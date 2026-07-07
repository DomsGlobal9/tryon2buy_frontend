import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, CameraOff, Clock, LayoutGrid, Zap, ShieldCheck, User, Menu, X } from 'lucide-react';

export default function Landing() {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGuestWorkspace = () => {
    sessionStorage.setItem('guest_mode', 'true');
    navigate('/workspace');
  };

  useEffect(() => {
    // Inject fonts
    const linkGaramond = document.createElement('link');
    linkGaramond.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap';
    linkGaramond.rel = 'stylesheet';
    document.head.appendChild(linkGaramond);

    const linkCourier = document.createElement('link');
    linkCourier.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap';
    linkCourier.rel = 'stylesheet';
    document.head.appendChild(linkCourier);

    const linkOutfit = document.createElement('link');
    linkOutfit.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';
    linkOutfit.rel = 'stylesheet';
    document.head.appendChild(linkOutfit);

    const linkMontserrat = document.createElement('link');
    linkMontserrat.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
    linkMontserrat.rel = 'stylesheet';
    document.head.appendChild(linkMontserrat);

    const linkMerriweather = document.createElement('link');
    linkMerriweather.href = 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap';
    linkMerriweather.rel = 'stylesheet';
    document.head.appendChild(linkMerriweather);

    return () => {
      document.head.removeChild(linkGaramond);
      document.head.removeChild(linkCourier);
      document.head.removeChild(linkOutfit);
      document.head.removeChild(linkMontserrat);
      document.head.removeChild(linkMerriweather);
    };
  }, []);

  const marqueeImages = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&h=500&q=80",
    "https://i.pinimg.com/1200x/e1/41/3a/e1413aef6cfdc4be616501fa1ae06e29.jpg",
    "https://i.pinimg.com/1200x/ef/1f/4f/ef1f4fa37753149f3b0046b70ba5da83.jpg",
    "https://i.pinimg.com/736x/ef/9f/fd/ef9ffd17b941412d4a5044f4d5b9c1aa.jpg",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=500&h=500&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=500&h=500&q=80",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&h=500&q=80",
    "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=500&h=500&q=80"
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Montserrat',sans-serif] text-[#1a1410] selection:bg-[#ed7b22] selection:text-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); } /* 12px accounts for half the gap */
        }
        .animate-marquee {
          animation: scrollMarquee 45s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        
        /* Custom Animated Hamburger Menu */
        .menu__icon {
          width: 32px;
          height: 32px;
          padding: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          outline: none;
        }
        .menu__icon span {
          display: block;
          width: 100%;
          height: 0.15rem;
          border-radius: 2px;
          background-color: #1a1410;
          transition: background-color .4s;
          position: relative;
        }
        .menu__icon span+span {
          margin-top: .375rem;
        }
        .menu__icon.closed span:nth-child(1) { animation: ease .8s menu-icon-top-2 forwards; }
        .menu__icon.closed span:nth-child(2) { animation: ease .8s menu-icon-scaled-2 forwards; }
        .menu__icon.closed span:nth-child(3) { animation: ease .8s menu-icon-bottom-2 forwards; }
        .menu__icon.open span { background-color: #faf7f2; }
        .menu__icon.open span:nth-child(1) { animation: ease .8s menu-icon-top forwards; }
        .menu__icon.open span:nth-child(2) { animation: ease .8s menu-icon-scaled forwards; }
        .menu__icon.open span:nth-child(3) { animation: ease .8s menu-icon-bottom forwards; background-color: #ed7b22; }

        @keyframes menu-icon-top { 0% { top: 0; transform: rotate(0); } 50% { top: .5rem; transform: rotate(0); } 100% { top: .5rem; transform: rotate(45deg); } }
        @keyframes menu-icon-top-2 { 0% { top: .5rem; transform: rotate(45deg); } 50% { top: .5rem; transform: rotate(0); } 100% { top: 0; transform: rotate(0); } }
        @keyframes menu-icon-bottom { 0% { bottom: 0; transform: rotate(0); } 50% { bottom: .5rem; transform: rotate(0); } 100% { bottom: .5rem; transform: rotate(135deg); } }
        @keyframes menu-icon-bottom-2 { 0% { bottom: .5rem; transform: rotate(135deg); } 50% { bottom: .5rem; transform: rotate(0); } 100% { bottom: 0; transform: rotate(0); } }
        @keyframes menu-icon-scaled { 50% { transform: scale(0); } 100% { transform: scale(0); } }
        @keyframes menu-icon-scaled-2 { 0% { transform: scale(0); } 50% { transform: scale(0); } 100% { transform: scale(1); } }
      `}} />
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-16 xl:px-24 py-4 md:py-6 max-w-[1800px] mx-auto w-full sticky top-0 z-[110] bg-[#faf7f2]/90 backdrop-blur-md border-b border-[#8c8278]/10">
        <div className="flex items-center gap-2">
          <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-12 object-contain" />
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/about" className="text-[11px] uppercase tracking-widest font-bold hover:text-[#ed7b22] transition-colors font-['Merriweather',serif]">
            ABOUT US
          </Link>
          <Link to="/login" state={{ isLogin: false }} className="text-[11px] uppercase tracking-widest font-bold hover:text-[#ed7b22] transition-colors font-['Merriweather',serif]">
            SIGNUP
          </Link>
          <Link to="/login" state={{ isLogin: true }} className="bg-[#1a1410] text-white px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold hover:bg-[#ed7b22] transition-colors flex items-center gap-2 font-['Merriweather',serif]">
            LOGIN <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Animated Hamburger Toggle */}
        <button 
          className={`md:hidden menu__icon ${isMobileMenuOpen ? 'open' : 'closed'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Full-Screen Menu Overlay (Dark Premium Mode) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1a1410] text-[#faf7f2] flex flex-col pt-28 overflow-hidden animate-fade-up">
          
          {/* Background Decorative Marquee */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full overflow-hidden opacity-5 pointer-events-none flex whitespace-nowrap -z-10">
            <span className="text-[120px] font-['EB_Garamond',serif] italic font-bold">TRYON2BUY STUDIO&nbsp;</span>
            <span className="text-[120px] font-['EB_Garamond',serif] italic font-bold">TRYON2BUY STUDIO&nbsp;</span>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
            <Link 
              to="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-end gap-6 py-8 border-b border-white/10 animate-fade-up delay-100"
            >
              <span className="text-[12px] font-['Outfit',sans-serif] font-light text-[#8c8278] mb-2">01</span>
              <span className="font-['EB_Garamond',serif] text-5xl tracking-wide text-white group-hover:text-[#ed7b22] group-hover:italic transition-all duration-300">About Us</span>
            </Link>
            
            <Link 
              to="/login" 
              state={{ isLogin: false }} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-end gap-6 py-8 border-b border-white/10 animate-fade-up delay-200"
            >
              <span className="text-[12px] font-['Outfit',sans-serif] font-light text-[#8c8278] mb-2">02</span>
              <span className="font-['EB_Garamond',serif] text-5xl tracking-wide text-white group-hover:text-[#ed7b22] group-hover:italic transition-all duration-300">Sign Up</span>
            </Link>

            <Link 
              to="/login" 
              state={{ isLogin: true }} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-end gap-6 py-8 border-b border-white/10 animate-fade-up delay-300"
            >
              <span className="text-[12px] font-['Outfit',sans-serif] font-light text-[#8c8278] mb-2">03</span>
              <span className="font-['EB_Garamond',serif] text-5xl tracking-wide text-[#ed7b22] group-hover:text-white transition-all duration-300">Login</span>
            </Link>
          </div>

          <div className="px-8 pb-12 animate-fade-up delay-400 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8c8278] font-bold leading-loose">
              Tryon2Buy Technology <br/>
              © {new Date().getFullYear()} All Rights Reserved
            </p>
            <div className="flex gap-2 md:gap-3 flex-wrap">
              <a href="https://www.instagram.com/tryon2buy/?hl=en" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://x.com/Tryon2buy" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://in.pinterest.com/tryon2buy/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.625 0 12.017 0z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@Tryon2buy" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="https://www.linkedin.com/company/132194315/admin/dashboard/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-[1800px] mx-auto px-6 md:px-16 xl:px-24 pt-16 md:pt-24 pb-20 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          
          <div className="relative z-10">
            <h1 className="font-['EB_Garamond',serif] text-5xl md:text-[5.5rem] leading-[1.05] mb-6 md:mb-8 font-normal tracking-tight text-[#1a1410]">
              The Ultimate <br/>Virtual Try-On.
            </h1>
            
            <p className="text-[15px] md:text-[17px] leading-relaxed text-[#5c544d] mb-10 md:mb-12 font-['Inter',sans-serif] max-w-lg">
              Elevate your boutique's catalog with studio-quality digital draping. 
              Transform flat garment photos into stunning editorial model shots instantly, 
              and allow your customers to try on your fashion collection from anywhere.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-md mx-auto xl:mx-0">
              <button onClick={handleGuestWorkspace} className="bg-[#1a1410] text-white px-8 py-4 text-[11px] md:text-[12px] uppercase tracking-widest font-bold hover:bg-[#ed7b22] transition-colors flex items-center justify-center gap-2 font-['Merriweather',serif]">
                Continue as Guest <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[12px] uppercase tracking-[0.08em] font-bold font-['Outfit',sans-serif]">Zero Photoshoot Costs</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[12px] uppercase tracking-[0.08em] font-bold font-['Outfit',sans-serif]">Immersive Try-On</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[12px] uppercase tracking-[0.08em] font-bold font-['Outfit',sans-serif]">Studio-Grade Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[12px] uppercase tracking-[0.08em] font-bold font-['Outfit',sans-serif]">Multi-Category Support</span>
              </div>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            {/* Background blur decorative circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-amber-100/60 rounded-full filter blur-[80px] md:blur-[120px] -z-10" />
            
            {/* Image Composition */}
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="mt-12 relative overflow-hidden group shadow-xl rounded-sm">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src="/assets/ui/landingsaree.png" 
                  alt="Draped Saree Example"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="relative overflow-hidden group shadow-xl rounded-sm">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                <video 
                  src="/assets/ui/vid.mp4" 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-110 transition-transform duration-1000 group-hover:scale-[1.15]"
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Infinite Image Marquee */}
      <section className="py-12 border-t border-[#8c8278]/10 bg-white/20 overflow-hidden relative">
        <div className="absolute top-0 left-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#faf7f2] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#faf7f2] to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex w-max animate-marquee gap-8 px-4">
            {[...marqueeImages, ...marqueeImages].map((src, i) => (
              <div key={i} className="h-[220px] w-[220px] md:h-[280px] md:w-[280px] shrink-0 relative overflow-hidden group shadow-lg border border-[rgba(26,20,16,0.05)] rounded-[2rem]">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 duration-500" />
                <img 
                  src={src} 
                  alt="Virtual Try-On Inspiration" 
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110" 
                />
              </div>
            ))}
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="border-y border-[#8c8278]/10 bg-white/40 py-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-['EB_Garamond',serif] text-4xl md:text-5xl text-[#ed7b22] mb-2">10x</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#8c8278]">Faster Cataloging</div>
          </div>
          <div>
            <div className="font-['EB_Garamond',serif] text-4xl md:text-5xl text-[#ed7b22] mb-2">100%</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#8c8278]">Digital Workflow</div>
          </div>
          <div>
            <div className="font-['EB_Garamond',serif] text-4xl md:text-5xl text-[#ed7b22] mb-2">40%</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#8c8278]">Conversion Increase</div>
          </div>
          <div>
            <div className="font-['EB_Garamond',serif] text-4xl md:text-5xl text-[#ed7b22] mb-2">24/7</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#8c8278]">Virtual Fitting Room</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <h2 className="font-['EB_Garamond',serif] text-4xl md:text-5xl mb-6">Redefining the Fashion Studio</h2>
          <p className="text-[#5c544d] font-['Inter',sans-serif] text-[15px] leading-relaxed">
            Replace expensive, time-consuming model photoshoots with our advanced digital draping technology. A completely seamless workflow for modern fashion brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-[#8c8278]/20 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 bg-[#faf7f2] p-8 text-center border border-[#8c8278]/10 hover:border-[#ed7b22]/30 transition-colors shadow-sm">
            <div className="w-16 h-16 mx-auto bg-[#1a1410] text-white flex items-center justify-center rounded-full mb-6 shadow-xl">
              <CameraOff className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] uppercase font-bold tracking-widest mb-4">1. Upload Flat Lays</h3>
            <p className="text-[#5c544d] font-['Inter',sans-serif] text-[14px] leading-relaxed">
              No models needed. Simply upload a flat photo of your saree, lehenga, or kurti directly from your inventory.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 bg-[#faf7f2] p-8 text-center border border-[#8c8278]/10 hover:border-[#ed7b22]/30 transition-colors shadow-sm">
            <div className="w-16 h-16 mx-auto bg-[#ed7b22] text-white flex items-center justify-center rounded-full mb-6 shadow-xl">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] uppercase font-bold tracking-widest mb-4">2. Digital Draping</h3>
            <p className="text-[#5c544d] font-['Inter',sans-serif] text-[14px] leading-relaxed">
              Our proprietary technology instantly drapes your garment onto professional virtual models with perfect lighting and folds.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 bg-[#faf7f2] p-8 text-center border border-[#8c8278]/10 hover:border-[#ed7b22]/30 transition-colors shadow-sm">
            <div className="w-16 h-16 mx-auto bg-[#1a1410] text-white flex items-center justify-center rounded-full mb-6 shadow-xl">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] uppercase font-bold tracking-widest mb-4">3. Publish & Sell</h3>
            <p className="text-[#5c544d] font-['Inter',sans-serif] text-[14px] leading-relaxed">
              Export stunning, high-resolution catalog images directly to your store and enable interactive virtual try-ons for your customers.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 bg-[#faf7f2] p-8 text-center border border-[#8c8278]/10 hover:border-[#ed7b22]/30 transition-colors shadow-sm">
            <div className="w-16 h-16 mx-auto bg-[#ed7b22] text-white flex items-center justify-center rounded-full mb-6 shadow-xl">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] uppercase font-bold tracking-widest mb-4">4. Customer Try-On</h3>
            <p className="text-[#5c544d] font-['Inter',sans-serif] text-[14px] leading-relaxed">
              Shoppers can upload their own photos to try on your garments, instantly customizing blouse styles and backgrounds.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Split Section */}
      <section className="bg-[#1a1410] text-white py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" 
                alt="Virtual Dressing Room" 
                className="w-full h-auto object-cover rounded-sm opacity-90 shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#ed7b22] -z-10 hidden md:block"></div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="font-['EB_Garamond',serif] text-4xl md:text-5xl mb-8 leading-tight">
                An Immersive Fitting Room,<br/> Built for Conversion.
              </h2>
              <p className="text-[#a69c92] font-['Inter',sans-serif] text-[16px] leading-relaxed mb-10">
                Give your customers the ultimate confidence to purchase. By allowing them to see exactly how your luxury garments drape on their unique body type, you drastically reduce return rates and increase brand loyalty.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-[#2a2420] p-2 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="text-[12px] uppercase font-bold tracking-widest mb-1 text-white">Privacy First</h4>
                    <p className="text-[#a69c92] font-['Inter',sans-serif] text-[14px]">Secure, enterprise-grade architecture protects your catalog and your customers' data.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-[#2a2420] p-2 rounded-full">
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div>
                    <h4 className="text-[12px] uppercase font-bold tracking-widest mb-1 text-white">Instant Results</h4>
                    <p className="text-[#a69c92] font-['Inter',sans-serif] text-[14px]">Lightning-fast rendering delivers high-fidelity try-ons in seconds, not minutes.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[#ede8df] -z-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gradient-to-b from-transparent via-[#faf7f2]/80 to-[#faf7f2] -z-10"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="font-['EB_Garamond',serif] text-5xl md:text-6xl mb-6 text-[#1a1410]">
            Ready to Elevate Your Catalog?
          </h2>
          <p className="text-[#5c544d] font-['Inter',sans-serif] text-[16px] leading-relaxed mb-10 max-w-xl mx-auto">
            Join the modern fashion boutiques using TryOn2Buy to digitize their draping process and deliver unparalleled shopping experiences.
          </p>
          <Link to="/login" className="inline-flex items-center gap-3 bg-[#ed7b22] text-white px-10 py-5 text-[12px] uppercase tracking-[3px] font-bold hover:bg-[#1a1410] transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-200 font-['Merriweather',serif]">
            Create Your Merchant Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1410] text-white py-16 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-[#3a3430] pb-12 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <img src="/assets/footer_logo.png" alt="TryOn2Buy Logo" className="h-8 md:h-10 object-contain" />
            </div>
            <p className="text-[#a69c92] font-['Inter',sans-serif] text-[14px] max-w-sm leading-relaxed mb-8">
              The premier digital draping and virtual fitting room technology for modern luxury fashion e-commerce.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 flex-wrap">
              <a href="https://www.instagram.com/tryon2buy/?hl=en" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#3a3430] flex items-center justify-center text-[#a69c92] hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://x.com/Tryon2buy" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#3a3430] flex items-center justify-center text-[#a69c92] hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://in.pinterest.com/tryon2buy/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#3a3430] flex items-center justify-center text-[#a69c92] hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.625 0 12.017 0z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@Tryon2buy" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#3a3430] flex items-center justify-center text-[#a69c92] hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="https://www.linkedin.com/company/132194315/admin/dashboard/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#3a3430] flex items-center justify-center text-[#a69c92] hover:text-[#ed7b22] hover:border-[#ed7b22] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[2px] font-bold mb-6 text-[#8c8278]">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/login" className="text-[13px] text-[#a69c92] hover:text-white transition-colors">Merchant Login</Link></li>
              <li><Link to="/login" className="text-[13px] text-[#a69c92] hover:text-white transition-colors">Create Account</Link></li>
              <li><a href="#" className="text-[13px] text-[#a69c92] hover:text-white transition-colors">Technology</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[2px] font-bold mb-6 text-[#8c8278]">Contact & Legal</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@tryon2buy.com" className="text-[13px] text-[#a69c92] hover:text-white transition-colors">
                  info@tryon2buy.com
                </a>
              </li>
              <li><a href="#" className="text-[13px] text-[#a69c92] hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-[13px] text-[#a69c92] hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#8c8278]">
          <p className="text-[11px] uppercase tracking-[2px]">
            &copy; {new Date().getFullYear()} Tryon2Buy Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] uppercase tracking-widest font-bold">Studio Grade</span>
            <span className="w-1 h-1 bg-[#8c8278] rounded-full"></span>
            <span className="text-[11px] uppercase tracking-widest font-bold">Enterprise Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
