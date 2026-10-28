import React, { useState } from 'react';
import { INVENTORY_API_URL } from '../config';

/**
 * Their WhatsApp number, before a try-on from a tag's QR code (the shop's owner, 28 Oct).
 *
 * The shop sends a code from its own WhatsApp number; typing it back proves the number is theirs, so
 * the shop knows who tried what on (their customer card in Scaleezy Inventory). Shown only when
 * Inventory says this shop asks (`needsNumber`): a shop whose WhatsApp is not linked lets everybody
 * try on as before.
 *
 * The pass Inventory gives back is kept on this phone for the shop (30 days), so a returning shopper
 * goes straight to the photo. It is a secret for that shop only -- never the number itself.
 */

const KEY = (clientId) => `t2b_shop_proof:${clientId}`;
export const heldShopProof = (clientId) => { try { return localStorage.getItem(KEY(clientId)) || null; } catch { return null; } };
const holdShopProof = (clientId, token) => { try { if (token) localStorage.setItem(KEY(clientId), token); } catch { /* private window */ } };
export const dropShopProof = (clientId) => { try { localStorage.removeItem(KEY(clientId)); } catch { /* nothing to do */ } };

const post = async (url, body) => {
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('We could not reach the shop. Check your connection and try again.');
  }
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out?.message || 'That did not work. Try again.');
  return out.data;
};

export default function ShopperNumberGate({ clientId, garmentTitle, garmentImageUrl, onProved }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState(null);
  const base = `${INVENTORY_API_URL}/api/v1/public/tryon/${encodeURIComponent(clientId)}/verify`;

  const send = async () => {
    if (phone.replace(/\D/g, '').length < 10) { setSaid('Enter your 10-digit WhatsApp number.'); return; }
    setBusy(true); setSaid(null);
    try {
      await post(`${base}/send`, { phone });
      setSent(true); setCode('');
      setSaid('We have sent a code to your WhatsApp.');
    } catch (e) { setSaid(e.message); } finally { setBusy(false); }
  };

  const check = async () => {
    setBusy(true); setSaid(null);
    try {
      const out = await post(`${base}/check`, { phone, code });
      holdShopProof(clientId, out?.token);
      onProved(out?.token);
    } catch (e) { setSaid(e.message); } finally { setBusy(false); }
  };

  const field = 'w-full border border-[rgba(26,20,16,0.2)] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#1a1410]';
  const go = 'w-full py-3.5 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-[2px] transition-colors';
  const quiet = 'text-[12px] text-muted underline underline-offset-2 disabled:opacity-50';

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center px-6 pt-10 pb-12 font-sans text-[#1a1410]">
      <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy" className="h-9 object-contain mb-8 opacity-90" />
      <div className="w-full max-w-[360px] flex flex-col gap-5">
        {garmentImageUrl && (
          <div className="flex items-center gap-3">
            <img src={garmentImageUrl} alt="" className="w-14 h-[72px] object-cover bg-white border border-[rgba(26,20,16,0.08)]" />
            <span className="font-serif text-[18px] leading-snug">{garmentTitle}</span>
          </div>
        )}
        <div>
          <h1 className="font-serif text-[26px] mb-2">See it on you</h1>
          <p className="text-[13px] leading-relaxed text-muted">
            {sent ? 'Enter the 6-digit code we sent on WhatsApp.' : "Enter your WhatsApp number. We'll send a code to check it's yours."}
          </p>
        </div>

        {sent ? (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Code</span>
              <input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code"
                maxLength={6} placeholder="123456" autoFocus className={`${field} tracking-[0.4em] text-center`} aria-label="The code we sent" />
            </label>
            <button type="button" className={go} disabled={busy || code.replace(/\D/g, '').length !== 6} onClick={check}>
              {busy ? 'Checking…' : 'Confirm'}
            </button>
            <div className="flex justify-between">
              <button type="button" className={quiet} disabled={busy} onClick={send}>Send it again</button>
              <button type="button" className={quiet} disabled={busy} onClick={() => { setSent(false); setSaid(null); }}>Change number</button>
            </div>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[1.5px] text-muted">WhatsApp number</span>
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" autoComplete="tel"
                maxLength={16} placeholder="98480 11122" className={field} aria-label="WhatsApp number" />
            </label>
            <button type="button" className={go} disabled={busy} onClick={send}>{busy ? 'Sending…' : 'Send code'}</button>
          </>
        )}
        {said ? <p role="status" className="text-[12.5px] text-muted">{said}</p> : null}
      </div>
    </div>
  );
}
