import { API_URL } from '../config';

const OUR_BUCKET = '.supabase.co/storage/v1/object/public/tryon-fits/';

/**
 * A smaller copy of one of our stored pictures, for cards and thumbnails.
 * The server makes it once and keeps it (see /api/tryon/thumb); anything that is not in our
 * bucket is returned unchanged.
 * @param {string} url
 * @param {320|480|800} width
 */
export function thumb(url, width = 480) {
  if (!url || !url.includes(OUR_BUCKET)) return url;
  return `${API_URL}/api/tryon/thumb?w=${width}&src=${encodeURIComponent(url)}`;
}
