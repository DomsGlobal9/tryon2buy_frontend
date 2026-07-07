import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CameraOff, MonitorPlay, Users2, ShieldCheck, Heart, Wand2, Menu, X } from 'lucide-react';

// Reusable Scroll Reveal Component (Triggers only once, always slides up)
const RevealOnScroll = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const hiddenClasses = 'opacity-0 translate-y-16';
  const visibleClasses = 'opacity-100 translate-y-0';

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out ${isVisible ? visibleClasses : hiddenClasses} ${className}`} 
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function AboutUs() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    
    if (heroRef.current) observer.observe(heroRef.current);
    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
    };
  }, []);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Montserrat',sans-serif] text-[#1a1410] selection:bg-[#ed7b22] selection:text-white overflow-x-hidden">
      
      {/* Custom Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8); }
          70% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideOutLeft {
          0% { opacity: 0; transform: translateX(50px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideOutRight {
          0% { opacity: 0; transform: translateX(-50px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-pop-in { animation: popIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-left { animation: slideOutLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slide-right { animation: slideOutRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }

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
        <Link to="/" className="flex items-center gap-2">
          <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-12 object-contain hover:opacity-80 transition-opacity" />
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-[11px] uppercase tracking-widest font-bold hover:text-[#ed7b22] transition-colors font-['Merriweather',serif]">
            HOME
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
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-end gap-6 py-8 border-b border-white/10 animate-fade-up delay-100"
            >
              <span className="text-[12px] font-['Outfit',sans-serif] font-light text-[#8c8278] mb-2">01</span>
              <span className="font-['EB_Garamond',serif] text-5xl tracking-wide text-white group-hover:text-[#ed7b22] group-hover:italic transition-all duration-300">Home</span>
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

      {/* Hero Section (FlyonUI Inspired) */}
      <section className="relative pt-24 pb-16 overflow-hidden border-b border-[#8c8278]/10 text-center">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
          
          <RevealOnScroll delay={0}>
            <h1 className="font-['EB_Garamond',serif] text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 font-normal tracking-tight text-[#1a1410]">
              Revolutionizing How The World Experiences <span className="text-[#ed7b22] italic pr-2">Fashion.</span>
            </h1>
          </RevealOnScroll>
          
          <RevealOnScroll delay={100}>
            <p className="text-[16px] md:text-[18px] leading-relaxed text-[#5c544d] font-['Inter',sans-serif] max-w-2xl mb-10 mx-auto">
              We're a passionate team united by a common goal — to create meaningful solutions that bridge the gap between physical retail and digital commerce through unparalleled AI technology.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
              <Link to="/login" className="bg-[#ed7b22] text-white px-8 py-4 rounded-full text-[12px] uppercase tracking-widest font-bold hover:bg-[#1a1410] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform font-['Merriweather',serif]">
                Become a Merchant <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="bg-transparent border-2 border-[#ed7b22] text-[#ed7b22] px-8 py-4 rounded-full text-[12px] uppercase tracking-widest font-bold hover:bg-[#ed7b22]/5 transition-colors flex items-center justify-center font-['Merriweather',serif]">
                Book a Demo
              </button>
            </div>
          </RevealOnScroll>
          
          {/* Focal Image with Solid Semi-Circles (Pop Out & Slide Out on Scroll) */}
          <div ref={heroRef} className="w-full max-w-[1000px] h-[400px] md:h-[600px] mx-auto flex items-center justify-center gap-4 md:gap-12 mb-10 overflow-visible">
            
            {/* Left Decorative Semi-Circles (Curved on the right) */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className={`${heroVisible ? 'animate-slide-left' : 'opacity-0'} delay-600 w-8 h-20 md:w-12 md:h-32 bg-[#ed7b22]/10 rounded-r-full shrink-0`}></div>
              <div className={`${heroVisible ? 'animate-slide-left' : 'opacity-0'} delay-500 w-12 h-32 md:w-16 md:h-48 bg-[#ed7b22]/20 rounded-r-full shrink-0`}></div>
              <div className={`${heroVisible ? 'animate-slide-left' : 'opacity-0'} delay-400 w-16 h-48 md:w-24 md:h-72 bg-[#ed7b22]/30 rounded-r-full shrink-0`}></div>
            </div>

            {/* Central Video (Pop In) - Vertical Pill */}
            <div className={`${heroVisible ? 'animate-pop-in' : 'opacity-0'} delay-300 w-[180px] h-[360px] md:w-[280px] md:h-[560px] rounded-full overflow-hidden border-[8px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-10 group shrink-0`}>
              <video 
                src="/assets/ui/vid.mp4" 
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Right Decorative Semi-Circles (Curved on the left) */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className={`${heroVisible ? 'animate-slide-right' : 'opacity-0'} delay-400 w-16 h-48 md:w-24 md:h-72 bg-[#ed7b22]/30 rounded-l-full shrink-0`}></div>
              <div className={`${heroVisible ? 'animate-slide-right' : 'opacity-0'} delay-500 w-12 h-32 md:w-16 md:h-48 bg-[#ed7b22]/20 rounded-l-full shrink-0`}></div>
              <div className={`${heroVisible ? 'animate-slide-right' : 'opacity-0'} delay-600 w-8 h-20 md:w-12 md:h-32 bg-[#ed7b22]/10 rounded-l-full shrink-0`}></div>
            </div>
            
          </div>
        </div>
      </section>

      {/* The Problem & Solution (Split Pane) */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 md:px-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <RevealOnScroll className="relative h-auto md:h-[500px] flex flex-col md:block justify-center items-center gap-6" delay={100}>
            
            {/* Background Decorative Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-[#ed7b22]/10 rounded-full animate-ping duration-[3000ms] -z-10 hidden md:block"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border border-[#1a1410]/5 rounded-full animate-pulse -z-10 hidden md:block"></div>

            {/* Top Left Badge (Black) */}
            <div className="relative md:absolute md:top-8 md:left-0 w-full md:w-[280px] z-10 animate-float group/card">
              <div className="bg-[#1a1410] text-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_60px_rgba(237,123,34,0.15)] hover:scale-[1.03] transition-all duration-500 rounded-sm border border-transparent hover:border-[#ed7b22]/40 cursor-default">
                <CameraOff className="w-8 h-8 text-[#ed7b22] mb-4 transition-transform duration-500 group-hover/card:scale-125 group-hover/card:-rotate-12" />
                <h4 className="text-[14px] font-bold uppercase tracking-widest mb-2 font-['Outfit',sans-serif] transition-colors duration-300 group-hover/card:text-[#ed7b22]">The Old Way</h4>
                <p className="text-[13px] font-['Inter',sans-serif] text-[#a69c92] leading-relaxed">
                  Traditional fashion cataloging is slow, expensive, and heavily limited by physical constraints.
                </p>
              </div>
            </div>

            {/* Middle Right Badge (White) */}
            <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 md:right-0 w-full md:w-[280px] z-20 animate-float delay-300 group/card">
              <div className="bg-white text-[#1a1410] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_rgba(237,123,34,0.15)] hover:scale-[1.03] transition-all duration-500 rounded-sm border border-[#8c8278]/10 hover:border-[#ed7b22]/40 cursor-default">
                <Wand2 className="w-8 h-8 text-[#ed7b22] mb-4 transition-transform duration-500 group-hover/card:scale-125 group-hover/card:rotate-12" />
                <h4 className="text-[14px] font-bold uppercase tracking-widest mb-2 font-['Outfit',sans-serif] transition-colors duration-300 group-hover/card:text-[#ed7b22]">The Solution</h4>
                <p className="text-[13px] font-['Inter',sans-serif] text-[#5c544d] leading-relaxed">
                  Instant digital draping bypasses physical photo studios completely, reducing time-to-market by 90%.
                </p>
              </div>
            </div>

            {/* Bottom Center Badge (Orange) */}
            <div className="relative md:absolute md:bottom-8 md:left-16 w-full md:w-[280px] z-30 animate-float delay-500 group/card">
              <div className="bg-[#ed7b22] text-white p-8 shadow-[0_20px_50px_rgba(237,123,34,0.3)] hover:shadow-[0_30px_60px_rgba(237,123,34,0.6)] hover:scale-[1.03] transition-all duration-500 rounded-sm border border-transparent hover:border-white/50 cursor-default">
                <MonitorPlay className="w-8 h-8 text-white mb-4 transition-transform duration-500 group-hover/card:scale-125 group-hover/card:-rotate-12" />
                <h4 className="text-[14px] font-bold uppercase tracking-widest mb-2 font-['Outfit',sans-serif] transition-colors duration-300 group-hover/card:text-white/80">The Result</h4>
                <p className="text-[13px] font-['Inter',sans-serif] font-medium leading-relaxed">
                  Zero photography costs. 100% photorealistic, studio-grade results in seconds.
                </p>
              </div>
            </div>
          </RevealOnScroll>
          
          <div>
            <RevealOnScroll delay={200}>
              <h2 className="font-['EB_Garamond',serif] text-4xl md:text-5xl mb-8 leading-tight">
                The Evolution of <br/>Fashion E-Commerce.
              </h2>
            </RevealOnScroll>
            <div className="space-y-6 text-[#5c544d] font-['Inter',sans-serif] text-[15px] leading-relaxed">
              <RevealOnScroll delay={300}>
                <p>
                  For decades, fashion boutiques and brands have relied on expensive, time-consuming photoshoots to showcase their new collections. Hiring models, renting studios, and waiting for post-production editing drains resources and slows down your time-to-market.
                </p>
              </RevealOnScroll>
              <RevealOnScroll delay={400}>
                <p>
                  At TryOn2Buy, we realized that the future of fashion commerce needed to be instant and effortless. We built a dual-engine platform designed specifically to solve this problem from both sides:
                </p>
              </RevealOnScroll>
              <ul className="space-y-4 pt-2">
                <RevealOnScroll delay={500}>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-[#faf7f2] border border-[#8c8278]/20 p-1.5 rounded-full shrink-0">
                      <CameraOff className="w-4 h-4 text-[#ed7b22]" />
                    </div>
                    <div>
                      <strong className="text-[#1a1410] font-bold block mb-1">Vendor-Side Digital Draping</strong>
                      Completely avoid product photoshoots. Simply upload a basic flat lay photo of a saree, lehenga, or kurti from your inventory. Our AI instantly drapes it onto a professional virtual model, generating studio-grade catalog images in seconds.
                    </div>
                  </li>
                </RevealOnScroll>
                <RevealOnScroll delay={600}>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-[#faf7f2] border border-[#8c8278]/20 p-1.5 rounded-full shrink-0">
                      <Users2 className="w-4 h-4 text-[#ed7b22]" />
                    </div>
                    <div>
                      <strong className="text-[#1a1410] font-bold block mb-1">Customer-Side Virtual Try-On</strong>
                      Once your catalog is digitized, your shoppers can upload their own photos to instantly try on any garment, drastically increasing confidence and reducing return rates.
                    </div>
                  </li>
                </RevealOnScroll>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="py-24 bg-[#1a1410] text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <RevealOnScroll>
            <h2 className="font-['EB_Garamond',serif] text-4xl md:text-5xl mb-16">Our Core Pillars</h2>
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <RevealOnScroll delay={100}>
              <div className="bg-[#2a2420] p-10 hover:-translate-y-2 transition-transform duration-300 h-full">
                <MonitorPlay className="w-10 h-10 text-[#d4af37] mx-auto mb-6" />
                <h3 className="text-[16px] uppercase font-bold tracking-widest mb-4">Innovation First</h3>
                <p className="text-[#a69c92] font-['Inter',sans-serif] text-[14px] leading-relaxed">
                  We continuously push the boundaries of generative AI to ensure our virtual try-ons are indistinguishable from real photography.
                </p>
              </div>
            </RevealOnScroll>
            
            <RevealOnScroll delay={300}>
              <div className="bg-[#2a2420] p-10 hover:-translate-y-2 transition-transform duration-300 h-full">
                <ShieldCheck className="w-10 h-10 text-[#d4af37] mx-auto mb-6" />
                <h3 className="text-[16px] uppercase font-bold tracking-widest mb-4">Uncompromising Quality</h3>
                <p className="text-[#a69c92] font-['Inter',sans-serif] text-[14px] leading-relaxed">
                  We believe that digital assets must match the luxury and craftsmanship of the physical garments they represent.
                </p>
              </div>
            </RevealOnScroll>
            
            <RevealOnScroll delay={500}>
              <div className="bg-[#2a2420] p-10 hover:-translate-y-2 transition-transform duration-300 h-full">
                <Users2 className="w-10 h-10 text-[#d4af37] mx-auto mb-6" />
                <h3 className="text-[16px] uppercase font-bold tracking-widest mb-4">Empowering Brands</h3>
                <p className="text-[#a69c92] font-['Inter',sans-serif] text-[14px] leading-relaxed">
                  Our mission is to arm boutique owners and independent designers with enterprise-grade technology to compete globally.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* The Technology Section */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 md:px-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <RevealOnScroll>
              <h2 className="font-['EB_Garamond',serif] text-4xl md:text-5xl mb-8 leading-tight">
                Driven by <br/>Advanced AI.
              </h2>
            </RevealOnScroll>
            <div className="space-y-8">
              <RevealOnScroll delay={200}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-[#faf7f2] border border-[#8c8278]/20 rounded-full flex items-center justify-center font-['EB_Garamond',serif] text-xl font-bold text-[#ed7b22]">1</div>
                  <div>
                    <h4 className="font-bold text-[15px] mb-2 uppercase tracking-wide">Identity Lock Technology</h4>
                    <p className="text-[#5c544d] font-['Inter',sans-serif] text-[14px] leading-relaxed">Our proprietary AI strictly preserves the customer's face, body type, and skin tone, ensuring an authentic and ethical try-on experience.</p>
                  </div>
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={400}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-[#faf7f2] border border-[#8c8278]/20 rounded-full flex items-center justify-center font-['EB_Garamond',serif] text-xl font-bold text-[#ed7b22]">2</div>
                  <div>
                    <h4 className="font-bold text-[15px] mb-2 uppercase tracking-wide">Dynamic Draping Physics</h4>
                    <p className="text-[#5c544d] font-['Inter',sans-serif] text-[14px] leading-relaxed">Unlike simple overlays, our system understands fabric weight, pleats, and gravity to drape garments exactly as they would fall in reality.</p>
                  </div>
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={600}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-[#faf7f2] border border-[#8c8278]/20 rounded-full flex items-center justify-center font-['EB_Garamond',serif] text-xl font-bold text-[#ed7b22]">3</div>
                  <div>
                    <h4 className="font-bold text-[15px] mb-2 uppercase tracking-wide">Studio Lighting Emulation</h4>
                    <p className="text-[#5c544d] font-['Inter',sans-serif] text-[14px] leading-relaxed">Automatically matches ambient lighting and generates realistic drop shadows to composite subjects seamlessly into any luxury environment.</p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative p-2 md:p-8">
            <RevealOnScroll delay={300}>
              {/* Decorative Arch Background */}
              <div className="absolute inset-0 bg-[#ede8df] rounded-t-full rounded-b-2xl translate-x-4 translate-y-4 -z-10" />
              
              {/* Main Image Container - Arch Shape */}
              <div className="w-full aspect-[4/5] rounded-t-full rounded-b-2xl shadow-2xl overflow-hidden bg-[#ede8df] group border-4 border-[#faf7f2]">
                <img 
                  src="/assets/ui/tryon-models.png" 
                  alt="TryOn2Buy Virtual Try-On Models" 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden text-center bg-[#faf7f2] border-t border-[#8c8278]/10">
        <div className="absolute inset-0 bg-[#ede8df] -z-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gradient-to-b from-transparent via-[#faf7f2]/80 to-[#faf7f2] -z-10"></div>
        
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <RevealOnScroll>
            <Heart className="w-8 h-8 text-[#ed7b22] mx-auto mb-6" />
          </RevealOnScroll>
          <RevealOnScroll delay={100}>
            <h2 className="font-['EB_Garamond',serif] text-4xl md:text-5xl mb-6 text-[#1a1410]">
              Join the Revolution.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <p className="text-[#5c544d] font-['Inter',sans-serif] text-[16px] leading-relaxed mb-10 max-w-xl mx-auto">
              Ready to transform how your customers experience your fashion catalog? Start your journey with TryOn2Buy today.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={300}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login" className="inline-flex justify-center items-center gap-3 bg-[#ed7b22] text-white px-10 py-5 text-[12px] uppercase tracking-[3px] font-bold hover:bg-[#1a1410] transition-colors shadow-xl hover:-translate-y-1 transform duration-200 font-['Merriweather',serif]">
                Become a Merchant <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1410] text-white py-24 px-6 md:px-12 border-t border-[#3a3430]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img src="/assets/footer_logo.png" alt="TryOn2Buy Logo" className="h-12 object-contain" />
            <span className="hidden md:block w-px h-8 bg-[#3a3430]"></span>
            <p className="text-[12px] uppercase tracking-[2px] text-[#8c8278] text-center md:text-left">
              &copy; {new Date().getFullYear()} Tryon2Buy Technology. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-8">
              <Link to="/" className="text-[13px] uppercase tracking-widest text-[#a69c92] hover:text-white transition-colors">Home</Link>
              <Link to="/login" className="text-[13px] uppercase tracking-widest text-[#a69c92] hover:text-white transition-colors">Merchant Login</Link>
            </div>
            {/* Social Icons */}
            <div className="flex gap-4 flex-wrap justify-center">
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
        </div>
      </footer>

    </div>
  );
}
