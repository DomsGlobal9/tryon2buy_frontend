import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Image as ImageIcon, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllHistory, promoteToActive, deleteHistoryImage, EXPIRY_MS, subscribeToImageEvents } from '../utils/imageStore';

export default function ImageHistoryDock() {
  const [history, setHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Refresh timer display every 10s and auto-purge expired images
  useEffect(() => {
    const int = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      
      // If any image has crossed the 20m threshold, auto-refresh to purge it
      if (history.some(img => currentTime - img.lastUsedAt > EXPIRY_MS)) {
        fetchHistory();
      }
    }, 10000);
    return () => clearInterval(int);
  }, [history]);

  const fetchHistory = async () => {
    try {
      const records = await getAllHistory();
      const withUrls = records.map(r => {
        try {
          return {
            ...r,
            previewUrl: URL.createObjectURL(r.file)
          };
        } catch(e) {
          console.warn("Failed to create URL for history image", e);
          return { ...r, previewUrl: null };
        }
      }).filter(r => r.previewUrl !== null);
      
      setHistory(prev => {
        // Revoke old URLs before replacing
        prev.forEach(h => {
          if (h.previewUrl) URL.revokeObjectURL(h.previewUrl);
        });
        return withUrls;
      });
    } catch (e) {
      console.warn("fetchHistory failed", e);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      history.forEach(h => {
        if (h.previewUrl) URL.revokeObjectURL(h.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    fetchHistory();
    const unsubscribe = subscribeToImageEvents(() => {
      // Small delay to let IndexedDB settle
      setTimeout(() => fetchHistory(), 50);
    });
    return () => unsubscribe();
  }, []);

  const handlePromote = async (id) => {
    await promoteToActive(id);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteHistoryImage(id);
    // fetchHistory will be called by the event listener
  };

  const inactiveHistory = history.filter(h => !h.isActive);

  return (
    <>
      {/* ---- Floating Dock Button (bottom-right) ---- */}
      <AnimatePresence>
        {inactiveHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              id="history-dock-button"
              onClick={() => setIsModalOpen(true)}
              className="bg-white p-3 rounded-full shadow-lg border border-[#e2e8f0] flex items-center justify-center hover:shadow-xl transition-all relative group"
            >
              <div className="absolute -top-2 -right-2 bg-[#dd6b20] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {inactiveHistory.length}
              </div>
              <Clock className="w-5 h-5 text-[#dd6b20]" />
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[11px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                Recent Selfies
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- History Modal ---- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#dd6b20]" />
                  <h3 className="font-bold text-[#1a202c]">Recent Selfies</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-[#a0aec0] hover:text-[#1a202c] transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-4 overflow-y-auto">
                <p className="text-[#718096] text-[12px] mb-4">
                  Select a previous photo to reuse it instantly. Photos automatically expire 20 minutes after their last use.
                </p>

                {inactiveHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ImageIcon className="w-12 h-12 text-[#e2e8f0] mb-3" />
                    <p className="text-[#a0aec0] text-sm">No recent photos found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {inactiveHistory.map(img => {
                      const timeElapsed = now - img.lastUsedAt;
                      const timeRemainingMs = Math.max(0, EXPIRY_MS - timeElapsed);
                      const minsRemaining = Math.ceil(timeRemainingMs / 60000);
                      
                      return (
                        <div 
                          key={img.id}
                          className="relative rounded-lg overflow-hidden border border-[#e2e8f0] bg-[#f7fafc]"
                        >
                          {/* Image thumbnail */}
                          <div className="aspect-[3/4] overflow-hidden">
                            <img src={img.previewUrl} alt="History" className="w-full h-full object-cover" />
                          </div>
                          
                          {/* Expiry Badge */}
                          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {minsRemaining}m
                          </div>

                          {/* Action buttons — ALWAYS visible, separate from the image */}
                          <div className="flex items-center border-t border-[#e2e8f0]">
                            <button
                              onClick={() => handlePromote(img.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-[#dd6b20] hover:bg-[#fffaf0] transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> Use Photo
                            </button>
                            <div className="w-[1px] h-6 bg-[#e2e8f0]"></div>
                            <button
                              onClick={() => handleDelete(img.id)}
                              className="flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
