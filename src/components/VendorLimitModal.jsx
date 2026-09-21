import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

/**
 * @param {'guest' | 'vendor' | 'expired'} userType
 *   guest   -- a guest used their free try-ons.
 *   vendor  -- a vendor used a credit allowance.
 *   expired -- a vendor's login ran out. Every page used to show these people the guest
 *              wording, "Free Trial Ended -- Login as Vendor", which is wrong for somebody who
 *              is already a vendor and was never on a free trial.
 * @param {boolean} allowGuest  expired only: offer "continue as a guest". For pages a shopper
 *   can use (CustomerTryon). Not for vendor-only pages, which cannot work without a login.
 */
export default function VendorLimitModal({ isOpen, onClose, userType = 'guest', allowGuest = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  // Come back to this exact page after logging in, rather than to the dashboard.
  const goToLogin = () => navigate('/login', { state: { returnTo: location.pathname + location.search } });

  const title = userType === 'vendor' ? 'Credit Limit Reached'
    : userType === 'expired' ? 'Session Expired'
    : 'Free Trial Ended';

  const text = userType === 'vendor'
    ? "You've used all your allocated try-on credits for this feature. Please Contact Us to upgrade your plan."
    : userType === 'expired'
      ? (allowGuest
          ? 'Your login has expired. Log in again to keep using your account, or carry on as a guest.'
          : 'Your login has expired. Please log in again to carry on.')
      : "You've used your 10 free trial credits! Create a free merchant account to unlock more credits and full studio features.";

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
          {title}
        </h2>

        <p className="text-[12px] text-[#5c544d] font-sans leading-relaxed mb-8">
          {text}
        </p>

        <button
          onClick={() => {
            if (userType === 'vendor') {
              window.location.href = "mailto:contact@tryon2buy.com";
            } else {
              // Guest mode is NOT cleared here any more. It used to be, before the login page
              // had even opened -- so backing out of it left a guest locked out of the
              // workspace. The login page ends guest mode itself, once a login succeeds.
              goToLogin();
            }
          }}
          className="w-full bg-[#1a1410] hover:bg-[#7f5700] text-white py-4 text-[11px] font-bold tracking-[2px] uppercase transition-colors rounded-xl"
        >
          {userType === 'vendor' ? 'Contact Us' : userType === 'expired' ? 'Log In Again' : 'Login as Vendor'}
        </button>

        {userType === 'expired' && allowGuest && (
          <button
            onClick={onClose}
            className="w-full mt-3 bg-transparent border border-[#1a1410] hover:bg-[rgba(26,20,16,0.05)] text-[#1a1410] py-3.5 text-[11px] font-bold tracking-[2px] uppercase transition-colors rounded-xl"
          >
            Continue as Guest
          </button>
        )}
      </div>
    </div>
  );
}
