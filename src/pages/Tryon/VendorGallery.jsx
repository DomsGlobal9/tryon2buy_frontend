import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Copy, Check, Trash2, ExternalLink, X } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';
import { getVendorToken, clearVendorSession } from '../../utils/auth';
import { categoryLabel } from '../../utils/categories';
import { GridSkeleton } from '../../components/Skeleton';
import { thumb } from '../../utils/thumb';
import GarmentCard from '../../components/GarmentCard';

// Must match the hardcoded vendor ID in backend/index.js
const DEFAULT_VENDOR_ID = 'feb21067-a3ee-4020-b388-16d3a37a29ce';

export default function VendorGallery() {
  const navigate = useNavigate();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [galleryCopied, setGalleryCopied] = useState(false);
  const [previewGen, setPreviewGen] = useState(null);

  /**
   * The same promise-shaped confirm the dock uses, for the same reason.
   *
   * This was window.confirm, which renders as "www.tryon2buy.com says" in chrome nobody
   * chose and freezes the page while it is up. Deleting from the gallery is the most
   * destructive thing on this screen -- the try-on does not come back -- so it is the last
   * place to ask the question in a box that looks like a browser error.
   */
  const [confirmState, setConfirmState] = useState(null);
  const ask = (question) => new Promise((resolve) => setConfirmState({ ...question, resolve }));
  const settleConfirm = (answer) => {
    setConfirmState((current) => { current?.resolve(answer); return null; });
  };

  /**
   * A failure worth mentioning, in our own words and gone on its own.
   *
   * The two alert()s here were native AND wrong: one of them printed the server's error
   * straight onto the screen -- "Failed to delete: " + data.error -- which is exactly what
   * nobody outside this codebase should ever read. A merchant needs to know it did not work,
   * not which table complained.
   */
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  const vendor = JSON.parse(localStorage.getItem('vendor_data') || '{}');
  const vendorId = vendor.id || DEFAULT_VENDOR_ID;

  const copyGalleryLink = () => {
    const link = `${window.location.origin}/shop/${vendorId}`;
    navigator.clipboard.writeText(link);
    setGalleryCopied(true);
    setTimeout(() => setGalleryCopied(false), 2000);
  };

  /**
   * Set when the gallery could not be loaded, so the page says so.
   *
   * A failed load used to fall through to "No draped garments yet": the error body was not an
   * array, .filter threw, and the catch left the list empty. A vendor whose login had expired
   * was told their catalogue was empty, which reads as "your work has been deleted".
   */
  const [loadFailed, setLoadFailed] = useState(false);

  // An expired login goes to the login page and comes straight back here afterwards.
  const sendToLogin = () => {
    clearVendorSession();
    navigate('/login', { replace: true, state: { returnTo: '/gallery' } });
  };

  useEffect(() => {
    const token = getVendorToken();
    fetch(`${API_URL}/api/tryon/vendor/generations`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(async res => {
        if (res.status === 401 || res.status === 403) { sendToLogin(); return null; }
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) throw new Error(`gallery load failed: ${res.status}`);
        return data;
      })
      .then(data => {
        if (!data) return;
        // Show only Phase 1 vendor drapings with successful AI results (exclude fallbacks/failed images)
        const vendorGens = data.filter(g => g.mode === 'with_garment' && g.phase === 1 && !!g.resultImageUrl);
        setGenerations(vendorGens);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch gallery", err);
        setLoadFailed(true);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = (id) => {
    const link = `${window.location.origin}/tryon/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    /**
     * Worded from what the server actually does, which is more than the old copy admitted.
     *
     * These gallery items are the phase-1 drapes -- the flatlay put on a default model and
     * saved. DELETE /api/tryon/vendor/generations/:id removes the asset AND runs
     * product.deleteMany on anything using it as its primary image, to clear the foreign key.
     * So this is not "remove a picture": it takes the product out of the catalogue, and with
     * it the ability for anyone to try that garment on.
     *
     * "Are you sure you want to delete this try-on from your gallery?" described none of
     * that. Somebody tidying what they thought were old previews would have been removing
     * stock.
     */
    const ok = await ask({
      title: 'Delete this drape from your catalogue?',
      lines: [
        'This is the draped photo of the garment. Deleting it removes the product from your catalogue too, so nobody can try that garment on any more.',
        'Its share link stops working, and it cannot be undone.'
      ],
      confirmLabel: 'Delete product',
      cancelLabel: 'Keep it'
    });
    if (!ok) return;
    
    try {
      const token = getVendorToken();
      const res = await fetch(`${API_URL}/api/tryon/vendor/generations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.status === 401) { sendToLogin(); return; }
      if (res.ok) {
        setGenerations(prev => prev.filter(g => g.id !== id));
      } else {
        // Detail to the console, never to the person -- the same rule the try-on pages follow.
        const data = await res.json().catch(() => ({}));
        console.error("Failed to delete", data.error);
        setNotice('That drape could not be deleted. Please try again.');
      }
    } catch (err) {
      console.error("Error deleting", err);
      setNotice('That drape could not be deleted. Please try again.');
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen font-sans text-[#1a1410] flex flex-col items-center py-12 px-6 relative">

      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title}
        lines={confirmState?.lines}
        confirmLabel={confirmState?.confirmLabel}
        cancelLabel={confirmState?.cancelLabel}
        onConfirm={() => settleConfirm(true)}
        onCancel={() => settleConfirm(false)}
      />

      {notice && (
        <div role="status" className="fixed bottom-6 right-6 z-40 max-w-xs bg-white border border-[#e2e8f0] shadow-lg rounded-lg px-3.5 py-2.5">
          <p className="text-[11px] text-[#1a202c] leading-relaxed">{notice}</p>
        </div>
      )}
      
      <div className="w-full max-w-[1000px] mb-8">
        <Link to="/workspace" className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-[1.5px] text-accent hover:text-[#1a1410] transition-colors mb-4">
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to Workspace</span>
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-serif text-3xl md:text-[36px] font-normal leading-tight text-[#1a1410]">
              Vendor Gallery
            </h2>
            <p className="text-[15px] text-muted mt-2">
              Your beautifully draped catalog ready to be shared with customers.
            </p>
          </div>

          {/* Share Full Gallery Button */}
          <button
            onClick={copyGalleryLink}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors shrink-0 ${
              galleryCopied
                ? 'bg-[#1a1410] text-[#faf7f2]'
                : 'border border-[#1a1410] text-[#1a1410] hover:bg-[#1a1410] hover:text-[#faf7f2]'
            }`}
          >
            {galleryCopied ? (
              <><Check className="w-3 h-3" /><span>Gallery Link Copied!</span></>
            ) : (
              <><Share2 className="w-3 h-3" /><span>Share Full Gallery</span></>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 w-full flex justify-center"><GridSkeleton /></div>
      ) : loadFailed ? (
        <div className="flex flex-col items-center justify-center mt-20 opacity-70 text-center">
          <p className="text-[12px] uppercase tracking-widest text-muted">We couldn't load your gallery.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest border border-[#1a1410] text-[#1a1410] hover:bg-[#1a1410] hover:text-[#faf7f2] transition-colors"
          >
            Try again
          </button>
        </div>
      ) : generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 opacity-60">
          <Share2 className="w-12 h-12 mb-4 text-muted" />
          <p className="text-[12px] uppercase tracking-widest text-muted">No draped garments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 w-full max-w-[1000px]">
          {generations.map((gen) => (
            <GarmentCard
              key={gen.id}
              image={thumb(gen.resultImageUrl || gen.garmentImageUrl, 480)}
              title={categoryLabel(gen.category) || 'Draped garment'}
              onOpen={() => setPreviewGen(gen)}
              openLabel="View full size"
              // The SHOP's try-on page, with the shared dock: photos and outfits follow the
              // account across the counter tablet and the stockroom phone.
              onTryOn={() => navigate(`/vendor/preview/${gen.id}`)}
              actions={[
                { key: 'share', label: copiedId === gen.id ? 'Copied' : 'Share', icon: copiedId === gen.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />, onClick: () => copyLink(gen.id) },
                // What a shopper who follows the share link sees. fromVendorGallery lets that
                // page send its logo back to the workspace for this vendor, and nobody else.
                { key: 'preview', label: 'Preview', icon: <ExternalLink className="w-3.5 h-3.5" />, onClick: () => navigate(`/tryon/${gen.id}`, { state: { fromVendorGallery: true } }) },
              ]}
            />
          ))}
        </div>
      )}

      {/* Full-size view, and the one place Delete lives: on every card it sat one tap from Try it on. */}
      {previewGen && (
        <div
          className="fixed inset-0 z-[200] bg-[#1a1410]/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 sm:p-12 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setPreviewGen(null)}
        >
          <button
            aria-label="Close"
            className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white/60 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setPreviewGen(null); }}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={previewGen.resultImageUrl || previewGen.garmentImageUrl}
            alt="Full size"
            className="max-w-full max-h-[80vh] object-contain cursor-default drop-shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); const id = previewGen.id; setPreviewGen(null); handleDelete(id); }}
            className="flex items-center gap-2 px-4 py-2 border border-white/30 text-white/80 hover:text-white hover:border-red-400 hover:bg-red-600/80 text-[12px] font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete this drape
          </button>
        </div>
      )}

    </div>
  );
}
