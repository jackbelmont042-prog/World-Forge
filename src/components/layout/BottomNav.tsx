import React, { useState } from 'react';
import { useWorld, NavTab } from '../../context/WorldContext';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Clock,
  Compass,
  Grid,
  Shield,
  Crown,
  Sparkles,
  Bug,
  Globe2,
  Zap,
  Flame,
  Scroll,
  Sword,
  StickyNote,
  Share2,
  Download,
  X,
} from 'lucide-react';

interface ModuleItem {
  id: NavTab;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, stats, clearSelectedEntity } = useWorld();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const modules: ModuleItem[] = [
    { id: 'dashboard', label: 'Dashboard', category: 'Core', icon: LayoutDashboard },
    { id: 'characters', label: 'Characters', category: 'Cast', icon: Users, badge: stats.charactersCount },
    { id: 'locations', label: 'Locations Atlas', category: 'Atlas', icon: MapPin, badge: stats.locationsCount },
    { id: 'map', label: 'Interactive Map', category: 'Atlas', icon: Compass },
    { id: 'timeline', label: 'Historical Timeline', category: 'Chronicles', icon: Clock, badge: stats.eventsCount },
    { id: 'quests', label: 'Quests & Plots', category: 'Chronicles', icon: Scroll, badge: stats.questsCount },
    { id: 'politics', label: 'Kingdoms & Politics', category: 'Nations', icon: Crown },
    { id: 'factions', label: 'Factions & Guilds', category: 'Nations', icon: Shield, badge: stats.factionsCount },
    { id: 'speciesCultures', label: 'Species & Cultures', category: 'Peoples', icon: Globe2 },
    { id: 'systems', label: 'Magic & Tech Rules', category: 'Systems', icon: Zap },
    { id: 'creatures', label: 'Bestiary & Fauna', category: 'Fauna', icon: Bug, badge: stats.creaturesCount },
    { id: 'religions', label: 'Religions & Myths', category: 'Beliefs', icon: Flame },
    { id: 'items', label: 'Relics & Equipment', category: 'Artifacts', icon: Sword, badge: stats.itemsCount },
    { id: 'lore', label: 'Lore Encyclopedia', category: 'Knowledge', icon: Scroll },
    { id: 'graph', label: 'Knowledge Graph', category: 'Knowledge', icon: Share2 },
    { id: 'notes', label: 'Scratchpad Notes', category: 'Drafts', icon: StickyNote, badge: stats.unresolvedNotes },
    { id: 'generator', label: 'Creative Generator', category: 'Tools', icon: Sparkles },
    { id: 'exportImport', label: 'Backup & Export', category: 'Tools', icon: Download },
  ];

  const handleSelectTab = (tab: NavTab) => {
    clearSelectedEntity();
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Sticky Bottom Bar (Touch friendly, >=44px touch targets) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 w-full items-center justify-around border-t border-[#262c38] bg-[#0c0e12]/95 px-2 backdrop-blur-lg sm:hidden">
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 transition ${
            activeTab === 'dashboard' ? 'text-[#f5d99b]' : 'text-[#858d9e] hover:text-[#cad0dc]'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => handleSelectTab('characters')}
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 transition relative ${
            activeTab === 'characters' ? 'text-[#f5d99b]' : 'text-[#858d9e] hover:text-[#cad0dc]'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium">Cast</span>
          {stats.charactersCount > 0 && (
            <span className="absolute top-1 right-2 text-[9px] font-bold text-[#d4af37]">
              {stats.charactersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectTab('map')}
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 transition ${
            activeTab === 'map' || activeTab === 'locations' ? 'text-[#f5d99b]' : 'text-[#858d9e] hover:text-[#cad0dc]'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-medium">Atlas</span>
        </button>

        <button
          onClick={() => handleSelectTab('timeline')}
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 transition ${
            activeTab === 'timeline' || activeTab === 'quests' ? 'text-[#f5d99b]' : 'text-[#858d9e] hover:text-[#cad0dc]'
          }`}
        >
          <Clock className="h-5 w-5" />
          <span className="text-[10px] font-medium">History</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-1 transition ${
            isDrawerOpen ? 'text-[#d4af37]' : 'text-[#858d9e] hover:text-[#cad0dc]'
          }`}
        >
          <Grid className="h-5 w-5" />
          <span className="text-[10px] font-medium">Modules</span>
        </button>
      </nav>

      {/* Desktop / Tablet Sub-Navigation Sidebar / Tab Strip */}
      <aside className="hidden sm:flex border-r border-[#262c38] bg-[#0c0e12] w-56 flex-col justify-between p-3 shrink-0">
        <div className="space-y-1 overflow-y-auto pr-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#636b7b]">
            World Studio
          </div>
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleSelectTab(mod.id)}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#d4af37]/15 text-[#f5d99b] border border-[#d4af37]/40 shadow-xs'
                    : 'text-[#9098a7] hover:bg-[#161a22] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#d4af37]' : 'text-[#707887]'}`} />
                  <span className="truncate">{mod.label}</span>
                </div>
                {mod.badge !== undefined && mod.badge > 0 && (
                  <span className="text-[10px] text-[#717887] font-sans tabular-nums">
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Studio Info Card */}
        <div className="mt-3 p-3 rounded-xl border border-[#232936] bg-[#12151c] text-[11px] text-[#7f8695]">
          <div className="flex items-center gap-2 text-white font-serif text-xs mb-1">
            <Compass className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>WorldForge Local</span>
          </div>
          <p className="leading-snug">Persistent IndexedDB active. Offline ready.</p>
        </div>
      </aside>

      {/* Mobile Expandable All-Modules Bottom Sheet Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-xs sm:hidden">
          <div className="max-h-[85vh] w-full rounded-t-3xl border-t border-[#303846] bg-[#12151b] p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white">Worldbuilding Modules</h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-[#1d222c] text-[#8e95a5] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 grid grid-cols-2 gap-2 mt-2">
              {modules.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeTab === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelectTab(mod.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left text-xs transition border ${
                      isActive
                        ? 'border-[#d4af37]/60 bg-[#d4af37]/15 text-[#f5d99b]'
                        : 'border-[#232936] bg-[#161a22] text-[#cad0dc] hover:border-[#384152]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#d4af37]' : 'text-[#8e95a5]'}`} />
                    <div className="truncate">
                      <div className="font-medium truncate">{mod.label}</div>
                      {mod.badge !== undefined && (
                        <div className="text-[10px] text-[#717887]">{mod.badge} entries</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
