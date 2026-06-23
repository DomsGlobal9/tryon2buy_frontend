import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function VendorLimitModal({ isOpen, onClose, userType = 'guest' }) {
  const navigate = useNavigate();

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
        <div className="mx-auto flex justify-center mb-6">
          <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy Logo" className="h-10 object-contain" />
        </div>
        
        <h2 className="font-['EB_Garamond',serif] text-3xl text-[#1a1410] mb-3">
          {userType === 'vendor' ? 'Credit Limit Reached' : 'Free Trial Ended'}
        </h2>
        
        <p className="text-[12px] text-[#5c544d] font-sans leading-relaxed mb-8">
          {userType === 'vendor' 
            ? "You've used all your allocated try-on credits for this feature. Please Contact Us to upgrade your plan."
            : "You've used your 10 free trial credits! Create a free merchant account to unlock more credits and full studio features."
          }
        </p>
        
        <button 
          onClick={() => {
            if (userType === 'vendor') {
              window.location.href = "mailto:contact@tryon2buy.com";
            } else {
              sessionStorage.removeItem('guest_mode');
              navigate('/login');
            }
          }} 
          className="w-full bg-[#1a1410] hover:bg-[#7f5700] text-white py-4 text-[11px] font-bold tracking-[2px] uppercase transition-colors rounded-xl"
        >
          {userType === 'vendor' ? 'Contact Us' : 'Login as Vendor'}
        </button>
      </div>
    </div>
  );
}
