import React from 'react';
import { Star } from 'lucide-react';

export default function VendorUpgradeModal({ isOpen, onClose, userType = 'vendor' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#faf7f2] border border-[#1a1410] max-w-md w-full p-8 md:p-10 relative shadow-2xl text-center rounded-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-[#1a1410] hover:text-[#7f5700] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div className="bg-[#c4933f]/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-6 border border-[#c4933f]/30">
          <Star className="w-8 h-8 text-[#c4933f] fill-[#c4933f]" />
        </div>
        <h2 className="font-['EB_Garamond',serif] text-3xl text-[#1a1410] mb-3">Out of Credits</h2>
        <p className="text-[12px] text-[#5c544d] font-sans leading-relaxed mb-8">
          {userType === 'customer' 
            ? "You've used all 5 of your free try-ons! Contact the boutique to get unlimited access and keep trying on beautiful outfits."
            : "You've used all 5 of your free merchant try-ons! Subscribe to our Unlimited Plan to keep generating stunning personalized fits for your customers."
          }
        </p>
        <button 
          onClick={() => {
            onClose();
            window.location.href = 'mailto:info@tryon2buy.com?subject=Upgrade%20to%20Unlimited';
          }} 
          className="w-full bg-[#c4933f] hover:bg-[#a67c35] text-white py-4 text-[11px] font-bold tracking-[2px] uppercase transition-colors rounded-xl shadow-md"
        >
          Contact Us to Upgrade
        </button>
      </div>
    </div>
  );
}
