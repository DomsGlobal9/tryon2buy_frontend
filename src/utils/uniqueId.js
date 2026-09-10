/**
 * Identifiers that do not collide.
 *
 * Written because two stores used `Date.now().toString()` as a primary key. Anything saved
 * within the same millisecond got the same key, and IndexedDB's put() overwrites rather than
 * complains -- so photographs and try-on results disappeared silently. Measured on the
 * version this replaces: five photos saved in one tick produced ONE row, and three carousel
 * results produced one. No error anywhere; the pictures were simply gone.
 *
 * A millisecond is a long time. A multi-file drop, a change event that fires twice, or React
 * re-invoking a handler in development are all enough.
 */

/** Monotonic within a page, so two calls in the same millisecond still differ. */
let counter = 0;

/**
 * A unique string id.
 *
 * Timestamp-prefixed on purpose: keys sort chronologically in the store, which keeps
 * debugging sane and matches how these records are read back. Uniqueness comes from the
 * suffix, not the timestamp.
 */
export function uniqueId(prefix = '') {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;

  const stamp = Date.now();
  const seq = counter.toString(36);

  // randomUUID needs a secure context; plain http during local testing does not have one,
  // and this must not be the thing that breaks there.
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}${stamp}-${seq}-${random}`;
}
