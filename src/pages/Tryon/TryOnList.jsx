import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ScanLine, Camera, Images, X, Heart, ChevronLeft, ChevronRight, RefreshCw, Loader2, Check, Users, Sparkles, ArrowLeft } from 'lucide-react';
import { API_URL, INVENTORY_API_URL } from '../../config';
import { uploadSelfie } from '../../utils/imageUpload';
import { swipeable } from '../../utils/swipe';
import QrScanner from '../../components/QrScanner';
import ShopperNumberGate, { heldShopProof, dropShopProof } from '../../components/ShopperNumberGate';

/**
 * A try-on LIST (owner, 28 Oct): scan one tag, scan more, take ONE photo, and see yourself in all of
 * them, one after another.
 *
 *   - Each tag scanned -- with the "Scan next tag" camera here, or the phone's own camera, which opens
 *     this page again -- joins this shop's list on this phone (up to 10, for the day).
 *   - One list per shop: each shop pays for its own try-ons and asks for its own number. A tag from
 *     another shop opens that shop's list; this one stays.
 *   - One photo for all of them, uploaded once. Try-ons run two at a time and each shows as soon as it
 *     is ready; one that fails says so on its own card.
 *   - Hearts are saved against the shopper's proved number, so they show on the shop's Customer card,
 *     and "Show my hearts to staff" puts the codes on screen for the salesperson.
 *
 * Nothing about the shop's own numbers (how many try-ons it has left) is ever shown here: this is the
 * customer's side. A shop that has run out just says "ask the staff" on the cards it could not do.
 */

const LIST_MAX = 10;
const AT_ONCE = 2;
const today = () => new Date().toLocaleDateString('en-CA');
const KEY = (clientId) => `t2b_list:${clientId}`;
const keyOf = (productCode, variantCode) => `${productCode}|${variantCode ?? ''}`;

const loadList = (clientId) => {
  try {
    const held = JSON.parse(localStorage.getItem(KEY(clientId)) || 'null');
    if (held && held.day === today() && Array.isArray(held.items)) return held;
  } catch { /* a broken list is an empty one */ }
  return { day: today(), needsNumber: false, items: [] };
};
const saveList = (clientId, list) => {
  try { localStorage.setItem(KEY(clientId), JSON.stringify(list)); } catch { /* private window: the list lives in this tab */ }
};

/** The shop, garment and colour a TryOn2Buy tag's QR points at, or null. */
export function parseTag(text) {
  try {
    const url = new URL(String(text).trim());
    const m = /^\/try\/([^/]+)\/([^/]+)\/?$/.exec(url.pathname);
    if (!m || m[2] === 'list') return null;
    return { clientId: decodeURIComponent(m[1]), productCode: decodeURIComponent(m[2]), variant: url.searchParams.get('variant') || null };
  } catch { return null; }
}

async function lookUp(clientId, productCode, variant) {
  const url = `${INVENTORY_API_URL}/api/v1/public/tryon/${encodeURIComponent(clientId)}/${encodeURIComponent(productCode)}${variant ? `?variant=${encodeURIComponent(variant)}` : ''}`;
  try {
    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body?.message || 'That tag does not match anything to try on.' };
    return { garment: body.data };
  } catch {
    return { error: 'We could not reach the shop. Check your connection and try again.' };
  }
}

/** A fresh page per shop: each shop has its own list, number and pass. */
export default function TryOnListPage() {
  const { clientId } = useParams();
  return <TryOnList key={clientId} />;
}

