import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Store, Lock, Mail, User, Eye, EyeOff, ChevronLeft } from 'lucide-react';

export default function VendorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to workspace if already logged in
    const token = localStorage.getItem('vendor_token');
    if (token) {
      navigate('/workspace');
    }

    // Inject fonts
    const linkGaramond = document.createElement('link');
    linkGaramond.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap';
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
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/vendor/login' : '/api/auth/vendor/register';
    const payload = isLogin 
      ? { email, password }
      : { email, password, name, storeName };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token & info
      localStorage.setItem('vendor_token', data.token);
      localStorage.setItem('vendor_data', JSON.stringify(data.vendor));

      // Redirect to merchant dashboard
      navigate('/workspace');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen font-['Courier_Prime',monospace] text-[#1a1410] flex flex-col items-center justify-center p-6 relative select-none">
      
      {/* Background patterns/circles for premium look */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#ede8df]/50 rounded-full filter blur-3xl" />

      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:top-10 md:left-10 inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[2px] text-[#7f5700] hover:text-[#1a1410] transition-colors z-20"
      >
        <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-[450px] bg-white border border-[rgba(26,20,16,0.1)] p-8 relative overflow-hidden shadow-sm animate-fade-in">


        {/* Brand Header */}
        <div className="text-center mb-8">
          <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="mx-auto h-12 object-contain" />
          <span className="text-[9px] uppercase tracking-[2px] text-[#8c8278] block mt-1.5">
            Merchant Studio Portal
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[rgba(26,20,16,0.1)] mb-8">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 pb-3 text-[10px] uppercase font-bold tracking-[1.5px] transition-colors relative ${
              isLogin ? 'text-[#7f5700]' : 'text-[#8c8278] hover:text-[#1a1410]'
            }`}
          >
            Sign In
            {isLogin && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7f5700]" />
            )}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 pb-3 text-[10px] uppercase font-bold tracking-[1.5px] transition-colors relative ${
              !isLogin ? 'text-[#7f5700]' : 'text-[#8c8278] hover:text-[#1a1410]'
            }`}
          >
            Create Account
            {!isLogin && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7f5700]" />
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-700 text-[10px] uppercase tracking-wider p-3 mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <>
              {/* Owner Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#8c8278]">Owner Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#8c8278]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-10 pr-4 py-3 bg-[#faf7f2] border border-[rgba(26,20,16,0.15)] text-[11px] focus:outline-none focus:border-[#7f5700] transition-colors"
                  />
                </div>
              </div>

              {/* Store Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-[#8c8278]">Store / Boutique Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 w-4 h-4 text-[#8c8278]" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Heritage Coutures"
                    className="w-full pl-10 pr-4 py-3 bg-[#faf7f2] border border-[rgba(26,20,16,0.15)] text-[11px] focus:outline-none focus:border-[#7f5700] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[#8c8278]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8c8278]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@store.com"
                className="w-full pl-10 pr-4 py-3 bg-[#faf7f2] border border-[rgba(26,20,16,0.15)] text-[11px] focus:outline-none focus:border-[#7f5700] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-[#8c8278]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#8c8278]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#faf7f2] border border-[rgba(26,20,16,0.15)] text-[11px] focus:outline-none focus:border-[#7f5700] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#8c8278] hover:text-[#1a1410] focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1410] hover:bg-[#7f5700] text-[#faf7f2] text-[10px] font-bold uppercase tracking-[2px] py-4 mt-2 transition-colors flex items-center justify-center gap-2 relative disabled:opacity-75"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Merchant Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
