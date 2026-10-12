import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * The one garment card: shop, vendor gallery and product catalogue all use it.
 *
 * Those pages each had their own card (square/orange, rounded/black, SKU chips, two different
 * Eye buttons, a red bin on every picture), so the same garment looked different depending on
 * which page it was on. The rules here:
 *   - the picture opens the garment (full size, or the try-on, as the page decides)
 *   - one main action, "Try it on"
 *   - at most two short secondary actions, on one line, never wrapping
 *   - nothing destructive on the card: delete lives in the full-size view, where it is deliberate
 */
export default function GarmentCard({ image, title, subtitle, onOpen, openLabel, onTryOn, actions = [] }) {
  return (
    <div className="bg-white border border-[rgba(26,20,16,0.1)] p-2 md:p-3 flex flex-col gap-2.5 group hover:border-[rgba(26,20,16,0.35)] transition-colors">
      <button
        onClick={onOpen}
        aria-label={openLabel || `Open ${title}`}
        className="block w-full aspect-[3/4] bg-[#ede8df] overflow-hidden cursor-pointer"
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </button>

      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-[#1a1410] truncate" title={title}>{title}</p>
        {subtitle && <p className="text-[12px] text-muted truncate">{subtitle}</p>}
      </div>

      {/* One extra action sits beside the main one, 75/25, as an icon (no room for words at a
          quarter of a card); two or more go on their own line underneath. */}
      <div className={actions.length === 1 ? 'grid grid-cols-4 gap-1.5' : 'flex'}>
        <button
          onClick={onTryOn}
          className={`${actions.length === 1 ? 'col-span-3' : 'flex-1'} min-w-0 flex items-center justify-center gap-2 py-2.5 bg-[#1a1410] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-accent transition-colors whitespace-nowrap`}
        >
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>Try it on</span>
        </button>
        {actions.length === 1 && (
          <button
            onClick={actions[0].onClick}
            aria-label={actions[0].label}
            title={actions[0].label}
            className={`col-span-1 flex items-center justify-center border transition-colors ${actions[0].danger
              ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400'
              : 'border-[rgba(26,20,16,0.25)] text-[#1a1410] hover:border-[#1a1410] hover:text-accent'}`}
          >
            {actions[0].icon}
          </button>
        )}
      </div>

      {actions.length > 1 && (
        <div className={`grid ${actions.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 -mt-1`}>
          {actions.map((a) => (
            <button
              key={a.key || a.label}
              onClick={a.onClick}
              className="flex items-center justify-center gap-1 py-1.5 text-[12px] font-medium text-[#1a1410] whitespace-nowrap hover:text-accent transition-colors"
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
