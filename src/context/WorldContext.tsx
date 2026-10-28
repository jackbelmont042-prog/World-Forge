import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  World,
  Character,
  Location,
  PoliticalEntity,
  Faction,
  Species,
  Culture,
  Language,
  MagicOrTechSystem,
  Creature,
  HistoricalEvent,
  Religion,
  Quest,
  LoreEntry,
  Item,
  Note,
  WorldMap,
  EntityLink,
  EntityType,
} from '../types/world';
import { db } from '../services/db';

export type NavTab =
  | 'dashboard'
  | 'characters'
  | 'locations'
  | 'map'
  | 'politics'
  | 'factions'
  | 'speciesCultures'
  | 'systems'
  | 'creatures'
  | 'timeline'
  | 'religions'
  | 'quests'
  | 'items'
  | 'lore'
  | 'graph'
  | 'notes'
  | 'generator'
  | 'exportImport';

interface WorldContextType {
  currentWorld: World | null;
  worlds: World[];
  theme: 'dark' | 'parchment';
  setTheme: (theme: 'dark' | 'parchment') => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedEntity: { type: EntityType; id: string } | null;
  openEntity: (type: EntityType, id: string) => void;
  clearSelectedEntity: () => void;
  isLibraryOpen: boolean;
  setIsLibraryOpen: (open: boolean) => void;
  isCreationWizardOpen: boolean;
  setIsCreationWizardOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isGeneratorOpen: boolean;
  setIsGeneratorOpen: (open: boolean) => void;
  generatorCategorySeed?: string;
  openGeneratorWithCategory: (category: string) => void;

  // Data cache for active world
  characters: Character[];
  locations: Location[];
  politicalEntities: PoliticalEntity[];
  factions: Faction[];
  species: Species[];
  cultures: Culture[];
  languages: Language[];
  magicOrTechSystems: MagicOrTechSystem[];
  creatures: Creature[];
  historicalEvents: HistoricalEvent[];
  religions: Religion[];
  quests: Quest[];
  loreEntries: LoreEntry[];
  items: Item[];
  notes: Note[];
  maps: WorldMap[];
  links: EntityLink[];

  stats: {
    charactersCount: number;
    locationsCount: number;
    factionsCount: number;
    eventsCount: number;
    questsCount: number;
    activeQuests: number;
    completedQuests: number;
    itemsCount: number;
    creaturesCount: number;
    unresolvedNotes: number;
  };

  loading: boolean;
  refreshWorldData: () => Promise<void>;
  switchWorld: (worldId: string) => Promise<void>;
  saveCurrentWorld: (world: World) => Promise<void>;
}

const WorldContext = createContext<WorldContextType | undefined>(undefined);

