import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';
import { Sparkles, Upload, Check, ChevronLeft, ArrowRight, RefreshCw, LogOut, Shirt, UserCheck, Wind, Star, Layers, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VendorLimitModal from '../../components/VendorLimitModal';
import VendorUpgradeModal from '../../components/VendorUpgradeModal';

// Step 1 assets
const imgSaree = "http://localhost:3845/assets/acdc2b8b07c17fbe38507a6bf5f4d4bfd0719563.png";
const imgKurti = "http://localhost:3845/assets/d5e5b05a9a6ba0093dcc01d5b3d3690e5d9d10f6.png";
const imgLehenga = "http://localhost:3845/assets/486b0188b62478ceed283e6e4c8fa8da3b96f448.png";
const imgBlouse = "http://localhost:3845/assets/8782926965bb3f5cccc7cc13e2856a5027062f35.png";
const imgDress = "http://localhost:3845/assets/dd6249a9f7c216437dd9fe7cf035368fb6b86bc2.png";

// Models
const imgModelClassicStudio = "http://localhost:3845/assets/568a6f72551bfb6386758b8c6e5d3ddd96fcd4d6.png";
const imgModelHeritageCourt = "http://localhost:3845/assets/b99e1af1067f8445e5da914267019819fb9bc126.png";

// SVGs / Icons
const imgCheckIcon = "http://localhost:3845/assets/5562447e235a6d5290bd80edeccaad8685635a9d.svg";
const imgCloudUploadIcon = "http://localhost:3845/assets/5ed675a87992382480595b863c88f043867b5f35.svg";
const imgSparkleIcon = "http://localhost:3845/assets/57bc61ae51616a14133de6d0ecef9147d2895169.svg";
const imgSilhouetteIcon = "http://localhost:3845/assets/a249434f512726ee89a8ee251ee587fd341399a0.svg";
const imgSearchIcon = "http://localhost:3845/assets/6e210d18e84e7be6898081e805c5c52a0b885275.svg"; 
const imgCartIcon = "http://localhost:3845/assets/fe48a95e0d65c7fcf86d546a537bcf683b7cb725.svg"; 
const imgChevronDown = "http://localhost:3845/assets/09a9e63298cac1d80b6e69971e95da0f6ebb5138.svg";

// Backdrops
const imgBackdropClassic = "http://localhost:3845/assets/487b58442e3bc149cf2907401b038c005bb8c5f8.png";
const imgBackdropHeritage = "http://localhost:3845/assets/8f8024eb71678cba872ebfb43d0ef224aaef92ad.png";

// Samples (draping reference)
const imgSample1 = "http://localhost:3845/assets/eb3723735f4918d0fea490acc7cf28dbf398e136.png";
const imgSample2 = "http://localhost:3845/assets/12485f59679dfaa84d051008c4f9b1fa8b47cad3.png";
const imgSample3 = "http://localhost:3845/assets/2be0b27cbf3bdfc0adec50cbe945bd6dc6e92fe2.png";

// Fallbacks for Unsplash
const FALLBACK_SAREE_ICON = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&h=120&q=80";
const FALLBACK_KURTI_ICON = "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=120&h=120&q=80";
const FALLBACK_LEHENGA_ICON = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=120&h=120&q=80";
const FALLBACK_BLOUSE_ICON = "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=120&h=120&q=80";
const FALLBACK_DRESS_ICON = "https://images.unsplash.com/photo-1595959183075-c1d09e7e951c?auto=format&fit=crop&w=120&h=120&q=80";

const FALLBACK_SAMPLE_1 = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80";
const FALLBACK_SAMPLE_2 = "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=400&q=80";
const FALLBACK_SAMPLE_3 = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80";

// Personal user photo shortcuts (without garment flow)
const FALLBACK_USER_1 = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
const FALLBACK_USER_2 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80";
const FALLBACK_USER_3 = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80";

// Draped Models map for results
const DRAPED_RESULT_MAP = {
  "SAREE": {
    "Classic Studio": "http://localhost:3845/assets/b8f534b47b928ffbb17116a86e63b2807359e0dd.png",
    "Heritage Court": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&h=800&q=80"
  },
  "KURTI": {
    "Classic Studio": "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&h=800&q=80",
    "Heritage Court": "https://images.unsplash.com/photo-1583391733958-d25e07fac200?auto=format&fit=crop&w=600&h=800&q=80"
  },
  "LEHENGA": {
    "Classic Studio": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=80",
    "Heritage Court": "https://images.unsplash.com/photo-1595959183075-c1d09e7e951c?auto=format&fit=crop&w=600&h=800&q=80"
  },
  "BLOUSE": {
    "Classic Studio": "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&h=800&q=80",
    "Heritage Court": "https://images.unsplash.com/photo-1597983073492-ae23722e6db4?auto=format&fit=crop&w=600&h=800&q=80"
  },
  "DRESS": {
    "Classic Studio": "https://images.unsplash.com/photo-1595959183075-c1d09e7e951c?auto=format&fit=crop&w=600&h=800&q=80",
    "Heritage Court": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=80"
  }
};

// Catalog dresses data for "Without Garment" Step 2
const CATALOG_DRESSES = {
  "SAREE": [
    { id: "s1", name: "Banarasi Silk Saree", img: imgSaree, fallback: FALLBACK_SAREE_ICON, draped: "http://localhost:3845/assets/b8f534b47b928ffbb17116a86e63b2807359e0dd.png" },
    { id: "s2", name: "Kanjeevaram Gold Saree", img: FALLBACK_SAMPLE_1, fallback: FALLBACK_SAMPLE_1, draped: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&h=800&q=80" },
    { id: "s3", name: "Brocade Royal Saree", img: FALLBACK_SAREE_ICON, fallback: FALLBACK_SAREE_ICON, draped: "https://images.unsplash.com/photo-1583391733958-d25e07fac200?auto=format&fit=crop&w=600&h=800&q=80" }
  ],
  "KURTI": [
    { id: "k1", name: "Cotton Chikankari Kurti", img: imgKurti, fallback: FALLBACK_KURTI_ICON, draped: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&h=800&q=80" },
    { id: "k2", name: "Indigo Blockprint Kurti", img: FALLBACK_SAMPLE_2, fallback: FALLBACK_SAMPLE_2, draped: "https://images.unsplash.com/photo-1583391733958-d25e07fac200?auto=format&fit=crop&w=600&h=800&q=80" }
  ],
  "LEHENGA": [
    { id: "l1", name: "Velvet Bridal Lehenga", img: imgLehenga, fallback: FALLBACK_LEHENGA_ICON, draped: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=80" },
    { id: "l2", name: "Pastel Organza Lehenga", img: FALLBACK_SAMPLE_3, fallback: FALLBACK_SAMPLE_3, draped: "https://images.unsplash.com/photo-1595959183075-c1d09e7e951c?auto=format&fit=crop&w=600&h=800&q=80" }
  ],
  "BLOUSE": [
    { id: "b1", name: "Chanderi Silk Blouse", img: imgBlouse, fallback: FALLBACK_BLOUSE_ICON, draped: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&h=800&q=80" }
  ],
  "DRESS": [
    { id: "d1", name: "Floral Georgette Dress", img: imgDress, fallback: FALLBACK_DRESS_ICON, draped: "https://images.unsplash.com/photo-1595959183075-c1d09e7e951c?auto=format&fit=crop&w=600&h=800&q=80" }
  ]
};

const BLOUSE_COLORS = [
  { id: 1, hex: "#3d0a11", name: "Burgundy Velvet" },
  { id: 2, hex: "#d4af37", name: "Tuscan Gold" },
  { id: 3, hex: "#1a1410", name: "Midnight Black" },
  { id: 4, hex: "#2d3e40", name: "Deep Teal" },
  { id: 5, hex: "#e2d2b3", name: "Vanilla Linen" }
];

const BACKDROPS = [
  { id: 1, image: imgBackdropClassic, fallback: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=150&h=150&q=80", name: "Classic Studio" },
  { id: 2, image: imgBackdropHeritage, fallback: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=150&h=150&q=80", name: "Heritage Court" }
];

const DEFAULT_MODELS_BY_CATEGORY = {
  "SAREE": [
    { name: "Saree Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/41.jpeg" },
    { name: "Saree Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/42.jpeg" },
    { name: "Saree Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/43.jpeg" },
    { name: "Saree Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/44.jpeg" }
  ],
  "LEHANGA": [
    { name: "Lehanga Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga1.jpg" },
    { name: "Lehanga Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga2.jpg" },
    { name: "Lehanga Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga3.jpg" },
    { name: "Lehanga Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga4.jpg" }
  ],
  "ANARKALI": [
    { name: "Anarkali Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/anarkali1.jpg" },
    { name: "Anarkali Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/anarkali2.jpg" },
    { name: "Anarkali Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/anarkali3.jpg" },
    { name: "Anarkali Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/anarkali4.jpg" }
  ],
  "KURTHI": [
    { name: "Kurthi Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti1.jpg" },
    { name: "Kurthi Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti2.jpg" },
    { name: "Kurthi Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti3.jpg" },
    { name: "Kurthi Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti4.jpg" }
  ],
  "SHARARA": [
    { name: "Sharara Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/shrara1.jpg" },
    { name: "Sharara Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/shrara2.jpg" },
    { name: "Sharara Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/shrara3.jpg" },
    { name: "Sharara Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/sharara4.jpg" }
  ]
};

export default function TryonWorkspace({ onExit }) {
  const navigate = useNavigate();
  const getHeaders = () => {
    const token = localStorage.getItem('vendor_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const getUploadHeaders = () => {
    const token = localStorage.getItem('vendor_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const isGuestMode = sessionStorage.getItem('guest_mode') === 'true';

  const handleLogout = () => {
    if (isGuestMode) {
      sessionStorage.removeItem('guest_mode');
      navigate('/');
    } else {
      localStorage.removeItem('vendor_token');
      localStorage.removeItem('vendor_data');
      navigate('/login');
    }
  };

  // Workspace Mode ('with_garment' is now default since 'with_catalog' is disabled)
  const [workspaceMode, setWorkspaceMode] = useState('with_garment');

  // Workspace configuration states
  const [category, setCategory] = useState("SAREE");
  
  // Selection references for BOTH flows
  const [selectedImage, setSelectedImage] = useState(null); // portrait image for without_garment
  const [selectedFile, setSelectedFile] = useState(null); // portrait file for without_garment
  const [garmentUploads, setGarmentUploads] = useState({}); // multi-slot state for with_garment
  const [currentGenerationId, setCurrentGenerationId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [selectedModel, setSelectedModel] = useState(null); // model selection
  const [selectedCatalogDress, setSelectedCatalogDress] = useState(null); // catalog dress selection

  // Dynamic Data
  const [defaultModels, setDefaultModels] = useState([]);
  const [catalogDressesData, setCatalogDressesData] = useState({});
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [showGuestSaveModal, setShowGuestSaveModal] = useState(false);

  // Try-on generation state ('initial', 'generating', 'generated')
  const [tryonState, setTryonState] = useState('initial');
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState(0);

  // Two-Step Flow State
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [phase1Result, setPhase1Result] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Customization states
  const [selectedBlouse, setSelectedBlouse] = useState(BLOUSE_COLORS[0]);
  const [selectedBackdrop, setSelectedBackdrop] = useState(BACKDROPS[0]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Inject fonts
    const linkGaramond = document.createElement('link');
    linkGaramond.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap';
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

  // Fetch dynamic data (Default Models based on category)
  useEffect(() => {
    const localModels = DEFAULT_MODELS_BY_CATEGORY[category] || DEFAULT_MODELS_BY_CATEGORY["SAREE"];
    setDefaultModels(localModels);
    if (localModels.length > 0) {
      setSelectedModel(localModels[0].name);
    }
  }, [category]);

  

  const getUploadSlots = (cat) => {
    if (cat === "SAREE") {
      return [
        { id: 'saree', label: 'Saree', required: true },
        { id: 'blouse', label: 'Blouse', required: false }
      ];
    }
    return [
      { id: 'full', label: 'Full', required: true },
      { id: 'top', label: 'Top', required: true },
      { id: 'bottom', label: 'Bottom', required: true },
      { id: 'back', label: 'Back', required: true }
    ];
  };

  const activeSlots = getUploadSlots(category);

  const isGarmentUploadValid = () => {
    return activeSlots.every(slot => !slot.required || garmentUploads[slot.id]);
  };

  const handleCategorySelect = (newCategory) => {
    if (newCategory !== category) {
      setCategory(newCategory);
      setGarmentUploads({}); // clear slots when switching category
    }
  };

  const handleGarmentSlotChange = (slotId, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setGarmentUploads(prev => ({ ...prev, [slotId]: { file, url } }));
    }
  };

  const handleGarmentDrop = (slotId, e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setGarmentUploads(prev => ({ ...prev, [slotId]: { file, url } }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedFile(file);
    }
  };

  const handleHumanDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const startGeneration = async () => {
    if (!isGarmentUploadValid() || !selectedModel) return;
    setTryonState('generating');
    setIsSaved(false);
    setProgress(0); setProgressStage(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        const bounded = next > 95 ? 95 : next;
        if (bounded < 35) setProgressStage(0); else if (bounded < 70) setProgressStage(1); else setProgressStage(2);
        return bounded;
      });
    }, 300);
    try {
      const garment_urls = {};
      for (const slot of activeSlots) {
        const slotData = garmentUploads[slot.id];
        if (slotData && slotData.file) {
          const formData = new FormData(); formData.append('image', slotData.file);
          const uploadRes = await fetch(`${API_URL}/api/tryon/upload?folder=garments`, { method: 'POST', headers: getUploadHeaders(), body: formData });
          const uploadData = await uploadRes.json(); garment_urls[slot.id] = uploadData.url;
        } else if (slotData && slotData.url) {
          garment_urls[slot.id] = slotData.url;
        }
      }
      const garment_image_url = JSON.stringify(garment_urls);
      const sm = defaultModels.find(m => m.name === selectedModel);
      const human_image_url = sm ? sm.img : imgModelClassicStudio;
      const genRes = await fetch(`${API_URL}/api/tryon/generate`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ mode: 'with_garment', garment_image_url, human_image_url, category, target_folder: 'vendor-drapes' })
      });
      if (!genRes.ok) {
        const errorData = await genRes.json(); clearInterval(interval); setTryonState('initial');
        if (genRes.status === 401 && errorData.error === 'GUEST_LIMIT_REACHED') setShowLimitModal(true);
        else if (genRes.status === 403 && errorData.error === 'INSUFFICIENT_CREDITS') setShowUpgradeModal(true);
        else alert('Generation failed: ' + (errorData.message || errorData.error || 'Unknown error'));
        return;
      }
      const genData = await genRes.json();
      
      clearInterval(interval);
      setProgress(100);
      setResultImageUrl(genData.result_image_url || FALLBACK_SAREE_ICON);
      if (genData.generation_id) setCurrentGenerationId(genData.generation_id);
      setTimeout(() => setTryonState('generated'), 400);

    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setTryonState('initial');
      alert('Generation failed: ' + err.message);
    }
  };

  // 1. AUTH GATE / SIGNUP SCREEN (REMOVED - HANDLED BY ROUTER)

  // 3. MAIN ATELIER / WORKSPACE FLOW
  return (
    <div className="bg-[#FAF7F2] min-h-screen flex flex-col font-['Courier_Prime',monospace] text-[#1A1410] antialiased select-none select-text relative">
      
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
      <header className="bg-[#FAF7F2] border-b border-[rgba(26,20,16,0.08)] h-[60px] flex items-center justify-between px-4 md:px-[64px] relative shrink-0 z-20">
        <div className="flex items-center gap-[48px]">
          <img 
            onClick={onExit}
            src="/TRYON2BUY%20LOGO%20(black%20).png" 
            alt="TryOn2Buy Logo" 
            className="h-10 md:h-12 object-contain cursor-pointer hover:opacity-80 transition-opacity"
          />
          <nav className="hidden md:flex gap-[32px] text-[12px] tracking-[1.6px] uppercase font-bold">
            <span className="text-[#7f5700] border-[#7f5700] border-b border-solid pb-[2px] leading-[24px] cursor-pointer">VIRTUAL TRY-ON</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-[24px]">
          <button className="opacity-80 hover:opacity-100 transition-opacity">
            <img src={imgSearchIcon} alt="Search" className="h-[18px] w-[14px] object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          </button>
          <button className="opacity-80 hover:opacity-100 transition-opacity">
            <img src={imgCartIcon} alt="Bag" className="h-[14px] w-[14px] object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          </button>
          
          <button 
            onClick={() => navigate(isGuestMode ? '/shop/demo' : '/gallery')}
            className="text-[10px] font-bold tracking-[1px] uppercase flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity text-[#8c8278] hover:text-[#1A1410]"
          >
            <Image className="w-3.5 h-3.5" />
            <span>MY TRYON GALLERY</span>
          </button>

          <div className="h-4 w-px bg-[rgba(26,20,16,0.15)]" />

          <button 
            onClick={handleLogout}
            className="text-[10px] font-bold tracking-[1px] uppercase flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity text-[#8c8278] hover:text-[#1A1410]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isGuestMode ? 'EXIT GUEST MODE' : 'LOGOUT'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col-reverse md:flex-row relative z-10 overflow-y-auto md:overflow-clip">
        
        {/* Left Side Console Column */}
        <aside className="w-full md:w-[420px] bg-[#FAF7F2] border-r border-[rgba(26,20,16,0.08)] overflow-y-auto px-6 py-5 shrink-0 flex flex-col gap-4 custom-scrollbar">
          
          {/* Back button to Choice Screen (only shown during personalization now) */}
          

          {/* Workspace Header */}
          <div className="space-y-0.5">
            <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-[#c4933f] block">
              TRYON2BUY VIRTUAL FITTING
            </span>
            <h2 className="font-['Playfair_Display',serif] text-[18px] font-normal leading-tight text-[#1A1410]">
              Virtual Fitting Room
            </h2>
          </div>

          {/* Step 1: SELECT CATEGORY */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-[#1a1410] text-[#faf7f2] size-5 flex items-center justify-center text-[10px] font-bold">1</div>
                  <h3 className="text-[11px] tracking-[1.5px] uppercase font-bold text-[#1A1410]">SELECT CATEGORY</h3>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { key: "SAREE", icon: Wind },
                    { key: "LEHANGA", icon: Sparkles },
                    { key: "ANARKALI", icon: Star },
                    { key: "KURTHI", icon: Shirt },
                    { key: "SHARARA", icon: Layers }
                  ].map((cat) => {
                    const isActive = category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => handleCategorySelect(cat.key)}
                        className={`group h-[72px] flex flex-col items-center justify-center p-1.5 gap-1.5 border transition-all duration-300 ${
                          isActive 
                            ? 'bg-[#FFFFFF] border-[#7f5700] ring-[1px] ring-[#7f5700]' 
                            : 'bg-white border-[rgba(26,20,16,0.08)] hover:border-[#7F5700] hover:shadow-[0_4px_15px_rgb(127,87,0,0.1)] hover:scale-[1.01]'
                        }`}
                      >
                        <div className={`h-[36px] w-full flex items-center justify-center transition-colors ${isActive ? 'text-[#7f5700]' : 'text-[#8c8278] group-hover:text-[#1A1410]'}`}>
                          <cat.icon className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <span className="text-[7px] font-bold tracking-[0.5px] uppercase text-[#1A1410] block whitespace-nowrap">
                          {cat.key}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: UPLOAD GARMENT */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="bg-[#1a1410] text-[#faf7f2] size-4 flex items-center justify-center text-[9px] font-bold">2</div>
                  <h3 className="text-[10px] tracking-[1px] uppercase font-bold text-[#1A1410]">UPLOAD GARMENT</h3>
                </div>
                
                {category === 'SAREE' && (
                  <p className="text-[12px] text-red-600 font-medium leading-relaxed -mt-2">
                    Upload the saree as a flat lay or draped on a mannequin. Blouse is optional — if not uploaded, the blouse from the saree image will be used.
                  </p>
                )}

                <div className={`grid gap-2 ${activeSlots.length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {activeSlots.map((slot) => {
                    const slotData = garmentUploads[slot.id];
                    return (
                      <label 
                        key={slot.id} 
                        htmlFor={`file-${slot.id}`}
                        onDrop={(e) => handleGarmentDrop(slot.id, e)}
                        onDragOver={handleDragOver}
                        className="relative border border-dashed border-[rgba(26,20,16,0.2)] bg-[#FFFFFF] shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center min-h-[100px] group cursor-pointer hover:border-[#7F5700] hover:shadow-[0_4px_15px_rgb(127,87,0,0.1)] hover:scale-[1.01] transition-all"
                      >
                        <input id={`file-${slot.id}`} type="file" accept="image/*" onChange={(e) => handleGarmentSlotChange(slot.id, e)} className="hidden" />
                        
                        <div className="absolute top-1 left-1 bg-white/80 px-2 py-1 text-[8px] uppercase font-bold tracking-wider z-10 text-[#1A1410]">
                          {slot.label} {slot.required && <span className="text-red-600">*</span>}
                        </div>

                        {slotData ? (
                          <div className="relative w-full h-[80px] flex items-center justify-center p-2">
                            <img src={slotData.url} alt={slot.label} className="max-h-full max-w-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="bg-white text-[#1A1410] text-[7px] font-bold px-2 py-1 uppercase">Change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 opacity-60">
                            <Upload className="h-4 w-4 text-[#8c8278]" />
                            <span className="text-[7px] uppercase font-bold text-center">Upload {slot.label}</span>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: SELECT MODEL */}
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="bg-[#1a1410] text-[#faf7f2] size-4 flex items-center justify-center text-[9px] font-bold">3</div>
                  <h3 className="text-[10px] tracking-[1px] uppercase font-bold text-[#1A1410]">SELECT MODEL</h3>
                </div>

                <div className="grid grid-cols-4 gap-3 w-full">
                  {(defaultModels.length > 0 ? defaultModels : [
                    { name: "Classic Studio", img: imgModelClassicStudio },
                    { name: "Heritage Court", img: imgModelHeritageCourt }
                  ]).map((model) => {
                    const isSelected = selectedModel === model.name;
                    return (
                      <button
                        key={model.name}
                        onClick={() => setSelectedModel(model.name)}
                        className={`w-full border p-0.5 relative flex flex-col transition-all duration-300 ${
                          isSelected ? 'border-[#7f5700]' : 'border-[rgba(0,0,0,0)] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="aspect-[3/4] w-full overflow-hidden relative">
                          <img src={model.img} alt={model.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          <div className="absolute bottom-0 left-0 right-0 bg-[rgba(26,20,16,0.8)] p-1.5 flex items-center justify-between">
                            <span className="text-[7px] font-bold tracking-[0.5px] text-[#faf7f2] uppercase truncate max-w-[80%]">{model.name}</span>
                            {isSelected && <img src={imgCheckIcon} alt="selected" className="size-[6px] object-contain invert shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
                
          {/* Primary Action Button: GENERATE TRY-ON */}
          <button
            onClick={startGeneration}
            disabled={tryonState === 'generating' || !isGarmentUploadValid() || !selectedModel}
            className={`w-full py-4 mt-8 text-[12px] font-bold tracking-[3px] uppercase flex items-center justify-center gap-2 transition-all shrink-0 ${tryonState !== 'generating' && isGarmentUploadValid() && selectedModel ? 'bg-[#1A1410] hover:bg-black text-[#FAF7F2] cursor-pointer shadow-md active:scale-[0.99]' : 'bg-[rgba(26,20,16,0.2)] text-[#8c8278] cursor-not-allowed'}`}
          >
            <img src={imgSparkleIcon} alt="" className="h-3 w-3 object-contain invert" onError={(e) => { e.target.style.display = 'none'; }} />
            <span>GENERATE TRY-ON</span>
          </button>

        </aside>

        {/* Right Side Result Canvas Column */}
        <main className="flex-1 bg-[#FFFFFF] relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 min-h-[600px] md:min-h-0 shrink-0 md:shrink">
          
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute border-[rgba(26,20,16,0.2)] border-r border-t right-[-192px] size-[384px] top-[-192px]" />
            <div className="absolute border-[rgba(26,20,16,0.2)] border-b border-l bottom-[-128px] left-[-128px] size-[256px]" />
          </div>

          <div className="aspect-[3/4] bg-[#FAF7F2] w-full max-w-[500px] shadow-2xl border border-[rgba(26,20,16,0.05)] relative overflow-hidden flex items-center justify-center animate-fade-in z-10">
            
            {/* STATE A: Initial silhouette */}
            {tryonState === 'initial' && (
              <div className="flex flex-col items-center text-center p-8 opacity-45 select-none animate-fade-in">
                <img src={imgSilhouetteIcon} alt="" className="h-[140px] w-[88px] object-contain mb-4" onError={(e) => { e.target.style.display = 'none'; }} />
                <h4 className="font-['Playfair_Display',serif] text-[16px] tracking-[1.5px] uppercase text-[#1A1410] font-normal mb-1">
                  READY FOR DRAPING
                </h4>
                <div className="flex items-center gap-1 justify-center">
                  <div className="bg-[#c4933f] rounded-full size-1" />
                  <div className="bg-[#c4933f] rounded-full size-1" />
                  <div className="bg-[#c4933f] rounded-full size-1" />
                </div>
              </div>
            )}

            {/* STATE B: Generating Loading Animation */}
            {tryonState === 'generating' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/95 animate-fade-in text-center">
                <div className="w-[180px] h-[240px] bg-white border border border-[rgba(26,20,16,0.08)] relative overflow-hidden mb-6 shadow-md">
                  <img src={selectedImage || (Object.values(garmentUploads)[0]?.url) || imgSilhouetteIcon} alt="Scanning preview" className="w-full h-full object-cover blur-[5px] opacity-75" />
                  <div className="absolute left-0 right-0 h-[2px] bg-[#c4933f] shadow-[0_0_8px_#c4933f] animate-scan" />
                </div>

                <div className="space-y-4 w-full max-w-[280px] text-left">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 size-3.5 border border-[#1a1410] rounded-sm flex items-center justify-center">
                      {progressStage >= 0 && <Check className="w-2.5 h-2.5 text-[#c4933f] stroke-[3]" />}
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#1A1410]">Stage 1: silhouette extraction</h5>
                      <p className="text-[8px] text-[#8c8278] font-sans">
                        {progressStage === 0 ? 'Analyzing fabric structure and silhouette...' : 'Completed silhouette identification.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 size-3.5 border border-[#1a1410] rounded-sm flex items-center justify-center">
                      {progressStage >= 1 && <Check className="w-2.5 h-2.5 text-[#c4933f] stroke-[3]" />}
                    </div>
                    <div>
                      <h5 className={`text-[10px] font-bold uppercase tracking-wider ${progressStage >= 1 ? 'text-[#1A1410]' : 'text-[#8c8278]'}`}>Stage 2: digital drapery mapping</h5>
                      <p className="text-[8px] text-[#8c8278] font-sans">
                        {progressStage < 1 ? 'Waiting...' : progressStage === 1 ? 'Aligning digital textile nodes on model...' : 'Completed grid nodes projection.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 size-3.5 border border-[#1a1410] rounded-sm flex items-center justify-center">
                      {progressStage >= 2 && <Check className="w-2.5 h-2.5 text-[#c4933f] stroke-[3]" />}
                    </div>
                    <div>
                      <h5 className={`text-[10px] font-bold uppercase tracking-wider ${progressStage >= 2 ? 'text-[#1A1410]' : 'text-[#8c8278]'}`}>Stage 3: style compilation</h5>
                      <p className="text-[8px] text-[#8c8278] font-sans">
                        {progressStage < 2 ? 'Waiting...' : 'Simulating lighting, wrinkles, and shadows...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-[280px] border-t border-[rgba(26,20,16,0.08)] pt-4 mt-6 text-[8px] tracking-[1px] text-[#8c8278] uppercase font-bold text-left">
                  ESTIMATING: {Math.max(1, Math.floor((100 - progress) / 8))} SEC REMAINING ({progress}%)
                </div>
              </div>
            )}

            {/* STATE C: Generated Result */}
            {tryonState === 'generated' && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-white animate-fade-in">
                
                <img 
                  src={
                    resultImageUrl || 
                    (workspaceMode === 'with_garment' 
                      ? (DRAPED_RESULT_MAP[category]?.[selectedModel] || DRAPED_RESULT_MAP["SAREE"]["Classic Studio"])
                      : (selectedCatalogDress?.draped || DRAPED_RESULT_MAP["SAREE"]["Classic Studio"]))
                  } 
                  alt="Try-on output preview" 
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Metadata label bottom-left */}
                <div className="absolute bottom-4 left-4 backdrop-blur-[6px] bg-white/85 border border-[rgba(26,20,16,0.08)] px-3 py-1.5 shadow-sm">
                  <span className="text-[10px] font-bold text-[#1A1410]">
                    {workspaceMode === 'with_garment' 
                      ? `${category} · ${selectedModel} · ${selectedBackdrop.name}`
                      : `${selectedCatalogDress?.name} · Personal Portrait · ${selectedBackdrop.name}`
                    }
                  </span>
                </div>

                {/* AI tag top-right */}
                <div className="absolute top-4 right-4 bg-white border border-[rgba(26,20,16,0.08)] px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                  <img src={imgSparkleIcon} alt="" className="h-2.5 w-2.5" onError={(e) => { e.target.style.display = 'none'; }} />
                  <span className="text-[8px] font-bold uppercase tracking-wide text-[#1A1410]">
                    AI GENERATED
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Under-bar Customization Controls */}


          {/* Action buttons */}
          <div 
            className={`mt-4 grid gap-4 w-full max-w-[500px] transition-all duration-500 grid-cols-2 ${
              tryonState === 'generated' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden mt-0'
            }`}
          >
            <button 
              onClick={() => {
                startGeneration();
              }}
              className="border border-[#1a1410] hover:bg-[#1a1410]/5 py-3.5 text-[9px] font-bold tracking-[1.5px] uppercase text-[#1A1410] transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>REGENERATE</span>
            </button>

            <button 
              onClick={async () => {
                if (isGuestMode) {
                  setShowGuestSaveModal(true);
                  return;
                }
                if (!currentGenerationId) {
                  return;
                }
                setIsSaving(true);
                try {
                  const res = await fetch(`${API_URL}/api/tryon/save-to-library`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ generationId: currentGenerationId })
                  });
                  if (!res.ok) throw new Error('Failed to save');
                  setCurrentGenerationId(null);
                  setIsSaved(true);
                } catch (err) {
                  console.error(err);
                  alert('Error saving to library');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving || isSaved || !currentGenerationId || !resultImageUrl || resultImageUrl === FALLBACK_SAREE_ICON}
              className="bg-[#1a1410] hover:bg-black text-[#faf7f2] py-3.5 text-[9px] font-bold tracking-[1.5px] uppercase transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : isSaved ? <Check className="w-3 h-3" /> : <Check className="w-3 h-3" />}
              <span>{isSaving ? 'SAVING...' : isSaved ? 'SAVED TO LIBRARY' : 'SAVE TO LIBRARY'}</span>
            </button>
          </div>

        </main>
      </div>

      <VendorLimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)}
        userType={isGuestMode ? 'guest' : 'vendor'}
      />

      <VendorUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />

      {/* Guest Save Modal */}
      {showGuestSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FAF7F2] border border-[#1a1410] max-w-md w-full p-8 relative shadow-2xl text-center rounded-2xl">
            <button 
              onClick={() => setShowGuestSaveModal(false)} 
              className="absolute top-4 right-4 text-[#1A1410] hover:text-[#7f5700] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="font-['Playfair_Display',serif] text-3xl text-[#1A1410] mb-3 mt-4">
              Save to Library
            </h2>
            <p className="text-[12px] text-[#5c544d] font-sans leading-relaxed mb-6">
              To save your custom drapes to a personal library, please create a free Merchant Account. 
              <br/><br/>
              Alternatively, you can visit the Demo Gallery to try on existing collection pieces!
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  sessionStorage.removeItem('guest_mode');
                  navigate('/login');
                }}
                className="w-full bg-[#1a1410] hover:bg-[#7f5700] text-white py-3.5 text-[11px] font-bold tracking-[2px] uppercase transition-colors rounded-xl"
              >
                Create Account
              </button>
              <button 
                onClick={() => navigate('/shop/demo')}
                className="w-full bg-transparent border border-[#1a1410] hover:bg-[rgba(26,20,16,0.05)] text-[#1A1410] py-3.5 text-[11px] font-bold tracking-[2px] uppercase transition-colors rounded-xl"
              >
                View Demo Gallery
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
