import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Copy, Check, Trash2, ExternalLink } from 'lucide-react';

// Must match the hardcoded vendor ID in backend/index.js
const DEFAULT_VENDOR_ID = 'feb21067-a3ee-4020-b388-16d3a37a29ce';

export default function VendorGallery() {
  const navigate = useNavigate();
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [galleryCopied, setGalleryCopied] = useState(false);

  const vendor = JSON.parse(localStorage.getItem('vendor_data') || '{}');
  const vendorId = vendor.id || DEFAULT_VENDOR_ID;

  const copyGalleryLink = () => {
    const link = `${window.location.origin}/shop/${vendorId}`;
    navigator.clipboard.writeText(link);
    setGalleryCopied(true);
    setTimeout(() => setGalleryCopied(false), 2000);
  };

  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    fetch(`${API_URL}/api/tryon/vendor/generations`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(res => res.json())
      .then(data => {
        // Show only Phase 1 vendor drapings (exclude customer Phase 2 try-ons)
        const vendorGens = data.filter(g => g.mode === 'with_garment' && g.phase === 1);
        setGenerations(vendorGens);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch gallery", err);
        setLoading(false);
      });
  }, []);

  const copyLink = (id) => {
    const link = `${window.location.origin}/tryon/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this try-on from your gallery?")) return;
    
    try {
      const token = localStorage.getItem('vendor_token');
      const res = await fetch(`${API_URL}/api/tryon/vendor/generations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        setGenerations(prev => prev.filter(g => g.id !== id));
      } else {
        const data = await res.json();
        console.error("Failed to delete", data.error);
        alert("Failed to delete: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting", err);
      alert("Error deleting item");
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen font-['Courier_Prime',monospace] text-[#1a1410] flex flex-col items-center py-12 px-6 relative">
      
      <div className="w-full max-w-[1000px] mb-8">
        <Link to="/workspace" className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[1.5px] text-[#7f5700] hover:text-[#1a1410] transition-colors mb-4">
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to Workspace</span>
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-['EB_Garamond',serif] text-[36px] font-normal leading-tight text-[#1a1410]">
              Vendor Gallery
            </h2>
            <p className="text-[11px] tracking-[1.5px] uppercase font-bold text-[#8c8278] mt-2">
              Your beautifully draped catalog ready to be shared with customers.
            </p>
          </div>

          {/* Share Full Gallery Button */}
          <button
            onClick={copyGalleryLink}
            className={`flex items-center gap-2 px-5 py-3 text-[9px] font-bold uppercase tracking-widest transition-colors shrink-0 ${
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
        <div className="text-[12px] uppercase tracking-widest text-[#8c8278] mt-20 animate-pulse">
          Loading your gallery...
        </div>
      ) : generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 opacity-60">
          <Share2 className="w-12 h-12 mb-4 text-[#8c8278]" />
          <p className="text-[12px] uppercase tracking-widest text-[#8c8278]">No draped garments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-[1000px]">
          {generations.map((gen) => (
            <div key={gen.id} className="bg-white border border-[rgba(26,20,16,0.1)] p-3 flex flex-col gap-3 group hover:border-[#7f5700] transition-all hover:shadow-lg">
              <div className="aspect-[3/4] bg-[#ede8df] overflow-hidden relative group/img">
                <img 
                  src={gen.resultImageUrl || gen.garmentImageUrl} 
                  alt="Draped Garment" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => handleDelete(gen.id)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 p-2 rounded-sm opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm border border-transparent hover:border-red-200"
                  title="Delete from Gallery"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#1a1410] truncate">
                  {gen.category || "Draped Garment"}
                </span>

                {/* Split Buttons: Share Link + Tryon */}
                <div className="flex gap-1.5">
                  {/* Share Link (left, wider) */}
                  <button
                    onClick={() => copyLink(gen.id)}
                    title="Copy customer share link"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                      copiedId === gen.id
                        ? 'bg-[#1a1410] text-[#faf7f2]'
                        : 'bg-[#faf7f2] border border-[#1a1410] text-[#1a1410] hover:bg-[#1a1410] hover:text-[#faf7f2]'
                    }`}
                  >
                    {copiedId === gen.id ? (
                      <><Check className="w-3 h-3" /><span>Copied</span></>
                    ) : (
                      <><Copy className="w-3 h-3" /><span>Share</span></>
                    )}
                  </button>

                  {/* Tryon Preview (right) */}
                  <button
                    onClick={() => navigate(`/tryon/${gen.id}`)}
                    title="Preview customer try-on experience"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-widest bg-[#7f5700] text-[#faf7f2] hover:bg-[#1a1410] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Tryon</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
