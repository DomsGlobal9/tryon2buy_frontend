import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Check, ChevronLeft, RefreshCw, LogOut, Upload, Lightbulb, CloudUpload, FolderOpen, Heart, Lock, ShieldCheck, Shield, Camera, X } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
  const cameraInputRef = useRef(null);
  const intervalRef = useRef(null);

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
  const [isDragging, setIsDragging] = useState(false);

  const [authToken, setAuthToken] = useState(
    localStorage.getItem('vendor_token') || null
  );
  const [showVendorLimitModal, setShowVendorLimitModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAuthError = () => {
    setShowVendorLimitModal(true);
    setTryonState('initial');
  };

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    };
  };

  const logout = () => {
    setAuthToken(null);
  };

  useEffect(() => {
    // Wait for explicit action
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

  // Clean up blob URLs and intervals to prevent massive memory leaks on mobile
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedImage]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please upload an image under 10MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        return;
      }
      if (selectedImage && selectedImage.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImage);
      }
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setTryonState('initial');
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    if (selectedImage && selectedImage.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setSelectedFile(null);
    setTryonState('initial');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const triggerFileBrowser = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    fileInputRef.current?.click();
  };

  const triggerCamera = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    cameraInputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
          alert("File is too large. Please upload an image under 10MB.");
          return;
        }
        if (selectedImage && selectedImage.startsWith('blob:')) {
          URL.revokeObjectURL(selectedImage);
        }
        setSelectedFile(file);
        setSelectedImage(URL.createObjectURL(file));
        setTryonState('initial');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
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

    intervalRef.current = setInterval(() => {
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
        const uploadRes = await fetch(`${API_URL}/api/tryon/upload?folder=user-uploads`, { 
          method: 'POST', 
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
          body: formData 
        });

        if (uploadRes.status === 401 || uploadRes.status === 403) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleAuthError();
          return;
        }

        const uploadData = await uploadRes.json();
        human_image_url = uploadData.url;
      } else {
        human_image_url = selectedImage;
      }

      if (!human_image_url || human_image_url.startsWith('blob:')) {
        throw new Error("Invalid image source. Please upload a fresh photo.");
      }

      const garment_image_url = sourceGeneration.resultImageUrl || sourceGeneration.garmentImageUrl;

      const genRes = await fetch(`${API_URL}/api/tryon/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          mode: 'with_garment',
          garment_image_url: garment_image_url,
          human_image_url,
          parent_generation_id: id,
          target_folder: 'results/tryon-results'
        })
      });

      const errorData = await genRes.clone().json().catch(() => ({}));
      if (genRes.status === 401 && errorData.error === 'GUEST_LIMIT_REACHED') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleAuthError();
        return;
      } else if (genRes.status === 403 && errorData.error === 'INSUFFICIENT_CREDITS') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setShowUpgradeModal(true);
        setTryonState('initial');
        return;
      } else if (genRes.status === 401 || genRes.status === 403) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleAuthError();
        return;
      } else if (!genRes.ok) {
        throw new Error(errorData.error || 'Generation failed');
      }

      const genData = await genRes.json();
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setResultImageUrl(genData.result_image_url || garment_image_url);
      setTimeout(() => setTryonState('generated'), 400);

    } catch (err) {
      console.error(err);
      if (intervalRef.current) clearInterval(intervalRef.current);
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
      <header className="bg-[#faf7f2] border-b border-[rgba(26,20,16,0.1)] h-[60px] flex items-center justify-between px-4 md:px-[32px] shrink-0 relative">
        {/* Back Button */}
        <div className="flex-1 md:w-[200px] md:flex-none">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[1.5px] text-[#7f5700] hover:text-[#1a1410] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden md:inline">Back</span>
          </button>
        </div>

        {/* Centered Branding */}
        <div className="flex justify-center items-center gap-2 md:gap-3">
          <div 
            onClick={() => {
              if (authToken) {
                navigate('/workspace');
              } else if (sourceGeneration?.vendorId) {
                navigate(`/shop/${sourceGeneration.vendorId}`);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-10 object-contain mr-2" />
            <span className="hidden md:flex font-['EB_Garamond',serif] font-normal text-[#1a1410] text-[18px] md:text-[22px] tracking-tight items-center"><span className="opacity-40 px-2">|</span> PERSONAL FITTING</span>
          </div>
        </div>

        {/* Right spacer with Logout */}
        <div className="flex-1 md:w-[200px] md:flex-none flex justify-end">
          {authToken && (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[1.5px] text-[#7f5700] hover:text-[#1a1410] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Left Side: Instructions & Upload */}
        <aside className="w-full md:w-[400px] bg-[#faf7f2] border-r border-[rgba(26,20,16,0.1)] p-3 md:p-4 shrink-0 flex flex-col justify-start overflow-y-auto style={{scrollbarWidth: 'thin'}}">
          
          {/* Global Hidden Inputs for Camera and File Browser */}
          <input ref={cameraInputRef} type="file" accept="image/*" capture="camera" onChange={handleFileChange} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          <div className="flex flex-col animate-fade-in w-full">
            <h2 className={`font-['EB_Garamond',serif] text-[24px] font-normal leading-tight text-[#1a1410] ${tryonState === 'generated' ? 'mb-4 mt-4' : 'mb-0 hidden'}`}>
              Try On This Look
            </h2>
          </div>

          {tryonState !== 'generated' && (
            <div className="flex flex-col animate-fade-in w-full pt-4">

              {/* Header */}
              <div className="text-center mb-3">
                <h2 className="text-[#1a202c] text-[18px] md:text-[20px] font-bold flex items-center justify-center gap-1.5 mb-1 font-sans">
                  Upload Your Photo
                </h2>
                <p className="text-[#718096] text-[10px] md:text-[11px] font-sans leading-tight">
                  For the best try-on experience, please follow the guidelines below.
                </p>
              </div>

              {/* Framing example */}
              <div className="flex items-center justify-center mb-3">
                <div className="h-[1px] w-8 bg-[#ed8936]"></div>
                <span className="px-2 text-[#1a202c] font-bold text-[11px] font-sans">Framing example</span>
                <div className="h-[1px] w-8 bg-[#ed8936]"></div>
              </div>

              <div className="flex justify-center mb-3">
                <div className="w-[100px] h-[150px] bg-[#f8f9fa] rounded-lg shadow-[0_1px_6px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden flex items-center justify-center">
                  <img src="https://res.cloudinary.com/doiezptnn/image/upload/v1782733465/79061311-f8ef-4542-88ea-4783015af68d_z2bhdi.png" alt="Full image" className="w-full h-full object-cover object-top" />
                </div>
              </div>

              {/* Tip Box -> Note Box */}
              <div className="bg-[#fffaf0] rounded-lg p-3 flex items-center gap-3 mb-3 border border-[#fefcbf]">
                <div className="bg-[#feebc8] rounded-full p-1.5 shrink-0">
                  <Lightbulb className="w-4 h-4 text-[#dd6b20]" />
                </div>
                <p className="text-[#4a5568] text-[10px] font-sans leading-relaxed">
                  <span className="font-bold text-[#1a202c]">Note:</span> For the best fit visualization, please upload a clear, front-facing full-body photo. Ensure your posture and hand placement closely match the product model.
                </p>
              </div>

              {/* Upload Area */}
              <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center bg-white transition-all relative group mb-3 min-h-[160px] ${isDragging ? 'border-[#dd6b20] bg-[#fffaf0] scale-[1.02] shadow-md' : 'border-[#f6ad55]'}`}
              >

                {selectedImage ? (
                  <div className="w-full h-full flex flex-col items-center justify-center group">
                    <div className="relative mb-3">
                      <img src={selectedImage} alt="Your Portrait" className="h-[120px] w-auto object-contain rounded-md shadow-sm" />
                      <button 
                        onClick={clearImage}
                        className="absolute top-1 right-1 bg-black/40 hover:bg-red-500 text-white rounded-full p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-20"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 z-10 justify-center">
                      <button 
                        onClick={triggerCamera} 
                        className="lg:hidden border border-[#dd6b20] text-[#dd6b20] bg-white rounded-md px-3 py-1.5 flex items-center gap-1.5 font-bold text-[10px] font-sans hover:bg-[#dd6b20] hover:text-white transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" /> Take Photo
                      </button>
                      <button 
                        onClick={triggerFileBrowser} 
                        className="border border-[#dd6b20] text-[#dd6b20] bg-white rounded-md px-3 py-1.5 flex items-center gap-1.5 font-bold text-[10px] font-sans hover:bg-[#dd6b20] hover:text-white transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Browse Files
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#fffaf0] rounded-full p-2 mb-2 group-hover:scale-110 transition-transform">
                      <CloudUpload className="w-6 h-6 text-[#dd6b20]" />
                    </div>
                    <h3 className="text-[#1a202c] text-[13px] font-bold mb-2 font-sans">Drag & drop your image here</h3>
                    
                    <div className="flex items-center justify-center w-full max-w-[160px] mb-2">
                      <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>
                      <span className="px-2 text-[#a0aec0] text-[10px] font-sans">or</span>
                      <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>
                    </div>

                    <div className="flex items-center gap-2 mb-2 z-10">
                      <button 
                        onClick={triggerCamera} 
                        className="lg:hidden border border-[#dd6b20] text-[#dd6b20] bg-white rounded-md px-3 py-1.5 flex items-center gap-1.5 font-bold text-[10px] font-sans hover:bg-[#dd6b20] hover:text-white transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" /> Take Photo
                      </button>
                      <button 
                        onClick={triggerFileBrowser} 
                        className="border border-[#dd6b20] text-[#dd6b20] bg-white rounded-md px-3 py-1.5 flex items-center gap-1.5 font-bold text-[10px] font-sans hover:bg-[#dd6b20] hover:text-white transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Browse Files
                      </button>
                    </div>

                    <p className="text-[#a0aec0] text-[9px] font-sans">PNG, JPG, HEIC · Max 10 MB</p>
                  </>
                )}
              </div>

              {/* Note Box */}
              <div className="bg-white rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#e2e8f0] p-3 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <Lock className="w-3 h-3 text-[#dd6b20] shrink-0 mt-0.5" />
                  <span className="text-[#4a5568] text-[10px] font-medium font-sans leading-relaxed">Uploaded images will be used solely to generate virtual try-on previews.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="w-3 h-3 text-[#dd6b20] shrink-0 mt-0.5" />
                  <span className="text-[#4a5568] text-[10px] font-medium font-sans leading-relaxed">Your privacy is important to us. We do not share your images with anyone.</span>
                </div>
              </div>

            </div>
          )}

          {tryonState === 'generated' && selectedImage && (
            <div className="mb-4 animate-fade-in mt-4">
              <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`bg-white border-2 flex flex-col items-center justify-center text-center relative overflow-hidden group p-2 min-h-[140px] rounded-xl mb-3 transition-all ${isDragging ? 'border-[#dd6b20] border-dashed bg-[#fffaf0] scale-[1.02] shadow-md' : 'border-[#f6ad55]'}`}
              >
                <img src={selectedImage} alt="Your Portrait" className="h-[120px] w-auto object-contain shadow-sm rounded-lg pointer-events-none" />
                
                <button 
                  onClick={clearImage}
                  className="absolute top-1 right-1 bg-black/40 hover:bg-red-500 text-white rounded-full p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-20"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 z-10 justify-center">
                <button 
                  onClick={triggerCamera} 
                  className="lg:hidden border border-[#dd6b20] text-[#dd6b20] bg-white rounded-md px-3 py-1.5 flex items-center gap-1.5 font-bold text-[10px] font-sans hover:bg-[#dd6b20] hover:text-white transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" /> Take Photo
                </button>
                <button 
                  onClick={triggerFileBrowser} 
                  className="border border-[#dd6b20] text-[#dd6b20] bg-white rounded-md px-3 py-1.5 flex items-center gap-1.5 font-bold text-[10px] font-sans hover:bg-[#dd6b20] hover:text-white transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Browse Files
                </button>
              </div>
            </div>
          )}

          {tryonState === 'generated' && (
            <button
              onClick={startGeneration}
              disabled={isChangingBackground || isModifying}
              className="w-full mb-6 py-4 text-[11px] font-bold tracking-[2px] uppercase flex items-center justify-center gap-2 transition-all bg-transparent border border-[rgba(26,20,16,0.3)] text-[#1a1410] hover:border-[#1a1410] animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[rgba(26,20,16,0.3)]"
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
                disabled={isModifying || isChangingBackground}
                className="w-full mt-6 bg-[#1a1410] text-[#faf7f2] py-4 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-black shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
            className={`w-full py-4 text-[11px] font-bold tracking-[2px] uppercase flex items-center justify-center gap-2 transition-all shadow-lg rounded-full ${
              selectedImage && tryonState !== 'generating'
                ? 'bg-[#dd6b20] hover:bg-[#c05621] text-white cursor-pointer hover:shadow-xl active:scale-[0.99]'
                : 'bg-[rgba(26,20,16,0.1)] text-[#8c8278] cursor-not-allowed shadow-none'
            } ${tryonState === 'generated' ? 'hidden' : ''}`}
          >
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
                    src="https://lottie.host/1014dfd1-04b7-4311-bee6-0807da37a820/KcoFjrbtZT.lottie"
                    loop
                    autoplay
                  />
                </div>
              </div>
            )}

            {tryonState === 'generated' && (
              <div className="relative w-full h-full animate-fade-in group/canvas">
                <img src={resultImageUrl} alt="Your Personal Try-On" className={`w-full h-full object-cover transition-opacity duration-700 ${(isChangingBackground || isModifying) ? 'opacity-40 blur-[2px]' : 'opacity-100'}`} />
                
                {/* Background Changing Animation */}
                {isChangingBackground && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/60 backdrop-blur-[2px]">
                    <div className="w-[280px] h-[280px]">
                      <DotLottieReact
                        src="https://lottie.host/daaf6e95-096e-4581-9f9b-57fd2fb31511/RNiTHsdDkt.lottie"
                        loop
                        autoplay
                        speed={0.5}
                      />
                    </div>
                  </div>
                )}

                {/* Outfit Modification Animation */}
                {isModifying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/60 backdrop-blur-[2px]">
                    <div className="w-[280px] h-[280px]">
                      <DotLottieReact
                        src="https://lottie.host/1014dfd1-04b7-4311-bee6-0807da37a820/KcoFjrbtZT.lottie"
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
                  disabled={isChangingBackground || isModifying}
                  onClick={() => setSelectedBg(bg.id)}
                  className={`relative aspect-[4/3] overflow-hidden group border transition-all ${selectedBg === bg.id ? 'border-[#c4933f] ring-2 ring-[#c4933f] scale-[1.02] shadow-md' : 'border-[rgba(26,20,16,0.1)]'} ${(isChangingBackground || isModifying) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#1a1410]'}`}
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
              disabled={!selectedBg || isChangingBackground || isModifying}
              className="w-full bg-[#1a1410] text-[#faf7f2] py-4 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black flex items-center justify-center gap-2 shadow-md"
            >
              {isChangingBackground && <RefreshCw className="w-4 h-4 animate-spin" />}
              {isChangingBackground ? 'APPLYING...' : 'APPLY BACKGROUND'}
            </button>
          </aside>
        )}
      </div>
      <VendorLimitModal 
        isOpen={showVendorLimitModal} 
        onClose={() => setShowVendorLimitModal(false)}
        userType="guest"
      />

      <VendorUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        userType="vendor"
      />
    </div>
  );
}
