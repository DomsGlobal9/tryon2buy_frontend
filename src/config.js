// Central configuration for the frontend
export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Scaleezy Inventory, which owns the garments reached by scanning the QR code on a tag.
 *
 * A second backend rather than ours, because the shop's gateway key lives there and must never
 * come near a browser. This app holds no key at all: it asks Inventory what was scanned, and
 * asks Inventory to generate. Inventory presents the shop's own key on the way out.
 *
 * The fallback is not decoration. Nothing sets VITE_INVENTORY_API_URL in this deployment, so
 * this literal IS the address every scanned tag resolves against -- and it was pointing at
 * inventory-backend-6vk5, which now answers "Service Suspended". A shopper scanning a tag got
 * "Nothing to try on", which reads as the garment not being set up rather than as the wrong
 * host in a config file. Verified before changing it: the old host serves that suspended page,
 * this one answers with Inventory's own JSON.
 */
export const INVENTORY_API_URL =
  import.meta.env.VITE_INVENTORY_API_URL || 'https://inventory-backend-1-ym8d.onrender.com';

/**
 * Where a shopper who arrived from Inventory is allowed to be sent back to.
 *
 * A scanned garment belongs to a shop in Inventory, not to this app, so "back" for that
 * person means their shop's page -- never this app's own gallery, storefront or merchant
 * studio, which are somebody else's product entirely.
 *
 * This is an allowlist rather than "trust whatever ?returnUrl says", because a page that
 * redirects anywhere on request is an open redirect: a /try/ link could be mailed out with a
 * returnUrl pointing at a lookalike site, and the Back button would carry the shopper there.
 * Set VITE_INVENTORY_APP_URL to the Inventory front end to allow it.
 */
export const INVENTORY_APP_URL = import.meta.env.VITE_INVENTORY_APP_URL || '';
