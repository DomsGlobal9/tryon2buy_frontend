import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Package, Box, Filter, LogOut, Image as ImageIcon, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorCatalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vendor_token');
    localStorage.removeItem('vendor_data');
    localStorage.removeItem('portal_type');
    navigate('/');
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/tryon/catalog/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductId = (product) => {
    if (product.sku) return product.sku.toUpperCase();
    return `PRD-${product.id.split('-')[0].toUpperCase()}`;
  };

  const filteredProducts = products.filter(product => {
    const q = searchQuery.toLowerCase();
    const pId = getProductId(product).toLowerCase();
    return product.title.toLowerCase().includes(q) || pId.includes(q);
  });

  const handleTryOn = (product) => {
    if (product.primaryAssetId) {
      navigate(`/vendor/preview/${product.primaryAssetId}`);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tryon/catalog/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Space_Grotesk',sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e0d8] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => navigate('/vendor/upload')}
              className="text-gray-400 hover:text-[#1A1410] hover:bg-gray-100 p-1 md:p-1.5 rounded-full transition-colors flex items-center justify-center -ml-1 md:-ml-2"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="bg-[#1A1410] text-[#faf7f2] p-2 md:p-2.5 rounded-xl shadow-md">
              <Package className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-[#1A1410] tracking-tight">Product Catalog</h1>
              <p className="hidden md:block text-sm text-gray-500 font-medium mt-0.5">Manage and preview your digitized garments.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => navigate('/vendor/upload')}
              className="bg-[#7F5700] hover:bg-[#664600] text-white px-3 py-2 md:px-6 md:py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Digitize New Product</span>
              <span className="sm:hidden">New</span>
            </button>
            
            <div className="w-px h-6 bg-[#e5e0d8] mx-1 md:mx-2 hidden sm:block"></div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 md:gap-2 bg-[#faf7f2] hover:bg-red-50 border border-[#e5e0d8] hover:border-red-200 text-[#5c544d] hover:text-red-600 px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all shadow-sm flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 md:py-6 px-4 md:px-8">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Product Name or ID (e.g. PRD-A1B2)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-[#e5e0d8] rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-[#7F5700] focus:ring-1 focus:ring-[#7F5700] transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 text-sm font-bold text-[#5c544d]">
            <Filter className="w-4 h-4" />
            <span>{filteredProducts.length} Products</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#7F5700] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-[#dcd6cc] p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#faf7f2] rounded-full flex items-center justify-center mb-6">
              <Box className="w-8 h-8 text-[#dcd6cc]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1410] mb-2">Your Catalog is Empty</h3>
            <p className="text-gray-500 max-w-md mb-8">You haven't digitized any products yet. Upload your flat lays or mannequin photos to generate AI drapes.</p>
            <button 
              onClick={() => navigate('/vendor/upload')}
              className="bg-[#1A1410] hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold tracking-widest uppercase text-xs transition-all shadow-md"
            >
              Digitize First Product
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const pId = getProductId(product);
              const imageUrl = product.primaryAsset?.imageUrl;
              
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-[#e5e0d8] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                  {/* Image Container */}
                  <div className="aspect-[4/5] bg-[#faf7f2] relative overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    
                    {/* ID/SKU Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/20 shadow-sm text-[9px] font-bold uppercase tracking-wider text-[#1A1410]">
                      {pId}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-[#1A1410]/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10 shadow-sm text-[9px] font-bold uppercase tracking-wider text-white">
                      {product.category}
                    </div>

                    {/* Delete Button (Hover Reveal) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductToDelete(product);
                      }}
                      className="absolute bottom-3 right-3 bg-white/90 hover:bg-red-50 hover:text-red-600 text-gray-500 backdrop-blur-sm p-1.5 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <h3 className="text-sm md:text-base font-bold text-[#1A1410] mb-1 line-clamp-1" title={product.title}>{product.title}</h3>
                    {product.description && (
                      <p className="hidden md:block text-[10px] md:text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{product.description}</p>
                    )}
                    
                    <div className="mt-auto pt-3 flex gap-2">
                      <button 
                        onClick={() => handleTryOn(product)}
                        className="flex-1 bg-[#1A1410] hover:bg-black text-white py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Try It On
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1410] mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-8">
                Are you sure you want to delete <strong>{productToDelete.title}</strong>? This will permanently remove the product and all associated generated try-on images.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-[#5c544d] bg-[#faf7f2] hover:bg-[#e5e0d8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorCatalog;
