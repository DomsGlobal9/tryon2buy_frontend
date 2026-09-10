import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * The shop's own confirmation, instead of the browser's.
 *
 * window.confirm() was doing this job, and it is the wrong tool in a shop. It renders as
 * "www.tryon2buy.com says" in a system chrome nobody chose, it cannot be styled, it freezes
 * the whole page including any generation in flight, and on a phone it appears at the top of
 * the screen far from the thumb that triggered it. For a merchant standing at a counter with
 * a customer waiting, a browser-branded box asking about their photographs looks like
 * something went wrong.
 *
 * Deliberately mounted only while open, with no exit animation.
 *
 * The dock's modal animates out through AnimatePresence, and that bit once already: the exit
 * is driven by requestAnimationFrame, browsers stop firing it in a hidden tab, and a
 * full-screen interactive backdrop was left sitting over the page swallowing taps. A
 * confirmation is the last place to repeat that -- it is the thing standing between somebody
 * and their customer's photographs. Fading in is safe because entry does not gate removal;
 * unmounting immediately on close is what guarantees nothing can linger.
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {string}   props.title          the question, short enough to read at a glance
 * @param {string[]} props.lines          paragraphs of consequence, most important first
 * @param {string}  [props.confirmLabel]
 * @param {string}  [props.cancelLabel]
 * @param {function} props.onConfirm
 * @param {function} props.onCancel
 */
export default function ConfirmDialog({
  open,
  title,
  lines = [],
  confirmLabel = 'Delete',
  cancelLabel = 'Keep it',
  onConfirm,
  onCancel
}) {
  const cancelRef = useRef(null);

  /**
   * Escape cancels, and the cancel button takes focus.
   *
   * Focus goes to CANCEL rather than confirm on purpose: this dialog only ever appears in
   * front of something destructive and shared, so the key somebody mashes without reading
   * should be the one that changes nothing.
   */
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 pb-3">
          <div className="w-9 h-9 rounded-full bg-[#fffaf0] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#dd6b20]" />
          </div>
          <h3 className="flex-1 text-[15px] font-bold text-[#1a202c] leading-snug pt-1.5">{title}</h3>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-[#a0aec0] hover:text-[#1a202c] transition-colors p-1 -mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-4 pl-[68px] space-y-2">
          {lines.map((line, i) => (
            <p key={i} className="text-[12px] text-[#4a5568] leading-relaxed">{line}</p>
          ))}
        </div>

        <div className="flex gap-2 px-5 py-3.5 bg-[#f7fafc] border-t border-[#e2e8f0]">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#1a202c] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#edf2f7] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white bg-[#dd6b20] rounded-lg hover:bg-[#c05621] transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
