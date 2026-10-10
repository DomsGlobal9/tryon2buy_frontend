// Category keys stay as the server knows them (LEHANGA, KURTHI); this is only what a person reads.
const LABELS = { SAREE: 'Saree', LEHANGA: 'Lehenga', ANARKALI: 'Anarkali', KURTHI: 'Kurti', SHARARA: 'Sharara' };

export function categoryLabel(key) {
  if (!key) return '';
  const upper = String(key).toUpperCase();
  return LABELS[upper] || upper.charAt(0) + upper.slice(1).toLowerCase();
}
