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
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the mobile menu is open to prevent background flickering/shifting
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

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

          {/* The same menu as the home page (About us, Solutions, Journal, Sign up, Login); this one
              used to read Solutions, Company, Sign In, Book a Demo. */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-[11px] uppercase tracking-widest font-bold text-[#1A1410] hover:text-accent transition-colors">About Us</Link>
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button onClick={() => setSolutionsOpen(o => !o)} aria-expanded={solutionsOpen} className="flex items-center gap-1 py-2 text-[11px] uppercase tracking-widest font-bold text-[#1A1410] hover:text-accent transition-colors">
                Solutions
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", solutionsOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {solutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[320px] bg-white shadow-xl border border-[#1A1410]/5 p-2"
                  >
                    {SOLUTIONS.map((item) => (
                      <Link key={item.path} to={item.path} className="block p-3 hover:bg-[#ede8df]/40 transition-colors group">
                        <div className="text-sm font-bold text-[#1A1410] group-hover:text-accent transition-colors">{item.name}</div>
                        <div className="text-xs text-muted mt-0.5">{item.desc}</div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/blog" className="text-[11px] uppercase tracking-widest font-bold text-[#1A1410] hover:text-accent transition-colors">Journal</Link>
            <Link to="/login" state={{ isLogin: false }} className="text-[11px] uppercase tracking-widest font-bold text-[#1A1410] hover:text-accent transition-colors">Sign Up</Link>
            <Link to="/login" state={{ isLogin: true }} className="bg-[#1a1410] text-white px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold hover:bg-accent transition-colors flex items-center gap-2">
              Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Solutions</h4>
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
                <Link to="/blog" className="block text-sm font-medium text-[#1A1410]">Journal</Link>
              </div>

              <div className="pt-4 border-t border-[#1A1410]/5 flex flex-col gap-3">
                <Link to="/login" state={{ isLogin: false }} className="w-full py-3 text-center text-[12px] uppercase tracking-widest font-bold text-white bg-[#1A1410]">
                  Sign Up
                </Link>
                <Link to="/login" state={{ isLogin: true }} className="w-full py-3 text-center text-[12px] uppercase tracking-widest font-bold text-[#1A1410] border border-[#1A1410]">
                  Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>

    </>
  );
}
