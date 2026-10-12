import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Copy, Check, ChevronLeft } from 'lucide-react';
import ErrorScreen, { NETWORK_PROBLEM } from '../../components/ErrorScreen';
import { GridSkeleton } from '../../components/Skeleton';
import { thumb } from '../../utils/thumb';
import GarmentCard from '../../components/GarmentCard';
import { userFacingError } from '../../utils/generationRecovery';
import { categoryLabel } from '../../utils/categories';

export default function CustomerGallery() {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copyLink = (id) => {
    const link = `${window.location.origin}/tryon/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };


  useEffect(() => {
    fetch(`${API_URL}/api/tryon/vendor/${vendorId}/gallery`)
      .then(res => {
        if (res.status === 404) throw userFacingError("This shop's collection could not be found. Please check the link.");
        if (!res.ok) throw new Error(`gallery ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Filter out any generations that do not have a successful AI result image
        setGenerations((data.generations || []).filter(g => !!g.resultImageUrl));
        setLoading(false);
      })
      .catch(err => {
        console.error('[CustomerGallery] load failed', err);
        setError(err.isUserFacing ? err.message : NETWORK_PROBLEM);
        setLoading(false);
      });
  }, [vendorId]);

  if (loading) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex flex-col items-center px-4 md:px-6 pt-24">
        <GridSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={error === NETWORK_PROBLEM ? () => window.location.reload() : undefined} />;
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen font-sans text-[#1a1410] flex flex-col">

      {/* Header */}
      <header className="bg-[#faf7f2] border-b border-[rgba(26,20,16,0.1)] h-[60px] flex items-center justify-between px-4 md:px-[64px] shrink-0 relative">
        <div className="w-[150px] md:w-[200px]">
          <button
            // Opened straight from a shared link there is nothing to go back to.
            onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-[1.5px] text-accent hover:text-[#1a1410] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="flex items-center">
            <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-10 object-contain mr-2" />
            <span className="hidden sm:flex font-serif font-normal text-[#1a1410] text-[18px] md:text-[22px] tracking-tight items-center"><span className="opacity-40 px-2">|</span> COLLECTION</span>
          </div>
        </div>
        
        <div className="w-[150px] md:w-[200px]"></div>
      </header>

      {/* Page Title */}
      <div className="flex flex-col items-center py-10 px-4 md:px-6">
        <div className="w-full max-w-[1040px] mb-10">
          <h1 className="font-serif text-3xl md:text-[36px] font-normal leading-tight text-[#1a1410]">
            Curated Collection
          </h1>
          <p className="text-[15px] text-muted mt-2">
            Pick a piece you love and see how it looks on you.
          </p>
        </div>

        {generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 opacity-60">
            <ShoppingBag className="w-12 h-12 mb-4 text-muted" />
            <p className="text-[12px] uppercase tracking-widest text-muted">
              No items in this collection yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 w-full max-w-[1040px]">
            {/* Two per row on phones: one card per screen made browsing a collection a long scroll. */}
            {generations.map((gen) => {
              const tryOn = () => navigate(`/tryon/${gen.id}`, { state: { fromGallery: true } });
              return (
                <GarmentCard
                  key={gen.id}
                  image={thumb(gen.resultImageUrl || gen.garmentImageUrl, 480)}
                  // The product's own name when the shop gave it one; the category otherwise.
                  title={gen.title || categoryLabel(gen.category) || 'Garment'}
                  subtitle={gen.title ? categoryLabel(gen.category) : null}
                  // For a shopper the picture is the garment, so it opens the try-on.
                  onOpen={tryOn}
                  openLabel={`Try on ${gen.title || categoryLabel(gen.category) || 'this garment'}`}
                  onTryOn={tryOn}
                  actions={[{ key: 'copy', label: copiedId === gen.id ? 'Link copied' : 'Copy link', icon: copiedId === gen.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />, onClick: () => copyLink(gen.id) }]}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
