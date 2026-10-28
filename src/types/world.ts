export type WorldGenre =
  | 'high-fantasy'
  | 'dark-fantasy'
  | 'low-fantasy'
  | 'science-fantasy'
  | 'sci-fi'
  | 'post-apocalyptic'
  | 'historical'
  | 'custom';

export type TechLevel =
  | 'stone-age'
  | 'bronze-age'
  | 'medieval'
  | 'renaissance'
  | 'steampunk'
  | 'industrial'
  | 'modern'
  | 'sci-fi'
  | 'futuristic'
  | 'custom';

export type MagicLevel = 'none' | 'low' | 'medium' | 'high' | 'wild' | 'custom';

export type WorldTone = 'hopeful' | 'epic' | 'grim' | 'mysterious' | 'whimsical' | 'custom';

export type WorldStructure = 'planet' | 'continent' | 'archipelago' | 'realm' | 'multiverse' | 'custom';

export interface World {
  id: string;
  name: string;
  description: string;
  genre: WorldGenre;
  customGenre?: string;
  techLevel: TechLevel;
  customTechLevel?: string;
  magicLevel: MagicLevel;
  customMagicLevel?: string;
  tone: WorldTone;
  customTone?: string;
  structure: WorldStructure;
  customStructure?: string;
  themes: string[];
  era: string;
  coverUrl?: string;
  privateNotes?: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  dashboardSections?: string[];
}

export type EntityType =
  | 'character'
  | 'location'
  | 'political'
  | 'faction'
  | 'species'
  | 'culture'
  | 'language'
  | 'magicSystem'
  | 'creature'
  | 'event'
  | 'religion'
  | 'quest'
  | 'lore'
  | 'item'
  | 'note'
  | 'map';

export interface EntityLink {
  id: string;
  sourceId: string;
  sourceType: EntityType;
  targetId: string;
  targetType: EntityType;
  relationship: string; // e.g. "Rules", "Allied With", "Inhabits", "Worships", "Created"
  isBidirectional?: boolean;
}

export type CharacterRelationType =
  | 'friend'
  | 'enemy'
  | 'mentor'
  | 'student'
  | 'rival'
  | 'sibling'
  | 'parent'
  | 'child'
  | 'spouse'
  | 'ally'
  | 'ruler'
  | 'subject'
  | 'custom';

export interface CharacterRelationship {
  id: string;
  targetCharacterId: string;
  type: CharacterRelationType;
  customType?: string;
  description?: string;
}

