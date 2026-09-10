import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * A thumbnail that says something when the picture will not load.
 *
 * A dock entry is a row in the database pointing at a file in storage, and those two can
 * disagree. The row can outlive the file -- the storage collector spares anything under
 * twenty-four hours but nothing older, so a file removed from under a live entry leaves the
 * dock holding a URL that 404s. Verified on production: an entry whose file did not exist
 * rendered as a blank tile, no icon, no words, and sat there for its full twenty minutes.
 *
 * A blank tile is the worst of the options. It looks like the dock is broken, or like the
 * photograph is still loading, and somebody will keep tapping it. Saying "this one is gone"
 * costs nothing and answers the question.
 *
 * Only the FAILURE is handled here, not a loading state. These are small images off a CDN and
 * a spinner on each one would flicker on every open for no information.
 *
 * @param {object}   props
 * @param {string}  [props.src]     the image; a missing one falls back the same way a broken one does
 * @param {string}   props.alt
 * @param {string}  [props.label]   what to say in the tile's place
 * @param {React.ElementType} [props.icon]  shown when there is no src at all (a garment gets a shirt)
 */
export default function ThumbWithFallback({ src, alt, label = 'Not available', icon: EmptyIcon }) {
  const [failed, setFailed] = useState(false);

  /**
   * A new URL gets a fresh chance.
   *
   * Without this, one broken image poisons the tile for whatever the dock shows next in that
   * position -- the list is re-rendered constantly as photographs are added, picked and swept,
   * and React reuses the element. The failure belongs to the URL, not to the slot on screen.
   */
  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) {
    const Icon = (!src && EmptyIcon) ? EmptyIcon : ImageOff;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#f7fafc] px-1">
        <Icon className="w-6 h-6 text-[#cbd5e0]" />
        {/* Only when the picture was expected and did not arrive. An empty slot is not a
            failure and does not need explaining. */}
        {src && failed && (
          <span className="text-[8px] leading-tight text-center text-[#a0aec0] font-sans">{label}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover"
    />
  );
}
