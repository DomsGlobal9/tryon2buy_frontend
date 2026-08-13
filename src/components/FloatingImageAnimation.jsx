import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * FloatingImageAnimation - Pure React FLIP (Diagonal Corner Shrink)
 * 
 * Uses transformOrigin: "bottom right" so the image shrinks diagonally
 * towards its own corner while translating to the dock.
 * 100% GPU accelerated, no canvas black-box errors, no CPU lag.
 */
export default function FloatingImageAnimation({ imageUrl, sourceRect, onComplete }) {
  const [destRect, setDestRect] = useState(null);
  const onCompleteRef = useRef(onComplete);
  const hasCompleted = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const findDock = () => {
      const dockBtn = document.getElementById('history-dock-button');
      if (dockBtn) {
        setDestRect(dockBtn.getBoundingClientRect());
      } else {
        setDestRect({
          top: window.innerHeight - 72,
          left: window.innerWidth - 72,
          width: 48,
          height: 48
        });
      }
    };

    const timer = setTimeout(findDock, 50);

    const failsafe = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onCompleteRef.current?.();
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(failsafe);
    };
  }, []);

  if (!sourceRect || !destRect) return null;

  // The center of the dock (where we want the image to disappear)
  const dstCX = destRect.left + destRect.width / 2;
  const dstCY = destRect.top + destRect.height / 2;

  // Because transformOrigin is "bottom right" (100% 100%),
  // the scaling anchor is the bottom-right corner of the original image.
  const srcBottomRightX = sourceRect.left + sourceRect.width;
  const srcBottomRightY = sourceRect.top + sourceRect.height;

  // Calculate the distance to move the anchor point to the dock
  const deltaX = dstCX - srcBottomRightX;
  const deltaY = dstCY - srcBottomRightY;

  // We add a gentle arc by pulling the X movement out slightly during the flight
  const midX = deltaX * 0.5 - 50; 
  const midY = deltaY * 0.5;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <motion.img
        src={imageUrl}
        alt=""
        style={{
          position: 'absolute',
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
          objectFit: 'contain',
          
          // Crucial: Shrinks exactly from the bottom right corner
          transformOrigin: 'bottom right',
          willChange: 'transform, opacity',
        }}
        initial={{
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        animate={{
          // Move the bottom-right anchor along an arc to the dock
          x: [0, midX, deltaX],
          y: [0, midY, deltaY],
          
          // Shrink from 100% down to 5% size
          scale: [1, 0.7, 0.05],
          
          // Morph the border radius to be completely round at the end
          borderRadius: [8, 16, 100],
          
          opacity: [1, 1, 0],
          boxShadow: [
            '0 4px 12px rgba(0,0,0,0.15)',
            '0 20px 40px rgba(0,0,0,0.3)',
            '0 0px 0px rgba(0,0,0,0)'
          ],
        }}
        transition={{
          duration: 1.0,
          ease: [0.25, 0.1, 0.25, 1], // Smooth deceleration curve
        }}
        onAnimationComplete={() => {
          if (!hasCompleted.current) {
            hasCompleted.current = true;
            onCompleteRef.current?.();
          }
        }}
      />
    </div>
  );
}
