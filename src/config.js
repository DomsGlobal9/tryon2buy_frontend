// Central configuration for the frontend
export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Scaleezy Inventory, which owns the garments reached by scanning the QR code on a tag.
 *
 * A second backend rather than ours, because the shop's gateway key lives there and must never
 * come near a browser. This app holds no key at all: it asks Inventory what was scanned, and
 * asks Inventory to generate. Inventory presents the shop's own key on the way out.
 */
export const INVENTORY_API_URL =
  import.meta.env.VITE_INVENTORY_API_URL || 'https://inventory-backend-6vk5.onrender.com';
