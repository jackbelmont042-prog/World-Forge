import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Compass,
  Search,
  BookOpen,
  Moon,
  Sun,
  Plus,
  Settings,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentWorld,
    worlds,
    switchWorld,
    theme,
    setTheme,
    setIsCreationWizardOpen,
    setIsLibraryOpen,
    setIsGlobalSearchOpen,
    setIsSettingsOpen,
    setIsGeneratorOpen,
  } = useWorld();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#262c38] bg-[#0f1115]/95 px-3 sm:px-6 backdrop-blur-md">
      {/* Brand & World Selector */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setIsLibraryOpen(true)}
          className="flex cursor-pointer items-center gap-2 group"
          title="WorldForge Library"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d4af37]/40 bg-[#161a22] shadow-inner group-hover:border-[#d4af37] transition">
            <Compass className="h-4 w-4 text-[#d4af37] animate-spin-slow" />
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-sm font-bold tracking-wider text-[#f5d99b]">WORLDFORGE</span>
          </div>
        </div>

        <div className="h-4 w-px bg-[#262c38] hidden sm:block" />

        {/* World Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-[#2c3342] bg-[#141820] px-2.5 py-1 text-xs font-medium text-[#cad0dc] hover:border-[#d4af37]/60 hover:text-white transition"
          >
            <span className="max-w-[130px] sm:max-w-[200px] truncate font-serif text-[#e4c478]">
              {currentWorld?.name || 'Select Universe'}
            </span>
            <ChevronDown className="h-3 w-3 text-[#8b92a2]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-[#303846] bg-[#12151b] py-1.5 shadow-2xl z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b92a2] border-b border-[#232936]">
                Universes ({worlds.length})
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {worlds.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      switchWorld(w.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition ${
                      w.id === currentWorld?.id
                        ? 'bg-[#d4af37]/15 text-[#f5d99b] font-medium'
                        : 'text-[#cad0dc] hover:bg-[#1a1f29] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{w.name}</span>
                    <span className="text-[10px] text-[#717887] uppercase ml-2">{w.genre}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[#232936] pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsCreationWizardOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#d4af37] hover:bg-[#1c222c] transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create New Universe</span>
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLibraryOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#9aa2b4] hover:bg-[#1c222c] hover:text-white transition"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Manage All Worlds</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Global Search Button */}
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[#2c3342] bg-[#141820] px-2.5 py-1.5 text-xs text-[#8e95a5] hover:border-[#d4af37]/60 hover:text-white transition"
          title="Search all entities (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5 text-[#d4af37]" />
          <span className="hidden md:inline">Search Universe...</span>
          <kbd className="hidden lg:inline text-[9px] bg-[#1e2430] border border-[#303846] px-1 py-0.5 rounded text-[#778091]">
            ⌘K
          </kbd>
        </button>

        {/* AI / Generator Tool */}
        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/40 bg-[#191d26] px-2.5 py-1.5 text-xs font-medium text-[#f5d99b] hover:border-[#d4af37] transition"
          title="Generation Studio (AI & Offline Codex)"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
          <span className="hidden sm:inline">Generator</span>
        </button>

        {/* PWA Install */}
        <PWAInstallButton compact />

        {/* Theme Toggle (Dark / Parchment) */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'parchment' : 'dark')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2c3342] bg-[#141820] text-[#cad0dc] hover:border-[#d4af37] hover:text-[#d4af37] transition"
          title={theme === 'dark' ? 'Switch to Parchment Reading Mode' : 'Switch to Obsidian Night Mode'}
        >
          {theme === 'dark' ? <BookOpen className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Settings Modal */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2c3342] bg-[#141820] text-[#cad0dc] hover:border-[#d4af37] hover:text-[#d4af37] transition"
          title="Settings & Storage"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
