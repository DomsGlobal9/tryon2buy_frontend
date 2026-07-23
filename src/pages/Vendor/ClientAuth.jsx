import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Store, Lock, Mail, User, Eye, EyeOff, ChevronLeft } from 'lucide-react';

export default function ClientAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to appropriate workspace if already logged in
    const token = localStorage.getItem('vendor_token');
    const portalType = localStorage.getItem('portal_type');
    
    if (token) {
      if (portalType === 'merchant') {
        navigate('/workspace');
      } else {
        navigate('/vendor/upload');
      }
    }

    // Inject fonts
    const linkGaramond = document.createElement('link');
    linkGaramond.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap';
    linkGaramond.rel = 'stylesheet';
    document.head.appendChild(linkGaramond);

    const linkSpace = document.createElement('link');
    linkSpace.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap';
    linkSpace.rel = 'stylesheet';
    document.head.appendChild(linkSpace);

    return () => {
      document.head.removeChild(linkGaramond);
      document.head.removeChild(linkSpace);
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = '/api/auth/vendor/login';
    const payload = { email, password };

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
      localStorage.setItem('portal_type', 'b2b');

      // Redirect to digitize product screen
      navigate('/vendor/upload');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1410] min-h-screen font-['Space_Grotesk',sans-serif] text-white flex flex-col items-center justify-center p-6 relative select-none">
      
      {/* Background patterns for premium B2B look */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7F5700]/10 rounded-full filter blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#c4933f]/10 rounded-full filter blur-[100px]" />

      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:top-10 md:left-10 inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[#c4933f] hover:text-white transition-colors z-20"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="mx-auto h-12 object-contain invert brightness-0 pb-1" />
          <span className="text-xs uppercase tracking-[3px] text-[#8c8278] font-bold block mt-3">
            B2B Client Portal
          </span>
        </div>

        {/* Single Header (No Tabs) */}
        <div className="flex border-b border-white/10 mb-8 pb-4 justify-center">
          <span className="text-sm uppercase font-bold tracking-widest text-white">
            Client Login
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 text-red-400 text-xs uppercase tracking-wider p-4 mb-6 border border-red-500/20 text-center rounded-xl font-bold">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Business Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@brand.com"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#c4933f] transition-all placeholder-gray-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#c4933f] transition-all placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c4933f] hover:bg-[#a67c33] text-[#1A1410] text-xs font-bold uppercase tracking-widest py-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-3 relative shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#1A1410]/20 border-t-[#1A1410] rounded-full animate-spin" />
            ) : (
              <>
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Link back to Merchant Portal */}
          <div className="mt-2 text-center border-t border-white/10 pt-5">
            <span className="text-xs uppercase tracking-widest font-bold text-gray-500 mr-2">Are you a Merchant?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-bold uppercase tracking-widest text-[#c4933f] hover:text-white transition-colors"
            >
              Go to Studio Portal →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