export const WorldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [currentWorld, setCurrentWorld] = useState<World | null>(null);
  const [theme, setThemeState] = useState<'dark' | 'parchment'>('dark');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedEntity, setSelectedEntity] = useState<{ type: EntityType; id: string } | null>(null);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isCreationWizardOpen, setIsCreationWizardOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorCategorySeed, setGeneratorCategorySeed] = useState<string | undefined>(undefined);

  // Entities
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [politicalEntities, setPoliticalEntities] = useState<PoliticalEntity[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [magicOrTechSystems, setMagicOrTechSystems] = useState<MagicOrTechSystem[]>([]);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<HistoricalEvent[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [maps, setMaps] = useState<WorldMap[]>([]);
  const [links, setLinks] = useState<EntityLink[]>([]);

  const [stats, setStats] = useState({
    charactersCount: 0,
    locationsCount: 0,
    factionsCount: 0,
    eventsCount: 0,
    questsCount: 0,
    activeQuests: 0,
    completedQuests: 0,
    itemsCount: 0,
    creaturesCount: 0,
    unresolvedNotes: 0,
  });

  const [loading, setLoading] = useState(true);

  // Apply theme to document
  const setTheme = useCallback(async (newTheme: 'dark' | 'parchment') => {
    setThemeState(newTheme);
    if (newTheme === 'parchment') {
      document.documentElement.classList.add('theme-parchment');
    } else {
      document.documentElement.classList.remove('theme-parchment');
    }
    await db.setSetting('app_theme', newTheme);
  }, []);

  const refreshWorldData = useCallback(async () => {
    if (!currentWorld) return;
    const worldId = currentWorld.id;

    try {
      const [
        allWorlds,
        chars,
        locs,
        pols,
        facs,
        spcs,
        culs,
        langs,
        syss,
        crts,
        evts,
        rels,
        qsts,
        lores,
        itms,
        nts,
        mps,
        lnks,
        stts,
      ] = await Promise.all([
        db.getAll<World>('worlds'),
        db.getAll<Character>('characters', worldId),
        db.getAll<Location>('locations', worldId),
        db.getAll<PoliticalEntity>('politicalEntities', worldId),
        db.getAll<Faction>('factions', worldId),
        db.getAll<Species>('species', worldId),
        db.getAll<Culture>('cultures', worldId),
        db.getAll<Language>('languages', worldId),
        db.getAll<MagicOrTechSystem>('magicOrTechSystems', worldId),
        db.getAll<Creature>('creatures', worldId),
        db.getAll<HistoricalEvent>('historicalEvents', worldId),
        db.getAll<Religion>('religions', worldId),
        db.getAll<Quest>('quests', worldId),
        db.getAll<LoreEntry>('loreEntries', worldId),
        db.getAll<Item>('items', worldId),
        db.getAll<Note>('notes', worldId),
        db.getAll<WorldMap>('maps', worldId),
        db.getAll<EntityLink>('links', worldId),
        db.getWorldStats(worldId),
      ]);

      setWorlds(allWorlds);
      setCharacters(chars);
      setLocations(locs);
      setPoliticalEntities(pols);
      setFactions(facs);
      setSpecies(spcs);
      setCultures(culs);
      setLanguages(langs);
      setMagicOrTechSystems(syss);
      setCreatures(crts);
      setHistoricalEvents(evts);
      setReligions(rels);
      setQuests(qsts);
      setLoreEntries(lores);
      setItems(itms);
      setNotes(nts);
      setMaps(mps);
      setLinks(lnks);
      setStats(stts);
    } catch (err) {
      console.error('Failed to load world data:', err);
    }
  }, [currentWorld]);

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const savedTheme = await db.getSetting<'dark' | 'parchment'>('app_theme', 'dark');
        setTheme(savedTheme);

        const active = await db.initializeDefaultsIfEmpty();
        setCurrentWorld(active);
        const allWorlds = await db.getAll<World>('worlds');
        setWorlds(allWorlds);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [setTheme]);

  useEffect(() => {
    if (currentWorld) {
      refreshWorldData();
    }
  }, [currentWorld, refreshWorldData]);

  const switchWorld = async (worldId: string) => {
    const world = await db.get<World>('worlds', worldId);
    if (world) {
      setCurrentWorld(world);
      await db.setSetting('active_world_id', world.id);
      setSelectedEntity(null);
      setActiveTab('dashboard');
    }
  };

  const saveCurrentWorld = async (updated: World) => {
    await db.put('worlds', updated);
    setCurrentWorld(updated);
    const all = await db.getAll<World>('worlds');
    setWorlds(all);
  };

  const openEntity = (type: EntityType, id: string) => {
    setSelectedEntity({ type, id });
    switch (type) {
      case 'character':
        setActiveTab('characters');
        break;
      case 'location':
        setActiveTab('locations');
        break;
      case 'political':
        setActiveTab('politics');
        break;
      case 'faction':
        setActiveTab('factions');
        break;
      case 'species':
      case 'culture':
      case 'language':
        setActiveTab('speciesCultures');
        break;
      case 'magicSystem':
        setActiveTab('systems');
        break;
      case 'creature':
        setActiveTab('creatures');
        break;
      case 'event':
        setActiveTab('timeline');
        break;
      case 'religion':
        setActiveTab('religions');
        break;
      case 'quest':
        setActiveTab('quests');
        break;
      case 'item':
        setActiveTab('items');
        break;
      case 'lore':
        setActiveTab('lore');
        break;
      case 'note':
        setActiveTab('notes');
        break;
      case 'map':
        setActiveTab('map');
        break;
      default:
        break;
    }
  };

  const clearSelectedEntity = () => setSelectedEntity(null);

  const openGeneratorWithCategory = (cat: string) => {
    setGeneratorCategorySeed(cat);
    setIsGeneratorOpen(true);
  };

  return (
    <WorldContext.Provider
      value={{
        currentWorld,
        worlds,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        selectedEntity,
        openEntity,
        clearSelectedEntity,
        isLibraryOpen,
        setIsLibraryOpen,
        isCreationWizardOpen,
        setIsCreationWizardOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isGeneratorOpen,
        setIsGeneratorOpen,
        generatorCategorySeed,
        openGeneratorWithCategory,
        characters,
        locations,
        politicalEntities,
        factions,
        species,
        cultures,
        languages,
        magicOrTechSystems,
        creatures,
        historicalEvents,
        religions,
        quests,
        loreEntries,
        items,
        notes,
        maps,
        links,
        stats,
        loading,
        refreshWorldData,
        switchWorld,
        saveCurrentWorld,
      }}
    >
      {children}
    </WorldContext.Provider>
  );
};

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) throw new Error('useWorld must be used within a WorldProvider');
  return context;
}
