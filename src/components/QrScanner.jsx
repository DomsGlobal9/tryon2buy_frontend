import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * The camera, inside the page, reading the QR on a garment's tag (28 Oct) -- so a shopper building a
 * try-on list scans tag after tag without the phone opening a new tab each time.
 *
 * The phone's own reader (BarcodeDetector) where there is one; ZXing, loaded only when needed, where
 * there is not (iPhone Safari). The back camera, because the tag is in the shopper's hand.
 */
const hasNativeReader = () => typeof window !== 'undefined' && 'BarcodeDetector' in window;

async function zxingReader() {
  const [{ BrowserQRCodeReader }] = await Promise.all([import('@zxing/browser')]);
  return new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 150 });
}

export default function QrScanner({ onFound, onClose }) {
  const videoRef = useRef(null);
  const liveRef = useRef(true);
  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    liveRef.current = true;
    let stream = null;
    let controls = null;
    const stop = () => {
      try { controls?.stop(); } catch { /* already stopped */ }
      stream?.getTracks().forEach(t => t.stop());
      stream = null;
    };
    const found = (raw) => {
      const value = String(raw ?? '').trim();
      if (!value || !liveRef.current) return;
      liveRef.current = false;
      stop();
      navigator.vibrate?.(40);
      onFoundRef.current(value);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) { setProblem('This browser cannot open the camera. Scan the tag with your phone camera instead.'); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (!liveRef.current) { stop(); return; }
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => undefined); }
        if (hasNativeReader()) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const tick = async () => {
            if (!liveRef.current || !videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes?.[0]?.rawValue) { found(codes[0].rawValue); return; }
            } catch { /* the next frame */ }
            setTimeout(tick, 250);
          };
          tick();
          return;
        }
        const reader = await zxingReader();
        if (!liveRef.current || !videoRef.current) { stop(); return; }
        controls = await reader.decodeFromStream(stream, videoRef.current, (result) => { if (result) found(result.getText()); });
      } catch (e) {
        setProblem(e?.name === 'NotAllowedError'
          ? 'The camera was not allowed. Turn it on for this site in your browser settings, or scan the tag with your phone camera.'
          : 'The camera could not be opened. Scan the tag with your phone camera instead.');
        stop();
      }
    })();
    return () => { liveRef.current = false; stop(); };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label="Scan the next tag" className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 h-14 text-white">
        <span className="text-[13px] uppercase tracking-[1.5px]">Scan the next tag</span>
        <button type="button" onClick={onClose} aria-label="Close the camera" className="p-2"><X className="w-6 h-6" /></button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[62vw] max-w-[280px] aspect-square border-2 border-white/80 rounded-xl" />
        </div>
      </div>
      <p className="text-white/85 text-[13px] text-center px-6 py-4 leading-relaxed">
        {problem ?? 'Hold the QR on the tag inside the square.'}
      </p>
    </div>
  );
}
