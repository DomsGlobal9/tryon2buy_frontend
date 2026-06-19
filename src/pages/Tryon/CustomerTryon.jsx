import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Check, ChevronLeft, RefreshCw, LogOut, Upload } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import CustomerAuthModal from '../../components/CustomerAuthModal';
import VendorLimitModal from '../../components/VendorLimitModal';
import VendorUpgradeModal from '../../components/VendorUpgradeModal';


// Display-only — no prompts or raw image logic here.
// The backend resolves everything from prompts.js using these IDs.
const BACKGROUND_OPTIONS = [
  { id: 'bg1', name: 'Ancient Temple',   image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg1.png' },
  { id: 'bg2', name: 'Festive Palace',   image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg2.png' },
  { id: 'bg3', name: 'Luxury Boutique',  image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg3.png' },
  { id: 'bg4', name: 'Hotel Lobby',      image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg4.png' },
  { id: 'bg5', name: 'Floral Archway',   image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg5.jpg' },
  { id: 'bg6', name: 'Golden Palace',    image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg6.jpg' },
  { id: 'bg7', name: 'Tropical Garden',  image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg7.jpg' },
  { id: 'bg8', name: 'Beach Resort',     image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg8.png' }
];

const SHOWCASE_BLOUSES = [
  { id: 'elbow-sleeve', name: 'Elbow Sleeve', image: '/assets/blouse/elbow_sleeve.png' },
  { id: 'full-sleeve',  name: 'Full Sleeve',  image: '/assets/blouse/full_sleeve.png' },
  { id: 'sleeveless',   name: 'Sleeveless',   image: '/assets/blouse/sleeve_less.png' }
];

const SHOWCASE_NECKS = [
  { id: 'boat-neck',    name: 'Boat Neck',    image: '/assets/neck/boat_neck.png' },
  { id: 'round-neck',   name: 'Round Neck',   image: '/assets/neck/round_neck.png' },
  { id: 'collar-neck',  name: 'Collar Neck',  image: '/assets/neck/collar_neck.png' }
];

export default function CustomerTryon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sourceGeneration, setSourceGeneration] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [tryonState, setTryonState] = useState('initial'); // 'initial', 'generating', 'generated'
  const [progress, setProgress] = useState(0);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  
  const [isChangingBackground, setIsChangingBackground] = useState(false);
  const [selectedBg, setSelectedBg] = useState(null);

  const [showcaseBlouse, setShowcaseBlouse] = useState('elbow-sleeve');
  const [showcaseNeck, setShowcaseNeck] = useState('round-neck');
  const [activeTab, setActiveTab] = useState('sleeve');
  const [isModifying, setIsModifying] = useState(false);

  const [authToken, setAuthToken] = useState(localStorage.getItem('customer_token') || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVendorLimitModal, setShowVendorLimitModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAuthError = () => {
    if (sessionStorage.getItem('guest_mode') === 'true') {
      setShowVendorLimitModal(true);
    } else {
      setShowAuthModal(true);
    }
    setTryonState('initial');
  };

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    };
  };

  const handleAuthSuccess = (token, customerData) => {
    setAuthToken(token);
    setShowAuthModal(false);
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    setAuthToken(null);
  };

  useEffect(() => {
    // Wait for explicit action before showing auth modal, allowing 1 free guest try-on
  }, [authToken]);

  useEffect(() => {
    fetch(`${API_URL}/api/tryon/generations/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Dress not found or link expired");
        return res.json();
      })
      .then(data => {
        setSourceGeneration(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setTryonState('initial');
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const applyBackground = async () => {
    if (!resultImageUrl || isChangingBackground || !selectedBg) return;
    
    const bgOption = BACKGROUND_OPTIONS.find(bg => bg.id === selectedBg);
    if (!bgOption) return;

    setIsChangingBackground(true);
    
    try {
      const res = await fetch(`${API_URL}/api/tryon/change-background`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          imageUrl: resultImageUrl,
          backgroundId: selectedBg,
          generationId: id
        })
      });

      const data = await res.json();

      if (res.status === 403 && data.error === 'INSUFFICIENT_CREDITS') {
        setShowUpgradeModal(true);
        setIsChangingBackground(false);
        return;
      }
      if (res.status === 401 || res.status === 403) {
        handleAuthError();
        setIsChangingBackground(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to change background");
      
      setResultImageUrl(data.url);
      setSelectedBg(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsChangingBackground(false);
    }
  };

  const applyModification = async () => {
    if (!resultImageUrl) return;

    setIsModifying(true);
    try {
      const response = await fetch(`${API_URL}/api/tryon/modify-outfit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          imageUrl: resultImageUrl,
          modificationType: activeTab === 'sleeve' ? showcaseBlouse : showcaseNeck,
          generationId: id
        })
      });

      const result = await response.json();

      if (response.status === 403 && result.error === 'INSUFFICIENT_CREDITS') {
        setShowUpgradeModal(true);
        setIsModifying(false);
        return;
      }
      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        setIsModifying(false);
        return;
      }
      if (!response.ok) throw new Error(result.error || 'API Error');
      setResultImageUrl(result.resultImageUrl);
    } catch (err) {
      alert("Failed to apply modification: " + err.message);
    } finally {
      setIsModifying(false);
    }
  };

  const startGeneration = async () => {
    if (!selectedImage || !sourceGeneration) return;
    
    setTryonState('generating');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        return next > 95 ? 95 : next;
      });
    }, 300);

    try {
      let human_image_url = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await fetch(`${API_URL}/api/tryon/upload?folder=human-images`, { 
          method: 'POST', 
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
          body: formData 
        });

        if (uploadRes.status === 401 || uploadRes.status === 403) {
          clearInterval(interval);
          handleAuthError();
          return;
        }

        const uploadData = await uploadRes.json();
        human_image_url = uploadData.url;
      } else {
        human_image_url = selectedImage;
      }

      const garment_image_url = sourceGeneration.resultImageUrl || sourceGeneration.garmentImageUrl;

      const genRes = await fetch(`${API_URL}/api/tryon/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          mode: 'with_garment',
          garment_image_url: garment_image_url,
          human_image_url,
          parent_generation_id: id 
        })
      });

      const errorData = await genRes.clone().json().catch(() => ({}));
      if (genRes.status === 401 && errorData.error === 'GUEST_LIMIT_REACHED') {
        clearInterval(interval);
        handleAuthError();
        return;
      } else if (genRes.status === 403 && errorData.error === 'INSUFFICIENT_CREDITS') {
        clearInterval(interval);
        setShowUpgradeModal(true);
        setTryonState('initial');
        return;
      } else if (genRes.status === 401 || genRes.status === 403) {
        clearInterval(interval);
        handleAuthError();
        return;
      } else if (!genRes.ok) {
        throw new Error(errorData.error || 'Generation failed');
      }

      const genData = await genRes.json();
      
      clearInterval(interval);
      setProgress(100);
      setResultImageUrl(genData.result_image_url || garment_image_url);
      setTimeout(() => setTryonState('generated'), 400);

    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setTryonState('initial');
      alert('Try-On failed: ' + err.message);
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (sourceGeneration?.vendorId) {
      navigate(`/shop/${sourceGeneration.vendorId}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#ede8df] flex items-center justify-center font-['Courier_Prime',monospace] text-[12px] uppercase tracking-widest text-[#8c8278] animate-pulse">Loading dress details...</div>;
  }

  if (error || !sourceGeneration) {
    return <div className="min-h-screen bg-[#ede8df] flex items-center justify-center font-['Courier_Prime',monospace] text-[12px] uppercase tracking-widest text-red-800">{error || "Not found"}</div>;
  }

  const drapedDressUrl = sourceGeneration.resultImageUrl || sourceGeneration.garmentImageUrl;

  return (
    <div className="bg-[#faf7f2] min-h-screen flex flex-col font-['Courier_Prime',monospace] text-[#1a1410] antialiased select-none">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scan {
          animation: scan 2.5s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      
      {/* Header */}
      <header className="bg-[#faf7f2] border-b border-[rgba(26,20,16,0.1)] h-[60px] flex items-center justify-between px-[32px] shrink-0 relative">
        {/* Back Button */}
        <div className="w-[200px]">
          {location.key !== 'default' && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[1.5px] text-[#7f5700] hover:text-[#1a1410] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Centered Branding */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="font-serif tracking-[0.2em] text-sm font-medium">
            TRYON2BUY <span className="opacity-40 px-2">|</span> PERSONAL FITTING
          </span>
        </div>

        {/* Right spacer with Logout */}
        <div className="w-[200px] flex justify-end">
          {authToken && (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[1.5px] text-[#7f5700] hover:text-[#1a1410] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Left Side: Instructions & Upload */}
        <aside className="w-full md:w-[400px] bg-[#faf7f2] border-r border-[rgba(26,20,16,0.1)] p-8 shrink-0 flex flex-col justify-center">
          
          <div className={`space-y-2 transition-all duration-500 ${tryonState === 'generated' ? 'mb-4' : 'mb-10'}`}>
            <h2 className="font-['EB_Garamond',serif] text-[24px] font-normal leading-tight text-[#1a1410]">
              Try On This Look
            </h2>
            <p className="text-[11px] text-[#8c8278] tracking-[0.5px]">
              Upload a clear, front-facing full-body photo of yourself to see how this beautiful piece looks on you.
              <br /><br />
              <strong className="text-[#1a1410]">Note:</strong> For best results, ensure your posture and hand placement match the product model.
            </p>
          </div>

          <div 
            onClick={triggerFileBrowser}
            className={`bg-[rgba(237,232,223,0.5)] border-2 border-dashed border-[#c4933f]/30 hover:border-[#c4933f] transition-all flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden group mb-6 ${selectedImage ? (tryonState === 'generated' ? 'p-2 min-h-[140px]' : 'p-4 min-h-[260px]') : 'p-6 min-h-[160px]'}`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {selectedImage ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img src={selectedImage} alt="Your Portrait" className={`w-auto object-contain shadow-sm transition-all duration-500 ${tryonState === 'generated' ? 'h-[120px]' : 'h-[240px]'}`} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider border border-white">Change Photo</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-[#ede8df] p-4 rounded-full group-hover:bg-[#c4933f]/10 transition-colors">
                  <Upload className="h-6 w-6 opacity-70" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#1a1410]">
                    UPLOAD YOUR PHOTO
                  </p>
                  <p className="text-[9px] text-[#8c8278]">JPG, PNG up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {tryonState === 'generated' && (
            <button
              onClick={startGeneration}
              className="w-full mb-6 py-4 text-[11px] font-bold tracking-[2px] uppercase flex items-center justify-center gap-2 transition-all bg-transparent border border-[rgba(26,20,16,0.3)] text-[#1a1410] hover:border-[#1a1410] animate-fade-in"
            >
              <RefreshCw className="h-4 w-4" />
              <span>REGENERATE</span>
            </button>
          )}

          {tryonState === 'generated' && sourceGeneration?.category === 'SAREE' && (
            <div className="mb-6 animate-fade-in border-t border-[rgba(26,20,16,0.1)] pt-6">
              
              <div className="bg-[rgba(26,20,16,0.05)] rounded-full p-1 flex">
                <button
                  onClick={() => setActiveTab('sleeve')}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full transition-all duration-300 ${
                    activeTab === 'sleeve'
                      ? 'bg-white shadow-sm text-[#1a1410]'
                      : 'text-[#8c8278] hover:text-[#1a1410]'
                  }`}
                >
                  SLEEVE STYLE
                </button>
                <button
                  onClick={() => setActiveTab('neck')}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full transition-all duration-300 ${
                    activeTab === 'neck'
                      ? 'bg-white shadow-sm text-[#1a1410]'
                      : 'text-[#8c8278] hover:text-[#1a1410]'
                  }`}
                >
                  NECK STYLE
                </button>
              </div>

              {activeTab === 'sleeve' && (
                <div className="grid grid-cols-3 gap-3 animate-fade-in mt-6">
                  {SHOWCASE_BLOUSES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setShowcaseBlouse(b.id)}
                      className={`relative aspect-square border overflow-hidden transition-all flex items-end justify-center pb-2 ${showcaseBlouse === b.id ? 'ring-2 ring-[#c4933f] border-transparent scale-[1.02] shadow-sm' : 'border-[rgba(26,20,16,0.2)] hover:border-[#1a1410]'}`}
                      title={b.name}
                    >
                      <img src={b.image} alt={b.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="relative z-10 text-[8px] uppercase tracking-wider font-bold text-white drop-shadow-md">
                        {b.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'neck' && (
                <div className="grid grid-cols-3 gap-3 animate-fade-in mt-6">
                  {SHOWCASE_NECKS.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setShowcaseNeck(n.id)}
                      className={`relative aspect-square border overflow-hidden transition-all flex items-end justify-center pb-2 ${showcaseNeck === n.id ? 'ring-2 ring-[#c4933f] border-transparent scale-[1.02] shadow-sm' : 'border-[rgba(26,20,16,0.2)] hover:border-[#1a1410]'}`}
                      title={n.name}
                    >
                      <img src={n.image} alt={n.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="relative z-10 text-[8px] uppercase tracking-widest font-bold text-white drop-shadow-md">
                        {n.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={applyModification}
                disabled={isModifying}
                className="w-full mt-6 bg-[#1a1410] text-[#faf7f2] py-4 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-black shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isModifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    APPLYING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    APPLY CHANGES
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={startGeneration}
            disabled={!selectedImage || tryonState === 'generating'}
            className={`w-full py-4 text-[11px] font-bold tracking-[2px] uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${
              selectedImage && tryonState !== 'generating'
                ? 'bg-[#1a1410] hover:bg-black text-[#faf7f2] cursor-pointer hover:shadow-xl active:scale-[0.99]'
                : 'bg-[rgba(26,20,16,0.1)] text-[#8c8278] cursor-not-allowed shadow-none'
            } ${tryonState === 'generated' ? 'hidden' : ''}`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{tryonState === 'generating' ? 'FITTING IN PROGRESS...' : 'SEE MYSELF IN THIS'}</span>
          </button>

        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 bg-[#ede8df] relative overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute border-[rgba(26,20,16,0.2)] border-r border-t right-[-192px] size-[384px] top-[-192px]" />
          </div>

          <div className="aspect-[3/4] bg-[#faf7f2] w-full max-w-[500px] shadow-2xl border border-[rgba(26,20,16,0.05)] relative overflow-hidden flex items-center justify-center animate-fade-in z-10">
            
            {tryonState === 'initial' && (
              <img src={drapedDressUrl} alt="Garment" className="w-full h-full object-cover" />
            )}

            {tryonState === 'generating' && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-8 text-center animate-fade-in z-20">
                <div className="w-[280px] h-[280px]">
                  <DotLottieReact
                    src="https://lottie.host/60549870-6cf3-4b11-8125-00d065479f3c/NFmw4l5ycl.lottie"
                    loop
                    autoplay
                  />
                </div>
                <h3 className="font-['EB_Garamond',serif] text-[20px] text-[#1a1410] mt-2 mb-2">Architecting your fit...</h3>
                <div className="w-[200px] bg-[#ede8df] h-1.5 overflow-hidden">
                  <div className="bg-[#c4933f] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {tryonState === 'generated' && (
              <div className="relative w-full h-full animate-fade-in group/canvas">
                <img src={resultImageUrl} alt="Your Personal Try-On" className={`w-full h-full object-cover transition-opacity duration-700 ${(isChangingBackground || isModifying) ? 'opacity-40 blur-[2px]' : 'opacity-100'}`} />
                
                {/* Background Changing Animation */}
                {isChangingBackground && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <RefreshCw className="w-8 h-8 text-[#1a1410] animate-spin mb-3" />
                    <span className="bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      Applying Background...
                    </span>
                  </div>
                )}

                {/* Outfit Modification Animation */}
                {isModifying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/60 backdrop-blur-[2px]">
                    <div className="w-[280px] h-[280px]">
                      <DotLottieReact
                        src="https://lottie.host/60549870-6cf3-4b11-8125-00d065479f3c/NFmw4l5ycl.lottie"
                        loop
                        autoplay
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {tryonState === 'initial' && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 shadow-lg">
                  THE GARMENT YOU WILL TRY ON
                </div>
              </div>
            )}
          </div>

        </main>

        {/* Right Side: Background Panel */}
        {tryonState === 'generated' && (
          <aside className="w-full md:w-[360px] bg-[#faf7f2] border-l border-[rgba(26,20,16,0.1)] p-8 shrink-0 flex flex-col justify-center animate-fade-in">
            <h3 className="font-['EB_Garamond',serif] text-[20px] text-[#1a1410] mb-2">Change Background</h3>
            <p className="text-[10px] tracking-[0.5px] text-[#8c8278] mb-8">Select a background and apply it to your try-on.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  disabled={isChangingBackground}
                  onClick={() => setSelectedBg(bg.id)}
                  className={`relative aspect-[4/3] overflow-hidden group border transition-all ${selectedBg === bg.id ? 'border-[#c4933f] ring-2 ring-[#c4933f] scale-[1.02] shadow-md' : 'border-[rgba(26,20,16,0.1)]'} ${isChangingBackground ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#1a1410]'}`}
                >
                  <img src={bg.image} alt={bg.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-white text-[9px] font-bold tracking-wider uppercase text-left leading-tight">{bg.name}</span>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={applyBackground}
              disabled={!selectedBg || isChangingBackground}
              className="w-full bg-[#1a1410] text-[#faf7f2] py-4 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black flex items-center justify-center gap-2 shadow-md"
            >
              {isChangingBackground && <RefreshCw className="w-4 h-4 animate-spin" />}
              {isChangingBackground ? 'APPLYING...' : 'APPLY BACKGROUND'}
            </button>
          </aside>
        )}
      </div>
      <CustomerAuthModal 
        isOpen={showAuthModal} 
        onSuccess={handleAuthSuccess} 
      />
      <VendorLimitModal 
        isOpen={showVendorLimitModal} 
        onClose={() => setShowVendorLimitModal(false)} 
      />

      <VendorUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        userType={sessionStorage.getItem('guest_mode') === 'true' ? 'vendor' : 'customer'}
      />
    </div>
  );
}
