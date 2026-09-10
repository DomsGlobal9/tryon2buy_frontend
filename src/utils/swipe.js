/**
 * Swipe left/right, for the people who have no arrow keys and no mouse.
 *
 * The try-on carousel could only be moved by tapping a small chevron or an even smaller
 * thumbnail. On a phone -- which is most of the people who ever see it, since the whole point
 * is a shopper holding their own camera -- the natural gesture is to drag the picture sideways,
 * and nothing happened. They are not going to hunt for a 32px target while holding a saree.
 *
 * Deliberately built on touch events rather than a carousel library: the carousel already
 * exists and works, this only adds a second way to drive it. A library would replace markup
 * that three pages already share.
 *
 * The rules that matter, and why:
 *
 *   - a swipe must beat a scroll only when it is clearly sideways. A finger moving mostly
 *     down the screen is reading, not browsing, and stealing that gesture makes the page feel
 *     broken. Hence the horizontal-dominance test.
 *   - it needs a floor. Thumbs wobble, and every tap carries a few pixels of drift; without a
 *     threshold a tap on the image would jump to the next try-on.
 *   - it must not preventDefault on move. Doing that kills vertical scrolling inside the
 *     carousel, which is a far worse bug than the one being fixed.
 *   - multi-touch is left alone. Two fingers is a pinch-zoom on somebody's face, and they are
 *     entitled to it.
 */

/** Below this, it was a tap or a wobble, not a swipe. Roughly a thumb's width. */
const MIN_DISTANCE_PX = 45;

/**
 * How much more horizontal than vertical the movement has to be before it counts.
 *
 * 1.2 rather than 1.0 because a thumb arcs: swiping sideways across a phone naturally curves
 * down, so a strict comparison rejects real swipes. Anything much higher starts demanding a
 * ruler-straight gesture nobody makes.
 */
const HORIZONTAL_BIAS = 1.2;

/** Longer than this and it is a drag, a long-press, or a finger that got distracted. */
const MAX_DURATION_MS = 800;

/**
 * Props to spread onto the element that should accept swipes.
 *
 *   <div {...swipeable({ onNext: nextSlide, onPrev: prevSlide })}>
 *
 * `onNext` fires on a swipe LEFT, because the content moves left as you push it away -- the
 * same direction every photo gallery on a phone already uses. Getting this backwards is the
 * kind of thing that feels wrong without anyone being able to say why.
 *
 * @param {object}   opts
 * @param {function} opts.onNext     called on a leftward swipe
 * @param {function} opts.onPrev     called on a rightward swipe
 * @param {boolean} [opts.enabled]   false to ignore gestures entirely (one slide, or busy)
 */
export function swipeable({ onNext, onPrev, enabled = true } = {}) {
  let startX = 0;
  let startY = 0;
  let startedAt = 0;
  let tracking = false;

  const onTouchStart = (e) => {
    // One finger only. Two is a pinch, and hijacking it would fight the zoom.
    if (!enabled || e.touches.length !== 1) { tracking = false; return; }
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startedAt = Date.now();
    tracking = true;
  };

  const onTouchEnd = (e) => {
    if (!tracking) return;
    tracking = false;
    if (!enabled) return;

    // changedTouches, not touches: by touchend the finger is gone from touches.
    const touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (Date.now() - startedAt > MAX_DURATION_MS) return;
    if (Math.abs(dx) < MIN_DISTANCE_PX) return;
    // Mostly-vertical movement belongs to the page's scroll, not to us.
    if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_BIAS) return;

    if (dx < 0) { if (typeof onNext === 'function') onNext(); }
    else        { if (typeof onPrev === 'function') onPrev(); }
  };

  // A cancelled touch (a call arrives, the browser takes over) is not a swipe.
  const onTouchCancel = () => { tracking = false; };

  return {
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    /**
     * Vertical scrolling stays with the browser, horizontal panning comes to us.
     *
     * Without this the browser may claim a sideways drag for its own overscroll or
     * back-navigation gesture before touchend ever fires, and the swipe is simply eaten.
     */
    style: { touchAction: 'pan-y' }
  };
}
