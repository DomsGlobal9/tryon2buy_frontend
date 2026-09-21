/**
 * One answer to "who is using this screen?", shared by every page.
 *
 * Each page used to ask for itself, and they all asked the wrong question: "is there a
 * vendor_token in localStorage?". A token is still sitting there seven days after it has
 * expired, so an expired vendor was let into the workspace, shown an empty gallery, and
 * charged as a guest; and a customer page on a shop's tablet treated the shopper as the
 * shop owner. These helpers answer the real question -- is there a login that still works?
 */

const TOKEN_KEY = 'vendor_token';
const GUEST_KEY = 'guest_mode';
const DEVICE_KEY = 'guest_device_id';

/**
 * True when the token's own expiry time has passed.
 *
 * Reads the exp claim without verifying the signature -- only the server can do that, and it
 * still does on every request. This is only to stop the screen acting on a login it can see
 * is over. A token that cannot be decoded is NOT called expired: guessing wrong there would
 * sign people out for no reason, and the server will refuse a bad token by itself.
 */
function isExpired(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return false;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '='));
    const { exp } = JSON.parse(json);
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

/** Everything a login leaves behind -- the same keys the logout buttons remove. */
export function clearVendorSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('vendor_data');
  localStorage.removeItem('portal_type');
}

/**
 * The vendor token, or null when there is none or it has expired.
 *
 * An expired one is removed on the spot. That is what keeps the login page and the route
 * guard agreeing: the login page sends anyone with a token to the workspace, and the guard
 * sends anyone without a working one to the login page -- if the two disagreed about an
 * expired token they would bounce it between them forever.
 */
export function getVendorToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (isExpired(token)) {
    clearVendorSession();
    return null;
  }
  return token;
}

/**
 * Guest mode, remembered on this device rather than in one tab.
 *
 * It lived in sessionStorage, which belongs to a single tab: opening the workspace or a
 * shared link in a new tab forgot it, and the guest was sent to a vendor login page. Both
 * stores are read so a guest who started before this change is still recognised.
 */
export function isGuestMode() {
  return localStorage.getItem(GUEST_KEY) === 'true' || sessionStorage.getItem(GUEST_KEY) === 'true';
}

export function setGuestMode() {
  localStorage.setItem(GUEST_KEY, 'true');
  sessionStorage.setItem(GUEST_KEY, 'true');
}

export function clearGuestMode() {
  localStorage.removeItem(GUEST_KEY);
  sessionStorage.removeItem(GUEST_KEY);
}

/**
 * A random id for this browser, so free try-ons are counted per device.
 *
 * The server used to count them per IP address, so everyone on a shop's Wi-Fi shared one
 * allowance. It is random and identifies nobody; the server also caps a whole network, so
 * clearing it is not an unlimited supply.
 */
export function getGuestDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID())
        || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return undefined; // storage blocked: the server falls back to counting by IP
  }
}

/**
 * A path to come back to after logging in, or null if it is not safe to follow.
 *
 * Only paths inside this site. "//evil.example" is a path to a browser and a whole other
 * site to the address bar, so it is refused; so is /login, which would loop.
 */
export function safeReturnPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return null;
  if (path === '/login' || path.startsWith('/login?')) return null;
  return path;
}

/**
 * What an error response from a try-on means for the person looking at the screen.
 *
 * Every page used to lump all 401s and 403s together and show "Free Trial Ended -- Login as
 * Vendor", including to vendors whose login had merely expired.
 *
 * @returns {'guest_limit' | 'credits' | 'expired' | null}
 */
export function authProblem(status, body) {
  const code = body && body.error;
  if (code === 'GUEST_LIMIT_REACHED') return 'guest_limit';
  if (code === 'INSUFFICIENT_CREDITS') return 'credits';
  if (status === 401 || status === 403) return 'expired';
  return null;
}
