import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Store, Lock, Mail, User, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isNavigatingHome, setIsNavigatingHome] = useState(false);

  const handleClientPortalNav = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/client-login');
    }, 700); // Wait for the ultra-smooth sweep to complete
  };

  const handleHomeNav = () => {
    setIsNavigatingHome(true);
    setTimeout(() => {
      navigate('/');
    }, 250); // Faster fade out
  };

  useEffect(() => {
    // Redirect to appropriate workspace if already logged in
    const token = localStorage.getItem('vendor_token');
    const portalType = localStorage.getItem('portal_type');
    
    if (token) {
      if (portalType === 'b2b') {
        navigate('/vendor/upload');
      } else {
        navigate('/workspace');
      }
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

    const linkSpace = document.createElement('link');
    linkSpace.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap';
    linkSpace.rel = 'stylesheet';
    document.head.appendChild(linkSpace);

    return () => {
      document.head.removeChild(linkGaramond);
      document.head.removeChild(linkCourier);
      document.head.removeChild(linkSpace);
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Custom Validation
    if (isLogin) {
      if (!email.trim()) {
        setError('Please enter your business email address.');
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password to sign in.');
        return;
      }
    } else {
      if (!name.trim()) {
        setError('Please enter the owner\'s name.');
        return;
      }
      if (!storeName.trim()) {
        setError('Please enter your boutique or store name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter a valid business email address.');
        return;
      }
      if (!password.trim()) {
        setError('Please create a secure password.');
        return;
      }
    }

    setLoading(true);

    const endpoint = isLogin ? '/api/auth/vendor/login' : '/api/auth/vendor/register';
    const payload = isLogin 
      ? { email, password, expectedRole: 'merchant' }
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
      localStorage.setItem('portal_type', 'merchant');
      
      // Clear any lingering guest state to prevent UI conflicts in the workspace
      sessionStorage.removeItem('guest_mode');

      // Redirect to merchant dashboard
      navigate('/workspace');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-['Montserrat',sans-serif] text-[#1a1410] bg-white">
      
      {/* Page Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ scaleY: 0, transformOrigin: 'bottom' }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] bg-[#1a1410]"
          />
        )}
      </AnimatePresence>

      {/* Back to Home Transition Overlay */}
      <AnimatePresence>
        {isNavigatingHome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Left Side: Visual Editorial (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a1410] overflow-hidden">
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src="/content%20(4).png" 
            alt="Fashion Editorial" 
            className="w-full h-full object-cover object-[center_20%] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410] via-transparent to-transparent opacity-90" />
        </motion.div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
          <Link to="/" className="inline-block">
            <img src="/TRYON2BUY%20LOGO%20(white%20).png" alt="TryOn2Buy Logo" className="h-10 object-contain drop-shadow-lg" onError={(e) => e.target.style.display='none'} />
            <h1 className="text-white font-['EB_Garamond',serif] text-3xl tracking-wide drop-shadow-lg mt-2 hidden" id="fallback-logo">TRYON2BUY</h1>
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl lg:text-6xl font-['EB_Garamond',serif] tracking-tight leading-[1.1] mb-6 drop-shadow-xl">
              The Future of <br/><span className="italic text-[#dccdbf]">Ethnic Wear.</span>
            </h2>
            <p className="text-lg text-white/80 max-w-md leading-relaxed drop-shadow-md">
              Join the world's most advanced virtual try-on studio built specifically for the physics of Indian fashion.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-hidden bg-[#faf7f2]">
        
        {/* Subtle decorative background for right side */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ede8df]/50 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-24 py-12 relative z-10">
          
          <button 
            onClick={handleHomeNav}
            className="absolute top-8 left-6 sm:left-12 md:left-24 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#8c8278] hover:text-[#1a1410] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto mt-12"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-12">
              <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="mx-auto h-10 object-contain" />
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-['EB_Garamond',serif] tracking-tight mb-2">Merchant Studio</h2>
              <p className="text-[#8c8278] text-sm">Sign in to manage your digital catalog and virtual try-ons.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-8 border-b border-[#1A1410]/10 mb-10">
              <button
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`pb-4 text-xs uppercase font-bold tracking-[2px] transition-colors relative ${
                  isLogin ? 'text-[#1a1410]' : 'text-[#8c8278] hover:text-[#1a1410]'
                }`}
              >
                Sign In
                {isLogin && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a1410]" />
                )}
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`pb-4 text-xs uppercase font-bold tracking-[2px] transition-colors relative ${
                  !isLogin ? 'text-[#1a1410]' : 'text-[#8c8278] hover:text-[#1a1410]'
                }`}
              >
                Create Account
                {!isLogin && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a1410]" />
                )}
              </button>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-700 text-xs font-medium p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    className="flex flex-col gap-6 overflow-hidden"
                  >
                    {/* Owner Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8c8278]">Owner Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8278] group-focus-within:text-[#7f5700] transition-colors" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                          placeholder="e.g. Jane Doe"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#1A1410]/10 rounded-xl text-sm focus:outline-none focus:border-[#7f5700] focus:ring-1 focus:ring-[#7f5700]/20 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Store Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8c8278]">Boutique Name</label>
                      <div className="relative group">
                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8278] group-focus-within:text-[#7f5700] transition-colors" />
                        <input
                          type="text"
                          required
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="e.g. Heritage Coutures"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#1A1410]/10 rounded-xl text-sm focus:outline-none focus:border-[#7f5700] focus:ring-1 focus:ring-[#7f5700]/20 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#8c8278]">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8278] group-focus-within:text-[#7f5700] transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@store.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#1A1410]/10 rounded-xl text-sm focus:outline-none focus:border-[#7f5700] focus:ring-1 focus:ring-[#7f5700]/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#8c8278]">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8278] group-focus-within:text-[#7f5700] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#1A1410]/10 rounded-xl text-sm focus:outline-none focus:border-[#7f5700] focus:ring-1 focus:ring-[#7f5700]/20 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8278] hover:text-[#1a1410] focus:outline-none p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1410] hover:bg-[#ed7b22] text-white text-[11px] font-bold uppercase tracking-widest py-4 rounded-xl mt-4 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-3 relative disabled:opacity-75 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Studio' : 'Create Merchant Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Link to B2B Client Portal */}
              <div className="mt-8 text-center pt-8 border-t border-[#1A1410]/5">
                <p className="text-xs text-[#8c8278] mb-2">Are you a B2B or wholesale client?</p>
                <button
                  type="button"
                  onClick={handleClientPortalNav}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1410] hover:text-[#7f5700] transition-colors pb-0.5 border-b border-[#1A1410]/20 hover:border-[#7f5700]"
                >
                  Access B2B Client Portal <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
