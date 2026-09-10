/**
 * Recovering a try-on whose response never arrived.
 *
 * Generation is synchronous and takes 20s-2min: the backend downloads both images, calls
 * Gemini (up to 5 attempts, 180s each, with backoff between them), watermarks, and uploads to
 * Supabase before it answers. The connection carrying that answer is the least reliable part
 * of the flow -- a proxy gives up, a phone changes network, a tab is backgrounded.
 *
 * When it broke, the result was simply lost. The server finished the image, stored it and
 * charged a credit for it; the page fell back to showing the garment, which reads to a
 * customer as "the try-on produced the product photo".
 *
 * The fix is that the caller names the request BEFORE sending it. The backend stamps that
 * name on the row it creates before any AI runs, so the result is findable by something the
 * caller already holds, rather than only by an id that travelled in the lost response.
 */

/**
 * The only thing a user is ever told when a try-on does not work.
 *
 * Backend error text ("Image download failed: HTTP 400", a raw Gemini refusal, a Supabase
 * message) is meaningless to a shopper and describes our internals. The real detail goes to
 * the console and the server log; the person sees this.
 */
export const GENERIC_TRYON_FAILURE = 'Try-on failed. Please try again.';

/**
 * What to actually put in front of someone, given a thrown error.
 * Only errors we raised ourselves and deliberately marked are shown as-is.
 */
export function userFacingMessage(err) {
  return err?.isUserFacing ? err.message : GENERIC_TRYON_FAILURE;
}

/** Raises an error whose text is safe to show, because we wrote it for this purpose. */
export function userFacingError(message) {
  const err = new Error(message);
  err.isUserFacing = true;
  return err;
}

/** Names a request so its result can be claimed later. */
export function newClientRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // randomUUID needs a secure context. Plain http (a LAN address during testing) does not
  // have one, and this must not be the thing that breaks there.
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

const POLL_INTERVAL_MS = 4000;

// The server's own worst case is roughly 5 x 180s of Gemini plus backoff. Waiting slightly
// past that is what makes "if the backend generated it, the frontend gets it" actually true,
// rather than true only for the fast ones.
const MAX_WAIT_MS = 16 * 60 * 1000;

// The row is written before the AI is called. If it is still missing after this long, the
// request never reached the server, so there is nothing to wait for and we say so promptly
// instead of spinning for sixteen minutes.
const NOT_FOUND_GRACE_MS = 20000;

/**
 * Polls for the outcome of a generation that was already started.
 *
 * @param {object}   opts
 * @param {string}   opts.apiUrl            API base (may be '').
 * @param {string}   opts.clientRequestId   The key sent with the original request.
 * @param {object}  [opts.headers]          Auth headers, if the caller has any.
 * @param {function}[opts.isCancelled]      Return true to abandon the wait (e.g. unmounted).
 * @returns {Promise<{status:'COMPLETED', result_image_url:string, generation_id:string}
 *                  | {status:'FAILED', error:string}
 *                  | null>}  null when the outcome could not be established.
 */
export async function recoverGeneration({ apiUrl = '', clientRequestId, headers = {}, isCancelled }) {
  if (!clientRequestId) return null;

  const startedAt = Date.now();
  let firstSeenAt = null;

  while (Date.now() - startedAt < MAX_WAIT_MS) {
    if (typeof isCancelled === 'function' && isCancelled()) return null;

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    if (typeof isCancelled === 'function' && isCancelled()) return null;

    try {
      const res = await fetch(
        `${apiUrl}/api/tryon/generation-status/${encodeURIComponent(clientRequestId)}`,
        { headers }
      );

      if (res.status === 404) {
        // Never started, or not written yet. Give it a short grace period, then stop.
        if (firstSeenAt === null && Date.now() - startedAt > NOT_FOUND_GRACE_MS) return null;
        continue;
      }

      if (!res.ok) continue; // transient; keep waiting

      const body = await res.json();

      if (body.status === 'COMPLETED' && body.result_image_url) return body;
      if (body.status === 'FAILED') return body;

      // PROCESSING: the row exists, so the work is genuinely running. From here on a 404
      // would be an anomaly rather than "never started", so the grace period stops applying.
      firstSeenAt = firstSeenAt ?? Date.now();
    } catch {
      // Offline, DNS blip, proxy hiccup -- none of these mean the generation failed.
      // Keep waiting; the whole point is to outlast the connection.
    }
  }

  return null;
}