function TryOnList() {
  const { clientId, productCode: codeParam } = useParams();
  // /try/:clientId/list is the list itself; any other code is a tag that was scanned.
  const productCode = codeParam === 'list' ? null : codeParam;
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [list, setList] = useState(() => loadList(clientId));
  const [proof, setProof] = useState(() => heldShopProof(clientId));
  const [note, setNote] = useState(null);
  const [adding, setAdding] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [photo, setPhoto] = useState(null);           // { file, preview }
  const humanUrl = useRef(null);                       // the photo, uploaded once per photo
  const [running, setRunning] = useState(false);
  const [view, setView] = useState('list');            // list | results | staff
  const [at, setAt] = useState(0);
  const [comparing, setComparing] = useState(false);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const started = useRef(null);

  useEffect(() => { saveList(clientId, list); }, [clientId, list]);
  // A note is a passing word ("added", "already in your list"), not something to dismiss.
  useEffect(() => { if (!note) return undefined; const t = setTimeout(() => setNote(null), 4000); return () => clearTimeout(t); }, [note]);
  const patch = (key, change) => setList(l => ({ ...l, items: l.items.map(i => (i.key === key ? { ...i, ...change } : i)) }));

  const add = async (code, variant) => {
    const key = keyOf(code, variant);
    const now = loadList(clientId);
    if (now.items.some(i => i.key === key || (!variant && i.productCode === code))) { setNote('That piece is already in your list.'); return; }
    if (now.items.length >= LIST_MAX) { setNote(`Your list is full (${LIST_MAX}). Try these on, or remove one first.`); return; }
    setAdding(true); setNote(null);
    const { garment, error } = await lookUp(clientId, code, variant);
    setAdding(false);
    if (error) { setNote(error); return; }
    const colours = Array.isArray(garment.colours) ? garment.colours : [];
    const item = {
      key: keyOf(code, garment.variantCode ?? null), productCode: garment.productCode, title: garment.title,
      variantCode: garment.variantCode ?? null, colourName: garment.colourName ?? null,
      imageUrl: garment.imageUrl, colours, status: 'new', resultUrl: null, liked: false, message: null
    };
    setList(l => {
      if (l.items.some(i => i.key === item.key)) return l;
      return { ...l, needsNumber: garment.needsNumber === true, items: [...l.items, item] };
    });
    setNote(`${garment.title}${garment.colourName ? ` (${garment.colourName})` : ''} added.`);
  };

  // A tag opened this page: add it, then show the list at its own address (a refresh must not add it again).
  useEffect(() => {
    if (!productCode || started.current === productCode) return;
    started.current = productCode;
    add(productCode, search.get('variant')).finally(() => navigate(`/try/${encodeURIComponent(clientId)}/list`, { replace: true }));
  }, [productCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const onScanned = (text) => {
    setScanning(false);
    const tag = parseTag(text);
    if (!tag) { setNote('That QR is not a try-on tag. Scan the QR on the garment\'s tag.'); return; }
    if (tag.clientId !== clientId) {
      if (window.confirm('This tag is from another shop. Open that shop\'s list? Your list here stays.')) {
        navigate(`/try/${encodeURIComponent(tag.clientId)}/${encodeURIComponent(tag.productCode)}${tag.variant ? `?variant=${encodeURIComponent(tag.variant)}` : ''}`);
      }
      return;
    }
    add(tag.productCode, tag.variant);
  };

  const choose = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (photo?.preview) URL.revokeObjectURL(photo.preview);
    humanUrl.current = null;
    setPhoto({ file, preview: URL.createObjectURL(file) });
    // A new photo: every try-on is redone with it.
    setList(l => ({ ...l, items: l.items.map(i => ({ ...i, status: 'new', resultUrl: null, message: null })) }));
  };

  const items = list.items;
  const ready = (i) => i.variantCode || (i.colours ?? []).length <= 1;
  // Not 'unavailable': the shop has no try-ons left just now, and asking again would only fail again.
  const toDo = items.filter(i => !['done', 'working', 'unavailable'].includes(i.status) && ready(i));
  const done = items.filter(i => i.status === 'done');

  const tryOne = async (item, url) => {
    patch(item.key, { status: 'working', message: null });
    try {
      const res = await fetch(`${INVENTORY_API_URL}/api/v1/public/tryon/${encodeURIComponent(clientId)}/${encodeURIComponent(item.productCode)}/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humanImageUrl: url, ...(item.variantCode ? { variant: item.variantCode } : {}), ...(proof ? { token: proof } : {}) })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body?.data?.resultImageUrl) { patch(item.key, { status: 'done', resultUrl: body.data.resultImageUrl }); return 'ok'; }
      if (res.status === 400 && body?.needsNumber) { patch(item.key, { status: 'new' }); return 'number'; }
      if (res.status === 429 && /used/i.test(body?.message ?? '')) { patch(item.key, { status: 'unavailable', message: 'Not available just now. Ask the staff.' }); return 'stop'; }
      if (res.status === 429) { patch(item.key, { status: 'failed', message: 'Too many at once. Wait a few minutes, then try again.' }); return 'stop'; }
      if (res.status === 404) { patch(item.key, { status: 'failed', message: 'This piece cannot be tried on. Ask the staff.' }); return 'ok'; }
      patch(item.key, { status: 'failed', message: 'That one did not work. Try again.' });
      return 'ok';
    } catch {
      patch(item.key, { status: 'failed', message: 'We could not reach the shop. Try again.' });
      return 'ok';
    }
  };

  const tryAll = async (only) => {
    if (running || !photo) return;
    const queue = only ? [only] : [...toDo];
    if (!queue.length) return;
    setRunning(true); setNote(null);
    try {
      if (!humanUrl.current) {
        try { humanUrl.current = (await uploadSelfie({ apiUrl: API_URL, file: photo.file, folder: 'human-images' })).url ?? null; }
        catch { humanUrl.current = null; }
        if (!humanUrl.current) { setNote('Your photo could not be sent. Check your connection and try again.'); return; }
      }
      let halt = null;
      const worker = async () => {
        while (queue.length && !halt) {
          const outcome = await tryOne(queue.shift(), humanUrl.current);
          if (outcome === 'number' || outcome === 'stop') halt = outcome;
        }
      };
      await Promise.all(Array.from({ length: AT_ONCE }, worker));
      if (halt === 'number') { dropShopProof(clientId); setProof(null); setList(l => ({ ...l, needsNumber: true })); }
      if (halt === 'stop') {
        // Whatever was still waiting gets the same plain sentence; nothing about the shop's numbers.
        setList(l => ({ ...l, items: l.items.map(i => (queue.some(q => q.key === i.key) ? { ...i, status: 'unavailable', message: 'Not available just now. Ask the staff.' } : i)) }));
      }
    } finally { setRunning(false); }
  };

  const like = (item) => {
    const liked = !item.liked;
    patch(item.key, { liked });
    if (proof) {
      fetch(`${INVENTORY_API_URL}/api/v1/public/tryon/${encodeURIComponent(clientId)}/${encodeURIComponent(item.productCode)}/liked`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: proof, liked, ...(item.variantCode ? { variant: item.variantCode } : {}) })
      }).catch(() => undefined);
    }
  };

  const swipe = useMemo(() => swipeable({ onNext: () => setAt(a => Math.min(a + 1, done.length - 1)), onPrev: () => setAt(a => Math.max(a - 1, 0)), enabled: done.length > 1 }), [done.length]);

  // ── The number, before anything else, when this shop asks for it ──
  if (list.needsNumber && !proof && items.length) {
    return <ShopperNumberGate clientId={clientId} garmentTitle={items[0].title} garmentImageUrl={items[0].imageUrl} onProved={(t) => setProof(t)} />;
  }

  const muted = 'text-[#8a7f72]';
  const primary = 'relative overflow-hidden flex-1 h-14 rounded-full bg-accent hover:bg-accent-dark disabled:opacity-60 text-white text-[13px] font-semibold tracking-[0.5px] flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(194,65,12,0.6)] transition-colors';
  const secondary = 'h-14 px-5 rounded-full border border-[#d9cfc0] bg-white text-[13px] font-semibold flex items-center justify-center gap-2';
  const header = (back) => (
    <header className="sticky top-0 z-30 bg-[#faf7f2]/90 backdrop-blur border-b border-[rgba(26,20,16,0.06)]">
      <div className="h-14 max-w-[560px] mx-auto px-3 flex items-center justify-between">
        <div className="w-10">
          {back && <button type="button" onClick={back} aria-label="Back" className="w-10 h-10 grid place-items-center rounded-full hover:bg-black/5"><ArrowLeft className="w-5 h-5" /></button>}
        </div>
        <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy" className="h-7 object-contain" />
        <div className="w-10" />
      </div>
    </header>
  );
  const bottomBar = (children) => (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-[#faf7f2] via-[#faf7f2] to-[#faf7f2]/0 pt-6 px-4" style={{ paddingBottom: 'calc(14px + env(safe-area-inset-bottom))' }}>
      <div className="max-w-[560px] mx-auto flex gap-2">{children}</div>
    </div>
  );
  const toast = note && (
    <div role="status" className="fixed top-16 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="bg-[#1a1410] text-white text-[13px] rounded-full px-4 py-2.5 shadow-lg max-w-[92vw] text-center">{note}</div>
    </div>
  );

  // ── Show the hearted pieces to the salesperson ──
  if (view === 'staff') {
    const hearted = items.filter(i => i.liked);
    return (
      <div className="min-h-screen bg-[#1a1410] text-white font-sans">
        <header className="h-14 max-w-[560px] mx-auto px-3 flex items-center">
          <button type="button" onClick={() => setView('results')} aria-label="Back to my try-ons" className="w-10 h-10 grid place-items-center rounded-full hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></button>
        </header>
        <main className="max-w-[560px] mx-auto px-5 pb-10">
          <p className="text-[11px] uppercase tracking-[2px] text-white/55">Show this screen to the salesperson</p>
          <h1 className="font-serif text-[34px] leading-tight mt-1 mb-5">Please bring these</h1>
          {hearted.length === 0 ? (
            <p className="text-[15px] text-white/75 leading-relaxed">Tap the heart on the try-ons you like. They appear here for the staff.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {hearted.map((i, n) => (
                <li key={i.key} className="bg-white text-[#1a1410] rounded-2xl p-3 flex gap-3 items-center">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-accent text-white grid place-items-center text-[13px] font-bold">{n + 1}</span>
                  <img src={i.imageUrl} alt="" className="w-16 aspect-[3/4] object-cover rounded-lg" />
                  <div className="min-w-0">
                    <div className="font-serif text-[19px] leading-tight">{i.title}</div>
                    {i.colourName && <div className="text-[14px] mt-0.5">{i.colourName}</div>}
                    <div className="font-mono text-[18px] font-bold tracking-wide mt-1 break-all">{i.productCode}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </main>
      </div>
    );
  }

  // ── One try-on at a time, swipe for the next ──
  if (view === 'results' && done.length) {
    const n = Math.min(at, done.length - 1);
    const i = done[n];
    const hold = { onPointerDown: () => setComparing(true), onPointerUp: () => setComparing(false), onPointerLeave: () => setComparing(false), onPointerCancel: () => setComparing(false) };
    const favourites = items.filter(x => x.liked).length;
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#1a1410] font-sans pb-32">
        {header(() => setView('list'))}
        <main className="max-w-[560px] mx-auto px-4 pt-4">
          {/* The swipe handlers carry a style of their own (touch-action); merged, so the 3:4 shape stays. */}
          <div className="relative rounded-3xl overflow-hidden bg-[#ebe4d8] shadow-[0_18px_40px_-18px_rgba(26,20,16,0.45)]" {...swipe} style={{ ...(swipe.style ?? {}), aspectRatio: '3 / 4' }}>
            <img src={i.resultUrl} alt={`${i.title}, on you`} className="absolute inset-0 w-full h-full object-cover" />
            {photo?.preview && comparing && <img src={photo.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <span className="absolute top-3 left-3 bg-[#1a1410]/70 text-white text-[12px] font-semibold rounded-full px-3 py-1">{n + 1} of {done.length}{running ? ' · more coming' : ''}</span>
            {done.length > 1 && <>
              <button type="button" aria-label="Previous try-on" disabled={n === 0} onClick={() => setAt(Math.max(n - 1, 0))} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 grid place-items-center disabled:opacity-0 transition-opacity"><ChevronLeft className="w-5 h-5" /></button>
              <button type="button" aria-label="Next try-on" disabled={n >= done.length - 1} onClick={() => setAt(Math.min(n + 1, done.length - 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 grid place-items-center disabled:opacity-0 transition-opacity"><ChevronRight className="w-5 h-5" /></button>
            </>}
            {photo?.preview && (
              <button type="button" {...hold} className="absolute bottom-3 left-3 bg-white/90 rounded-full px-4 h-11 text-[12px] font-semibold select-none">{comparing ? 'Your photo' : 'Hold to compare'}</button>
            )}
            <button type="button" onClick={() => like(i)} aria-pressed={i.liked} aria-label={i.liked ? 'Liked' : 'Like this one'} className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white shadow-lg grid place-items-center active:scale-95 transition-transform">
              <Heart className={`w-6 h-6 ${i.liked ? 'fill-[#d6334a] text-[#d6334a]' : 'text-[#1a1410]'}`} />
            </button>
          </div>

          <div className="mt-4">
            <h2 className="font-serif text-[24px] leading-tight">{i.title}</h2>
            {i.colourName && <div className={`text-[13px] ${muted} mt-0.5`}>{i.colourName}</div>}
          </div>

          {done.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1" aria-label="All your try-ons">
              {done.map((x, k) => (
                <button key={x.key} type="button" onClick={() => setAt(k)} aria-label={`Show ${x.title}${x.colourName ? `, ${x.colourName}` : ''}`}
                  className={`relative shrink-0 w-14 aspect-[3/4] rounded-xl overflow-hidden ${k === n ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#faf7f2]' : 'opacity-80'}`}>
                  <img src={x.resultUrl} alt="" className="w-full h-full object-cover" />
                  {x.liked && <Heart className="absolute top-1 right-1 w-3.5 h-3.5 fill-[#d6334a] text-[#d6334a]" />}
                </button>
              ))}
            </div>
          )}
          <p className={`text-[11px] ${muted} mt-4 leading-relaxed`}>A picture made by a computer, to give you an idea. The real thing may sit differently.</p>
        </main>
        {bottomBar(
          <button type="button" className={primary} onClick={() => setView('staff')}>
            <Users className="w-5 h-5" /> Show my favourites to staff{favourites ? ` (${favourites})` : ''}
          </button>
        )}
      </div>
    );
  }

  // ── The fitting room ──
  const step = done.length ? 2 : photo ? 1 : 0;
  const total = items.filter(ready).length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1a1410] font-sans pb-36">
      {header(null)}
      {toast}
      <main className="max-w-[560px] mx-auto px-4 pt-5">
        <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[1.5px]" aria-label="Steps">
          {['Scan', 'Photo', 'See'].map((label, k) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold ${k < step ? 'bg-[#1a1410] text-white' : k === step ? 'bg-accent text-white' : 'bg-[#ebe4d8] text-[#8a7f72]'}`}>
                {k < step ? <Check className="w-3.5 h-3.5" /> : k + 1}
              </span>
              <span className={k === step ? 'font-semibold' : muted}>{label}</span>
              {k < 2 && <span className="w-5 h-px bg-[#d9cfc0]" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <h1 className="font-serif text-[32px] leading-tight mt-4">Your fitting room <span className={`text-[22px] ${muted}`}>({items.length})</span></h1>
        <p className={`text-[13px] ${muted} mt-1`}>Scan the tag on each piece you like. One photo, and you see yourself in all of them.</p>

        <ul className="grid grid-cols-2 gap-3 mt-5">
          {items.map(i => {
            const working = i.status === 'working';
            const isDone = i.status === 'done';
            const trouble = i.status === 'failed' || i.status === 'unavailable';
            return (
              <li key={i.key} data-piece className="flex flex-col">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#ebe4d8] shadow-[0_6px_18px_-10px_rgba(26,20,16,0.4)]">
                  <img src={isDone && i.resultUrl ? i.resultUrl : i.imageUrl} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity ${working ? 'opacity-70' : ''}`} />
                  {working && (
                    <div className="absolute inset-0 grid place-items-center bg-[#1a1410]/25">
                      <span className="bg-white/95 rounded-full px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Putting it on you…</span>
                    </div>
                  )}
                  {isDone && <span className="absolute top-2 left-2 bg-white/95 text-[#2e7d4f] rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" />Ready</span>}
                  {!working && (
                    <button type="button" aria-label={`Remove ${i.title}`} onClick={() => setList(l => ({ ...l, items: l.items.filter(x => x.key !== i.key) }))}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 grid place-items-center shadow-sm"><X className="w-4 h-4" /></button>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1410]/85 via-[#1a1410]/35 to-transparent pt-12 pb-3 px-3 text-white">
                    <div className="font-serif text-[16px] leading-tight line-clamp-2">{i.title}</div>
                    <div className="text-[11px] opacity-90 mt-0.5">{i.colourName ?? (ready(i) ? '' : 'Choose the colour you are holding')}</div>
                  </div>
                  {trouble && (
                    <div className="absolute inset-x-2 bottom-2 bg-white rounded-xl p-2.5 text-[11px] leading-snug text-[#a3262a] flex items-center gap-2 shadow">
                      <span className="flex-1">{i.message}</span>
                      {i.status === 'failed' && photo && !running && (
                        <button type="button" aria-label={`Try ${i.title} again`} onClick={() => tryAll(i)} className="w-8 h-8 shrink-0 rounded-full bg-[#faf7f2] grid place-items-center"><RefreshCw className="w-4 h-4 text-[#1a1410]" /></button>
                      )}
                    </div>
                  )}
                </div>
                {!ready(i) && (
                  <div role="radiogroup" aria-label={`Colour of ${i.title}`} className="flex flex-wrap gap-1.5 mt-2">
                    {i.colours.map(c => (
                      <button key={c.variantCode} type="button" role="radio" aria-checked={false}
                        onClick={() => {
                          const k = keyOf(i.productCode, c.variantCode);
                          if (items.some(x => x.key === k)) { setNote('That colour is already in your list.'); return; }
                          setList(l => ({ ...l, items: l.items.map(x => (x.key === i.key ? { ...x, key: k, variantCode: c.variantCode, colourName: c.colourName ?? null, imageUrl: c.imageUrl ?? x.imageUrl } : x)) }));
                        }}
                        className="px-3 h-8 rounded-full border border-[#d9cfc0] bg-white text-[12px] font-medium">{c.colourName ?? c.variantCode}</button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
          {items.length < LIST_MAX && (
            <li>
              <button type="button" onClick={() => setScanning(true)} disabled={adding}
                className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-[#d9cfc0] bg-white/40 flex flex-col items-center justify-center gap-2 text-center px-3 active:bg-white">
                <span className="w-12 h-12 rounded-full bg-[#1a1410] text-white grid place-items-center">
                  {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanLine className="w-5 h-5" />}
                </span>
                <span className="font-serif text-[18px] leading-tight">Scan next tag</span>
                <span className={`text-[11px] ${muted}`}>{items.length} of {LIST_MAX} pieces</span>
              </button>
            </li>
          )}
        </ul>

        {items.length > 0 && (
          <section className="mt-6 rounded-2xl bg-white border border-[rgba(26,20,16,0.06)] p-4 flex items-center gap-4" aria-label="Your photo">
            {photo
              ? <img src={photo.preview} alt="Your photo" className="w-16 aspect-[3/4] rounded-xl object-cover" />
              : (
                <div className="w-16 aspect-[3/4] rounded-xl bg-[#f3eee6] grid place-items-center" aria-hidden="true">
                  <svg viewBox="0 0 40 56" className="w-9 text-[#b9ab98]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="20" cy="14" r="6" /><path d="M20 21v18M12 28l8-6 8 6M14 52l6-13 6 13" /></svg>
                </div>
              )}
            <div className="flex-1 min-w-0">
              <div className="font-serif text-[19px] leading-tight">{photo ? 'Your photo' : 'Add your photo'}</div>
              <div className={`text-[12px] ${muted} mt-0.5 leading-snug`}>{photo ? 'Used for every piece, then deleted.' : 'Head to toe, facing forward, against a plain wall.'}</div>
              <div className="flex gap-4 mt-2 text-[12px] font-semibold">
                <button type="button" onClick={() => cameraRef.current?.click()} disabled={running} className="flex items-center gap-1.5 text-accent"><Camera className="w-4 h-4" />{photo ? 'Retake' : 'Camera'}</button>
                <button type="button" onClick={() => galleryRef.current?.click()} disabled={running} className="flex items-center gap-1.5"><Images className="w-4 h-4" />Gallery</button>
              </div>
            </div>
          </section>
        )}
        {items.some(i => !ready(i)) && <p className={`text-[12px] ${muted} mt-3`}>Choose the colour on each piece to try it on.</p>}
        {items.length === 0 && !adding && <p className={`text-[14px] ${muted} mt-6`}>Your fitting room is empty. Scan the QR on a garment's tag to start.</p>}

        <input ref={cameraRef} type="file" accept="image/jpeg,image/png,image/webp" capture onChange={choose} className="hidden" aria-label="Take a photo" />
        <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} className="hidden" aria-label="Choose a photo" />
      </main>

      {items.length > 0 && bottomBar(
        <>
          {done.length > 0 && (toDo.length > 0 || running) && (
            <button type="button" className={secondary} onClick={() => { setAt(0); setView('results'); }}>See ({done.length})</button>
          )}
          {!photo ? (
            <button type="button" className={primary} onClick={() => cameraRef.current?.click()}><Camera className="w-5 h-5" /> Add your photo</button>
          ) : running ? (
            <button type="button" className={primary} disabled>
              <span className="absolute inset-y-0 left-0 bg-accent-dark transition-all duration-500" style={{ width: `${pct}%` }} aria-hidden="true" />
              <span className="relative flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Trying on {done.length} of {total}…</span>
            </button>
          ) : toDo.length > 0 ? (
            <button type="button" className={primary} onClick={() => tryAll()}><Sparkles className="w-5 h-5" /> {toDo.length === 1 ? 'Try this one on' : `Try on all ${toDo.length}`}</button>
          ) : done.length > 0 ? (
            <button type="button" className={primary} onClick={() => { setAt(0); setView('results'); }}><Sparkles className="w-5 h-5" /> See my try-ons ({done.length})</button>
          ) : (
            <button type="button" className={primary} disabled>{items.some(i => i.status === 'unavailable') ? 'Not available just now. Ask the staff.' : 'Choose the colours above'}</button>
          )}
        </>
      )}
      {scanning && <QrScanner onFound={onScanned} onClose={() => setScanning(false)} />}
    </div>
  );
}
