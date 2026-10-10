import React from 'react';
import { Link } from 'react-router-dom';

/** A full-page problem a visitor can act on: what happened, and a way out. */
export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-[#ede8df] flex flex-col items-center justify-center gap-6 px-6 text-center font-['Courier_Prime',monospace]">
      <img src="/TRYON2BUY%20LOGO%20(black%20).png" alt="TryOn2Buy" className="h-10 object-contain" />
      <p role="alert" className="text-[13px] text-[#1A1410] max-w-sm leading-relaxed">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button onClick={onRetry} className="border border-[#1A1410] px-5 py-2.5 text-[11px] font-bold tracking-[1.5px] uppercase text-[#1A1410] hover:bg-[#1A1410]/5">
            Try again
          </button>
        )}
        <Link to="/" className="bg-[#1A1410] text-white px-5 py-2.5 text-[11px] font-bold tracking-[1.5px] uppercase hover:bg-black">
          Go to home
        </Link>
      </div>
    </div>
  );
}

export const NETWORK_PROBLEM = "We couldn't reach TryOn2Buy. Check your connection and try again.";
