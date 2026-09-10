import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Image as ImageIcon, X, RotateCcw, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from './ConfirmDialog';
import ThumbWithFallback from './ThumbWithFallback';
import { createPhotoDock, toPreview } from '../utils/photoDock';

/** How often a shared dock asks the server what the other devices have been doing. */
const SHARED_POLL_MS = 10000;

/**
 * Why every button in here greys out while something is being generated.
 *
 * The dock still opens and both tabs still browse -- somebody waiting on a generation is
 * exactly who wants to look at what to try next. What is refused is APPLYING a change, because
 * swapping the photograph or the garment out from under a generation already in flight
 * produces a result belonging to a pair of inputs nobody ever chose together.
 */
const BUSY_HINT = 'Wait for the current try-on to finish, then pick another.';

/**
 * @param {object}  props
 * @param {object}  [props.dock]    which dock to show. Defaults to this browser's own, so the
 *                                  shopper pages behave exactly as they always have;
 *                                  VendorTryon passes the account's shared dock instead.
 * @param {function}[props.onPickGarment]  called with a garment when somebody picks one out
 *                                         of the "Tried On" tab. That tab exists only on a
 *                                         shared dock: it lists the shop's clothes customers
 *                                         have actually tried, so whoever is serving someone
 *                                         can see what has been tried today -- on any device,
 *                                         by any colleague -- and open the same garment.
 * @param {boolean} [props.busy]   true while the page is generating, modifying an outfit or
 *                                 changing a background. The dock still OPENS and both tabs
 *                                 still browse -- somebody waiting on a generation is exactly
 *                                 who wants to look at what to try next. What it stops is
 *                                 APPLYING anything: swapping the photograph or the garment
 *                                 out from under a generation already in flight would produce
 *                                 a result belonging to inputs nobody chose together.
 * @param {function}[props.onPick]  called with the chosen photograph when somebody picks one.
 * @param {string}  [props.currentPhotoId]  the photograph already in this page's slot, so the
 *                                  list can leave it out. On a shared dock this is the ONLY
 *                                  thing that should be hidden -- the account's isActive flag
 *                                  belongs to whichever device picked last, not to this one.
 *                                  This is the ONLY way a shared dock reaches the page: the
 *                                  list keeps itself current across devices by polling, but
 *                                  nothing it learns is allowed to change what the page is
 *                                  working on until a person chooses it. Swapping a
 *                                  photograph out from under someone mid-session because a
 *                                  colleague picked a different one on another device is the
 *                                  thing this arrangement exists to prevent.
 */
