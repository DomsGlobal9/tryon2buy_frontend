import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config';
import { Sparkles, Upload, Check, ChevronLeft, ArrowRight, RefreshCw, LogOut, Shirt, UserCheck, Wind, Star, Layers, Image, X, Camera, ShieldCheck, Timer, Search, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VendorLimitModal from '../../components/VendorLimitModal';
import VendorUpgradeModal from '../../components/VendorUpgradeModal';
import SampleWorkspaceModal from '../../components/SampleWorkspaceModal';
import { motion } from 'framer-motion';
import { getVendorToken, clearVendorSession, isGuestMode as readGuestMode, clearGuestMode, getGuestDeviceId } from '../../utils/auth';

/**
 * Every asset here used to point at http://localhost:3845 -- the local asset server of the
 * design tool this screen was imported from. It exists on the designer's machine and nowhere
 * else, so for every real visitor these images simply failed: the header's search and bag
 * buttons were empty, the selected model had no tick, and the Generate button lost its icon.
 * The onError handlers hid the failures, which is why nobody saw a broken image.
 *
 * Icons are now lucide components (already used across this page); pictures are real hosted
 * images. Literal strings rather than the FALLBACK_* constants below: those are declared
 * further down, and a const cannot be read before its declaration.
 */

// Step 1 assets (catalogue thumbnails -- the same images their fallbacks already used)
const imgSaree = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&h=120&q=80";
const imgKurti = "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=120&h=120&q=80";
const imgLehenga = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=120&h=120&q=80";
const imgBlouse = "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=120&h=120&q=80";
const imgDress = "https://images.unsplash.com/photo-1595959183075-c1d09e7e951c?auto=format&fit=crop&w=120&h=120&q=80";

// Models -- the first two real saree default models, which DEFAULT_MODELS_BY_CATEGORY uses.
// Only reached as fallbacks, but one of them is the human image a generation falls back to,
// so it has to be a real picture of a person.
const imgModelClassicStudio = "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/41.jpeg";
const imgModelHeritageCourt = "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/42.jpeg";

// Shown in the preview when no model image is available.
const imgSilhouetteIcon = imgModelClassicStudio;

// A draped saree result, for the two places that showed a localhost one.
const imgDrapedSaree = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&h=800&q=80";

// Backdrops (the same images their fallbacks already used)
const imgBackdropClassic = "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=150&h=150&q=80";
const imgBackdropHeritage = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=150&h=150&q=80";

// Samples moved to SampleWorkspaceModal.jsx

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
    "Classic Studio": imgDrapedSaree,
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
    { id: "s1", name: "Banarasi Silk Saree", img: imgSaree, fallback: FALLBACK_SAREE_ICON, draped: imgDrapedSaree },
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
    { name: "Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/41.jpeg" },
    { name: "Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/42.jpeg" },
    { name: "Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/43.jpeg" },
    { name: "Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/44.jpeg" }
  ],
  "LEHANGA": [
    {
      name: "Model 1",
      img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga1_default.png",
      images: {
        default: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga1_default.png",
        style_1: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga1_duppat.png",
        style_2: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga1_default.png"
      }
    },
    {
      name: "Model 2",
      img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga2_default.png",
      images: {
        default: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga2_default.png",
        style_1: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga2_duppat.png",
        style_2: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga2_default.png"
      }
    },
    {
      name: "Model 3",
      img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga3_default.png",
      images: {
        default: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga3_default.png",
        style_1: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga3_duppa.png",
        style_2: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga3_default.png"
      }
    },
    {
      name: "Model 4",
      img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga4_default.png",
      images: {
        default: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga4_default.png",
        style_1: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga4_duppata.png",
        style_2: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/lehanga/lehanga4_default.png"
      }
    }
  ],
  "ANARKALI": [
    { name: "Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/ChatGPT%20Image%20Aug%2020,%202026,%2005_55_11%20PM.png" },
    { name: "Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/ChatGPT%20Image%20Aug%2020,%202026,%2005_55_23%20PM.png" },
    { name: "Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/ChatGPT%20Image%20Aug%2020,%202026,%2005_55_52%20PM.png" },
    { name: "Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/anarkali/ChatGPT%20Image%20Aug%2020,%202026,%2005_56_15%20PM.png" }
  ],
  "KURTHI": [
    { name: "Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti1.jpg" },
    { name: "Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti2.jpg" },
    { name: "Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti3.jpg" },
    { name: "Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/kurti/kurti4.jpg" }
  ],
  "SHARARA": [
    { name: "Model 1", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/shrara1.jpg" },
    { name: "Model 2", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/shrara2.jpg" },
    { name: "Model 3", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/shrara3.jpg" },
    { name: "Model 4", img: "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/default%20models/sharara/sharara4.jpg" }
  ]
};

export default function TryonWorkspace({ onExit }) {
  const navigate = useNavigate();
  const getHeaders = () => {
    const token = getVendorToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const getUploadHeaders = () => {
    const token = getVendorToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // A working login wins over a leftover guest flag, so a vendor is never shown the guest
  // workspace (the demo gallery, the guest limit) just because the flag was never cleared.
  const isGuestMode = !getVendorToken() && readGuestMode();

  const handleLogout = () => {
    if (isGuestMode) {
      clearGuestMode();
      navigate('/');
    } else {
      clearVendorSession();
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
  const [selectedDupattaStyle, setSelectedDupattaStyle] = useState(null);
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
  const [showSampleModal, setShowSampleModal] = useState(false);

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

    const linkInter = document.createElement('link');
    linkInter.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    linkInter.rel = 'stylesheet';
    document.head.appendChild(linkInter);

    return () => {
      document.head.removeChild(linkGaramond);
      document.head.removeChild(linkCourier);
      document.head.removeChild(linkInter);
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
      { id: 'bottom', label: 'Bottom', required: true }
    ];
  };

  const activeSlots = getUploadSlots(category);

  const isGarmentUploadValid = () => {
    return activeSlots.every(slot => !slot.required || garmentUploads[slot.id]);
  };

  const handleCategorySelect = (newCategory) => {
    if (newCategory !== category) {
      setCategory(newCategory);
      // Clean up object URLs before clearing state
      setGarmentUploads(prev => {
        Object.values(prev).forEach(slotData => {
          if (slotData?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(slotData.url);
          }
        });
        return {};
      });
      setSelectedDupattaStyle(null);
      setResultImageUrl(null); // Clear previous results to show the new category preview
      setTryonState('initial');
    }
  };

  const handleGarmentSlotChange = (slotId, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);

      setGarmentUploads(prev => {
        // Revoke the old object URL if one exists to prevent memory leaks
        if (prev[slotId]?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(prev[slotId].url);
        }
        return { ...prev, [slotId]: { file, url } };
      });

      // Clear the input value so the same file can be uploaded again if removed
      e.target.value = '';
    }
  };

  const handleGarmentDrop = (slotId, e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);

      setGarmentUploads(prev => {
        // Revoke the old object URL if one exists to prevent memory leaks
        if (prev[slotId]?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(prev[slotId].url);
        }
        return { ...prev, [slotId]: { file, url } };
      });
    }
  };

  const handleRemoveGarmentSlot = (slotId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setGarmentUploads(prev => {
      const newState = { ...prev };
      if (newState[slotId]?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(newState[slotId].url);
      }
      delete newState[slotId];
      return newState;
    });
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
    // Opened as a vendor, but the login has run out since. Without this the request would go
    // out with no login and be charged to the free guest allowance -- the same silent
    // downgrade the server no longer does.
    if (!isGuestMode && !getVendorToken()) {
      navigate('/login', { state: { returnTo: '/workspace' } });
      return;
    }
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
      let human_image_url = sm ? sm.img : imgModelClassicStudio;

      // Smart Model Switch Logic for Lehenga Dupatta Styles
      if (category === 'LEHANGA' && sm && sm.images) {
        if (selectedDupattaStyle === 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/lehanga_duppatta1.jpg') {
          human_image_url = sm.images.style_1 || human_image_url;
        } else if (selectedDupattaStyle === 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/lehangaduppatta2.jpg') {
          human_image_url = sm.images.style_2 || human_image_url;
        } else {
          human_image_url = sm.images.default || human_image_url;
        }
      }

      const genRes = await fetch(`${API_URL}/api/tryon/generate`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({
          mode: 'with_garment', garment_image_url, human_image_url, category, target_folder: 'vendor-drapes', dupatta_style_url: selectedDupattaStyle,
          // Guests are counted per device on the server; a logged-in vendor is charged to their account.
          ...(getVendorToken() ? {} : { guest_device_id: getGuestDeviceId() })
        })
      });
      if (!genRes.ok) {
        const errorData = await genRes.json().catch(() => ({})); clearInterval(interval); setTryonState('initial');
        if (genRes.status === 401 && errorData.error === 'GUEST_LIMIT_REACHED') setShowLimitModal(true);
        else if (genRes.status === 403 && errorData.error === 'INSUFFICIENT_CREDITS') setShowUpgradeModal(true);
        else if (genRes.status === 401) {
          // The login ran out. Log in again and come straight back to the workspace.
          clearVendorSession();
          navigate('/login', { state: { returnTo: '/workspace' } });
        }
        // Detail to the console, never to the person: this used to print the server's own
        // error text on screen, against the rule every other try-on page follows.
        else { console.error('[Workspace] generation failed', genRes.status, errorData); alert('Try-on failed. Please try again.'); }
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
      alert('Try-on failed. Please try again.');
    }
  };

  // 1. AUTH GATE / SIGNUP SCREEN (REMOVED - HANDLED BY ROUTER)

  // 3. MAIN ATELIER / WORKSPACE FLOW
  return (
    <div className="bg-[#FAF7F2] min-h-screen flex flex-col font-['Courier_Prime',monospace] text-[#1A1410] antialiased select-none select-text relative">

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

        <div className="flex items-center gap-3 md:gap-[24px]">
          <button className="opacity-80 hover:opacity-100 transition-opacity hidden sm:block">
            <Search className="h-[16px] w-[16px] text-[#1A1410]" strokeWidth={1.75} aria-label="Search" />
          </button>
          <button className="opacity-80 hover:opacity-100 transition-opacity hidden sm:block">
            <ShoppingBag className="h-[15px] w-[15px] text-[#1A1410]" strokeWidth={1.75} aria-label="Bag" />
          </button>

          <button
            onClick={() => navigate(isGuestMode ? '/shop/demo' : '/gallery')}
            className="text-[9px] md:text-[10px] font-bold tracking-[1px] uppercase flex items-center gap-1.5 transition-all text-[#1A1410] bg-white border border-[#1A1410]/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:border-[#1A1410] hover:bg-[#1A1410] hover:text-white shadow-sm whitespace-nowrap"
          >
            <Image className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">MY TRYON GALLERY</span>
            <span className="sm:hidden">GALLERY</span>
          </button>

          <div className="h-4 w-px bg-[rgba(26,20,16,0.15)] hidden md:block" />

          <button
            onClick={handleLogout}
            className="text-[9px] md:text-[10px] font-bold tracking-[1px] uppercase flex items-center gap-1.5 transition-colors text-[#1A1410] hover:text-red-600 whitespace-nowrap"
          >
            <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">{isGuestMode ? 'Exit Guest Mode' : 'Logout'}</span>
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
                    className={`group h-[48px] flex items-center justify-center px-2 border transition-all duration-300 ${isActive
                      ? 'bg-[#FFFFFF] border-[#7f5700] ring-[1px] ring-[#7f5700]'
                      : 'bg-white border-[rgba(26,20,16,0.08)] hover:border-[#7F5700] hover:shadow-[0_4px_15px_rgb(127,87,0,0.1)] hover:scale-[1.01]'
                      }`}
                  >
                    <span className={`text-[10px] font-bold tracking-[1px] uppercase whitespace-nowrap transition-colors ${isActive ? 'text-[#7f5700]' : 'text-[#8c8278] group-hover:text-[#1A1410]'}`}>
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

            {category === 'SAREE' ? (
              <div className="bg-yellow-50/80 px-4 py-3 border border-yellow-200 rounded-md shadow-sm text-[11px] text-yellow-800 font-['Inter',sans-serif] leading-relaxed -mt-2">
                <span className="font-bold text-yellow-900">Note:</span> Upload the saree as a flat lay or draped on a mannequin. Blouse is optional — if not uploaded, the blouse from the saree image will be used.
              </div>
            ) : (
              <div className="bg-yellow-50/80 px-4 py-3 border border-yellow-200 rounded-md shadow-sm text-[11px] text-yellow-800 font-['Inter',sans-serif] leading-relaxed -mt-2">
                <span className="font-bold text-yellow-900">Note:</span> Please upload flat lay or mannequin photos of the actual stitched {category.toLowerCase()}. Do not upload unstitched fabric pieces. Ensure each specific garment part is uploaded into its corresponding slot below for optimal draping.
              </div>
            )}
            {(() => {
              const renderSlot = (slot) => {
                if (!slot) return null;
                const slotData = garmentUploads[slot.id];
                return (
                  <div
                    key={slot.id}
                    onDrop={(e) => handleGarmentDrop(slot.id, e)}
                    onDragOver={handleDragOver}
                    className="relative border border-dashed border-[#dcd6cc] bg-[#fdfcf9] rounded-xl overflow-hidden flex flex-col items-center justify-center min-h-[140px] group hover:border-[#7F5700] hover:bg-white hover:shadow-sm transition-all duration-300"
                  >
                    <input id={`file-${slot.id}`} type="file" accept="image/*" onChange={(e) => handleGarmentSlotChange(slot.id, e)} className="hidden" />
                    <input id={`camera-${slot.id}`} type="file" accept="image/*" capture="environment" onChange={(e) => handleGarmentSlotChange(slot.id, e)} className="hidden" />

                    <div className="absolute top-3 left-0 right-0 text-center pointer-events-none z-10">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#1A1410] bg-[#fdfcf9] group-hover:bg-white px-2 transition-colors">
                        {slot.label} {slot.required && <span className="text-red-500">*</span>}
                      </span>
                    </div>

                    {slotData ? (
                      <>
                        <div className="relative w-full h-[100px] flex items-center justify-center p-4 mt-6">
                          <img src={slotData.url} alt={slot.label} className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-95 transition-transform duration-500" />
                        </div>
                        <div className="absolute inset-0 bg-[#1a1410]/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-20">
                          <button
                            type="button"
                            onClick={(e) => handleRemoveGarmentSlot(slot.id, e)}
                            className="bg-white text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-full text-[9px] font-bold tracking-[1px] uppercase transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 mt-6 opacity-70 group-hover:opacity-100 transition-opacity w-full h-full justify-center pb-2">
                        <div className="flex items-center gap-6">
                          {/* Upload from Gallery / Main Upload */}
                          <label htmlFor={`file-${slot.id}`} className="flex flex-col items-center gap-1.5 md:gap-2 cursor-pointer group/upload">
                            <div className="bg-[#f2efe9] p-2.5 md:p-3 rounded-full group-hover/upload:bg-[#ede8df] group-hover/upload:scale-110 group-hover/upload:shadow-sm transition-all duration-300">
                              <Upload className="h-4 w-4 text-[#7f5700]" />
                            </div>
                            <span className="text-[8px] font-bold text-[#1A1410] uppercase tracking-widest md:hidden">Gallery</span>
                            <span className="hidden md:block text-[10px] font-bold text-[#1A1410] uppercase tracking-widest whitespace-nowrap">Upload</span>
                          </label>

                          {/* Take Photo (Mobile Only) */}
                          <label htmlFor={`camera-${slot.id}`} className="flex flex-col items-center gap-1.5 cursor-pointer group/camera md:hidden">
                            <div className="bg-[#f2efe9] p-2.5 rounded-full group-hover/camera:bg-[#ede8df] group-hover/camera:scale-110 group-hover/camera:shadow-sm transition-all duration-300">
                              <Camera className="h-4 w-4 text-[#7f5700]" />
                            </div>
                            <span className="text-[8px] font-bold text-[#1A1410] uppercase tracking-widest">Camera</span>
                          </label>
                        </div>
                        <div className="text-[8px] text-[#8c8278] font-sans mt-0.5">JPG, PNG • Max 10MB</div>
                      </div>
                    )}
                  </div>
                );
              };

              return category === 'SAREE' ? (
                <div className="grid grid-cols-2 gap-3">
                  {activeSlots.map(renderSlot)}
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px bg-[#e5e0d8] flex-1"></div>
                      <span className="text-[9px] uppercase font-bold tracking-[2px] text-[#1A1410]">Full Garment</span>
                      <div className="h-px bg-[#e5e0d8] flex-1"></div>
                    </div>
                    {renderSlot(activeSlots.find(s => s.id === 'full'))}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px bg-[#e5e0d8] flex-1"></div>
                      <span className="text-[9px] uppercase font-bold tracking-[2px] text-[#1A1410]">
                        Garment Parts {category === 'LEHANGA' ? '& Dupatta Style (Optional)' : ''}
                      </span>
                      <div className="h-px bg-[#e5e0d8] flex-1"></div>
                    </div>
                    <div className={`grid grid-cols-2 ${category === 'LEHANGA' ? 'lg:grid-cols-4' : ''} gap-3`}>
                      {renderSlot(activeSlots.find(s => s.id === 'top'))}
                      {renderSlot(activeSlots.find(s => s.id === 'bottom'))}

                      {/* Dupatta Drape Style Selection (Lehenga Only) */}
                      {category === 'LEHANGA' && (
                        [
                          { id: 'style_1', name: 'Classic Single-Shoulder', url: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/lehanga_duppatta1.jpg' },
                          { id: 'style_2', name: 'Traditional Front Pleat', url: 'https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/lehangaduppatta2.jpg' }
                        ].map(style => (
                          <button
                            key={style.id}
                            onClick={() => setSelectedDupattaStyle(selectedDupattaStyle === style.url ? null : style.url)}
                            className={`relative group rounded-xl overflow-hidden border-2 transition-all min-h-[140px] ${selectedDupattaStyle === style.url ? 'border-[#7F5700] ring-4 ring-[#7F5700]/20' : 'border-[#e5e0d8] hover:border-[#7F5700]/50'}`}
                          >
                            <div className="w-full h-full bg-[#faf7f2]">
                              <img src={style.url} alt={style.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                              <span className="text-white text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-left drop-shadow-md">{style.name}</span>
                            </div>
                            {selectedDupattaStyle === style.url && (
                              <div className="absolute top-2 right-2 bg-[#7F5700] text-white p-1 rounded-full shadow-lg">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Try Sample Materials Button */}
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setShowSampleModal(true)}
                className="text-[10px] border border-[#dcd6cc] bg-[#fdfcf9] hover:bg-[#ede8df] hover:border-[#7f5700] text-[#5c544d] px-6 py-2 rounded-full transition-colors flex items-center gap-2 uppercase tracking-[1.5px] font-bold shadow-sm"
              >
                <Image className="w-3.5 h-3.5" /> Sample Materials
              </button>
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
                    onClick={() => {
                      setSelectedModel(model.name);
                      setResultImageUrl(null);
                      setTryonState('initial');
                    }}
                    className={`w-full border p-0.5 relative flex flex-col transition-all duration-300 ${isSelected ? 'border-[#7f5700]' : 'border-[rgba(0,0,0,0)] opacity-75 hover:opacity-100'
                      }`}
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden relative">
                      <img src={model.img} alt={model.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      <div className="absolute bottom-0 left-0 right-0 bg-[rgba(26,20,16,0.8)] p-1.5 flex items-center justify-between">
                        <span className="text-[7px] font-bold tracking-[0.5px] text-[#faf7f2] uppercase truncate max-w-[80%]">{model.name}</span>
                        {isSelected && <Check className="size-[8px] text-[#faf7f2] shrink-0" strokeWidth={4} aria-label="selected" />}
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
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
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

            {/* STATE A: Initial Model Preview */}
            {tryonState === 'initial' && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#faf7f2] animate-fade-in">
                <img
                  src={
                    workspaceMode === 'with_garment'
                      ? (defaultModels.find(m => m.name === selectedModel)?.img || imgSilhouetteIcon)
                      : (selectedCatalogDress?.img || imgSilhouetteIcon)
                  }
                  alt="Base model preview"
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col items-center justify-end pb-12 pointer-events-none">
                  <h4 className="font-['Playfair_Display',serif] text-[18px] tracking-[2px] uppercase text-white drop-shadow-lg font-bold mb-2">
                    SELECTED MODEL
                  </h4>
                  <div className="flex items-center gap-1.5 justify-center">
                    <div className="bg-white/90 rounded-full size-1.5 shadow-sm" />
                    <div className="bg-white/90 rounded-full size-1.5 shadow-sm" />
                    <div className="bg-white/90 rounded-full size-1.5 shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STATE B: Generating Loading Animation */}
            {tryonState === 'generating' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/95 animate-fade-in text-center">
                <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
                  <dotlottie-wc 
                    src="https://lottie.host/039ef93c-976a-4c61-a46d-63966c76e96e/9HZrOdg0ww.lottie" 
                    style={{width: '380px', height: '380px', maxWidth: '100%'}} 
                    autoplay="true" 
                    loop="true"
                  ></dotlottie-wc>
                </div>

                {/* Features Banner */}
                <div className="hidden md:flex mt-auto mb-4 border border-[#e5e0d8] rounded-2xl items-stretch divide-x divide-[#e5e0d8] bg-white w-full max-w-[560px] shadow-sm overflow-hidden shrink-0 font-['Inter',sans-serif] tracking-normal">
                  <div className="flex-1 flex flex-col items-center justify-start text-center p-4 py-5">
                    <div className="w-8 h-8 rounded-full bg-[#faf7f2] flex items-center justify-center mb-3">
                      <Sparkles className="w-4 h-4 text-[#7F5700]" />
                    </div>
                    <h6 className="text-[10px] font-bold text-[#1A1410] mb-1.5 leading-none tracking-wide">Realistic Try-On</h6>
                    <p className="text-[8px] text-[#5c544d] leading-[1.5] max-w-[90px] font-medium">Advanced AI for realistic results</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-start text-center p-4 py-5">
                    <div className="w-8 h-8 rounded-full bg-[#faf7f2] flex items-center justify-center mb-3">
                      <ShieldCheck className="w-4 h-4 text-[#7F5700]" />
                    </div>
                    <h6 className="text-[10px] font-bold text-[#1A1410] mb-1.5 leading-none tracking-wide">Secure & Private</h6>
                    <p className="text-[8px] text-[#5c544d] leading-[1.5] max-w-[90px] font-medium">Your images are safe and never shared</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-start text-center p-4 py-5">
                    <div className="w-8 h-8 rounded-full bg-[#faf7f2] flex items-center justify-center mb-3">
                      <Image className="w-4 h-4 text-[#7F5700]" />
                    </div>
                    <h6 className="text-[10px] font-bold text-[#1A1410] mb-1.5 leading-none tracking-wide">High Quality</h6>
                    <p className="text-[8px] text-[#5c544d] leading-[1.5] max-w-[90px] font-medium">HD results with perfect fit</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-start text-center p-4 py-5">
                    <div className="w-8 h-8 rounded-full bg-[#faf7f2] flex items-center justify-center mb-3">
                      <Timer className="w-4 h-4 text-[#7F5700]" />
                    </div>
                    <h6 className="text-[10px] font-bold text-[#1A1410] mb-1.5 leading-none tracking-wide">Easy & Fast</h6>
                    <p className="text-[8px] text-[#5c544d] leading-[1.5] max-w-[90px] font-medium">Get results in just seconds</p>
                  </div>
                </div>
              </div>
            )}

            {/* STATE C: Generated Result */}
            {tryonState === 'generated' && (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-white overflow-hidden">

                <motion.img
                  initial={{ scale: 1.05, filter: 'blur(10px)', opacity: 0 }}
                  animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  src={
                    resultImageUrl ||
                    (workspaceMode === 'with_garment'
                      ? (defaultModels.find(m => m.name === selectedModel)?.img || DRAPED_RESULT_MAP["SAREE"]["Classic Studio"])
                      : (selectedCatalogDress?.draped || DRAPED_RESULT_MAP["SAREE"]["Classic Studio"]))
                  }
                  alt="Try-on output preview"
                  className="w-full h-full object-cover"
                />

                {/* Metadata label bottom-left */}
                <div className="absolute bottom-4 left-4 backdrop-blur-[6px] bg-white/85 border border-[rgba(26,20,16,0.08)] px-3 py-1.5 shadow-sm">
                  <span className="text-[10px] font-bold text-[#1A1410]">
                    {workspaceMode === 'with_garment'
                      ? `${selectedModel} — ${selectedBackdrop.name}`
                      : `${selectedCatalogDress?.name} — Personal Portrait — ${selectedBackdrop.name}`
                    }
                  </span>
                </div>

              </div>
            )}
          </div>

          {/* Under-bar Customization Controls */}


          {/* Action buttons */}
          <div
            className={`mt-4 grid gap-4 w-full max-w-[500px] transition-all duration-500 grid-cols-2 ${tryonState === 'generated' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden mt-0'
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
              <br /><br />
              Alternatively, you can visit the Demo Gallery to try on existing collection pieces!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  // Guest mode is left alone: the login page ends it once a login succeeds.
                  // Clearing it here locked a guest out of the workspace if they backed out.
                  // isLogin:false opens the sign-up form -- the button says Create Account,
                  // and it used to land on the login form.
                  navigate('/login', { state: { isLogin: false, returnTo: '/workspace' } });
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

      {/* Sample Materials Modal */}
      <SampleWorkspaceModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        category={category}
        garmentUploads={garmentUploads}
        setGarmentUploads={setGarmentUploads}
      />

    </div>
  );
}
