import {
  getAllHistory, saveToHistory, promoteToActive, deleteHistoryImage,
  clearAllHistory, deactivateActiveImage, pingSelfieActivity,
  saveTryonResult, getTryonResultsBySelfie, deleteTryonResult, updateTryonResult,
  subscribeToImageEvents, EXPIRY_MS
} from './imageStore';
import { uploadSelfie } from './imageUpload';

/**
 * One way to talk to the photo dock, whichever dock it happens to be.
 *
 * There are two, and they are genuinely different things rather than two settings of one:
 *
 *   LOCAL   IndexedDB in this browser. What the shopper pages use, because a customer
 *           scanning a QR code has no account and nothing to share a dock with. Photographs
 *           never leave the device until a generation needs them, and expire after twenty
 *           minutes -- which is the privacy guarantee those pages make in writing.
 *
 *   SHARED  The account's dock on the server. What VendorTryon uses, so a shop's counter
 *           tablet and its owner's laptop are looking at the same photographs. The photo is
 *           uploaded when it is added rather than when it is used, because it has to exist
 *           somewhere the other device can reach.
 *
 * The mode is chosen by the PAGE, never inferred from whether a token happens to be lying
 * around in localStorage. CustomerTryon reads vendor_token too, and on a shared shop tablet
 * a shopper would otherwise silently land in the shop's dock -- with their photograph, and
 * everyone else's, in it.
 */

/** What both docks hand back, so the dock component does not care which one it is talking to. */
function normaliseLocal(record) {
  return {
    id: record.id,
    previewUrl: null,        // filled in by the caller from the File; see toPreview below
    file: record.file,
    imageUrl: null,
    createdAt: new Date(record.createdAt).getTime(),
    lastUsedAt: record.lastUsedAt,
    isActive: !!record.isActive,
    results: []
  };
}

function normaliseRemote(photo) {
  return {
    id: photo.id,
    previewUrl: photo.imageUrl,
    file: null,
    imageUrl: photo.imageUrl,
    createdAt: new Date(photo.createdAt).getTime(),
    lastUsedAt: typeof photo.lastUsedAt === 'number'
      ? photo.lastUsedAt
      : new Date(photo.lastUsedAt).getTime(),
    isActive: !!photo.isActive,
    results: photo.results || []
  };
}

/** The browser's own dock. Behaviour is unchanged from before this facade existed. */
function localDock() {
  return {
    shared: false,
    expiryMs: EXPIRY_MS,

    async list() {
      return (await getAllHistory()).map(normaliseLocal);
    },
    async add(file) {
      const saved = await saveToHistory(file);
      return saved ? normaliseLocal(saved) : null;
    },
    async activate(id) {
      const promoted = await promoteToActive(id);
      return promoted ? normaliseLocal(promoted) : null;
    },
    async deactivate() { return deactivateActiveImage(); },
    async remove(id)   { return deleteHistoryImage(id); },
    async clear()      { return clearAllHistory(); },
    async touch(id)    { return pingSelfieActivity(id); },

    // A local dock belongs to one anonymous shopper on one device -- there is no shop whose
    // try-on history it could show, so this is empty rather than pretending otherwise.
    async garments()                { return []; },
    // Nothing to remove from an empty list. Present so both docks have the same shape and
    // the dock component never has to ask which one it is holding.
    async removeGarment()           { return { success: false }; },
    async touchGarment()            { return undefined; },

    async results(photoId)          { return getTryonResultsBySelfie(photoId); },
    async addResult(entry)          { return saveTryonResult(entry); },
    async updateResult(id, patch)   { return updateTryonResult(id, patch); },
    async removeResult(id)          { return deleteTryonResult(id); },

    subscribe(cb) { return subscribeToImageEvents(cb); }
  };
}

/**
 * The account's dock, on the server.
 *
 * Every call carries the vendor token; the server takes the account from the token and never
 * from us, so there is nothing here that could ask for somebody else's photographs.
 */