export interface Character {
  id: string;
  worldId: string;
  name: string;
  aliases: string[];
  titles: string[];
  avatarUrl?: string;
  speciesId?: string;
  speciesName?: string;
  age?: string;
  lifespan?: string;
  gender?: string;
  status: 'living' | 'deceased' | 'undead' | 'missing' | 'ascended' | 'unknown';
  occupation?: string;
  homeLocationId?: string;
  factionIds: string[];
  appearance: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  skills: string[];
  goals: string;
  fears: string;
  secrets: string;
  backstory: string;
  relationships: CharacterRelationship[];
  family: {
    parentIds: string[];
    childIds: string[];
    spouseIds: string[];
    siblingIds: string[];
  };
  itemIds: string[];
  timelineEvents: { year: string; title: string; description: string }[];
  tags: string[];
  customFields: { label: string; value: string }[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type LocationType =
  | 'continent'
  | 'kingdom'
  | 'province'
  | 'city'
  | 'village'
  | 'town'
  | 'castle'
  | 'dungeon'
  | 'ruins'
  | 'forest'
  | 'mountain'
  | 'river'
  | 'ocean'
  | 'island'
  | 'plane'
  | 'custom';

export interface Location {
  id: string;
  worldId: string;
  name: string;
  alternateNames: string[];
  type: LocationType;
  customType?: string;
  description: string;
  imageUrl?: string;
  parentId?: string; // hierarchical parent
  climate: string;
  population: string;
  government: string;
  culture: string;
  languages: string[];
  economy: string;
  controllingFactionId?: string;
  secrets: string;
  travelInfo: string;
  mapCoordinates?: { x: number; y: number };
  mapId?: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type GovernmentType =
  | 'monarchy'
  | 'republic'
  | 'empire'
  | 'theocracy'
  | 'federation'
  | 'city-state'
  | 'tribal'
  | 'magocracy'
  | 'custom';

export interface DiplomaticRelation {
  targetEntityId: string;
  status: 'alliance' | 'neutral' | 'rivalry' | 'war' | 'vassal' | 'truce';
  notes?: string;
}

export interface PoliticalEntity {
  id: string;
  worldId: string;
  name: string;
  emblem?: string;
  governmentType: GovernmentType;
  customGovernmentType?: string;
  rulerId?: string;
  rulerTitle?: string;
  capitalLocationId?: string;
  territoryLocationIds: string[];
  laws: string;
  militaryStrength: string;
  economicSystem: string;
  resources: string[];
  currentStability: 'stable' | 'fragile' | 'crisis' | 'revolution' | 'golden-age';
  diplomaticRelations: DiplomaticRelation[];
  successionRules: string;
  conflicts: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type FactionCategory =
  | 'guild'
  | 'religious-order'
  | 'secret-society'
  | 'mercenary'
  | 'military'
  | 'criminal'
  | 'adventurers'
  | 'scholarly'
  | 'political'
  | 'custom';

export interface FactionRank {
  rank: number;
  title: string;
  description: string;
}

export interface Faction {
  id: string;
  worldId: string;
  name: string;
  symbol?: string;
  category: FactionCategory;
  customCategory?: string;
  description: string;
  purpose: string;
  leaderId?: string;
  headquartersLocationId?: string;
  memberIds: string[];
  ideology: string;
  resources: string;
  ranks: FactionRank[];
  allies: string[];
  enemies: string[];
  secrets: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Species {
  id: string;
  worldId: string;
  name: string;
  appearance: string;
  physiology: string;
  lifespan: string;
  abilities: string[];
  limitations: string[];
  habitat: string;
  society: string;
  variants: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Culture {
  id: string;
  worldId: string;
  name: string;
  traditions: string;
  values: string;
  customs: string;
  clothing: string;
  food: string;
  socialStructure: string;
  taboos: string;
  festivals: string;
  namingConventions: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyWord {
  word: string;
  translation: string;
  partOfSpeech?: string;
  notes?: string;
}

export interface Language {
  id: string;
  worldId: string;
  name: string;
  writingSystem: string;
  phonetics: string;
  grammar: string;
  vocabulary: VocabularyWord[];
  samplePhrases: { phrase: string; translation: string }[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MagicOrTechSystem {
  id: string;
  worldId: string;
  name: string;
  type: 'magic' | 'technology' | 'hybrid';
  sources: string;
  users: string;
  learningMethod: string;
  rulesAndLimitations: string;
  costsAndConsequences: string;
  categoriesOrSchools: string[];
  abilitiesOrSpells: { name: string; level: string; description: string; cost: string }[];
  forbiddenPractices: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreatureThreat = 'harmless' | 'low' | 'moderate' | 'dangerous' | 'cataclysmic' | 'legendary';

export interface Creature {
  id: string;
  worldId: string;
  name: string;
  classification:
    | 'monster'
    | 'beast'
    | 'dragon'
    | 'spirit'
    | 'undead'
    | 'magical-beast'
    | 'artificial'
    | 'aberration'
    | 'custom';
  threatLevel: CreatureThreat;
  appearance: string;
  habitat: string;
  behavior: string;
  intelligence: 'animalistic' | 'instinctual' | 'semi-intelligent' | 'humanoid' | 'transcendent';
  diet: string;
  abilities: string[];
  weaknesses: string[];
  culturalSignificance: string;
  knownLocationIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | 'war'
  | 'treaty'
  | 'dynasty'
  | 'disaster'
  | 'discovery'
  | 'migration'
  | 'revolution'
  | 'religion'
  | 'milestone'
  | 'custom';

export interface HistoricalEvent {
  id: string;
  worldId: string;
  title: string;
  name?: string;
  date: string;
  numericSortYear: number;
  era: string;
  category: EventCategory;
  description: string;
  causes: string;
  consequences: string;
  characterIds: string[];
  locationIds: string[];
  factionIds: string[];
  politicalEntityIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PantheonDeity {
  name: string;
  domain: string;
  symbol: string;
  myth: string;
}

export interface Religion {
  id: string;
  worldId: string;
  name: string;
  pantheonDeities: PantheonDeity[];
  beliefs: string;
  originMyth: string;
  disputedVersions: string[];
  sacredTexts: string;
  symbols: string;
  rituals: string;
  holidays: string;
  followersDescription: string;
  associatedLocationIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type QuestType = 'main-quest' | 'side-quest' | 'character-arc' | 'political-plot' | 'mystery' | 'legend';
export type QuestStatus = 'unstarted' | 'in-progress' | 'completed' | 'abandoned' | 'foreshadowed';

export interface QuestMilestone {
  id: string;
  text: string;
  done: boolean;
}

export interface Quest {
  id: string;
  worldId: string;
  title: string;
  name?: string;
  type: QuestType;
  status: QuestStatus;
  summary: string;
  mainObjective: string;
  milestones: QuestMilestone[];
  characterIds: string[];
  locationIds: string[];
  factionIds: string[];
  prerequisites: string;
  outcomes: string;
  rewards: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoreEntry {
  id: string;
  worldId: string;
  title: string;
  name?: string;
  category: string;
  content: string;
  relatedEntityIds: { entityId: string; entityType: EntityType; relationshipLabel: string }[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'mythic' | 'unique';

export interface Item {
  id: string;
  worldId: string;
  name: string;
  type: 'weapon' | 'armor' | 'artifact' | 'potion' | 'relic' | 'book' | 'tool' | 'currency' | 'material' | 'custom';
  rarity: ItemRarity;
  description: string;
  creatorId?: string;
  ownerId?: string;
  locationId?: string;
  abilities: string[];
  history: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  worldId: string;
  title: string;
  content: string;
  status: 'unresolved' | 'accepted' | 'discarded';
  pinned: boolean;
  linkedEntityId?: string;
  linkedEntityType?: EntityType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MapMarker {
  id: string;
  locationId?: string;
  name: string;
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  icon: string; // pin type: 'city', 'castle', 'mountain', 'ruin', 'dungeon', 'port', 'camp'
  description?: string;
}

export interface WorldMap {
  id: string;
  worldId: string;
  title: string;
  imageUrl?: string; // custom upload or parchment generator
  mapType: 'world' | 'continent' | 'region' | 'city' | 'dungeon';
  markers: MapMarker[];
  createdAt: string;
  updatedAt: string;
}

export interface FullWorldPackage {
  schemaVersion: number;
  exportedAt: string;
  world: World;
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
}
