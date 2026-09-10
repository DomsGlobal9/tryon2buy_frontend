/**
 * The two utilities whose bugs are invisible until they bite.
 *
 * Both are pure, and both guard something that failed silently in production: one decides
 * where a shopper's Back button goes (and could send them to a lookalike site), the other
 * hands out keys that used to collide and lose people's photographs without an error.
 *
 * Plain Node, no test framework -- this repo has none, and a runner nobody installs is a
 * suite nobody runs.
 *
 *   node scripts/verify-utils.mjs
 */
import { resolveBackTarget } from '../src/utils/backTarget.js';
import { uniqueId } from '../src/utils/uniqueId.js';

let passed = 0, failed = 0;
const failures = [];
const check = (name, ok, detail) => {
  if (ok) { passed++; console.log(`  [PASS] ${name}`); }
  else { failed++; failures.push(name); console.log(`  [FAIL] ${name}${detail !== undefined ? `  -> ${detail}` : ''}`); }
};

const SHOP = 'https://shop.example.com';
const US = 'https://www.tryon2buy.com';

console.log('\n-- BACK: where a scanned-in shopper is sent --');

/**
 * The open redirect. A /try/ link is printed on a garment tag and can be reproduced by
 * anybody; if Back followed whatever ?returnUrl said, a tag could be printed with a returnUrl
 * pointing at a lookalike and the shopper would be carried there by the one control on the
 * page that looks safe.
 */
const hostile = [
  ['a returnUrl to an unknown site', `?returnUrl=${encodeURIComponent('https://evil.example/steal')}`],
  ['a returnUrl over plain http', `?returnUrl=${encodeURIComponent('http://shop.example.com/x')}`],
  ['a javascript: returnUrl', `?returnUrl=${encodeURIComponent('javascript:alert(1)')}`],
  ['a data: returnUrl', `?returnUrl=${encodeURIComponent('data:text/html,<script>x</script>')}`],
  ['a protocol-relative returnUrl', '?returnUrl=%2F%2Fevil.example'],
  ['a returnUrl that is nonsense', '?returnUrl=not-a-url'],
  ['a returnUrl back to our own pages', `?returnUrl=${encodeURIComponent(US + '/gallery')}`]
];
for (const [label, search] of hostile) {
  const got = resolveBackTarget({ search, currentOrigin: US, allowedOrigins: [SHOP] });
  check(`refused: ${label}`, got === null || got.kind !== 'external', JSON.stringify(got));
}

const allowed = resolveBackTarget({
  search: `?returnUrl=${encodeURIComponent(SHOP + '/products/saree-12')}`,
  currentOrigin: US, allowedOrigins: [SHOP]
});
check('a returnUrl to the shop that sent them IS followed',
  allowed?.kind === 'external' && allowed.href.startsWith(SHOP), JSON.stringify(allowed));

const viaReferrer = resolveBackTarget({
  search: '', referrer: `${SHOP}/products/saree-12`, currentOrigin: US, allowedOrigins: [SHOP]
});
check('with no parameter, the referrer is used if it is the shop',
  viaReferrer?.kind === 'external', JSON.stringify(viaReferrer));

const badReferrer = resolveBackTarget({
  search: '', referrer: 'https://evil.example/x', currentOrigin: US, allowedOrigins: [SHOP]
});
check('but a referrer from anywhere else is ignored', badReferrer === null, JSON.stringify(badReferrer));

/**
 * The cold camera scan: opened straight from the phone's camera, so there is no referrer and
 * no history. The right answer is "no Back at all" -- offering one that goes nowhere, or that
 * lands on a stranger's storefront, is worse than offering none.
 */
const coldScan = resolveBackTarget({ search: '', referrer: '', currentOrigin: US, allowedOrigins: [SHOP] });
check('a cold camera scan is offered no Back at all', coldScan === null, JSON.stringify(coldScan));

const inApp = resolveBackTarget({ search: '', referrer: '', currentOrigin: US, allowedOrigins: [SHOP], hasAppHistory: true });
check('but somebody who moved around inside the app can go back',
  inApp?.kind === 'history', JSON.stringify(inApp));

const noConfig = resolveBackTarget({
  search: `?returnUrl=${encodeURIComponent(SHOP)}`, currentOrigin: US, allowedOrigins: []
});
check('with nothing allow-listed, nothing external is followed', noConfig === null, JSON.stringify(noConfig));

check('called with nothing at all it does not throw', (() => {
  try { resolveBackTarget(); return true; } catch { return false; }
})(), 'it threw');

console.log('\n-- IDS: five photographs saved in the same millisecond --');

/**
 * The bug this replaces: keys were Date.now().toString(), IndexedDB put() overwrites rather
 * than complaining, and five photographs saved in one tick became one row. No error anywhere.
 */
const burst = Array.from({ length: 5 }, () => uniqueId('photo-'));
check('five ids taken in one tick are five different ids',
  new Set(burst).size === 5, burst.join(' '));

const many = Array.from({ length: 20000 }, () => uniqueId());
check('twenty thousand in a tight loop are all distinct', new Set(many).size === 20000,
  `${new Set(many).size} distinct`);

check('the prefix is kept', uniqueId('result-').startsWith('result-'), uniqueId('result-'));
check('and it works with no prefix', typeof uniqueId() === 'string' && uniqueId().length > 8, uniqueId());

// Timestamp-first, so keys still sort chronologically in the store.
const early = uniqueId();
await new Promise(r => setTimeout(r, 5));
const later = uniqueId();
check('ids taken later sort after ids taken earlier', later > early, `${early} vs ${later}`);

console.log('\n' + '─'.repeat(60));
console.log(`${passed} passed, ${failed} failed`);
if (failures.length) failures.forEach(f => console.log(`  - ${f}`));
process.exit(failed ? 1 : 0);
