import React, { useState, useEffect, useRef, useMemo } from 'react';
import { API_URL, INVENTORY_API_URL, INVENTORY_APP_URL } from '../../config';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Check, ChevronLeft, RefreshCw, LogOut, Upload, Lightbulb, CloudUpload, FolderOpen, Heart, Lock, ShieldCheck, Shield, Camera, X } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import VendorLimitModal from '../../components/VendorLimitModal';
import { saveToHistory, getActiveImage, deactivateActiveImage, clearAllHistory, subscribeToImageEvents, EVENTS, saveTryonResult, getTryonResultsBySelfie, deleteTryonResult, updateTryonResult, pingSelfieActivity } from '../../utils/imageStore';
import ImageHistoryDock from '../../components/ImageHistoryDock';
import FloatingImageAnimation from '../../components/FloatingImageAnimation';
import VendorUpgradeModal from '../../components/VendorUpgradeModal';
import { uploadSelfie } from '../../utils/imageUpload';
import { userFacingMessage } from '../../utils/generationRecovery';
import { resolveBackTarget } from '../../utils/backTarget';


// Display-only — no prompts or raw image logic here.
// The backend resolves everything from prompts.js using these IDs.
const BACKGROUND_OPTIONS = [
  { id: 'bg1', name: 'Ancient Temple', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg1.png' },
  { id: 'bg2', name: 'Festive Palace', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg2.png' },
  { id: 'bg3', name: 'Designer Boutique', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg13.png' },
  { id: 'bg4', name: 'Luxury Hotel Lobby', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg12.png' },
  { id: 'bg5', name: 'Floral Garden Archway', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg14.png' },
  { id: 'bg6', name: 'Golden Palace', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg6.jpg' },
  { id: 'bg7', name: 'Tropical Garden', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg7.jpg' },
  { id: 'bg8', name: 'Beach Resort Sunset', image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg11.png' }
];

const SHOWCASE_BLOUSES = [
  { id: 'elbow-sleeve', name: 'Elbow Sleeve', image: '/assets/blouse/elbow_sleeve.png' },
  { id: 'full-sleeve', name: 'Full Sleeve', image: '/assets/blouse/full_sleeve.png' },
  { id: 'sleeveless', name: 'Sleeveless', image: '/assets/blouse/sleeve_less.png' }
];

const SHOWCASE_NECKS = [
  { id: 'boat-neck', name: 'Boat Neck', image: '/assets/neck/boat_neck.png' },
  { id: 'round-neck', name: 'Round Neck', image: '/assets/neck/round_neck.png' },
  { id: 'collar-neck', name: 'Collar Neck', image: '/assets/neck/collar_neck.png' }
];

export default function ClientTryon() {
  const { clientId, productCode } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const activeImageRef = useRef(null);
  const intervalRef = useRef(null);
  const isAnimatingRef = useRef(false);
  // The photo exactly as the file input gave it to us.
  //
  // selectedFile does NOT stay that object: saveToHistory broadcasts PHOTO_ADDED, and 50ms
  // later loadStoredImage overwrites it with the copy read back from IndexedDB. On iOS that
  // copy can come back with no MIME type or no bytes at all, and it is the copy that was
  // being uploaded -- so even a photo taken seconds earlier failed. Uploading this instead
  // sidesteps the round trip entirely for the case that matters most.
  const freshFileRef = useRef(null);
  const [floatingAnimation, setFloatingAnimation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sourceGeneration, setSourceGeneration] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [tryonState, setTryonState] = useState('initial'); // 'initial', 'generating', 'generated'
  const [progress, setProgress] = useState(0);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  
  const [activeSelfieId, setActiveSelfieId] = useState(null);
  const [carouselResults, setCarouselResults] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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
  /**
   * Tryon2Buy's own styling tools -- change background, and sleeve/neck modification -- are OFF
   * on this page.
   *
   * They call this app's backend directly (/api/tryon/change-background and
   * /api/tryon/modify-outfit) rather than going through Inventory, which is fine on
   * CustomerTryon and wrong here. On a scanned garment it would mean:
   *
   *   - the shop's own gateway key is never presented, so the gateway cannot tell whose work
   *     it is and attributes it to the shared guest key
   *   - the shop's monthly allowance is not checked and not decremented, so a shop that is out
   *     of allowance can still spend GPU time
   *   - nothing is metered on our side either, so the console shows usage that is quietly lower
   *     than what was actually run
   *
   * In short: real money spent with nobody billed for it. They come back the moment those two
   * endpoints are proxied through Inventory and metered the same way the generation already is.
   */
  const STYLING_TOOLS_ENABLED = false;

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


  useEffect(() => {
    // Check initial auth state
  }, [authToken]);

  useEffect(() => {
    async function loadStoredImage() {
      const activeRecord = await getActiveImage();
      if (activeRecord) {
        setActiveSelfieId(activeRecord.id);
        setSelectedFile(activeRecord.file);
        setSelectedImage(prev => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return URL.createObjectURL(activeRecord.file);
        });
      } else {
        setActiveSelfieId(null);
        setSelectedFile(null);
        setSelectedImage(prev => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return null;
        });
      }
    }
    loadStoredImage();

    async function loadCarousel() {
      if (activeSelfieId) {
        const results = await getTryonResultsBySelfie(activeSelfieId);
        setCarouselResults(results);
        setCurrentSlideIndex(0);
      } else {
        setCarouselResults([]);
        setCurrentSlideIndex(0);
      }
    }
    loadCarousel();

    const unsubscribe = subscribeToImageEvents((data) => {
      if ([EVENTS.PHOTO_PROMOTED, EVENTS.PHOTO_ADDED, EVENTS.PHOTO_DEACTIVATED, EVENTS.HISTORY_CLEARED].includes(data.type)) {
        setTimeout(() => loadStoredImage(), 50);
      }
    });

    return () => unsubscribe();
  }, [activeSelfieId]);

  // Ping selfie activity to extend 20-minute expiry when user interacts with carousel
  useEffect(() => {
    if (activeSelfieId) {
      pingSelfieActivity(activeSelfieId);
    }
  }, [currentSlideIndex, carouselResults, activeSelfieId]);

  useEffect(() => {
    // The garment lives in Scaleezy Inventory, not in this app's database -- that is the only
    // real difference between this page and CustomerTryon. It is addressed by the shop and the
    // product code PRINTED ON THE TAG rather than by a generation id, because a printed tag has
    // to keep working for the life of the garment and a row id is not something a shop can put
    // on a label.
    fetch(`${INVENTORY_API_URL}/api/v1/public/tryon/${clientId}/${productCode}`)
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.message || 'That code does not match anything we can try on.');
        return body.data;
      })
      .then(garment => {
        // Shaped into what the rest of this page already reads. It only ever asks for
        // garmentImageUrl, resultImageUrl and vendorId; vendorId stays absent on purpose,
        // because a scanned garment belongs to a shop in Inventory rather than to a vendor
        // here, so the "back to the vendor's gallery" link correctly never appears.
        setSourceGeneration({
          garmentImageUrl: garment.imageUrl,
          resultImageUrl: null,
          dressName: garment.title,
          category: garment.category
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [clientId, productCode]);

  // Clean up blob URLs and intervals to prevent massive memory leaks on mobile
  // IMPORTANT: Do NOT revoke if the floating animation is using this URL
  useEffect(() => {
    return () => {
      if (selectedImage && selectedImage.startsWith('blob:') && !isAnimatingRef.current) {
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
      freshFileRef.current = file;
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setTryonState('initial');
      saveToHistory(file);
    }
  };

  const clearImage = async (e) => {
    e.stopPropagation();
    
    if (activeImageRef.current && selectedImage) {
      isAnimatingRef.current = true;
      const rect = activeImageRef.current.getBoundingClientRect();
      const urlToAnimate = selectedImage;
      setFloatingAnimation({ url: urlToAnimate, sourceRect: rect });
    } else if (selectedImage && selectedImage.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImage);
    }
    
    freshFileRef.current = null;
    setSelectedImage(null);
    setSelectedFile(null);
    setTryonState('initial');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    await deactivateActiveImage();
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
        freshFileRef.current = file;
        setSelectedFile(file);
        setSelectedImage(URL.createObjectURL(file));
        setTryonState('initial');
        saveToHistory(file);
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
    const targetUrl = carouselResults.length > 0 ? carouselResults[currentSlideIndex]?.resultImageUrl : resultImageUrl;
    const targetId = carouselResults.length > 0 ? carouselResults[currentSlideIndex]?.id : null;
    
    if (!targetUrl || isChangingBackground || !selectedBg) return;

    const bgOption = BACKGROUND_OPTIONS.find(bg => bg.id === selectedBg);
    if (!bgOption) return;

    setIsChangingBackground(true);

    try {
      const res = await fetch(`${API_URL}/api/tryon/change-background`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          imageUrl: targetUrl,
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

      if (targetId) {
        const updatedRecord = await updateTryonResult(targetId, { resultImageUrl: data.url });
        if (updatedRecord) {
          setCarouselResults(prev => prev.map(r => r.id === targetId ? updatedRecord : r));
        } else {
          // Fallback update React state even if IndexedDB record expired
          setCarouselResults(prev => prev.map(r => r.id === targetId ? { ...r, resultImageUrl: data.url } : r));
        }
      } else {
        setResultImageUrl(data.url);
      }
      setSelectedBg(null);

      if (activeSelfieId) {
        pingSelfieActivity(activeSelfieId);
      }
    } catch (err) {
      console.error(err);
      console.error('[ChangeBackground]', err);
      alert(userFacingMessage(err));
    } finally {
      setIsChangingBackground(false);
    }
  };

  const applyModification = async () => {
    const targetUrl = carouselResults.length > 0 ? carouselResults[currentSlideIndex]?.resultImageUrl : resultImageUrl;
    const targetId = carouselResults.length > 0 ? carouselResults[currentSlideIndex]?.id : null;
    
    if (!targetUrl) return;

    setIsModifying(true);
    try {
      const response = await fetch(`${API_URL}/api/tryon/modify-outfit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          imageUrl: targetUrl,
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

      if (targetId) {
        const updatedRecord = await updateTryonResult(targetId, { resultImageUrl: result.resultImageUrl });
        if (updatedRecord) {
          setCarouselResults(prev => prev.map(r => r.id === targetId ? updatedRecord : r));
        } else {
          // Fallback update React state even if IndexedDB record expired
          setCarouselResults(prev => prev.map(r => r.id === targetId ? { ...r, resultImageUrl: result.resultImageUrl } : r));
        }
      } else {
        setResultImageUrl(result.resultImageUrl);
      }
      
      if (activeSelfieId) {
        pingSelfieActivity(activeSelfieId);
      }
    } catch (err) {
      console.error('[ModifyOutfit]', err);
      alert(userFacingMessage(err));
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
      // Prefer the file the browser gave us; fall back to the stored copy only if this is a
      // photo restored from a previous visit, where no fresh one exists.
      const sourceFile = freshFileRef.current || selectedFile;

      let human_image_url = null;
      if (sourceFile) {
        const uploaded = await uploadSelfie({
          apiUrl: API_URL,
          file: sourceFile,
          folder: 'human-images',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });

        if (uploaded.unauthorized) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleAuthError();
          return;
        }

        human_image_url = uploaded.url;
      }

      // A blob: URL is a local browser handle. It was never a valid thing to send, and
      // reaching here means we have no uploaded photo at all.
      if (!human_image_url || human_image_url.startsWith('blob:')) {
        throw new Error('No uploaded photo available for generation');
      }

      const garment_image_url = sourceGeneration.resultImageUrl || sourceGeneration.garmentImageUrl;

      const lockedSelfieId = activeSelfieId;

      // Through Inventory, NOT straight to this app's own generate endpoint.
      //
      // That is the second and more important difference from CustomerTryon. This app's
      // endpoint, called by an anonymous shopper, has no vendor to attribute the work to and
      // reports usage under a single shared guest key -- so every try-on from every shop would
      // arrive at the gateway as one anonymous customer. Inventory holds a key per shop,
      // presents that shop's key, checks that shop's monthly allowance, and meters the result
      // against that shop. The key itself stays on Inventory's server and never reaches here,
      // which is the whole reason this hop exists rather than the browser calling the gateway.
      const genRes = await fetch(
        `${INVENTORY_API_URL}/api/v1/public/tryon/${clientId}/${productCode}/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ humanImageUrl: human_image_url })
        }
      );

      const inventoryBody = await genRes.json().catch(() => ({}));
      // Mapped onto the shape the rest of this page already handles, so everything below --
      // the progress bar, the carousel, the saved history -- is untouched.
      const genData = {
        result_image_url: inventoryBody?.data?.resultImageUrl,
        error: inventoryBody?.message
      };
      
      if (genRes.status === 401 && genData.error === 'GUEST_LIMIT_REACHED') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleAuthError();
        return;
      } else if (genRes.status === 403 && genData.error === 'INSUFFICIENT_CREDITS') {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setShowUpgradeModal(true);
        setTryonState('initial');
        return;
      } else if (genRes.status === 401 || genRes.status === 403) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleAuthError();
        return;
      } else if (!genRes.ok) {
        throw new Error(genData.error || 'Generation failed');
      }

      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      const finalUrl = genData.result_image_url || garment_image_url;
      setResultImageUrl(finalUrl);
      
      if (lockedSelfieId) {
        const savedRecord = await saveTryonResult({
          activeSelfieId: lockedSelfieId,
          garmentImageUrl: garment_image_url,
          resultImageUrl: finalUrl
        });
        if (savedRecord) {
          setCarouselResults(prev => [savedRecord, ...prev]);
          setCurrentSlideIndex(0);
        }
      }

      setTimeout(() => setTryonState('generated'), 400);

    } catch (err) {
      console.error(err);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTryonState('initial');
      alert(userFacingMessage(err));
    }
  };

  /**
   * Where "back" goes for someone who scanned a tag in a shop.
   *
   * Never into Tryon2Buy. This page is reached from a garment in somebody else's shop, and
   * the previous behaviour sent that shopper to /shop/:vendorId or the Tryon2Buy landing
   * page -- a storefront belonging to a different business, or a pitch for software they
   * are not buying. Neither is "back" by any reading.
   *
   * Resolved once, from most explicit to least:
   *   1. ?returnUrl=, when Inventory puts one on the link (allowlisted -- see config.js)
   *   2. the referring page, when they clicked through from one
   *   3. in-app history, when they navigated within this app
   *   4. nothing -- and then the control is not shown at all, because a cold QR scan opens a
   *      fresh tab and there is genuinely nowhere to go back to. An empty back button that
   *      dumps someone on a stranger's storefront is worse than no back button.
   */
  const backTarget = useMemo(() => resolveBackTarget({
    search: window.location.search,
    referrer: document.referrer,
    currentOrigin: window.location.origin,
    allowedOrigins: [INVENTORY_APP_URL, INVENTORY_API_URL],
    hasAppHistory: !!(window.history.state && window.history.state.idx > 0),
  }), []);

  const handleBack = () => {
    if (!backTarget) return;
    if (backTarget.kind === 'external') {
      window.location.href = backTarget.href;
      return;
    }
    navigate(-1);
  };

  if (loading) {
    // Branded rather than bare. This is the first thing after a camera closes, and an
    // unbranded grey screen at that moment reads as "the code did not work".
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center gap-5 px-6 font-['Courier_Prime',monospace]">
        <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy" className="h-9 object-contain opacity-90" />
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(26,20,16,0.15)] border-t-[#dd6b20] animate-spin" />
        <p className="text-[11px] uppercase tracking-[2px] text-[#8c8278]">Finding your garment</p>
      </div>
    );
  }

  if (error || !sourceGeneration) {
    // A scanned code that resolves to nothing is a normal event, not a crash: the product may
    // be a draft, retired, or the tag may outlive the garment. Previously this was one line of
    // red text on an empty page -- no branding, no explanation, and nothing to do next. A
    // shopper standing in a shop deserves to know it is not their fault and where to go.
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-6 text-center font-['Courier_Prime',monospace]">
        <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy" className="h-9 object-contain mb-8 opacity-90" />
        <h1 className="font-['EB_Garamond',serif] text-[26px] text-[#1a1410] mb-3">Nothing to try on</h1>
        <p className="text-[12px] leading-relaxed text-[#8c8278] max-w-[320px] mb-8 font-sans">
          {error || 'That code does not match anything available to try on.'}
        </p>
        <p className="text-[10px] uppercase tracking-[1.5px] text-[#a0aec0] max-w-[320px] mb-6 font-sans">
          Ask in the shop, or scan a different tag.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-7 py-3 rounded-full bg-[#dd6b20] hover:bg-[#c05621] text-white text-[10px] font-bold uppercase tracking-[2px] transition-colors"
        >
          About TryOn2Buy
        </button>
      </div>
    );
  }

  const drapedDressUrl = sourceGeneration.resultImageUrl || sourceGeneration.garmentImageUrl;
  const displayResultUrl = carouselResults.length > 0 ? carouselResults[currentSlideIndex]?.resultImageUrl : resultImageUrl;

  const nextSlide = () => setCurrentSlideIndex(prev => Math.min(prev + 1, carouselResults.length - 1));
  const prevSlide = () => setCurrentSlideIndex(prev => Math.max(prev - 1, 0));

  const handleCarouselDelete = async (e, resultId) => {
    e.stopPropagation();
    const success = await deleteTryonResult(resultId);
    if (success) {
      setCarouselResults(prev => prev.filter(r => r.id !== resultId));
      setCurrentSlideIndex(prev => Math.max(0, Math.min(prev, carouselResults.length - 2)));
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen flex flex-col font-['Courier_Prime',monospace] text-[#1a1410] antialiased select-none">

      <style dangerouslySetInnerHTML={{
        __html: `
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
        {/* Back, only when there is somewhere honest to go. A tag scanned with a phone
            camera opens a fresh tab with no history and no referrer, so for that shopper the
            control is simply absent rather than pointing at a page that is not theirs. */}
        <div className="flex-1 md:w-[200px] md:flex-none">
          {backTarget && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[1.5px] text-[#7f5700] hover:text-[#1a1410] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">Back</span>
            </button>
          )}
        </div>

        {/* Centered Branding */}
        <div className="flex justify-center items-center gap-2 md:gap-3">
          {/* Branding only. This used to navigate: to /workspace if a vendor_token happened
              to be in localStorage -- so on a shared shop tablet a shopper tapping the logo
              landed in the merchant studio -- and otherwise to a storefront or landing page
              belonging to Tryon2Buy rather than to the shop they are standing in. */}
          <div className="flex items-center">
            <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-10 object-contain mr-2" />
            {/* Names the garment that was scanned rather than the feature. Someone who has
                just pointed a phone at a tag needs to know the code found the right thing
                before they do anything else. */}
            <span className="hidden md:flex font-['EB_Garamond',serif] font-normal text-[#1a1410] text-[18px] md:text-[22px] tracking-tight items-center max-w-[420px]">
              <span className="opacity-40 px-2">|</span>
              <span className="truncate">{sourceGeneration?.dressName || 'PERSONAL FITTING'}</span>
            </span>
          </div>
        </div>

        {/* Right spacer */}
        <div className="flex-1 md:w-[200px] md:flex-none flex justify-end">
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">

        {/* Left Side: Instructions & Upload */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] bg-[#faf7f2] border-b lg:border-b-0 lg:border-r border-[rgba(26,20,16,0.1)] p-4 md:p-5 shrink-0 flex flex-col justify-start lg:overflow-y-auto lg:max-h-[calc(100vh-60px)]">

          {/* Global Hidden Inputs for Camera and File Browser */}
          {/* capture="environment" -- "camera" is not a value the HTML spec defines (only
              "user" and "environment"), so browsers fell back to their own default. The photo
              wanted here is full-length and taken by someone else, so the rear camera is the
              right one to ask for, explicitly. */}
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          <div className="flex flex-col animate-fade-in w-full">
            <h2 className={`font-['EB_Garamond',serif] text-[24px] font-normal leading-tight text-[#1a1410] ${tryonState === 'generated' ? 'mb-4 mt-4' : 'mb-0 hidden'}`}>
              Try On This Look
            </h2>
          </div>

          {tryonState !== 'generated' && (
            <div className="flex flex-col animate-fade-in w-full pt-4">

              {/* WHAT WAS SCANNED, first and biggest.
                  On a phone this column stacks above the garment canvas, so before this the
                  first image a shopper saw was the framing example -- a DIFFERENT saree -- and
                  the obvious reading of that is "this is the garment I scanned". Showing the
                  real one here, named, settles the only question they have at this moment:
                  did the code find the thing in my hand. */}
              <div className="flex items-center gap-3 bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-3 mb-4">
                {sourceGeneration?.garmentImageUrl && (
                  <img
                    src={sourceGeneration.garmentImageUrl}
                    alt={sourceGeneration?.dressName || 'The garment you scanned'}
                    className="w-[56px] h-[76px] object-cover rounded-lg border border-[#e2e8f0] shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[1.2px] text-[#a0aec0] font-sans font-bold mb-0.5">You scanned</p>
                  <p className="text-[#1a202c] text-[13px] font-bold font-sans leading-snug truncate">
                    {sourceGeneration?.dressName || 'This garment'}
                  </p>
                  <p className="text-[#718096] text-[10px] font-sans mt-0.5">Add a photo and see it on you.</p>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-3">
                <h2 className="text-[#1a202c] text-[18px] md:text-[20px] font-bold flex items-center justify-center gap-1.5 mb-1 font-sans">
                  Upload Your Photo
                </h2>
                <p className="text-[#718096] text-[10px] md:text-[11px] font-sans leading-tight">
                  For the best try-on experience, please follow the guidelines below.
                </p>
              </div>

              {/* The pose guide, demoted and relabelled.
                  It is a picture of a stranger in a different garment, sitting where a shopper
                  reasonably expects to see the thing they scanned. Smaller, laid beside its
                  caption rather than centred under a heading, and told plainly what it is. */}
              <div className="flex items-center gap-3 bg-[#f8f9fa] rounded-lg border border-[#e2e8f0] p-2.5 mb-3">
                <div className="w-[44px] h-[62px] rounded-md overflow-hidden border border-[#e2e8f0] shrink-0 bg-white">
                  <img
                    src="https://res.cloudinary.com/doiezptnn/image/upload/v1782733465/79061311-f8ef-4542-88ea-4783015af68d_z2bhdi.png"
                    alt="Example of how to frame your photo"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[#1a202c] font-bold text-[10px] font-sans">Pose like this</p>
                  <p className="text-[#718096] text-[9px] font-sans leading-relaxed">
                    An example of framing — not the garment you scanned.
                  </p>
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
                    <div className="bg-[#fffaf0] w-full rounded-md p-2 flex items-center justify-center gap-1.5 mb-2 border border-[#fefcbf]">
                      <Check className="w-3.5 h-3.5 text-[#dd6b20]" />
                      <span className="text-[#4a5568] text-[9px] font-sans font-bold">Photo saved for all try-ons (Expires 20m)</span>
                    </div>
                    
                    <div className="relative mb-3">
                      <img ref={activeImageRef} src={selectedImage} alt="Your Portrait" className="h-[120px] w-auto object-contain rounded-md shadow-sm pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-2 z-10 justify-center w-full max-w-[200px]">
                      <button 
                        onClick={triggerFileBrowser} 
                        className="flex-1 border border-[rgba(26,20,16,0.2)] text-[#4a5568] bg-white rounded-md px-3 py-1.5 flex items-center justify-center gap-1.5 font-bold text-[9px] uppercase tracking-wider font-sans hover:border-[#1a1410] hover:text-[#1a1410] transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Replace
                      </button>
                      <button 
                        onClick={clearImage}
                        className="flex-1 border border-red-200 text-red-600 bg-red-50 rounded-md px-3 py-1.5 flex items-center justify-center gap-1.5 font-bold text-[9px] uppercase tracking-wider font-sans hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" /> Remove
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
                <img ref={activeImageRef} src={selectedImage} alt="Your Portrait" className="h-[120px] w-auto object-contain shadow-sm rounded-lg pointer-events-none" />
              </div>
              <div className="flex items-center gap-2 z-10 justify-center w-full">
                <button 
                  onClick={triggerFileBrowser} 
                  className="flex-1 border border-[rgba(26,20,16,0.2)] text-[#4a5568] bg-white rounded-md px-3 py-2 flex items-center justify-center gap-1.5 font-bold text-[9px] uppercase tracking-wider font-sans hover:border-[#1a1410] hover:text-[#1a1410] transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Replace
                </button>
                <button 
                  onClick={clearImage}
                  className="flex-1 border border-red-200 text-red-600 bg-red-50 rounded-md px-3 py-2 flex items-center justify-center gap-1.5 font-bold text-[9px] uppercase tracking-wider font-sans hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove
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

          {STYLING_TOOLS_ENABLED && tryonState === 'generated' && (!sourceGeneration?.category || sourceGeneration?.category.toUpperCase() === 'SAREE') && (
            <div className="mb-6 animate-fade-in border-t border-[rgba(26,20,16,0.1)] pt-6">

              <div className="bg-[rgba(26,20,16,0.05)] rounded-full p-1 flex">
                <button
                  onClick={() => setActiveTab('sleeve')}
                  disabled={isModifying || isChangingBackground}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full transition-all duration-300 ${(isModifying || isChangingBackground) ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'sleeve'
                      ? 'bg-white shadow-sm text-[#1a1410]'
                      : 'text-[#8c8278] hover:text-[#1a1410]'
                    }`}
                >
                  SLEEVE STYLE
                </button>
                <button
                  onClick={() => setActiveTab('neck')}
                  disabled={isModifying || isChangingBackground}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full transition-all duration-300 ${(isModifying || isChangingBackground) ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'neck'
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
                      disabled={isModifying || isChangingBackground}
                      className={`relative aspect-square border overflow-hidden transition-all flex items-end justify-center pb-2 ${(isModifying || isChangingBackground) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#1a1410]'} ${showcaseBlouse === b.id ? 'ring-2 ring-[#c4933f] border-transparent scale-[1.02] shadow-sm' : 'border-[rgba(26,20,16,0.2)]'}`}
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
                      disabled={isModifying || isChangingBackground}
                      className={`relative aspect-square border overflow-hidden transition-all flex items-end justify-center pb-2 ${(isModifying || isChangingBackground) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#1a1410]'} ${showcaseNeck === n.id ? 'ring-2 ring-[#c4933f] border-transparent scale-[1.02] shadow-sm' : 'border-[rgba(26,20,16,0.2)]'}`}
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
            className={`w-full py-4 text-[11px] font-bold tracking-[2px] uppercase flex items-center justify-center gap-2 transition-all shadow-lg rounded-full ${selectedImage && tryonState !== 'generating'
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
                <img src={displayResultUrl} alt="Your Personal Try-On" className={`w-full h-full object-cover transition-opacity duration-700 ${(isChangingBackground || isModifying) ? 'opacity-40 blur-[2px]' : 'opacity-100'}`} />

                {/* Carousel Navigation Overlays */}
                {carouselResults.length > 1 && (
                  <>
                    {currentSlideIndex > 0 && (
                      <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-30 transition-all shadow-md backdrop-blur-md border border-white/20">
                        <ChevronLeft className="w-5 h-5 stroke-[3]" />
                      </button>
                    )}
                    {currentSlideIndex < carouselResults.length - 1 && (
                      <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-30 transition-all rotate-180 shadow-md backdrop-blur-md border border-white/20">
                        <ChevronLeft className="w-5 h-5 stroke-[3]" />
                      </button>
                    )}
                  </>
                )}

                {/* Background Changing Animation */}
                {isChangingBackground && (
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
            
            {/* Filmstrip Overlay */}
            {tryonState === 'generated' && carouselResults.length > 0 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[90%] z-30 flex justify-center gap-1.5 overflow-x-auto p-1.5 bg-black/50 backdrop-blur-md rounded-xl shadow-2xl border border-white/20"
                style={{ scrollbarWidth: 'none' }}>
                {carouselResults.map((res, idx) => (
                  <div key={res.id} className="relative group/thumb shrink-0 cursor-pointer" onClick={() => setCurrentSlideIndex(idx)}>
                    {/* The RESULT, not the garment. This strip is how you flip between the try-ons you
                        have done, and every thumbnail showed the same outfit photograph -- so trying
                        one dress three times gave three identical thumbnails and no way to tell them
                        apart. Your own results all look different, which is what makes it a carousel. */}
                    <img src={res.resultImageUrl} alt={`Try-on ${idx + 1}`} className={`w-10 h-14 object-cover rounded-md transition-all duration-300 ${currentSlideIndex === idx ? 'border-[1.5px] border-[#dd6b20] opacity-100 scale-105 shadow-sm' : 'border border-[rgba(255,255,255,0.2)] opacity-50 hover:opacity-100'}`} />
                    {/* Delete button */}
                    <button onClick={(e) => handleCarouselDelete(e, res.id)} className="absolute -top-1.5 -right-1.5 bg-red-500/90 hover:bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-md">
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>

        {/* Right Side: Background Panel */}
        {STYLING_TOOLS_ENABLED && tryonState === 'generated' && (
          <aside className="w-full xl:w-[360px] bg-[#faf7f2] border-l border-[rgba(26,20,16,0.1)] p-8 shrink-0 flex flex-col justify-center animate-fade-in">
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
      <ImageHistoryDock />
      
      {floatingAnimation && (
        <FloatingImageAnimation 
          imageUrl={floatingAnimation.url}
          sourceRect={floatingAnimation.sourceRect}
          onComplete={() => {
            if (floatingAnimation.url.startsWith('blob:')) {
              URL.revokeObjectURL(floatingAnimation.url);
            }
            isAnimatingRef.current = false;
            setFloatingAnimation(null);
          }}
        />
      )}
    </div>
  );
}
