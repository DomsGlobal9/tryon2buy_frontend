import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-[#1A1410]/5 pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-8 md:h-10 object-contain" />
            </Link>
            <p className="text-sm text-[#8c8278] leading-relaxed pr-4">
              The only AI virtual try-on platform purpose-built for the physics and conventions of Indian ethnic fashion.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1A1410] mb-4">Solutions</h4>
            <ul className="space-y-3">
              <li><Link to="/saree" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">Saree Try-On</Link></li>
              <li><Link to="/lehenga" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">Lehenga Try-On</Link></li>
              <li><Link to="/anarkali" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">Anarkali Try-On</Link></li>
              <li><Link to="/sharara" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">Sharara Try-On</Link></li>
              <li><Link to="/kurti" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">Kurti Try-On</Link></li>
            </ul>
          </div>



          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1A1410] mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">About Us</Link></li>
              <li><a href="mailto:hello@tryon2buy.com" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">Contact</a></li>
              <li><Link to="/login" className="text-sm text-[#8c8278] hover:text-[#7F5700] transition-colors">Vendor Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1A1410]/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8c8278]">
            &copy; {new Date().getFullYear()} TryOn2Buy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-[#8c8278] hover:text-[#1A1410]">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-[#8c8278] hover:text-[#1A1410]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
