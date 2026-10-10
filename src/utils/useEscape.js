import { useEffect } from 'react';

/** Closes a popup on the Escape key while it is open. */
export function useEscape(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
}
