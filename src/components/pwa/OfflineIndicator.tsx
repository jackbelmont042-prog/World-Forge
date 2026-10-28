import React, { useEffect, useState } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotice(true);
      setTimeout(() => setShowNotice(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showNotice) return null;

  return (
    <div
      className={`fixed bottom-16 sm:bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium shadow-xl transition-all ${
        !isOnline
          ? 'bg-[#2a1e12] border border-[#d4af37]/60 text-[#f5d99b]'
          : 'bg-[#12281e] border border-emerald-500/50 text-emerald-300'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Offline Mode Active — 100% Local Storage</span>
        </>
      ) : (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Connection Restored</span>
        </>
      )}
    </div>
  );
};
