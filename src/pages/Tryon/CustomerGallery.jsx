import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Copy, Check } from 'lucide-react';

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
    // Inject fonts
    const linkGaramond = document.createElement('link');
    linkGaramond.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap';
    linkGaramond.rel = 'stylesheet';
    document.head.appendChild(linkGaramond);

    const linkCourier = document.createElement('link');
    linkCourier.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap';
    linkCourier.rel = 'stylesheet';
    document.head.appendChild(linkCourier);

    return () => {
      document.head.removeChild(linkGaramond);
      document.head.removeChild(linkCourier);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/tryon/vendor/${vendorId}/gallery`)
      .then(res => {
        if (!res.ok) throw new Error('Collection not found.');
        return res.json();
      })
      .then(data => {
        setGenerations(data.generations || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [vendorId]);

  if (loading) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center font-['Courier_Prime',monospace]">
        <p className="text-[12px] uppercase tracking-widest text-[#8c8278] animate-pulse">
          Loading Collection...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center font-['Courier_Prime',monospace]">
        <p className="text-[12px] uppercase tracking-widest text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen font-['Courier_Prime',monospace] text-[#1a1410] flex flex-col">

      {/* Header */}
      <header className="bg-[#faf7f2] border-b border-[rgba(26,20,16,0.1)] h-[60px] flex items-center justify-center px-[64px] shrink-0">
        <span className="font-['EB_Garamond',serif] tracking-[0.2em] text-[18px] font-normal">
          TRYON2BUY <span className="opacity-40 px-2">|</span> COLLECTION
        </span>
      </header>

      {/* Page Title */}
      <div className="flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-[1040px] mb-10">
          <h1 className="font-['EB_Garamond',serif] text-[36px] font-normal leading-tight text-[#1a1410]">
            Curated Collection
          </h1>
          <p className="text-[11px] tracking-[1.5px] uppercase font-bold text-[#8c8278] mt-2">
            Select a piece you love and see how it looks on you — virtually.
          </p>
        </div>

        {generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 opacity-60">
            <ShoppingBag className="w-12 h-12 mb-4 text-[#8c8278]" />
            <p className="text-[12px] uppercase tracking-widest text-[#8c8278]">
              No items in this collection yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1040px]">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="bg-white border border-[rgba(26,20,16,0.1)] p-3 flex flex-col gap-3 group hover:border-[#7f5700] transition-all hover:shadow-lg"
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-[#ede8df] overflow-hidden relative">
                  <img
                    src={gen.resultImageUrl || gen.garmentImageUrl}
                    alt={gen.category || 'Garment'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#1a1410] truncate">
                    {gen.category || 'Garment'}
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => navigate(`/tryon/${gen.id}`, { state: { fromGallery: true } })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1a1410] text-[#faf7f2] text-[9px] font-bold uppercase tracking-widest hover:bg-[#7f5700] transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Try This On</span>
                    </button>
                    
                    <button
                      onClick={() => copyLink(gen.id)}
                      title="Copy link to share with a friend"
                      className={`flex items-center justify-center w-10 shrink-0 transition-colors ${
                        copiedId === gen.id
                          ? 'bg-[#1a1410] text-[#faf7f2]'
                          : 'bg-[#faf7f2] border border-[rgba(26,20,16,0.1)] text-[#1a1410] hover:bg-[rgba(26,20,16,0.05)]'
                      }`}
                    >
                      {copiedId === gen.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
