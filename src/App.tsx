/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorldProvider, useWorld } from './context/WorldContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { WorldDashboard } from './components/dashboard/WorldDashboard';
import { CharacterEncyclopedia } from './components/characters/CharacterEncyclopedia';
import { LocationAtlas } from './components/locations/LocationAtlas';
import { InteractiveMapCanvas } from './components/map/InteractiveMapCanvas';
import { PoliticsModule } from './components/politics/PoliticsModule';
import { FactionsModule } from './components/factions/FactionsModule';
import { SpeciesCulturesModule } from './components/species/SpeciesCulturesModule';
import { MagicTechSystemsModule } from './components/systems/MagicTechSystemsModule';
import { BestiaryModule } from './components/bestiary/BestiaryModule';
import { TimelineModule } from './components/timeline/TimelineModule';
import { ReligionsModule } from './components/religions/ReligionsModule';
import { QuestsModule } from './components/quests/QuestsModule';
import { LoreKnowledgeGraph } from './components/lore/LoreKnowledgeGraph';
import { ItemsModule } from './components/items/ItemsModule';
import { NotesScratchpad } from './components/notes/NotesScratchpad';
import { BackupExportModule } from './components/export/BackupExportModule';
import { WorldLibraryModal } from './components/worlds/WorldLibraryModal';
import { WorldCreationWizard } from './components/worlds/WorldCreationWizard';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { GenerationAssistantModal } from './components/generator/GenerationAssistantModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Compass } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, loading, currentWorld, setIsCreationWizardOpen } = useWorld();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0f1115] text-[#cad0dc]">
        <Compass className="h-12 w-12 text-[#d4af37] animate-spin-slow mb-3" />
        <h2 className="font-serif text-lg font-bold text-white tracking-wider">IGNITING WORLDFORGE</h2>
        <p className="text-xs text-[#8e95a5] mt-1">Summoning local archives and cartographic grids...</p>
      </div>
    );
  }

  if (!currentWorld) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0f1115] text-center p-6 text-[#cad0dc]">
        <Compass className="h-14 w-14 text-[#d4af37] mb-3" />
        <h2 className="font-serif text-xl font-bold text-white mb-2">Welcome to WorldForge Studio</h2>
        <p className="text-xs text-[#8e95a5] max-w-sm mb-4 leading-relaxed">
          Create, manage, and chronicle your fictional universes offline with local IndexedDB storage.
        </p>
        <button
          onClick={() => setIsCreationWizardOpen(true)}
          className="rounded-xl bg-[#d4af37] px-5 py-2.5 text-xs font-semibold text-black hover:bg-[#e4bf47] shadow-lg"
        >
          Forge Your First Universe
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0f1115] text-[#cad0dc]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <BottomNav />

        {activeTab === 'map' ? (
          <main className="flex-1 overflow-hidden p-0 bg-[#0c0f14]">
            <InteractiveMapCanvas />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-manuscript">
            <div className="mx-auto max-w-6xl">
              {activeTab === 'dashboard' && <WorldDashboard />}
              {activeTab === 'characters' && <CharacterEncyclopedia />}
              {activeTab === 'locations' && <LocationAtlas />}
              {activeTab === 'politics' && <PoliticsModule />}
            {activeTab === 'factions' && <FactionsModule />}
            {activeTab === 'speciesCultures' && <SpeciesCulturesModule />}
            {activeTab === 'systems' && <MagicTechSystemsModule />}
            {activeTab === 'creatures' && <BestiaryModule />}
            {activeTab === 'timeline' && <TimelineModule />}
            {activeTab === 'religions' && <ReligionsModule />}
            {activeTab === 'quests' && <QuestsModule />}
            {activeTab === 'items' && <ItemsModule />}
            {(activeTab === 'lore' || activeTab === 'graph') && <LoreKnowledgeGraph />}
            {activeTab === 'notes' && <NotesScratchpad />}
            {activeTab === 'generator' && <WorldDashboard />}
            {activeTab === 'exportImport' && <BackupExportModule />}
          </div>
        </main>
      )}
      </div>

      {/* Global Modals & Indicators */}
      <WorldLibraryModal />
      <WorldCreationWizard />
      <GlobalSearchModal />
      <SettingsModal />
      <GenerationAssistantModal />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <WorldProvider>
      <MainContent />
    </WorldProvider>
  );
}
