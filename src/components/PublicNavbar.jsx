import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const SOLUTIONS = [
  { name: 'Saree Try-On', path: '/saree', desc: 'Nivi, Bengali, & regional drapes' },
  { name: 'Lehenga Try-On', path: '/lehenga', desc: 'Accurate flare & volume physics' },
  { name: 'Anarkali Try-On', path: '/anarkali', desc: 'Floor-length flow & fit' },
  { name: 'Sharara Try-On', path: '/sharara', desc: 'Trouser volume & layering' },
  { name: 'Kurti Try-On', path: '/kurti', desc: 'Regional tailoring conventions' },
];

export default function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when modal or mobile menu is open to prevent background flickering/shifting
  useEffect(() => {
    if (showDemoModal || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showDemoModal, mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSolutionsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 w-full",
        isScrolled ? "bg-white/95 backdrop-blur-md py-3 md:py-4" : "bg-transparent py-4 md:py-6"
      )}
    >
      <div className="flex items-center justify-between px-6 md:px-16 xl:px-24 max-w-[1800px] mx-auto w-full">
        <div className="flex items-center justify-between w-full">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-12 object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div 
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-[#1A1410]/70 hover:text-[#1A1410] transition-colors py-2">
                Solutions
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", solutionsOpen && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {solutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[320px] bg-white rounded-2xl shadow-xl border border-[#1A1410]/5 p-2"
                  >
                    {SOLUTIONS.map((item) => (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        className="block p-3 rounded-xl hover:bg-[#ede8df]/30 transition-colors group"
                      >
                        <div className="text-sm font-bold text-[#1A1410] group-hover:text-[#7F5700] transition-colors">
                          {item.name}
                        </div>
                        <div className="text-xs text-[#8c8278] mt-0.5">{item.desc}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            

            <Link to="/about" className="text-sm font-medium text-[#1A1410]/70 hover:text-[#1A1410] transition-colors">
              Company
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-[#1A1410] hover:text-[#7F5700] transition-colors">
              Sign In
            </Link>
            <button 
              onClick={() => setShowDemoModal(true)}
              className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-[#1A1410] rounded-full overflow-hidden transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1410] to-[#2a201a] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Book a Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1A1410]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-[#1A1410]/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8c8278] mb-3">Solutions</h4>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {SOLUTIONS.map(s => (
                    <Link 
                      key={s.path} 
                      to={s.path} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center p-4 rounded-2xl bg-[#faf7f2] border border-[#1A1410]/5 hover:bg-[#1A1410] hover:border-[#1A1410] hover:shadow-md transition-all duration-300"
                    >
                      <span className="text-sm font-bold text-[#1A1410] group-hover:text-white transition-colors">{s.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-[#1A1410]/5">

                <Link to="/about" className="block text-sm font-medium text-[#1A1410]">About Us</Link>
              </div>

              <div className="pt-4 border-t border-[#1A1410]/5 flex flex-col gap-3">
                <Link to="/login" className="w-full py-3 text-center text-sm font-bold text-[#1A1410] border border-[#1A1410] rounded-xl">
                  Sign In
                </Link>
                <button onClick={() => setShowDemoModal(true)} className="w-full py-3 text-center text-sm font-bold text-white bg-[#1A1410] rounded-xl">
                  Book a Demo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoModal(false)}
              className="absolute inset-0 bg-[#1a1410]/70"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 w-full max-w-lg overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="" className="w-48 opacity-20 grayscale" />
              </div>
              
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-6 right-6 text-[#1a1410]/40 hover:text-[#1a1410] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center justify-center mb-6">
                <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-10 object-contain" />
              </div>
              
              <h3 className="text-3xl font-['EB_Garamond',serif] font-bold mb-4">Book a Demo</h3>
              <p className="text-[#5c544d] leading-relaxed mb-8">
                Ready to see our Proprietary Dupatta Drape Matrix in action? Contact our enterprise team to schedule a live technical demonstration tailored to your catalog.
              </p>

              <div className="bg-[#faf7f2] p-6 rounded-2xl border border-[#1a1410]/10 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8c8278] mb-2">Email us at</span>
                <a 
                  href="mailto:info@tryon2buy.com" 
                  className="text-xl md:text-2xl font-bold text-[#1a1410] hover:text-[#7F5700] transition-colors"
                >
                  info@tryon2buy.com
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
