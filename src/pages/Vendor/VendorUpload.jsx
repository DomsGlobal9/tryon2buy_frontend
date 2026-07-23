import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Upload, ChevronRight, Check, Image as ImageIcon, Sparkles, Box, FileText, Package, LogOut, ChevronDown, Camera, X, LayoutGrid, CloudUpload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_SLOTS = {
  SAREE: [
    { id: 'saree', label: 'Saree', required: true },
    { id: 'blouse', label: 'Blouse', required: false }
  ],
  LEHANGA: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true },
    { id: 'back', label: 'Back View', required: true }
  ],
  ANARKALI: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true },
    { id: 'back', label: 'Back View', required: true }
  ],
  SHARARA: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true },
    { id: 'back', label: 'Back View', required: true }
  ],
  KURTHI: [
    { id: 'full', label: 'Full View', required: true },
    { id: 'top', label: 'Top View', required: true },
    { id: 'bottom', label: 'Bottom View', required: true },
    { id: 'back', label: 'Back View', required: true }
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
      const res = await fetch('/api/tryon/vendor/profile', {
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

    setIsUploadingSlot(slotId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/tryon/upload?folder=garments', {
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
      const res = await fetch('/api/tryon/catalog/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        },
        body: JSON.stringify({ garment_image_url: garmentPayload, category })
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
      const res = await fetch('/api/tryon/catalog/save', {
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
        await fetch('/api/tryon/catalog/discard', {
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

                <div className={`grid gap-4 ${activeSlots.length > 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {activeSlots.map((slot) => {
                    const slotData = garmentUploads[slot.id];
                    const isUploading = isUploadingSlot === slot.id;
                    const isDragging = draggingSlot === slot.id;

                    return (
                      <div 
                        key={slot.id}
                        onDragOver={(e) => handleDragOver(e, slot.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        className={`relative border-2 border-dashed bg-[#fdfcf9] rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[150px] sm:min-h-[160px] transition-all duration-300 ${isDragging ? 'border-[#7F5700] bg-[#faf7f2] scale-[1.02] shadow-md' : 'border-[#dcd6cc] hover:border-[#7F5700]'}`}
                      >
                        <div className="absolute top-0 left-0 bg-[#ede8df] text-[#5c544d] px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest z-10 rounded-br-lg border-b border-r border-[#dcd6cc]">
                          {slot.label} {slot.required && <span className="text-red-500">*</span>}
                        </div>

                        {isUploading ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-[#7F5700] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-gray-500 font-medium">Uploading...</span>
                          </div>
                        ) : slotData ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 mt-6">
                            <img src={slotData.url} alt={slot.label} className="max-h-[140px] max-w-full object-contain drop-shadow-md" />
                            
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveGarmentSlot(slot.id)}
                              className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors z-20 shadow-sm border border-gray-200 hover:border-red-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full p-3 sm:p-4 mt-2">
                            {/* Cloud Icon */}
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#faf7f2] rounded-full flex items-center justify-center text-[#7F5700] shadow-sm border border-[#e5e0d8] pointer-events-none mb-1">
                              <CloudUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            
                            {/* Headings */}
                            <h3 className="text-[11px] sm:text-[13px] font-bold text-[#1A1410] pointer-events-none">
                              <span className="hidden lg:inline">Upload a photo</span>
                              <span className="lg:hidden">Upload or take a photo</span>
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-gray-500 mb-2 sm:mb-3 pointer-events-none text-center">Drag & drop an image here or</p>
                            
                            {/* Buttons */}
                            <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-2 w-full relative z-20 flex-nowrap">
                              <label className="flex items-center justify-center gap-1 sm:gap-1.5 border border-[#7F5700] text-[#7F5700] hover:bg-[#7F5700] hover:text-white px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex-1 lg:flex-none">
                                <input type="file" accept="image/*" onChange={(e) => handleGarmentSlotChange(slot.id, e)} className="hidden" />
                                <Upload className="h-3 w-3" />
                                <span>Upload Files</span>
                              </label>

                              <label className="lg:hidden flex items-center justify-center gap-1 sm:gap-1.5 border border-[#7F5700] text-[#7F5700] hover:bg-[#7F5700] hover:text-white px-2 sm:px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap flex-1">
                                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleGarmentSlotChange(slot.id, e)} className="hidden" />
                                <Camera className="h-3 w-3" />
                                <span>Take Photo</span>
                              </label>
                            </div>

                            {/* Info */}
                            <p className="text-[8px] sm:text-[9px] font-medium text-gray-400 mt-2 sm:mt-3 pointer-events-none uppercase tracking-widest text-center">PNG, JPG up to 10MB</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-10 flex justify-end">
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-[#1A1410] hover:bg-black text-white px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-sm flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
                      <p className="text-xs md:text-sm text-gray-500 font-medium">Review the high-fidelity AI drape.</p>
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
    </div>
  );
};

export default VendorUpload;
