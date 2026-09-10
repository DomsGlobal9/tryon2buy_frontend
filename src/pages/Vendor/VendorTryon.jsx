import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Check, ChevronLeft, RefreshCw, LogOut, Upload, Lightbulb, CloudUpload, FolderOpen, Heart, Lock, ShieldCheck, Shield, Camera, X, Shirt } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import VendorLimitModal from '../../components/VendorLimitModal';
import VendorUpgradeModal from '../../components/VendorUpgradeModal';
import ImageHistoryDock from '../../components/ImageHistoryDock';
import FloatingImageAnimation from '../../components/FloatingImageAnimation';
import { newClientRequestId, recoverGeneration, userFacingMessage } from '../../utils/generationRecovery';
import { createPhotoDock } from '../../utils/photoDock';

// How long to hold the synchronous request open before falling back to polling. Generous
// enough for a normal generation to answer directly, short enough that we stop waiting on a
// socket a proxy has already abandoned. Exceeding it is not an error -- see recoverGeneration.
const GENERATION_REQUEST_TIMEOUT_MS = 120000;


// Display-only — no prompts or raw image logic here.
// The backend resolves everything from prompts.js using these IDs.
const BACKGROUND_OPTIONS = [
  { id: 'bg1', name: 'Ancient Temple',   image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg1.png' },
  { id: 'bg2', name: 'Festive Palace',   image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg2.png' },
  { id: 'bg3', name: 'Designer Boutique',  image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg13.png' },
  { id: 'bg4', name: 'Luxury Hotel Lobby',      image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg12.png' },
  { id: 'bg5', name: 'Floral Garden Archway',   image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg14.png' },
  { id: 'bg6', name: 'Golden Palace',    image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg6.jpg' },
  { id: 'bg7', name: 'Tropical Garden',  image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg7.jpg' },
  { id: 'bg8', name: 'Beach Resort Sunset',     image: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/bg11.png' }
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

export default function VendorTryon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const activeImageRef = useRef(null);
  const intervalRef = useRef(null);
  const isAnimatingRef = useRef(false);
  // The photo exactly as the file input gave it to us. selectedFile does not stay that
  // object -- saveToHistory broadcasts PHOTO_ADDED and loadStoredImage replaces it 50ms
  // later with the copy read back from IndexedDB, which on iOS can lose its MIME type or
  // its bytes. Uploading this avoids depending on that round trip.
  const freshFileRef = useRef(null);
  // Recovery can outlive the page. Without this, polling would keep calling setState after
  // the user has navigated away.
  const isMountedRef = useRef(true);

  /**
   * The SHARED dock: this shop's photographs, on the server, the same on every device the
   * account is signed in on.
   *
   * Only this page. The shopper-facing try-on pages keep the browser's own dock, because a
   * customer scanning a QR code has no account -- and because sharing their photograph into
   * a shop-wide dock is not a thing to do by accident.
   *
   * Created once: a new dock object each render would restart the poll continuously.
   */
  const [dock] = useState(() => createPhotoDock({
    shared: true,
    apiUrl: API_URL,
    getToken: () => localStorage.getItem('vendor_token')
  }));
  const [dockPhotoId, setDockPhotoId] = useState(null);
  // Set only when the outfit THIS device is working on is removed from the shop's list by
  // somebody else. A note, never an interruption -- see the effect further down.
  const [outfitWithdrawn, setOutfitWithdrawn] = useState(false);
  const [floatingAnimation, setFloatingAnimation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sourceGeneration, setSourceGeneration] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [tryonState, setTryonState] = useState('initial'); // 'initial', 'generating', 'generated'
  const [progress, setProgress] = useState(0);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  
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
    // Wait for explicit action
  }, [authToken]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  /**
   * What this shop currently has in its dock, from the server.
   *
   * Replaces the IndexedDB read this page used to do. The active photograph, and the try-ons
   * made from it, now come from the account rather than from this browser -- which is the
   * whole feature: the counter tablet and the owner's laptop see the same thing.
   *
   * selectedFile stays null on purpose. A shared photograph is a URL that already exists on
   * the server, so there is no File to hold and nothing to upload again at generation time.
   */
  /**
   * Puts one of the shop's photographs into the upload slot.
   *
   * The ONLY thing that changes which photograph this page is working with. Nothing else
   * does it -- not the poll, not another device.
   */
  const applyPhoto = React.useCallback((photo) => {
    setDockPhotoId(photo?.id || null);
    setSelectedFile(null);
    setSelectedImage(prev => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return photo?.imageUrl || null;
    });
    setCarouselResults(photo?.results || []);
    setCurrentSlideIndex(0);
  }, []);

  /**
   * Puts one of the shop's garments into the page, keeping the photograph already in the slot.
   *
   * The counterpart to applyPhoto: one changes who is being dressed, this changes what they
   * are wearing, and neither disturbs the other. That is the whole point -- somebody who has
   * just finished a try-on and opens the dock to try the next outfit should not have to find
   * and re-pick the customer's photograph in between.
   *
   * This used to be a plain navigate() to the garment's page. Same destination, but arriving
   * as a fresh page: the photograph in the slot was gone, and whoever was serving had to set
   * it up again with the customer standing there. The navigate stays -- the page is addressed
   * by the garment and the URL has to keep saying which one, or a refresh would go back to
   * the previous outfit -- but because the route pattern is unchanged React only swaps the
   * parameter. The component is not remounted, so selectedImage and the dock photograph
   * survive it and the effect keyed on `id` simply fetches the new garment.
   *
   * The RESULT is cleared, and that is not the same as clearing the photograph. A generated
   * image belongs to a pair -- this person, that outfit -- so leaving the previous garment's
   * result on screen under a new garment's name would be showing something untrue. It is not
   * lost: it stays in the dock under the photograph it was made from, which is where past
   * try-ons live.
   */
  const applyGarment = React.useCallback((garment) => {
    const assetId = garment?.primaryAssetId;
    if (!assetId || assetId === id) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTryonState('initial');
    setProgress(0);
    setResultImageUrl(null);
    setSelectedBg(null);

    // replace, not push: flipping between four outfits should not put four entries in the
    // history for the back button to walk through one at a time.
    navigate(`/vendor/preview/${assetId}`, { replace: true });
  }, [id, navigate]);

  /** Re-reads the try-ons under the photograph already in the slot. Never changes the slot. */
  const refreshResults = React.useCallback(async () => {
    if (!dockPhotoId) return;
    try {
      const photos = await dock.list();
      if (!isMountedRef.current) return;
      const mine = photos.find(p => p.id === dockPhotoId);
      // Gone from another device: leave the photograph on screen rather than blanking the
      // page mid-session. The next explicit pick will sort it out.
      if (mine) setCarouselResults(mine.results || []);
    } catch (err) {
      console.error('[VendorTryon] could not refresh try-ons', err);
    }
  }, [dock, dockPhotoId]);

  /**
   * On arrival -- and only on arrival -- start from whatever the shop last selected.
   *
   * A sensible starting point on a device that has just been opened, and the last moment
   * anything remote is allowed to decide what is in the slot. From here the photograph
   * changes only when somebody picks one out of the dock.
   *
   * The dock itself keeps polling, so its list stays current across devices. That is the part
   * that should follow the shop; the photograph being worked on is not, because swapping it
   * under someone mid-session is the disruption this arrangement exists to avoid.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const photos = await dock.list();
        if (cancelled || !isMountedRef.current) return;
        applyPhoto(photos.find(p => p.isActive) || null);
      } catch (err) {
        console.error('[VendorTryon] could not read the shared dock', err);
      }
    })();
    return () => { cancelled = true; };
  }, [dock, applyPhoto]);

  // Tell the server the photograph is still in use, so it is not aged out from under
  // someone who is still working with it on another device.
  useEffect(() => {
    if (dockPhotoId) dock.touch(dockPhotoId);
  }, [currentSlideIndex, dockPhotoId, dock]);

  /**
   * Say that this outfit is being worn, for as long as this page is open.
   *
   * Deleting an outfit erases the try-ons made with it, and a colleague on another device can
   * be in the middle of exactly that. This beat is what lets the dock ask "someone is trying
   * this on right now -- delete anyway?" instead of taking their work without a word.
   *
   * Thirty seconds against a ninety-second window on the server, so a lost beat costs a
   * warning rather than somebody's session. Beats immediately on arrival too: the risky moment
   * is the first minute, when a colleague has just seen the outfit appear in their dock.
   */
  useEffect(() => {
    if (!id) return;
    dock.touchGarment?.(id);
    const beat = setInterval(() => dock.touchGarment?.(id), 30000);
    return () => clearInterval(beat);
  }, [id, dock]);

  /**
   * Notice -- never interrupt -- when this outfit is taken off the shop's list.
   *
   * The rule this enforces is worth stating plainly: **a delete on another device must never
   * end a try-on in progress here.** It cannot, structurally, because deleting an outfit
   * removes its try-on RESULTS and never the garment itself, so this page keeps its garment,
   * its photograph and its ability to generate. What did happen silently was that results
   * already on screen vanished at the next refresh with nothing to explain why.
   *
   * So: watch for our own outfit leaving the list, say so once, quietly, and change nothing
   * else. No navigation, no cleared slot, no blocked button.
   *
   * Only a TRANSITION counts. An outfit with no try-ons yet is legitimately absent from the
   * list, and warning about that on arrival would be crying wolf on the normal case.
   */
  const wasListedRef = useRef(false);
  useEffect(() => {
    if (!dock.shared || !id) return;
    let stop = false;

    const look = async () => {
      try {
        const listed = (await dock.garments()).some(g => g.primaryAssetId === id);
        if (stop || !isMountedRef.current) return;
        if (wasListedRef.current && !listed) setOutfitWithdrawn(true);
        if (listed) { wasListedRef.current = true; setOutfitWithdrawn(false); }
      } catch {
        // Offline or expired. Not worth a word; the next look sorts it out.
      }
    };

    look();
    const unsubscribe = dock.subscribe(() => look());
    return () => { stop = true; unsubscribe(); };
  }, [dock, id]);

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
      setTryonState('initial');
      // Uploaded and recorded against the account, then re-read, so the photograph appears
      // on every signed-in device rather than only in this browser.
      addToSharedDock(file);
    }
  };

  /**
   * Puts a freshly picked photograph into the shop's dock.
   *
   * Uploading happens here rather than at generation time, because a photograph that only
   * exists as bytes in this browser cannot appear on the owner's laptop. The cost is that a
   * photograph picked and never used is still uploaded -- which is the price of the dock
   * being shared at all.
   */
  const addToSharedDock = async (file) => {
    try {
      const added = await dock.add(file);
      if (!added) { handleAuthError(); return; }
      // Picking a photograph here is this person's own action, so it goes into the slot.
      applyPhoto(added);
    } catch (err) {
      console.error('[VendorTryon] could not add to the shared dock', err);
      alert(userFacingMessage(err));
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
    // Empties the slot here, and drops the shop-wide "start here" mark so a device opening
    // later does not begin on a photograph nobody is working with. The photograph itself
    // stays in the dock, and no other open page has its slot changed.
    applyPhoto(null);
    await dock.deactivate();
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
        setTryonState('initial');
        addToSharedDock(file);
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
        setCarouselResults(prev => prev.map(r => r.id === targetId ? { ...r, resultImageUrl: data.url } : r));
      } else {
        setResultImageUrl(data.url);
      }
      setSelectedBg(null);

      if (dockPhotoId) dock.touch(dockPhotoId);
    } catch (err) {
      // Real reason to the console only -- never to the person.
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
        setCarouselResults(prev => prev.map(r => r.id === targetId ? { ...r, resultImageUrl: result.resultImageUrl } : r));
      } else {
        setResultImageUrl(result.resultImageUrl);
      }
      
      if (dockPhotoId) dock.touch(dockPhotoId);
    } catch (err) {
      // Real reason to the console only -- never to the person.
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
      // The photograph is already on the server: it was uploaded when it went into the
      // shared dock, which is what lets the other devices see it. Nothing to upload here.
      const human_image_url = selectedImage;

      // A blob: URL would mean a local handle that no other device could resolve.
      if (!human_image_url || human_image_url.startsWith('blob:')) {
        throw new Error('No shared dock photo available for generation');
      }

      const garment_image_url = sourceGeneration.resultImageUrl || sourceGeneration.garmentImageUrl;

      // Named before it is sent, so the result stays claimable if this response is lost.
      const clientRequestId = newClientRequestId();

      let genRes = null;
      let genData = {};
      let transportFailure = null;

      try {
        genRes = await fetch(`${API_URL}/api/tryon/generate`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            mode: 'with_garment',
            garment_image_url: garment_image_url,
            human_image_url,
            parent_generation_id: id,
            target_folder: 'results/tryon-results',
            client_request_id: clientRequestId,
            // Files this try-on under the dock photograph it was made from, so every signed-in
            // device sees it grouped under the right person.
            dock_photo_id: dockPhotoId
          }),
          // Stop holding a socket the network has already given up on. Hitting this is not
          // a failure -- the server is still working, and we go and collect the result below.
          signal: AbortSignal.timeout(GENERATION_REQUEST_TIMEOUT_MS)
        });
        // Deliberately NOT .catch(() => ({})). A body that will not parse means the response
        // was truncated, which is exactly the case that must trigger recovery rather than be
        // quietly turned into an empty object.
        genData = await genRes.json();
      } catch (err) {
        transportFailure = err;
      }

      // Refusals are decided by the server before any asset row exists, so they are settled
      // here and never polled for -- there would be nothing to find.
      if (genRes && !transportFailure) {
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
        }
      }

      let finalUrl = genData?.result_image_url || null;

      if (!finalUrl) {
        // Either the connection died or the reply carried no image. The credit is already
        // spent and the server is very likely still finishing the picture, so wait for it
        // rather than throwing the work away. The progress bar keeps running on purpose.
        const recovered = await recoverGeneration({
          apiUrl: API_URL,
          clientRequestId,
          headers: getHeaders(),
          isCancelled: () => !isMountedRef.current
        });

        if (recovered?.status === 'COMPLETED') {
          finalUrl = recovered.result_image_url;
        } else if (recovered?.status === 'FAILED') {
          throw new Error(recovered.error || 'Generation failed');
        } else if (transportFailure) {
          throw new Error('The connection dropped and the try-on could not be recovered. Please try again.');
        } else if (genRes && !genRes.ok) {
          throw new Error(genData?.error || 'Generation failed');
        } else {
          throw new Error('The try-on did not come back. Please try again.');
        }
      }

      if (!isMountedRef.current) return;

      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setResultImageUrl(finalUrl);

      // The result recorded itself against the dock photograph server-side, via the
      // dock_photo_id sent above. Only the try-ons are re-read -- the photograph in the slot
      // stays exactly where it is.
      await refreshResults();

      setTimeout(() => setTryonState('generated'), 400);

    } catch (err) {
      console.error(err);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTryonState('initial');
      alert(userFacingMessage(err));
    }
  };

  const handleBack = () => {
    navigate('/vendor/catalog');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#ede8df] flex items-center justify-center font-['Courier_Prime',monospace] text-[12px] uppercase tracking-widest text-[#8c8278] animate-pulse">Loading dress details...</div>;
  }

  /**
   * A garment that is gone, with a way out of it.
   *
   * This was a single line of centred red capitals -- "DRESS NOT FOUND OR LINK EXPIRED" -- and
   * nothing else on the page. No buttons, no links, not even the dock. Somebody who arrived
   * from a bookmark, a link a colleague sent them, or the browser's back button was simply
   * stuck: the only escape was knowing to press back again or to retype a URL, with a customer
   * standing there.
   *
   * It became much easier to reach the moment outfits could be deleted, which is how it turned
   * up -- pressing back after switching outfits landed on one whose try-ons had been erased.
   *
   * So: say what happened in a sentence rather than shouting an error code, and offer the two
   * things a person actually wants next. The dock stays mounted underneath, because "show me
   * the other outfits" is the most likely answer of all and it is already right there.
   */
  if (error || !sourceGeneration) {
    return (
      <div className="min-h-screen bg-[#ede8df] flex flex-col items-center justify-center px-6 text-center">
        <Shirt className="w-10 h-10 text-[#c4b8a8] mb-4" />
        <p className="font-['Courier_Prime',monospace] text-[13px] tracking-wide text-[#5c5349] max-w-sm leading-relaxed">
          This outfit is no longer here. It may have been removed from the shop, or the link
          may have expired.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => navigate('/vendor/catalog')}
            className="px-5 py-2.5 bg-[#1a202c] text-white font-['Courier_Prime',monospace] text-[11px] uppercase tracking-widest hover:bg-[#2d3748] transition-colors"
          >
            Back to your outfits
          </button>
          <button
            onClick={() => navigate('/workspace')}
            className="px-5 py-2.5 border border-[#c4b8a8] text-[#5c5349] font-['Courier_Prime',monospace] text-[11px] uppercase tracking-widest hover:bg-[#e3ddd2] transition-colors"
          >
            Start a new try-on
          </button>
        </div>

        {/* Still mounted, deliberately. The shop's other outfits and photographs are the most
            likely thing wanted next, and they are already loaded. */}
        <ImageHistoryDock dock={dock} onPick={applyPhoto} onPickGarment={applyGarment} />
      </div>
    );
  }

  const drapedDressUrl = sourceGeneration.resultImageUrl || sourceGeneration.garmentImageUrl;
  const displayResultUrl = carouselResults.length > 0 ? carouselResults[currentSlideIndex]?.resultImageUrl : resultImageUrl;

  const nextSlide = () => setCurrentSlideIndex(prev => Math.min(prev + 1, carouselResults.length - 1));
  const prevSlide = () => setCurrentSlideIndex(prev => Math.max(prev - 1, 0));

  const handleCarouselDelete = async (e, resultId) => {
    e.stopPropagation();
    try {
      await dock.removeResult(resultId);
      setCarouselResults(prev => prev.filter(r => r.id !== resultId));
      setCurrentSlideIndex(prev => Math.max(0, Math.min(prev, carouselResults.length - 2)));
      await refreshResults();
    } catch (err) {
      console.error('[VendorTryon] could not remove the try-on', err);
      alert(userFacingMessage(err));
    }
  };

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
            onClick={() => navigate('/vendor/catalog')}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-10 object-contain mr-2" />
            <span className="hidden md:flex font-['EB_Garamond',serif] font-normal text-[#1a1410] text-[18px] md:text-[22px] tracking-tight items-center"><span className="opacity-40 px-2">|</span> PERSONAL FITTING</span>
          </div>
        </div>

        {/* Right spacer */}
        <div className="flex-1 md:w-[200px] md:flex-none flex justify-end">
        </div>
      </header>

      <div className="flex-1 flex flex-col xl:flex-row relative">
        
        {/* Left Side: Instructions & Upload */}
        <aside className="w-full xl:w-[400px] bg-[#faf7f2] border-r border-[rgba(26,20,16,0.1)] p-3 md:p-4 shrink-0 flex flex-col justify-start overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}>
          
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
                    <div className="bg-[#fffaf0] w-full rounded-md p-2 flex items-center justify-center gap-1.5 mb-2 border border-[#fefcbf]">
                      <Check className="w-3.5 h-3.5 text-[#dd6b20]" />
                      {/* Says what is actually true on this page now. The photograph is in the shop's
                          dock, not this browser, and it is kept for a day rather than twenty minutes --
                          promising "20m" here would have been simply wrong. */}
                      <span className="text-[#4a5568] text-[9px] font-sans font-bold">Photo saved &mdash; try more outfits with it for 20 minutes</span>
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

          {tryonState === 'generated' && (!sourceGeneration?.category || sourceGeneration?.category.toUpperCase() === 'SAREE') && (
            <div className="mb-6 animate-fade-in border-t border-[rgba(26,20,16,0.1)] pt-6">
              
              <div className="bg-[rgba(26,20,16,0.05)] rounded-full p-1 flex">
                <button
                  onClick={() => setActiveTab('sleeve')}
                  disabled={isModifying || isChangingBackground}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full transition-all duration-300 ${(isModifying || isChangingBackground) ? 'opacity-50 cursor-not-allowed' : ''} ${
                    activeTab === 'sleeve'
                      ? 'bg-white shadow-sm text-[#1a1410]'
                      : 'text-[#8c8278] hover:text-[#1a1410]'
                  }`}
                >
                  SLEEVE STYLE
                </button>
                <button
                  onClick={() => setActiveTab('neck')}
                  disabled={isModifying || isChangingBackground}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-[1.5px] uppercase rounded-full transition-all duration-300 ${(isModifying || isChangingBackground) ? 'opacity-50 cursor-not-allowed' : ''} ${
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
        {tryonState === 'generated' && (
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
      {/* onPick is the only route from the dock into the upload slot. The dock keeps itself
          current across devices on its own; nothing it learns changes this page until
          somebody chooses a photograph out of it. */}
      {/* A note, not a dialog. Whoever is standing here can read it and carry on, or dismiss
          it; nothing about the page is blocked by it and the try-on continues either way. */}
      {outfitWithdrawn && (
        <div
          role="status"
          className="fixed bottom-24 right-6 z-40 max-w-xs bg-white border border-[#e2e8f0] shadow-lg rounded-lg p-3 flex items-start gap-2.5"
        >
          <Shirt className="w-4 h-4 text-[#dd6b20] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[11px] text-[#1a202c] leading-relaxed">
              Someone removed this outfit from the shop&rsquo;s list. You can carry on and try
              it on &mdash; earlier try-ons made with it have gone.
            </p>
            <button
              onClick={() => setOutfitWithdrawn(false)}
              className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#a0aec0] hover:text-[#1a202c]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <ImageHistoryDock
        dock={dock}
        onPick={applyPhoto}
        /* Picking a garment changes what this page is working on, and only on this device.
           The dock's LIST is shared -- an outfit tried on the counter tablet shows up on the
           owner's laptop, which is the point of it -- but choosing one is a local act. No
           other device's page moves, because nothing here writes the choice anywhere. */
        onPickGarment={applyGarment}
        /* Browsable while a generation runs, not applicable. Someone waiting on a try-on is
           exactly who wants to look at what to try next; what they must not be able to do is
           change the inputs underneath the generation already in flight. */
        busy={tryonState === 'generating' || isModifying || isChangingBackground}
      />
      
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
