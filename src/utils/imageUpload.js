/**
 * Turning whatever the browser handed us into something the upload endpoint will accept.
 *
 * The selfie does not go straight from the file input to the server. It is written to
 * IndexedDB (so it survives navigation between garments) and read back, and the copy read
 * back is what gets uploaded -- saveToHistory broadcasts PHOTO_ADDED, which reloads the
 * active record over the top of the freshly picked one within 50ms.
 *
 * On iOS that round trip is not lossless. A File put into IndexedDB can come back with an
 * empty `type`, or as a zero-length Blob whose backing file WebKit has already released.
 * Either one produced the same dead end, because all three of these are a 500 from
 * /api/tryon/upload with no `url` in the body:
 *
 *   - no MIME type        -> multer's fileFilter rejects it ("Only image files are allowed")
 *                            even when the bytes are a perfectly good JPEG
 *   - zero bytes          -> sharp: "Input Buffer is empty"
 *   - truncated           -> sharp: "VipsJpeg: Premature end of input file"
 *
 * and the caller turned all of them into "Invalid image source. Please upload a fresh photo."
 *
 * Re-encoding through a canvas fixes the whole class at once rather than guessing which one
 * a given iPhone hits: it produces a real JPEG with a real MIME type, applies EXIF rotation,
 * bounds the size, and -- because the browser does the decoding -- accepts HEIC from the iOS
 * photo library too. It also fails loudly and early on a blob that cannot be read, which is
 * something we can actually tell someone how to fix.
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.9;

/** Thrown for problems the person can actually do something about. */
function pickPhotoAgainError(message) {
  const err = new Error(message);
  err.isUserFacing = true;
  return err;
}

const RETAKE = 'That photo could not be read. Please take or choose it again.';

function loadImage(blobUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(pickPhotoAgainError(RETAKE));
    img.src = blobUrl;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(pickPhotoAgainError(RETAKE))),
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

/**
 * Normalises a File/Blob into a JPEG File that the upload endpoint will accept.
 *
 * @param {File|Blob} source
 * @returns {Promise<File>}
 * @throws  an error marked isUserFacing when the photo genuinely cannot be read.
 */
export async function toUploadableJpeg(source) {
  // A blob that lost its bytes on the way out of IndexedDB. Catching it here means the
  // person is told to re-pick the photo instead of being told their image is invalid after
  // a pointless round trip to the server.
  if (!source || typeof source.size !== 'number' || source.size === 0) {
    throw pickPhotoAgainError(RETAKE);
  }

  const blobUrl = URL.createObjectURL(source);
  try {
    const img = await loadImage(blobUrl);

    let { width, height } = img;
    if (!width || !height) throw pickPhotoAgainError(RETAKE);

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw pickPhotoAgainError(RETAKE);

    // A fresh canvas is transparent and JPEG has no alpha channel, so anything see-through
    // encodes as BLACK -- a PNG screenshot or a cut-out would arrive with a black background
    // and look like a broken upload. White matches what the backend does to garment images.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Current Safari, Chrome and Firefox all apply EXIF orientation when an HTMLImageElement
    // is drawn, so the photo lands the right way up without reading the EXIF ourselves.
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas);
    if (!blob || blob.size === 0) throw pickPhotoAgainError(RETAKE);

    // An explicit filename and type, always. FormData sends application/octet-stream for a
    // typeless blob, and that alone is enough for the server to refuse a valid photograph.
    return new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * Uploads a selfie and returns its public URL.
 *
 * @param {object}   opts
 * @param {string}   opts.apiUrl
 * @param {File|Blob} opts.file
 * @param {string}   opts.folder   'human-images' | 'user-uploads'
 * @param {object}  [opts.headers] auth headers, if any
 * @returns {Promise<{ url: string } | { unauthorized: true }>}
 */
export async function uploadSelfie({ apiUrl = '', file, folder, headers = {} }) {
  const prepared = await toUploadableJpeg(file);

  const formData = new FormData();
  // Third argument matters: without a filename some browsers send "blob" with no extension.
  formData.append('image', prepared, prepared.name);

  const res = await fetch(`${apiUrl}/api/tryon/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (res.status === 401 || res.status === 403) return { unauthorized: true };

  // Checked, at last. This used to be assumed to have succeeded, so a 500 became
  // `undefined` and then "Invalid image source" -- a message about the photo, for a problem
  // that had nothing to do with the photo.
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      /* body was not JSON; the status is enough for the log */
    }
    console.error('[uploadSelfie] upload failed:', detail);
    throw new Error(`Selfie upload failed: ${detail}`); // not user-facing; caller genericises
  }

  const body = await res.json().catch(() => ({}));
  if (!body?.url) {
    console.error('[uploadSelfie] upload returned no url:', body);
    throw new Error('Selfie upload returned no url');
  }

  return { url: body.url };
}