function remoteDock({ apiUrl, getToken, retentionMs }) {
  const headers = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const call = async (path, options = {}) => {
    const res = await fetch(`${apiUrl}/api/tryon/dock${path}`, { headers: headers(), ...options });
    if (!res.ok) {
      // Detail to the console, never to the person -- the same rule the try-on pages follow.
      console.error('[photoDock] request failed', path, res.status);
      throw new Error(`dock request failed: ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  };

  /**
   * One poll for the whole page, shared by everything that subscribes.
   *
   * The server is the shared truth, and nothing local ever hears about a change made on
   * another device -- so somebody has to ask. Doing that here rather than in each component
   * matters: the dock badge and the page's selected photograph are two views of one thing,
   * and when only the dock polled, the badge updated while the portrait stayed stale.
   *
   * Runs only while something is listening, and only announces when the answer actually
   * changed, so an idle page is not repainting every few seconds for nothing.
   */
  const listeners = new Set();
  const announce = () => listeners.forEach(cb => cb({ type: 'DOCK_CHANGED' }));

  let pollTimer = null;
  let lastSignature = null;

  /**
   * A cheap description of the dock, to tell "something changed" from "nothing changed".
   *
   * Covers BOTH tabs, because the poll used to fetch only the photographs and build the
   * signature from those. Garments were never asked about, so a change to the tried-on list
   * made on another device was never noticed: an outfit deleted on the counter tablet sat in
   * the owner's laptop's dock indefinitely, and one tried for the first time on the laptop
   * never appeared on the tablet at all. Measured on two screens -- thirteen seconds after a
   * delete, well past the ten-second tick, the second device still listed it.
   *
   * That made the shared half of the dock not actually shared, which is the entire reason it
   * lives on the server rather than in IndexedDB. The cost of fixing it is one extra request
   * every ten seconds per open page, and only while somebody is subscribed.
   */
  const signatureOf = (photos, garments) => [
    photos
      .map(p => `${p.id}:${p.isActive ? 1 : 0}:${(p.results || []).map(r => r.id).join('|')}`)
      .join(','),
    // tryOnCount is in here on purpose: an outfit tried again elsewhere is a change worth
    // repainting for, even though the list still holds exactly the same outfits.
    garments
      .map(g => `${g.id}:${g.tryOnCount}`)
      .join(',')
  ].join('#');

  const pollOnce = async () => {
    try {
      // Together, so one slow response cannot make the two halves disagree about which
      // moment they describe.
      const [photoBody, garmentBody] = await Promise.all([call(''), call('/garments')]);
      const signature = signatureOf(photoBody?.photos || [], garmentBody?.garments || []);

      /**
       * The first poll announces too, and that is the whole fix for a device that never
       * caught up.
       *
       * This used to skip announcing while lastSignature was null, on the reasoning that the
       * first answer is not a CHANGE. But the component has already rendered by then, from
       * its own read a moment earlier -- and anything that happened in between those two
       * reads landed in the gap. The first poll quietly recorded the newer state as the
       * baseline and said nothing, and every poll after it compared equal.
       *
       * So: open the page on the second device, have the first device add a photograph
       * before that device's first tick, and the second device sits on the older list
       * FOREVER -- not for ten seconds, but until something else changes. Which is exactly
       * "I logged in on another device and the dock never updated".
       *
       * Announcing on the first poll costs one repaint per mount and makes the page match
       * the server unconditionally, which is the only state worth being in.
       */
      if (signature !== lastSignature) announce();
      lastSignature = signature;
    } catch {
      // Offline, or the token expired. Neither is worth interrupting anyone over; the next
      // tick will pick things up when they come back.
    }
  };

  const startPolling = () => {
    if (pollTimer) return;
    // Ask immediately rather than waiting out the first interval. A device that has just
    // been opened is the one most likely to be behind, and making it wait ten seconds to
    // find that out is the worst moment to be slow.
    pollOnce();
    pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
    // Forget the baseline with the timer. Whatever is subscribed next has its own idea of
    // what the dock holds, and it is entitled to be told the truth on the first tick rather
    // than measured against a signature from a page that is gone.
    lastSignature = null;
  };

  return {
    shared: true,
    expiryMs: retentionMs,

    async list() {
      const body = await call('');
      return (body?.photos || []).map(normaliseRemote);
    },

    /**
     * Uploads the photograph, then records it.
     *
     * Two steps rather than one because the upload endpoint already exists and already
     * normalises orientation and format for every page in the app. A second way to get an
     * image onto the server would be a second thing to keep correct.
     */
    async add(file) {
      const uploaded = await uploadSelfie({
        apiUrl, file, folder: 'user-uploads',
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
      });
      if (uploaded.unauthorized) return null;

      const photo = await call('/photos', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: uploaded.url })
      });
      announce();
      return normaliseRemote(photo);
    },

    async activate(id) {
      const photo = await call(`/photos/${encodeURIComponent(id)}/activate`, { method: 'POST' });
      announce();
      return normaliseRemote(photo);
    },
    async deactivate() { await call('/deactivate', { method: 'POST' }); announce(); return true; },
    async remove(id)   { await call(`/photos/${encodeURIComponent(id)}`, { method: 'DELETE' }); announce(); return true; },
    async clear()      { await call('', { method: 'DELETE' }); announce(); return true; },
    async touch(id)    { try { await call(`/photos/${encodeURIComponent(id)}/touch`, { method: 'POST' }); } catch { /* best effort */ } },

    /** The shop's garments that customers have tried on, newest first. */
    async garments() {
      const body = await call('/garments');
      return body?.garments || [];
    },

    /**
     * Take a garment off the tried-on list.
     *
     * Shared and permanent, like removing a photograph is: the list is derived from the
     * try-ons made against that garment, so the server erases those. The garment itself
     * stays in the catalogue and comes back into the list the next time somebody tries it.
     */
    async removeGarment(id, { force = false } = {}) {
      const res = await fetch(
        `${apiUrl}/api/tryon/dock/garments/${encodeURIComponent(id)}${force ? '?force=1' : ''}`,
        { method: 'DELETE', headers: headers() }
      );

      // 409 means a colleague has this outfit open on another device. Not an error to report
      // as one -- it is a question, and the answer belongs to the person at this screen.
      // Handled here rather than in `call` because `call` treats every non-ok as a failure,
      // which would turn "are you sure?" into "something went wrong".
      if (res.status === 409) return { inUse: true };
      if (!res.ok) {
        console.error('[photoDock] removeGarment failed', res.status);
        throw new Error(`dock request failed: ${res.status}`);
      }

      announce();
      return { success: true };
    },

    /**
     * "Somebody has this outfit open on this device."
     *
     * Best effort, and swallowed on failure exactly like touch() above: a lost beat costs a
     * warning to whoever deletes it next, never anybody's work.
     */
    async touchGarment(id) {
      try { await call(`/garments/${encodeURIComponent(id)}/touch`, { method: 'POST' }); }
      catch { /* best effort */ }
    },

    // Results are read as part of list() -- the server returns them nested under their
    // photograph, so there is nothing to fetch separately.
    async results() { return []; },

    // Nothing to write. A generation records itself against the dock photo server-side, via
    // the dock_photo_id sent with it, so there is no second write for the client to make and
    // no chance of the two disagreeing.
    async addResult()        { return null; },
    async updateResult()     { return null; },
    async removeResult(id)   { await call(`/results/${encodeURIComponent(id)}`, { method: 'DELETE' }); announce(); return true; },

    subscribe(cb) {
      listeners.add(cb);
      startPolling();
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0) stopPolling();
      };
    }
  };
}

/** How often a shared dock asks the server what the other devices have been doing. */
const POLL_INTERVAL_MS = 10000;

/**
 * Twenty minutes, matching PHOTO_RETENTION_MS in the backend's dock service.
 *
 * Both sides have to agree: this is what the countdown on each thumbnail counts down to, and
 * a number that disagreed with the server would show people a photograph as having eight
 * minutes left when it had already gone.
 */
export const SHARED_RETENTION_MS = 20 * 60 * 1000;

/**
 * @param {object}  opts
 * @param {boolean} opts.shared   true only on pages that have a signed-in account AND are
 *                                meant to share -- today that is VendorTryon alone.
 * @param {string} [opts.apiUrl]
 * @param {function}[opts.getToken]
 */
export function createPhotoDock({ shared = false, apiUrl = '', getToken = () => null } = {}) {
  return shared
    ? remoteDock({ apiUrl, getToken, retentionMs: SHARED_RETENTION_MS })
    : localDock();
}

/** A preview URL for a dock entry, whichever dock it came from. */
export function toPreview(entry) {
  if (entry.imageUrl) return { url: entry.imageUrl, revoke: false };
  if (entry.file) {
    try { return { url: URL.createObjectURL(entry.file), revoke: true }; }
    catch { return { url: null, revoke: false }; }
  }
  return { url: null, revoke: false };
}
