import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, CameraOff, Clock, LayoutGrid, Zap, ShieldCheck } from 'lucide-react';

export default function Landing() {
  const [showGuestModal, setShowGuestModal] = useState(false);
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

    return () => {
      document.head.removeChild(linkGaramond);
      document.head.removeChild(linkCourier);
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
    <div className="min-h-screen bg-[#faf7f2] font-['Courier_Prime',monospace] text-[#1a1410] selection:bg-[#ed7b22] selection:text-white overflow-x-hidden">
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
      `}} />
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-16 xl:px-24 py-6 max-w-[1800px] mx-auto w-full sticky top-0 z-50 bg-[#faf7f2]/90 backdrop-blur-md border-b border-[#8c8278]/10">
        <div className="flex items-center gap-2">
          <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-10 md:h-12 object-contain" />
        </div>
        <div className="flex items-center gap-6 md:gap-8">
          <a href="#about" className="text-[10px] md:text-[11px] uppercase tracking-widest font-bold hover:text-[#ed7b22] transition-colors hidden sm:block">
            ABOUT US
          </a>
          <Link to="/login" state={{ isLogin: false }} className="text-[10px] md:text-[11px] uppercase tracking-widest font-bold hover:text-[#ed7b22] transition-colors hidden sm:block">
            SIGNUP
          </Link>
          <Link to="/login" state={{ isLogin: true }} className="bg-[#1a1410] text-white px-5 md:px-6 py-2.5 text-[10px] md:text-[11px] uppercase tracking-widest font-bold hover:bg-[#ed7b22] transition-colors flex items-center gap-2">
            LOGIN <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

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
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <button onClick={handleGuestWorkspace} className="bg-[#1a1410] text-white px-8 py-4 text-[11px] md:text-[12px] uppercase tracking-widest font-bold hover:bg-[#ed7b22] transition-colors flex items-center gap-2">
                Continue as Guest <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[11px] uppercase tracking-wider font-bold">Zero Photoshoot Costs</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[11px] uppercase tracking-wider font-bold">Immersive Try-On</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[11px] uppercase tracking-wider font-bold">Studio-Grade Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#ed7b22] shrink-0" />
                <span className="text-[11px] uppercase tracking-wider font-bold">Multi-Category Support</span>
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
                <img 
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=80" 
                  alt="Bridal Lehenga Example"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
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
          <Link to="/login" className="inline-flex items-center gap-3 bg-[#ed7b22] text-white px-10 py-5 text-[12px] uppercase tracking-[3px] font-bold hover:bg-[#1a1410] transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-200">
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
            <p className="text-[#a69c92] font-['Inter',sans-serif] text-[14px] max-w-sm leading-relaxed">
              The premier digital draping and virtual fitting room technology for modern luxury fashion e-commerce.
            </p>
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
