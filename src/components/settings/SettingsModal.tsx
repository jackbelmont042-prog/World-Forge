import React from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { SAMPLE_WORLD_PACKAGE } from '../../services/seedData';
import { Settings, X, Database, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, stats, currentWorld, refreshWorldData, switchWorld } = useWorld();

  if (!isSettingsOpen) return null;

  const handleResetSampleWorld = async () => {
    if (confirm('Re-import the default "The Shattered Reach" sample universe? Any custom changes to that sample will be refreshed.')) {
      await db.importWorldPackage(SAMPLE_WORLD_PACKAGE, true);
      await switchWorld(SAMPLE_WORLD_PACKAGE.world.id);
      await refreshWorldData();
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-[#303846] bg-[#12151b] shadow-2xl overflow-hidden flex flex-col text-[#cad0dc] my-auto">
        <div className="flex items-center justify-between border-b border-[#232936] px-5 py-4 bg-[#141822]">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#d4af37]" />
            <h3 className="font-serif text-base font-semibold text-white">WorldForge Settings & Storage</h3>
          </div>
          <button onClick={() => setIsSettingsOpen(false)} className="text-[#8e95a5] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-[#a0a8b8] leading-relaxed">
          {/* Storage & Privacy Information */}
          <div className="p-4 rounded-xl border border-[#232936] bg-[#151922] space-y-2">
            <div className="flex items-center gap-2 text-white font-serif font-semibold text-xs">
              <Database className="h-4 w-4 text-[#d4af37]" />
              <span>Local Storage & Privacy Guarantee</span>
            </div>
            <p>
              All world data, character dossiers, cartographic markers, and chronicle notes are stored safely inside your browser or device&apos;s <strong>IndexedDB local database</strong>.
            </p>
            <p>
              Your content stays private on your phone or computer. Nothing is transmitted to external servers without your direct request.
            </p>
            <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#cad0dc]">
              <span>Active World: <strong className="text-white">{currentWorld?.name}</strong></span>
              <span>·</span>
              <span>Characters: {stats.charactersCount}</span>
              <span>·</span>
              <span>Locations: {stats.locationsCount}</span>
              <span>·</span>
              <span>Chronicles: {stats.eventsCount}</span>
            </div>
          </div>

          {/* Android Mobile PWA & Native APK Packaging Guide */}
          <div className="p-4 rounded-xl border border-[#232936] bg-[#151922] space-y-3">
            <div className="flex items-center gap-2 text-white font-serif font-semibold text-xs">
              <Smartphone className="h-4 w-4 text-[#d4af37]" />
              <span>Android Testing & APK Installation</span>
            </div>
            
            <div className="p-3 rounded-lg border border-[#374151] bg-[#10141d] space-y-2">
              <div className="text-[11px] font-semibold text-[#f3d99b]">Method 1: Direct 1-Click APK Generator (Recommended)</div>
              <p className="text-[11px] text-[#cad0dc]">
                Use the official PWABuilder service (created by Microsoft &amp; Google) to automatically package this PWA into an installable signed <code>.apk</code> or <code>.aab</code> bundle for your phone:
              </p>
              <a
                href="https://www.pwabuilder.com/reportcard?site=https://ais-pre-atopno2yo75ebv3mzaa3f3-748704448533.europe-west2.run.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c99a3e] text-black font-semibold text-xs hover:bg-[#dfb04e] transition"
              >
                <span>Open PWABuilder APK Generator</span>
                <span className="text-[10px]">↗</span>
              </a>
              <p className="text-[10px] text-[#8e95a5]">
                On PWABuilder: Click <strong>&quot;Package for Stores&quot;</strong> &rarr; Choose <strong>&quot;Android&quot;</strong> &rarr; Click <strong>&quot;Generate&quot;</strong> to download the zip containing your signed <code>app-release-signed.apk</code>.
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-[#cad0dc]">
              <div className="font-semibold text-white">Method 2: Instant Installation without APK File</div>
              <p>
                Open WorldForge in Chrome on your Android phone. Tap Chrome&apos;s menu (<strong>⋮</strong>) and choose <strong>&quot;Install app&quot;</strong> or tap the <strong>&quot;Install App&quot;</strong> button in the header. It creates a native Android home screen icon, runs full-screen with offline storage, and requires no APK download.
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-[#cad0dc] pt-1">
              <div className="font-semibold text-white">Method 3: Build APK from Source via CLI</div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[10px] text-[#8e95a5]">
                <li>Google Bubblewrap: <code>npx @bubblewrap/cli init --manifest=https://ais-pre-atopno2yo75ebv3mzaa3f3-748704448533.europe-west2.run.app/manifest.webmanifest && bubblewrap build</code></li>
                <li>Capacitor: <code>npm i @capacitor/core @capacitor/android && npx cap init && npx cap add android</code></li>
              </ol>
            </div>
          </div>

          {/* Re-seed Sample World */}
          <div className="p-4 rounded-xl border border-[#232936] bg-[#151922] flex items-center justify-between gap-3">
            <div>
              <div className="text-white font-semibold text-xs mb-0.5">Restore Sample Universe</div>
              <p className="text-[11px] text-[#8e95a5]">
                Reset or re-import the &quot;The Shattered Reach&quot; demo universe dataset.
              </p>
            </div>
            <button
              onClick={handleResetSampleWorld}
              className="flex items-center gap-1 rounded-xl border border-[#2b3342] px-3 py-1.5 text-xs text-[#d4af37] hover:border-[#d4af37]"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Restore</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
