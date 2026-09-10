/**
 * Where "back" goes for a shopper who arrived by scanning a garment tag.
 *
 * Never into Tryon2Buy. This page is reached from a garment in somebody else's shop, and the
 * previous behaviour sent that shopper to /shop/:vendorId or the Tryon2Buy landing page -- a
 * storefront belonging to a different business, or a pitch for software they are not buying.
 * Neither is "back" by any reading.
 *
 * Kept out of the component so the rules can actually be exercised, because the interesting
 * cases here are the ones that are awkward to reach by hand: a link carrying a hostile
 * returnUrl, and a cold camera scan with no history at all.
 */

/**
 * @param {object}   opts
 * @param {string}  [opts.search]          window.location.search
 * @param {string}  [opts.referrer]        document.referrer
 * @param {string}   opts.currentOrigin    window.location.origin
 * @param {string[]}[opts.allowedOrigins]  origins a shopper may be sent back to
 * @param {boolean} [opts.hasAppHistory]   true when this app has somewhere to go back to
 * @returns {{kind:'external', href:string} | {kind:'history'} | null}
 */
export function resolveBackTarget({
  search = '',
  referrer = '',
  currentOrigin,
  allowedOrigins = [],
  hasAppHistory = false,
} = {}) {
  const origins = allowedOrigins
    .filter(Boolean)
    .map((u) => { try { return new URL(u).origin; } catch { return null; } })
    .filter(Boolean);

  const externalIfAllowed = (candidate) => {
    if (!candidate) return null;
    try {
      const url = new URL(candidate);
      // https only, and only somewhere we already trust. Following an arbitrary ?returnUrl
      // would make this an open redirect: a /try/ link could be sent out with a returnUrl
      // pointing at a lookalike site, and Back would carry the shopper straight to it.
      if (url.protocol !== 'https:') return null;
      if (url.origin === currentOrigin) return null; // our own pages are not "back"
      return origins.includes(url.origin) ? url.href : null;
    } catch {
      return null;
    }
  };

  let returnUrl = null;
  try {
    returnUrl = new URLSearchParams(search).get('returnUrl');
  } catch {
    returnUrl = null;
  }

  const fromParam = externalIfAllowed(returnUrl);
  if (fromParam) return { kind: 'external', href: fromParam };

  // Empty for a camera QR scan, which is exactly right: that shopper did not come from
  // anywhere, so no back control is offered.
  const fromReferrer = externalIfAllowed(referrer);
  if (fromReferrer) return { kind: 'external', href: fromReferrer };

  if (hasAppHistory) return { kind: 'history' };

  return null;
}
