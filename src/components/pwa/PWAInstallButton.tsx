import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, ShieldCheck } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed in standalone mode, show subtle indicator or hide
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleAction}
        className={`flex items-center gap-2 rounded-lg border border-[#d4af37]/40 bg-[#161a22] text-[#e6c875] hover:bg-[#1f2530] hover:border-[#d4af37] transition font-medium text-xs shadow-sm ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-2'
        }`}
        title="Install WorldForge on your Android or mobile device"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>{compact ? 'Install App' : 'Install on Mobile'}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303846] bg-[#12151b] p-6 shadow-2xl text-[#dcdfe4]">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-white">Install WorldForge</h3>
                  <p className="text-[11px] text-[#8e95a5]">Mobile-first Progressive Web App (PWA)</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-[#1d222c] text-[#8e95a5] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-[#b4bac7]">
              <div className="p-3 rounded-xl bg-[#181c24] border border-[#262c3a] space-y-2">
                <div className="flex items-center gap-2 font-medium text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>Architecture Note: PWA vs Native APK</span>
                </div>
                <p className="text-[11px] text-[#9aa2b4]">
                  WorldForge runs as a high-performance, mobile-first <strong>Progressive Web App</strong> with full local IndexedDB offline storage. It installs directly to your Android home screen and app drawer without requiring the Google Play Store.
                </p>
              </div>

              {isAndroid || !isIOS ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-[#d4af37]">
                    How to Install on Android:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#cad0dc]">
                    <li>Tap the <strong>three dots menu (⋮)</strong> in Chrome or your Android browser.</li>
                    <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                    <li>Confirm by tapping <strong>Install</strong>.</li>
                    <li>Launch from your Android app drawer or home screen with fullscreen immersive view!</li>
                  </ol>
                </div>
              ) : null}

              {isIOS && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-[#d4af37]">
                    How to Install on iPhone / iPad:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#cad0dc]">
                    <li>Tap the <strong>Share</strong> button in Safari&apos;s bottom toolbar.</li>
                    <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top right corner.</li>
                  </ol>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#141820] border border-[#232938] space-y-2 text-[11px] text-[#8b92a2]">
                <div>
                  <strong className="text-white">Need a standalone .apk file?</strong>
                </div>
                <p>
                  You can generate a signed Android <code>.apk</code> or <code>.aab</code> package directly via PWABuilder (backed by Google Bubblewrap):
                </p>
                <a
                  href="https://www.pwabuilder.com/reportcard?site=https://ais-pre-atopno2yo75ebv3mzaa3f3-748704448533.europe-west2.run.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c99a3e] text-black font-semibold text-xs hover:bg-[#dfb04e] transition"
                >
                  <span>Generate Android APK (PWABuilder)</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl bg-[#262d3a] py-2.5 text-xs font-semibold text-[#e5e7eb] hover:bg-[#323b4c] transition shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