export default function ImageHistoryDock({ dock, onPick, onPickGarment, currentPhotoId = null, busy = false }) {
  // Created once. A new dock object on every render would restart polling continuously.
  const [activeDock] = useState(() => dock || createPhotoDock({ shared: false }));
  const EXPIRY_MS = activeDock.expiryMs;
  const [history, setHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * A promise-shaped replacement for window.confirm.
   *
   * The handlers below were written against confirm(), which BLOCKS and returns a boolean. A
   * rendered dialog cannot block, so the question goes into state and the promise it returns
   * settles when a button is pressed. Every call site then reads exactly as it did --
   * `const ok = await ask(...)` where it was `const ok = confirm(...)` -- instead of turning
   * three straightforward handlers into callback chains.
   */
  const [confirmState, setConfirmState] = useState(null);
  const ask = (question) => new Promise((resolve) => setConfirmState({ ...question, resolve }));
  const settleConfirm = (answer) => {
    setConfirmState((current) => { current?.resolve(answer); return null; });
  };
  const [now, setNow] = useState(Date.now());
  const [garments, setGarments] = useState([]);
  const [tab, setTab] = useState('photos');

  // Ticks the countdown, and refreshes when something needs it.
  //
  // A shared dock refreshes on every tick regardless: the reason it exists is that another
  // device may have added or removed a photograph, and nothing local would ever tell us.
  useEffect(() => {
    const int = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      // A shared dock is refreshed by the facade's own poll, which announces to everything
      // subscribed -- this badge and the page's selected photograph together. Polling again
      // here would double the requests and still leave the two able to disagree.
      if (activeDock.shared) return;
      if (history.some(img => currentTime - img.lastUsedAt > EXPIRY_MS)) fetchHistory();
    }, SHARED_POLL_MS);
    return () => clearInterval(int);
  }, [history, activeDock]);

  /**
   * The shop's tried-on garments. Returns nothing at all on a local dock, so the shopper
   * pages are untouched by this and never render the tab.
   */
  const fetchGarments = async () => {
    try {
      // No guard on activeDock.shared here on purpose. A local dock's garments() returns an
      // empty list of its own accord, so this stays structurally identical to fetchHistory --
      // always awaiting before it touches state, never setting state synchronously.
      const next = await activeDock.garments();
      setGarments(next);
    } catch (e) {
      console.warn('fetchGarments failed', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const records = await activeDock.list();

      // A local entry is a File and needs an object URL; a shared one is already a URL on
      // the server. toPreview says which, and whether it is ours to revoke afterwards.
      const withUrls = records
        .map(r => { const { url, revoke } = toPreview(r); return { ...r, previewUrl: url, ownsPreview: revoke }; })
        .filter(r => r.previewUrl !== null);

      setHistory(prev => {
        // Only revoke URLs we created. Revoking a server URL would blank the image.
        prev.forEach(h => { if (h.ownsPreview && h.previewUrl) URL.revokeObjectURL(h.previewUrl); });
        return withUrls;
      });
    } catch (e) {
      console.warn("fetchHistory failed", e);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      history.forEach(h => {
        if (h.ownsPreview && h.previewUrl) URL.revokeObjectURL(h.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    fetchHistory();
    // fetchGarments awaits the dock before it touches state, exactly as fetchHistory does;
    // the rule only spots the difference because this one sets a value while that one uses
    // the updater form. Nothing is set synchronously, so no cascading render is possible.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGarments();
    const unsubscribe = activeDock.subscribe(() => {
      // Small delay to let IndexedDB settle
      setTimeout(() => { fetchHistory(); fetchGarments(); }, 50);
    });
    return () => unsubscribe();
  }, [activeDock]);

  const handlePromote = async (id) => {
    if (busy) return;
    const chosen = await activeDock.activate(id);
    setIsModalOpen(false);
    if (activeDock.shared) fetchHistory();
    // Hand it to the page. On a shared dock this is the moment the photograph lands in the
    // upload slot; activate() also records it as the shop's starting point for a device
    // opened later, which is a different thing from changing a page already in use.
    if (chosen && typeof onPick === 'function') onPick(chosen);
  };

  const handleDelete = async (id) => {
    if (busy) return;

    const first = await activeDock.remove(id);

    /**
     * Somebody is being fitted with this photograph on another device.
     *
     * Asked rather than refused, the same way removing an outfit is -- it is the shop's dock
     * and the shop's decision. But a photograph is not an outfit: deleting it takes away the
     * customer somebody is serving, along with their try-ons. That deserves a sentence
     * saying so before it happens, which is what was missing.
     *
     * On a local dock this branch is unreachable: one browser, no other device.
     */
    if (first?.inUse) {
      const goAhead = await ask({
        title: 'Someone is being fitted with this photo right now',
        lines: [
          'They are on another device, and deleting it takes the photo off their screen along with the try-ons made from it.',
          'They can pick a photo again and carry on — nothing stops mid-way.'
        ],
        confirmLabel: 'Delete anyway',
        cancelLabel: 'Leave it'
      });
      if (!goAhead) return;
      await activeDock.remove(id, { force: true });
    }

    // the local dock repaints via its event; the shared one has nothing to listen to
    if (activeDock.shared) fetchHistory();
  };

  /**
   * Hide the photograph THIS page is working with -- not the one the account calls active.
   *
   * The dock has always hidden the active photograph, and on a browser's own dock that is
   * right: "active" there means "the one in the slot on this screen", so listing it again
   * would offer somebody the picture they are already looking at.
   *
   * On a SHARED dock the word means something else. isActive is one flag for the whole
   * account, set by whichever device last picked or added. The other device is not using
   * that photograph -- it has an empty slot and no way to reach the photograph except
   * through this list -- so hiding it there hid the only copy.
   *
   * The effect was the whole feature failing in its most ordinary case: a shop takes ONE
   * photograph of a customer on the phone, it becomes the account's active one, and the
   * tablet shows no dock at all. Not a stale list -- no button, nothing to open. It only
   * started working once a SECOND photograph existed, which is why it looked like the dock
   * was not syncing when the sync had been correct the whole time.
   *
   * So: shared docks hide the photograph this page has in its slot (which is nothing, on a
   * device that has not picked yet), and local docks keep the old meaning exactly.
   */
  const inactiveHistory = activeDock.shared
    ? history.filter(h => h.id !== currentPhotoId)
    : history.filter(h => !h.isActive);

  // On a local dock garments is always empty, so this reduces to exactly the old condition
  // and the shopper pages behave as they always have.
  const hasSomethingToShow = inactiveHistory.length > 0 || garments.length > 0;
  const showTabs = activeDock.shared;

  const handlePickGarment = (garment) => {
    if (busy) return;
    setIsModalOpen(false);
    if (typeof onPickGarment === 'function') onPickGarment(garment);
  };

  /**
   * Erases the try-ons that put this garment on the list, which is what takes it off.
   *
   * Confirmed first, and worded so the consequence is on the button rather than in a
   * paragraph nobody reads: this is shared and permanent, and a colleague on another device
   * loses the same history.
   */
  const handleDeleteGarment = async (garment) => {
    if (busy) return;
    const count = garment.tryOnCount;
    const ok = await ask({
      title: `Remove “${garment.title}” from Outfits Tried?`,
      lines: [
        `This clears ${count} try-on ${count === 1 ? 'image' : 'images'} made with it, for everyone in the shop.`,
        'Nothing leaves your gallery: the outfit stays in your catalogue, and any try-on you saved to it is kept.',
        'You can try this outfit on again any time.'
      ],
      confirmLabel: 'Clear it',
      cancelLabel: 'Keep it'
    });
    if (!ok) return;
    try {
      const first = await activeDock.removeGarment(garment.id);

      /**
       * Somebody is wearing it on another device.
       *
       * Asked again rather than refused, because a shop must be able to clear its own list --
       * but the first confirmation said "for everyone in the shop" without knowing that
       * "everyone" included a colleague mid-customer. This is the sentence that was missing.
       */
      if (first?.inUse) {
        const goAhead = await ask({
          title: `Someone is trying “${garment.title}” on right now`,
          lines: [
            'They are on another device. Removing it now takes away the try-ons they are looking at.',
            'They can carry on and generate again — nothing stops mid-way — but what is already on their screen will go.'
          ],
          confirmLabel: 'Remove anyway',
          cancelLabel: 'Leave it'
        });
        if (!goAhead) return;
        await activeDock.removeGarment(garment.id, { force: true });
      }

      fetchGarments();
    } catch (e) {
      console.warn('removeGarment failed', e);
    }
  };

  const sinceLabel = (iso) => {
    const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`;
  };

  return (
    <>
      {/* ---- Floating Dock Button (bottom-right) ---- */}
      <AnimatePresence>
        {hasSomethingToShow && (
          <motion.div
            key="dock-button"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              id="history-dock-button"
              onClick={() => setIsModalOpen(true)}
              className="bg-white p-3 rounded-full shadow-lg border border-[#e2e8f0] flex items-center justify-center hover:shadow-xl transition-all relative group"
            >
              <div className="absolute -top-2 -right-2 bg-[#dd6b20] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {inactiveHistory.length + garments.length}
              </div>
              <Clock className="w-5 h-5 text-[#dd6b20]" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[11px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                {showTabs ? 'Your photos & outfits' : 'Recent Selfies'}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The shop's own confirmation, above the dock's own modal. Rendered outside the
          AnimatePresence below on purpose -- it must never depend on an exit animation to
          leave the screen. See ConfirmDialog for why that matters. */}
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        lines={confirmState?.lines}
        confirmLabel={confirmState?.confirmLabel}
        cancelLabel={confirmState?.cancelLabel}
        onConfirm={() => settleConfirm(true)}
        onCancel={() => settleConfirm(false)}
      />

      {/* ---- History Modal ---- */}
      {/**
        * The pointer-events guard lives HERE, on a plain wrapper, and not on the backdrop
        * inside -- which is the whole point and was wrong on the first attempt.
        *
        * AnimatePresence renders an exiting child from the PREVIOUS tree: it keeps the
        * element exactly as it was when it was removed, with the props it had then. A
        * state-driven style on that child is therefore frozen at whatever it evaluated to
        * while the modal was still open, so `isModalOpen ? 'auto' : 'none'` sat there
        * reading 'auto' for the entire exit. Measured on production: the modal was closed in
        * state and a full-screen interactive sheet was still over the page.
        *
        * This wrapper is not the exiting child, so it re-renders normally and the descendant
        * backdrop inherits pointer-events: none the instant the modal closes.
        *
        * It matters because removal otherwise depends on the exit ANIMATION finishing, and
        * framer-motion drives that with requestAnimationFrame, which browsers stop firing in
        * a hidden tab. Put a phone to sleep just after closing the dock and the backdrop
        * stays: invisible, full-screen, swallowing every tap until the tab is looked at
        * again. The key on the child fixed a worse version of this; this covers the case
        * where the animation never gets to run.
        */}
      <div style={{ pointerEvents: isModalOpen ? 'auto' : 'none' }}>
      <AnimatePresence>
        {isModalOpen && (
          /* key is REQUIRED, not decoration. AnimatePresence tracks its children by key, and
             without one it never finishes removing this on exit: the backdrop animated to
             opacity 0 and then stayed in the DOM, full-screen, with pointer-events auto. The
             dock looked closed and every click on the page underneath was swallowed by an
             invisible sheet. Reproduced on all three try-on pages before this line existed. */
          <motion.div
            key="dock-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#dd6b20]" />
                  <h3 className="font-bold text-[#1a202c]">
                    {showTabs ? 'Your photos' : 'Recent Selfies'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-[#a0aec0] hover:text-[#1a202c] transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tabs. Shared docks only -- a shopper's own dock has no shop behind it and
                  nothing to put in a second tab, so it keeps the single list it always had. */}
              {showTabs && (
                <div className="flex border-b border-[#e2e8f0] px-4">
                  <button
                    onClick={() => setTab('photos')}
                    className={`flex items-center gap-1.5 py-2.5 px-3 text-[12px] font-bold border-b-2 transition-colors ${tab === 'photos' ? 'border-[#dd6b20] text-[#dd6b20]' : 'border-transparent text-[#a0aec0] hover:text-[#1a202c]'}`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> My Photos ({inactiveHistory.length})
                  </button>
                  <button
                    onClick={() => setTab('garments')}
                    className={`flex items-center gap-1.5 py-2.5 px-3 text-[12px] font-bold border-b-2 transition-colors ${tab === 'garments' ? 'border-[#dd6b20] text-[#dd6b20]' : 'border-transparent text-[#a0aec0] hover:text-[#1a202c]'}`}
                  >
                    <Shirt className="w-3.5 h-3.5" /> Outfits Tried ({garments.length})
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="p-4 overflow-y-auto">
                <p className="text-[#718096] text-[12px] mb-4">
                  {showTabs
                    ? (tab === 'photos'
                        ? 'Pick a photo to try on another outfit. Your photos disappear 20 minutes after you last use one.'
                        : 'Outfits people have tried on here. Pick one to see it on you.')
                    : 'Select a previous photo to reuse it instantly. Photos automatically expire 20 minutes after their last use.'}
                </p>

                {showTabs && tab === 'garments' ? (
                  garments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Shirt className="w-12 h-12 text-[#e2e8f0] mb-3" />
                      <p className="text-[#a0aec0] text-sm">No outfits tried yet.</p>
                      <p className="text-[#cbd5e0] text-[11px] mt-1">An outfit shows up here once someone has tried it on.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Laid out exactly like a photograph card below: the picture, then a
                          row with the two things you can do to it, always visible rather than
                          revealed on hover. The whole card used to be one big button, so there
                          was nowhere to put Delete and no way to tell a tap meant to open the
                          garment from a tap meant to remove it. */}
                      {garments.map(garment => (
                        <div
                          key={garment.id}
                          className="relative rounded-lg overflow-hidden border border-[#e2e8f0] bg-[#f7fafc]"
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-white">
                            <ThumbWithFallback
                              src={garment.imageUrl}
                              alt={garment.title}
                              label="Outfit image gone"
                              icon={Shirt}
                            />
                          </div>

                          {/* How many people have tried it -- the reason this list is worth
                              looking at rather than just opening the catalogue. */}
                          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {garment.tryOnCount} {garment.tryOnCount === 1 ? 'try-on' : 'try-ons'}
                          </div>

                          <div className="p-2 border-t border-[#e2e8f0]">
                            <p className="text-[11px] font-bold text-[#1a202c] truncate">{garment.title}</p>
                            <p className="text-[10px] text-[#a0aec0]">{sinceLabel(garment.lastTriedAt)}</p>
                          </div>

                          <div className="flex items-center border-t border-[#e2e8f0]">
                            <button
                              onClick={() => handlePickGarment(garment)}
                              disabled={busy}
                              title={busy ? BUSY_HINT : undefined}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-[#dd6b20] hover:bg-[#fffaf0] transition-colors disabled:text-[#cbd5e0] disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            >
                              <Shirt className="w-3 h-3" /> Try This
                            </button>
                            <div className="w-[1px] h-6 bg-[#e2e8f0]"></div>
                            <button
                              onClick={() => handleDeleteGarment(garment)}
                              disabled={busy}
                              title={busy ? BUSY_HINT : undefined}
                              className="flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors disabled:text-[#cbd5e0] disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : inactiveHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ImageIcon className="w-12 h-12 text-[#e2e8f0] mb-3" />
                    <p className="text-[#a0aec0] text-sm">{showTabs ? 'No other photos yet.' : 'No recent photos found.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {inactiveHistory.map(img => {
                      const timeElapsed = now - img.lastUsedAt;
                      const timeRemainingMs = Math.max(0, EXPIRY_MS - timeElapsed);
                      const minsRemaining = Math.ceil(timeRemainingMs / 60000);
                      
                      return (
                        <div 
                          key={img.id}
                          className="relative rounded-lg overflow-hidden border border-[#e2e8f0] bg-[#f7fafc]"
                        >
                          {/* Image thumbnail */}
                          <div className="aspect-[3/4] overflow-hidden">
                            <ThumbWithFallback src={img.previewUrl} alt="A photo in the dock" label="Photo gone" />
                          </div>
                          
                          {/* Expiry Badge */}
                          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {minsRemaining}m
                          </div>

                          {/* Action buttons — ALWAYS visible, separate from the image */}
                          <div className="flex items-center border-t border-[#e2e8f0]">
                            <button
                              onClick={() => handlePromote(img.id)}
                              disabled={busy}
                              title={busy ? BUSY_HINT : undefined}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-[#dd6b20] hover:bg-[#fffaf0] transition-colors disabled:text-[#cbd5e0] disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            >
                              <RotateCcw className="w-3 h-3" /> {showTabs ? 'Use This' : 'Use Photo'}
                            </button>
                            <div className="w-[1px] h-6 bg-[#e2e8f0]"></div>
                            <button
                              onClick={() => handleDelete(img.id)}
                              disabled={busy}
                              title={busy ? BUSY_HINT : undefined}
                              className="flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors disabled:text-[#cbd5e0] disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
