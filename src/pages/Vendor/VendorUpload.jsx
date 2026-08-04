import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Upload, ChevronRight, Check, Image as ImageIcon, Sparkles, Box, FileText, Package, LogOut, ChevronDown, Camera, X, LayoutGrid, CloudUpload, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import VendorProfileModal from '../../components/VendorProfileModal';

const CATEGORY_SLOTS = {
  SAREE: [
    { id: 'saree', label: 'Saree', required: true },
    { id: 'blouse', label: 'Blouse', required: false }
  ],
  LEHANGA: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true }
  ],
  ANARKALI: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true }
  ],
  SHARARA: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true }
  ],
  KURTHI: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true }
  ]
};

const VendorUpload = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Metadata
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [allowedCategories, setAllowedCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedDupattaStyle, setSelectedDupattaStyle] = useState(null);

  // Uploads
  const [garmentUploads, setGarmentUploads] = useState({});
  const [isUploadingSlot, setIsUploadingSlot] = useState(null);
  const [draggingSlot, setDraggingSlot] = useState(null);

  // Results
  const [generationId, setGenerationId] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  useEffect(() => {
    fetchAllowedCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vendor_token');
    localStorage.removeItem('vendor_data');
    localStorage.removeItem('portal_type');
    navigate('/');
  };

  const fetchAllowedCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tryon/vendor/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        }
      });
      const data = await res.json();
      if (data.allowedCategories) {
        setAllowedCategories(data.allowedCategories);
        if (data.allowedCategories.length > 0) {
          setCategory(data.allowedCategories[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleGarmentSlotChange = async (slotId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    e.target.value = ''; // Reset input so same file can trigger onChange again

    setIsUploadingSlot(slotId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}/api/tryon/upload?folder=garments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setGarmentUploads(prev => ({ ...prev, [slotId]: { file, url: data.url } }));
      }
    } catch (error) {
      console.error('Upload failed', error);
      setError('Image upload failed.');
    } finally {
      setIsUploadingSlot(null);
    }
  };

  const handleDragOver = (e, slotId) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlot(slotId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlot(null);
  };

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlot(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleGarmentSlotChange(slotId, { target: { files: [file] } });
    }
  };

  const handleRemoveGarmentSlot = (slotId) => {
    setGarmentUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[slotId];
      return newUploads;
    });
  };

  const handleGenerate = async () => {
    if (!title || !category) {
      setError('Please provide a Product Title and Category.');
      return;
    }

    const activeSlots = CATEGORY_SLOTS[category] || [];
    const missingRequired = activeSlots.some(slot => slot.required && !garmentUploads[slot.id]);
    
    if (missingRequired) {
      setError('Please upload all required garment images.');
      return;
    }

    setLoading(true);
    setError(null);

    // Build garment image payload
    let garmentPayload = '';
    if (category === 'SAREE') {
      if (garmentUploads.blouse) {
        garmentPayload = JSON.stringify({ saree: garmentUploads.saree.url, blouse: garmentUploads.blouse.url });
      } else {
        garmentPayload = garmentUploads.saree.url;
      }
    } else {
      const payloadObj = {};
      activeSlots.forEach(s => {
        if (garmentUploads[s.id]) payloadObj[s.id] = garmentUploads[s.id].url;
      });
      garmentPayload = JSON.stringify(payloadObj);
    }

    try {
      const res = await fetch(`${API_URL}/api/tryon/catalog/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        },
        body: JSON.stringify({ garment_image_url: garmentPayload, category, dupatta_style_url: selectedDupattaStyle })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResultImage(data.result_image_url);
      setGenerationId(data.generation_id);
      setStep(2); // Move to Preview Step
    } catch (err) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/tryon/catalog/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        },
        body: JSON.stringify({
          generation_id: generationId,
          title,
          sku,
          description,
          category
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Successfully saved! Redirect to catalog
      navigate('/vendor/catalog');
    } catch (err) {
      setError(err.message || 'Failed to save to catalog.');
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    setLoading(true);
    if (generationId) {
      try {
        await fetch(`${API_URL}/api/tryon/catalog/discard`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
          },
          body: JSON.stringify({ generation_id: generationId })
        });
      } catch (err) {
        console.error('Failed to discard asset:', err);
      }
    }
    setResultImage(null);
    setGenerationId(null);
    setStep(1);
    setLoading(false);
  };

  const activeSlots = CATEGORY_SLOTS[category] || [];

  const renderSlot = (slot) => {
    if (!slot) return null;
    const slotData = garmentUploads[slot.id];
    const isUploading = isUploadingSlot === slot.id;
    const isDragging = draggingSlot === slot.id;

    return (
      <div
        key={slot.id}
        onDragOver={(e) => handleDragOver(e, slot.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, slot.id)}
        className={`relative border border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[220px] transition-all duration-300 ${isDragging ? 'border-[#7F5700] bg-[#faf7f2] scale-[1.02] shadow-md' : 'border-[#dcd6cc] bg-[#fdfcf9] hover:border-[#7F5700]'}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 w-full h-full justify-center">
            <div className="w-6 h-6 border-2 border-[#7F5700] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 font-medium">Uploading...</span>
          </div>
        ) : slotData ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 group/image">
            <img src={slotData.url} alt={slot.label} className="max-h-[180px] max-w-full object-contain drop-shadow-md group-hover/image:scale-95 transition-transform duration-500" />
            
            {/* Elegant Hover Overlay */}
            <div className="absolute inset-0 bg-[#1a1410]/40 opacity-0 group-hover/image:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-20">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleRemoveGarmentSlot(slot.id); }}
                className="bg-white text-red-500 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[1.5px] uppercase transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.15)] flex items-center gap-1.5 transform translate-y-3 group-hover/image:translate-y-0"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 mt-6 opacity-70 group-hover/image:opacity-100 transition-opacity w-full h-full justify-center pb-2">
            {slot.id !== 'full' && slot.id !== 'saree' && (
              <div className="text-[10px] font-bold text-[#1A1410] uppercase tracking-widest mb-2 pointer-events-none md:hidden">
                {slot.label.replace(' View', '')} {slot.required && <span className="text-red-500">*</span>}
              </div>
            )}
            
            <div className="flex items-center gap-6">
              {/* Upload from Gallery / Main Upload */}
              <label htmlFor={`file-${slot.id}`} className="flex flex-col items-center gap-1.5 md:gap-2 cursor-pointer group/upload">
                <div className="bg-[#f2efe9] p-3 md:p-3.5 rounded-full group-hover/upload:bg-[#ede8df] group-hover/upload:scale-110 group-hover/upload:shadow-sm transition-all duration-300">
                  <input id={`file-${slot.id}`} type="file" accept="image/*" onChange={(e) => handleGarmentSlotChange(slot.id, e)} className="hidden" />
                  <Upload className="h-5 w-5 text-[#7f5700]" />
                </div>
                <span className="text-[9px] font-bold text-[#1A1410] uppercase tracking-widest md:hidden">Gallery</span>
                <span className="hidden md:block text-[11px] font-bold text-[#1A1410]">Upload {slot.label.replace(' View', '')}</span>
              </label>

              {/* Take Photo (Mobile Only) */}
              <label htmlFor={`camera-${slot.id}`} className="flex flex-col items-center gap-1.5 cursor-pointer group/camera md:hidden">
                <div className="bg-[#f2efe9] p-3 rounded-full group-hover/camera:bg-[#ede8df] group-hover/camera:scale-110 group-hover/camera:shadow-sm transition-all duration-300">
                  <input id={`camera-${slot.id}`} type="file" accept="image/*" capture="environment" onChange={(e) => handleGarmentSlotChange(slot.id, e)} className="hidden" />
                  <Camera className="h-5 w-5 text-[#7f5700]" />
                </div>
                <span className="text-[9px] font-bold text-[#1A1410] uppercase tracking-widest">Camera</span>
              </label>
            </div>
            
            <div className="text-[9px] text-[#8c8278] font-sans mt-1">JPG, PNG • Max 10MB</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e0d8] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-[#1A1410] hover:bg-gray-100 p-1 md:p-1.5 rounded-full transition-colors flex items-center justify-center mr-1 md:mr-2"
            title="Go to Landing Page"
          >
            <Home className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex items-center">
            <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-6 md:h-8 object-contain" />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm font-medium overflow-x-auto no-scrollbar">
          <div className={`flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${step >= 1 ? 'text-[#1A1410]' : 'text-gray-400'}`}>
            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs ${step >= 1 ? 'bg-[#7F5700] text-white' : 'bg-gray-200'}`}>1</div>
            <span className="hidden sm:inline">Upload</span>
          </div>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-300 flex-shrink-0" />
          <div className={`flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${step >= 2 ? 'text-[#1A1410]' : 'text-gray-400'}`}>
            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs ${step >= 2 ? 'bg-[#7F5700] text-white' : 'bg-gray-200'}`}>2</div>
            <span className="hidden sm:inline">Preview & Save</span>
          </div>
          
          <button 
            onClick={() => navigate('/vendor/catalog')}
            className="flex items-center gap-1.5 md:gap-2 bg-[#fdfcf9] hover:bg-white border border-[#dcd6cc] hover:border-[#7F5700] text-[#5c544d] hover:text-[#7F5700] px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all shadow-sm ml-2 md:ml-0 flex-shrink-0"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">View Catalog</span>
          </button>

          <div className="w-px h-6 bg-[#e5e0d8] mx-1 md:mx-2 hidden sm:block flex-shrink-0"></div>

          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center justify-center bg-[#faf7f2] hover:bg-white border border-[#e5e0d8] hover:border-[#7F5700] text-[#5c544d] hover:text-[#7F5700] w-8 h-8 md:w-9 md:h-9 rounded-xl transition-all shadow-sm flex-shrink-0"
            title="Business Profile"
          >
            <User className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 md:gap-2 bg-[#faf7f2] hover:bg-red-50 border border-[#e5e0d8] hover:border-red-200 text-[#5c544d] hover:text-red-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all shadow-sm flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Metadata Section (Left Column) */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e5e0d8] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-[#7F5700]" />
                <h2 className="text-lg font-bold text-[#1A1410]">Product Details</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-[#5c544d] uppercase tracking-wider mb-2">Product Title *</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Midnight Blue Silk Saree"
                    className="w-full bg-[#fdfcf9] border border-[#dcd6cc] rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F5700] focus:ring-1 focus:ring-[#7F5700] transition-all"
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-[#5c544d] uppercase tracking-wider mb-2">SKU / Product ID</label>
                  <input 
                    type="text" 
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. SAREE-MB-001"
                    className="w-full bg-[#fdfcf9] border border-[#dcd6cc] rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F5700] focus:ring-1 focus:ring-[#7F5700] transition-all"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#5c544d] uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Product details, fabric info, styling notes..."
                    className="w-full bg-[#fdfcf9] border border-[#dcd6cc] rounded-xl px-4 py-3 focus:outline-none focus:border-[#7F5700] focus:ring-1 focus:ring-[#7F5700] transition-all resize-none"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-[#5c544d] uppercase tracking-wider mb-2">Category *</label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="w-full bg-[#fdfcf9] border border-[#dcd6cc] rounded-xl px-4 py-3 text-left focus:outline-none focus:border-[#7F5700] focus:ring-1 focus:ring-[#7F5700] transition-all flex items-center justify-between shadow-sm hover:shadow-md"
                    >
                      <span className={category ? "text-[#1A1410] font-medium" : "text-[#8c8278]"}>
                        {category ? category.charAt(0) + category.slice(1).toLowerCase() : "Select Category"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#8c8278] transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {categoryDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setCategoryDropdownOpen(false)}></div>
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e0d8] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          {allowedCategories.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              className="w-full text-left px-5 py-3.5 hover:bg-[#faf7f2] transition-colors border-b border-[#f0ece3] last:border-b-0 text-[#1A1410] font-medium hover:text-[#7F5700] flex items-center justify-between group"
                              onClick={() => {
                                setCategory(cat);
                                setGarmentUploads({}); // Reset uploads on category change
                                setSelectedDupattaStyle(null); // Reset dupatta style
                                setCategoryDropdownOpen(false);
                              }}
                            >
                              <span>{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                              {category === cat && <Check className="w-4 h-4 text-[#7F5700]" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section (Right Column) */}
            {category && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e5e0d8] flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-[#7F5700]" />
                    <h2 className="text-lg font-bold text-[#1A1410]">Garment Assets</h2>
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">{category}</span>
                </div>

                {category !== 'SAREE' ? (
                  <div className="flex flex-col gap-6">
                    {/* Full Garment Section */}
                    <div>
                      <div className="flex items-center gap-4 mb-4 mt-2">
                        <div className="h-px bg-[#e5e0d8] flex-1"></div>
                        <span className="text-[10px] uppercase font-bold tracking-[2px] text-[#1A1410]">Full Garment</span>
                        <div className="h-px bg-[#e5e0d8] flex-1"></div>
                      </div>
                      {renderSlot(activeSlots.find(s => s.id === 'full'))}
                    </div>

                    {/* Garment Parts & Dupatta Section */}
                    <div>
                      <div className="flex items-center gap-4 mb-4 mt-2">
                        <div className="h-px bg-[#e5e0d8] flex-1"></div>
                        <span className="text-[10px] uppercase font-bold tracking-[2px] text-[#1A1410]">
                          Garment Parts {category === 'LEHANGA' ? '& Dupatta Style (Optional)' : ''}
                        </span>
                        <div className="h-px bg-[#e5e0d8] flex-1"></div>
                      </div>
                      
                      <div className={`grid grid-cols-1 md:grid-cols-2 ${category === 'LEHANGA' ? 'lg:grid-cols-4' : ''} gap-4`}>
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
                              className={`relative group rounded-xl overflow-hidden border-2 transition-all min-h-[160px] ${selectedDupattaStyle === style.url ? 'border-[#7F5700] ring-4 ring-[#7F5700]/20' : 'border-[#e5e0d8] hover:border-[#7F5700]/50'}`}
                            >
                              <div className="w-full h-full bg-[#faf7f2]">
                                <img src={style.url} alt={style.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 md:p-4">
                                <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider text-left drop-shadow-md">{style.name}</span>
                              </div>
                              {selectedDupattaStyle === style.url && (
                                <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#7F5700] text-white p-1 md:p-1.5 rounded-full shadow-lg">
                                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {activeSlots.map((slot) => renderSlot(slot))}
                  </div>
                )}

                <div className="mt-auto pt-10 flex justify-end">
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#1A1410] hover:bg-black text-white px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-sm flex justify-center items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Preview...
                      </>
                    ) : (
                      <>
                        Generate Preview
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
              
              {/* Left Column: Result Image */}
              <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-[#e5e0d8] flex items-center justify-center">
                <div className="h-[60vh] md:h-[70vh] max-h-[700px] aspect-[3/4] bg-[#faf7f2] rounded-xl overflow-hidden border border-[#e5e0d8] shadow-lg relative group">
                  {resultImage && (
                    <img src={resultImage} alt="Generated Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-sm flex items-center gap-2">
                    <Box className="w-3.5 h-3.5 text-[#7F5700]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1410]">{category}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Summary */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e5e0d8] flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-[#1A1410] tracking-tight">Generation Complete!</h2>
                      <p className="text-xs md:text-sm text-gray-500 font-medium">Review the high-fidelity drape.</p>
                    </div>
                  </div>
                  
                  {/* Summary Block */}
                  <div className="bg-[#faf7f2] rounded-xl p-5 md:p-6 border border-[#e5e0d8] mb-8 space-y-5">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Product Title</p>
                      <p className="text-[#1A1410] font-medium text-sm md:text-base">{title}</p>
                    </div>
                    {sku && (
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">SKU / Product ID</p>
                        <p className="text-[#1A1410] font-medium text-sm">{sku}</p>
                      </div>
                    )}
                    {description && (
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</p>
                        <p className="text-[#5c544d] font-medium text-xs md:text-sm leading-relaxed line-clamp-4">{description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-auto">
                  <button 
                    onClick={handleDiscard}
                    disabled={loading}
                    className="flex-1 bg-white border border-[#dcd6cc] text-[#1A1410] px-4 py-3.5 md:py-4 rounded-xl font-bold tracking-widest uppercase text-[10px] md:text-xs hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Discarding...' : 'Discard & Retry'}
                  </button>
                  <button 
                    onClick={handleSaveToCatalog}
                    disabled={loading}
                    className="flex-1 bg-[#7F5700] hover:bg-[#664600] text-white px-4 py-3.5 md:py-4 rounded-xl font-bold tracking-widest uppercase text-[10px] md:text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Save to Catalog'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <VendorProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};

export default VendorUpload;
