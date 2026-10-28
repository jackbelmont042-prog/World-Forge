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
  FullWorldPackage,
  EntityType,
} from '../types/world';
import { SAMPLE_WORLD_PACKAGE } from './seedData';

const DB_NAME = 'worldforge_db';
const DB_VERSION = 1;

type StoreName =
  | 'worlds'
  | 'characters'
  | 'locations'
  | 'politicalEntities'
  | 'factions'
  | 'species'
  | 'cultures'
  | 'languages'
  | 'magicOrTechSystems'
  | 'creatures'
  | 'historicalEvents'
  | 'religions'
  | 'quests'
  | 'loreEntries'
  | 'items'
  | 'notes'
  | 'maps'
  | 'links'
  | 'settings';

class WorldForgeDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        const stores: StoreName[] = [
          'worlds',
          'characters',
          'locations',
          'politicalEntities',
          'factions',
          'species',
          'cultures',
          'languages',
          'magicOrTechSystems',
          'creatures',
          'historicalEvents',
          'religions',
          'quests',
          'loreEntries',
          'items',
          'notes',
          'maps',
          'links',
          'settings',
        ];

        stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store)) {
            const os = db.createObjectStore(store, { keyPath: store === 'settings' ? 'key' : 'id' });
            if (store !== 'worlds' && store !== 'settings') {
              try {
                os.createIndex('worldId', 'worldId', { unique: false });
              } catch (e) {
                // ignore
              }
            }
          }
        });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Generic store read
  async getAll<T>(storeName: StoreName, worldId?: string): Promise<T[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      if (worldId && store.indexNames.contains('worldId')) {
        const index = store.index('worldId');
        const req = index.getAll(worldId);
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      } else {
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result as (T & { worldId?: string })[];
          if (worldId) {
            resolve(list.filter((item) => item.worldId === worldId) as T[]);
          } else {
            resolve(list as T[]);
          }
        };
        req.onerror = () => reject(req.error);
      }
    });
  }

  async get<T>(storeName: StoreName, id: string): Promise<T | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(id);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    });
  }

  async put<T extends { id?: string; key?: string; updatedAt?: string }>(
    storeName: StoreName,
    item: T
  ): Promise<T> {
    const db = await this.openDB();
    const toSave = {
      ...item,
      updatedAt: item.updatedAt || new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(toSave);
      req.onsuccess = () => resolve(toSave);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName: StoreName, id: string, worldId?: string): Promise<void> {
    const db = await this.openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Clean up references and links safely after deletion commits
    if (worldId && storeName !== 'links') {
      try {
        await this.cleanupDanglingReferences(id, worldId);
      } catch (e) {
        console.warn('Reference cleanup error:', e);
      }
    }
  }

  // Safe referential integrity: remove dangling links, character relationship targets, etc.
  private async cleanupDanglingReferences(deletedId: string, worldId?: string) {
    if (!worldId) return;

    // 1. Remove entity links matching deletedId
    const links = await this.getAll<EntityLink>('links', worldId);
    for (const link of links) {
      if (link.sourceId === deletedId || link.targetId === deletedId) {
        await this.delete('links', link.id);
      }
    }

    // 2. Clean character relationships referencing deletedId
    const chars = await this.getAll<Character>('characters', worldId);
    for (const char of chars) {
      let changed = false;
      const filteredRel = char.relationships.filter((r) => r.targetCharacterId !== deletedId);
      if (filteredRel.length !== char.relationships.length) {
        char.relationships = filteredRel;
        changed = true;
      }
      if (char.homeLocationId === deletedId) {
        char.homeLocationId = undefined;
        changed = true;
      }
      if (char.factionIds.includes(deletedId)) {
        char.factionIds = char.factionIds.filter((f) => f !== deletedId);
        changed = true;
      }
      if (changed) {
        await this.put('characters', char);
      }
    }
  }

  // Settings
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const res = await this.get<{ key: string; value: T }>('settings', key);
    return res ? res.value : defaultValue;
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    await this.put('settings', { key, value });
  }

  // World Lifecycle
  async initializeDefaultsIfEmpty(): Promise<World> {
    const worlds = await this.getAll<World>('worlds');
    if (worlds.length > 0) {
      const activeId = await this.getSetting<string>('active_world_id', worlds[0].id);
      const active = worlds.find((w) => w.id === activeId) || worlds[0];
      return active;
    }

    // First time launching: import sample world
    await this.importWorldPackage(SAMPLE_WORLD_PACKAGE);
    await this.setSetting('active_world_id', SAMPLE_WORLD_PACKAGE.world.id);
    return SAMPLE_WORLD_PACKAGE.world;
  }

  async createWorld(worldData: Partial<World>): Promise<World> {
    const newWorld: World = {
      id: 'world-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: worldData.name || 'Untitled World',
      description: worldData.description || '',
      genre: worldData.genre || 'high-fantasy',
      customGenre: worldData.customGenre,
      techLevel: worldData.techLevel || 'medieval',
      customTechLevel: worldData.customTechLevel,
      magicLevel: worldData.magicLevel || 'medium',
      customMagicLevel: worldData.customMagicLevel,
      tone: worldData.tone || 'epic',
      customTone: worldData.customTone,
      structure: worldData.structure || 'continent',
      customStructure: worldData.customStructure,
      themes: worldData.themes || [],
      era: worldData.era || 'Current Era',
      coverUrl: worldData.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      privateNotes: worldData.privateNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dashboardSections: ['overview', 'quickCreate', 'stats', 'characters', 'locations', 'factions', 'timeline', 'quests', 'recentNotes'],
    };

    await this.put('worlds', newWorld);
    await this.setSetting('active_world_id', newWorld.id);
    return newWorld;
  }

  async duplicateWorld(sourceWorldId: string, newName?: string): Promise<World> {
    const pkg = await this.exportWorldPackage(sourceWorldId);
    if (!pkg) throw new Error('World not found to duplicate');

    const newWorldId = 'world-' + Date.now();
    const idMap = new Map<string, string>();
    idMap.set(sourceWorldId, newWorldId);

    const generateId = (oldId: string, prefix: string) => {
      const fresh = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      idMap.set(oldId, fresh);
      return fresh;
    };

    // Pre-map IDs
    pkg.characters.forEach((c) => generateId(c.id, 'char'));
    pkg.locations.forEach((l) => generateId(l.id, 'loc'));
    pkg.politicalEntities.forEach((p) => generateId(p.id, 'pol'));
    pkg.factions.forEach((f) => generateId(f.id, 'fac'));
    pkg.species.forEach((s) => generateId(s.id, 'spc'));
    pkg.cultures.forEach((c) => generateId(c.id, 'cul'));
    pkg.languages.forEach((l) => generateId(l.id, 'lang'));
    pkg.magicOrTechSystems.forEach((m) => generateId(m.id, 'sys'));
    pkg.creatures.forEach((c) => generateId(c.id, 'crt'));
    pkg.historicalEvents.forEach((e) => generateId(e.id, 'evt'));
    pkg.religions.forEach((r) => generateId(r.id, 'rel'));
    pkg.quests.forEach((q) => generateId(q.id, 'qst'));
    pkg.loreEntries.forEach((le) => generateId(le.id, 'lore'));
    pkg.items.forEach((i) => generateId(i.id, 'item'));
    pkg.notes.forEach((n) => generateId(n.id, 'note'));
    pkg.maps.forEach((m) => generateId(m.id, 'map'));

    const remap = (id?: string) => (id && idMap.has(id) ? idMap.get(id) : id);
    const remapList = (ids: string[]) => ids.map((id) => (idMap.has(id) ? idMap.get(id)! : id));

    const newWorld: World = {
      ...pkg.world,
      id: newWorldId,
      name: newName || `${pkg.world.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPkg: FullWorldPackage = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      world: newWorld,
      characters: pkg.characters.map((c) => ({
        ...c,
        id: idMap.get(c.id)!,
        worldId: newWorldId,
        homeLocationId: remap(c.homeLocationId),
        factionIds: remapList(c.factionIds),
        relationships: c.relationships.map((r) => ({
          ...r,
          id: 'rel-' + Date.now() + Math.random().toString(36).substring(2, 5),
          targetCharacterId: remap(r.targetCharacterId) || r.targetCharacterId,
        })),
      })),
      locations: pkg.locations.map((l) => ({
        ...l,
        id: idMap.get(l.id)!,
        worldId: newWorldId,
        parentId: remap(l.parentId),
        controllingFactionId: remap(l.controllingFactionId),
      })),
      politicalEntities: pkg.politicalEntities.map((p) => ({
        ...p,
        id: idMap.get(p.id)!,
        worldId: newWorldId,
        rulerId: remap(p.rulerId),
        capitalLocationId: remap(p.capitalLocationId),
        territoryLocationIds: remapList(p.territoryLocationIds),
        diplomaticRelations: p.diplomaticRelations.map((d) => ({
          ...d,
          targetEntityId: remap(d.targetEntityId) || d.targetEntityId,
        })),
      })),
      factions: pkg.factions.map((f) => ({
        ...f,
        id: idMap.get(f.id)!,
        worldId: newWorldId,
        leaderId: remap(f.leaderId),
        headquartersLocationId: remap(f.headquartersLocationId),
        memberIds: remapList(f.memberIds),
      })),
      species: pkg.species.map((s) => ({ ...s, id: idMap.get(s.id)!, worldId: newWorldId })),
      cultures: pkg.cultures.map((c) => ({ ...c, id: idMap.get(c.id)!, worldId: newWorldId })),
      languages: pkg.languages.map((l) => ({ ...l, id: idMap.get(l.id)!, worldId: newWorldId })),
      magicOrTechSystems: pkg.magicOrTechSystems.map((m) => ({ ...m, id: idMap.get(m.id)!, worldId: newWorldId })),
      creatures: pkg.creatures.map((c) => ({
        ...c,
        id: idMap.get(c.id)!,
        worldId: newWorldId,
        knownLocationIds: remapList(c.knownLocationIds),
      })),
      historicalEvents: pkg.historicalEvents.map((e) => ({
        ...e,
        id: idMap.get(e.id)!,
        worldId: newWorldId,
        characterIds: remapList(e.characterIds),
        locationIds: remapList(e.locationIds),
        factionIds: remapList(e.factionIds),
        politicalEntityIds: remapList(e.politicalEntityIds),
      })),
      religions: pkg.religions.map((r) => ({
        ...r,
        id: idMap.get(r.id)!,
        worldId: newWorldId,
        associatedLocationIds: remapList(r.associatedLocationIds),
      })),
      quests: pkg.quests.map((q) => ({
        ...q,
        id: idMap.get(q.id)!,
        worldId: newWorldId,
        characterIds: remapList(q.characterIds),
        locationIds: remapList(q.locationIds),
        factionIds: remapList(q.factionIds),
      })),
      loreEntries: pkg.loreEntries.map((le) => ({
        ...le,
        id: idMap.get(le.id)!,
        worldId: newWorldId,
        relatedEntityIds: le.relatedEntityIds.map((rel) => ({
          ...rel,
          entityId: remap(rel.entityId) || rel.entityId,
        })),
      })),
      items: pkg.items.map((i) => ({
        ...i,
        id: idMap.get(i.id)!,
        worldId: newWorldId,
        creatorId: remap(i.creatorId),
        ownerId: remap(i.ownerId),
        locationId: remap(i.locationId),
      })),
      notes: pkg.notes.map((n) => ({
        ...n,
        id: idMap.get(n.id)!,
        worldId: newWorldId,
        linkedEntityId: remap(n.linkedEntityId),
      })),
      maps: pkg.maps.map((m) => ({
        ...m,
        id: idMap.get(m.id)!,
        worldId: newWorldId,
        markers: m.markers.map((mk) => ({
          ...mk,
          locationId: remap(mk.locationId),
        })),
      })),
      links: pkg.links.map((lnk) => ({
        ...lnk,
        id: 'lnk-' + Date.now() + Math.random().toString(36).substring(2, 6),
        sourceId: remap(lnk.sourceId) || lnk.sourceId,
        targetId: remap(lnk.targetId) || lnk.targetId,
      })),
    };

    await this.importWorldPackage(newPkg);
    await this.setSetting('active_world_id', newWorld.id);
    return newWorld;
  }

  async deleteWorld(worldId: string): Promise<void> {
    const stores: StoreName[] = [
      'characters',
      'locations',
      'politicalEntities',
      'factions',
      'species',
      'cultures',
      'languages',
      'magicOrTechSystems',
      'creatures',
      'historicalEvents',
      'religions',
      'quests',
      'loreEntries',
      'items',
      'notes',
      'maps',
      'links',
    ];

    for (const store of stores) {
      const items = await this.getAll<{ id: string }>(store, worldId);
      for (const item of items) {
        await this.delete(store, item.id);
      }
    }

    await this.delete('worlds', worldId);

    const remaining = await this.getAll<World>('worlds');
    if (remaining.length > 0) {
      await this.setSetting('active_world_id', remaining[0].id);
    } else {
      await this.setSetting('active_world_id', '');
    }
  }

  // Export full world as JSON package
  async exportWorldPackage(worldId: string): Promise<FullWorldPackage | null> {
    const world = await this.get<World>('worlds', worldId);
    if (!world) return null;

    const [
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
    ] = await Promise.all([
      this.getAll<Character>('characters', worldId),
      this.getAll<Location>('locations', worldId),
      this.getAll<PoliticalEntity>('politicalEntities', worldId),
      this.getAll<Faction>('factions', worldId),
      this.getAll<Species>('species', worldId),
      this.getAll<Culture>('cultures', worldId),
      this.getAll<Language>('languages', worldId),
      this.getAll<MagicOrTechSystem>('magicOrTechSystems', worldId),
      this.getAll<Creature>('creatures', worldId),
      this.getAll<HistoricalEvent>('historicalEvents', worldId),
      this.getAll<Religion>('religions', worldId),
      this.getAll<Quest>('quests', worldId),
      this.getAll<LoreEntry>('loreEntries', worldId),
      this.getAll<Item>('items', worldId),
      this.getAll<Note>('notes', worldId),
      this.getAll<WorldMap>('maps', worldId),
      this.getAll<EntityLink>('links', worldId),
    ]);

    return {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      world,
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
    };
  }

  // Import world package with validation
  async importWorldPackage(pkg: FullWorldPackage, overwriteExisting = false): Promise<World> {
    if (!pkg || !pkg.world || !pkg.world.id || !pkg.world.name) {
      throw new Error('Invalid WorldForge package: Missing world core descriptor.');
    }

    const existing = await this.get<World>('worlds', pkg.world.id);
    let worldToSave = { ...pkg.world };

    if (existing && !overwriteExisting) {
      // Avoid collision by generating unique ID and appending (Imported)
      const freshWorldId = 'world-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      worldToSave = {
        ...pkg.world,
        id: freshWorldId,
        name: `${pkg.world.name} (Imported)`,
      };
      // Remap all entities to the fresh world ID
      return this.duplicateWorldWithNewPackage({ ...pkg, world: worldToSave }, freshWorldId);
    }

    // Save world and each sub-entity
    await this.put('worlds', worldToSave);

    const saveItems = async <T extends { id?: string }>(store: StoreName, items?: T[]) => {
      if (!items) return;
      for (const item of items) {
        await this.put(store, item);
      }
    };

    await Promise.all([
      saveItems('characters', pkg.characters),
      saveItems('locations', pkg.locations),
      saveItems('politicalEntities', pkg.politicalEntities),
      saveItems('factions', pkg.factions),
      saveItems('species', pkg.species),
      saveItems('cultures', pkg.cultures),
      saveItems('languages', pkg.languages),
      saveItems('magicOrTechSystems', pkg.magicOrTechSystems),
      saveItems('creatures', pkg.creatures),
      saveItems('historicalEvents', pkg.historicalEvents),
      saveItems('religions', pkg.religions),
      saveItems('quests', pkg.quests),
      saveItems('loreEntries', pkg.loreEntries),
      saveItems('items', pkg.items),
      saveItems('notes', pkg.notes),
      saveItems('maps', pkg.maps),
      saveItems('links', pkg.links),
    ]);

    await this.setSetting('active_world_id', worldToSave.id);
    return worldToSave;
  }

  private async duplicateWorldWithNewPackage(pkg: FullWorldPackage, newWorldId: string): Promise<World> {
    const idMap = new Map<string, string>();
    idMap.set(pkg.world.id, newWorldId);

    const generateId = (oldId: string, prefix: string) => {
      const fresh = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      idMap.set(oldId, fresh);
      return fresh;
    };

    (pkg.characters || []).forEach((c) => generateId(c.id, 'char'));
    (pkg.locations || []).forEach((l) => generateId(l.id, 'loc'));
    (pkg.politicalEntities || []).forEach((p) => generateId(p.id, 'pol'));
    (pkg.factions || []).forEach((f) => generateId(f.id, 'fac'));
    (pkg.species || []).forEach((s) => generateId(s.id, 'spc'));
    (pkg.cultures || []).forEach((c) => generateId(c.id, 'cul'));
    (pkg.languages || []).forEach((l) => generateId(l.id, 'lang'));
    (pkg.magicOrTechSystems || []).forEach((m) => generateId(m.id, 'sys'));
    (pkg.creatures || []).forEach((c) => generateId(c.id, 'crt'));
    (pkg.historicalEvents || []).forEach((e) => generateId(e.id, 'evt'));
    (pkg.religions || []).forEach((r) => generateId(r.id, 'rel'));
    (pkg.quests || []).forEach((q) => generateId(q.id, 'qst'));
    (pkg.loreEntries || []).forEach((le) => generateId(le.id, 'lore'));
    (pkg.items || []).forEach((i) => generateId(i.id, 'item'));
    (pkg.notes || []).forEach((n) => generateId(n.id, 'note'));
    (pkg.maps || []).forEach((m) => generateId(m.id, 'map'));

    const remap = (id?: string) => (id && idMap.has(id) ? idMap.get(id) : id);
    const remapList = (ids: string[]) => ids.map((id) => (idMap.has(id) ? idMap.get(id)! : id));

    const freshPkg: FullWorldPackage = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      world: { ...pkg.world, id: newWorldId },
      characters: (pkg.characters || []).map((c) => ({
        ...c,
        id: idMap.get(c.id) || generateId(c.id, 'char'),
        worldId: newWorldId,
        homeLocationId: remap(c.homeLocationId),
        factionIds: remapList(c.factionIds),
        relationships: (c.relationships || []).map((r) => ({
          ...r,
          id: 'rel-' + Date.now() + Math.random().toString(36).substring(2, 5),
          targetCharacterId: remap(r.targetCharacterId) || r.targetCharacterId,
        })),
      })),
      locations: (pkg.locations || []).map((l) => ({
        ...l,
        id: idMap.get(l.id) || generateId(l.id, 'loc'),
        worldId: newWorldId,
        parentId: remap(l.parentId),
        controllingFactionId: remap(l.controllingFactionId),
      })),
      politicalEntities: (pkg.politicalEntities || []).map((p) => ({
        ...p,
        id: idMap.get(p.id) || generateId(p.id, 'pol'),
        worldId: newWorldId,
        rulerId: remap(p.rulerId),
        capitalLocationId: remap(p.capitalLocationId),
        territoryLocationIds: remapList(p.territoryLocationIds),
        diplomaticRelations: (p.diplomaticRelations || []).map((d) => ({
          ...d,
          targetEntityId: remap(d.targetEntityId) || d.targetEntityId,
        })),
      })),
      factions: (pkg.factions || []).map((f) => ({
        ...f,
        id: idMap.get(f.id) || generateId(f.id, 'fac'),
        worldId: newWorldId,
        leaderId: remap(f.leaderId),
        headquartersLocationId: remap(f.headquartersLocationId),
        memberIds: remapList(f.memberIds),
      })),
      species: (pkg.species || []).map((s) => ({ ...s, id: idMap.get(s.id) || generateId(s.id, 'spc'), worldId: newWorldId })),
      cultures: (pkg.cultures || []).map((c) => ({ ...c, id: idMap.get(c.id) || generateId(c.id, 'cul'), worldId: newWorldId })),
      languages: (pkg.languages || []).map((l) => ({ ...l, id: idMap.get(l.id) || generateId(l.id, 'lang'), worldId: newWorldId })),
      magicOrTechSystems: (pkg.magicOrTechSystems || []).map((m) => ({ ...m, id: idMap.get(m.id) || generateId(m.id, 'sys'), worldId: newWorldId })),
      creatures: (pkg.creatures || []).map((c) => ({
        ...c,
        id: idMap.get(c.id) || generateId(c.id, 'crt'),
        worldId: newWorldId,
        knownLocationIds: remapList(c.knownLocationIds),
      })),
      historicalEvents: (pkg.historicalEvents || []).map((e) => ({
        ...e,
        id: idMap.get(e.id) || generateId(e.id, 'evt'),
        worldId: newWorldId,
        characterIds: remapList(e.characterIds),
        locationIds: remapList(e.locationIds),
        factionIds: remapList(e.factionIds),
        politicalEntityIds: remapList(e.politicalEntityIds),
      })),
      religions: (pkg.religions || []).map((r) => ({
        ...r,
        id: idMap.get(r.id) || generateId(r.id, 'rel'),
        worldId: newWorldId,
        associatedLocationIds: remapList(r.associatedLocationIds),
      })),
      quests: (pkg.quests || []).map((q) => ({
        ...q,
        id: idMap.get(q.id) || generateId(q.id, 'qst'),
        worldId: newWorldId,
        characterIds: remapList(q.characterIds),
        locationIds: remapList(q.locationIds),
        factionIds: remapList(q.factionIds),
      })),
      loreEntries: (pkg.loreEntries || []).map((le) => ({
        ...le,
        id: idMap.get(le.id) || generateId(le.id, 'lore'),
        worldId: newWorldId,
        relatedEntityIds: (le.relatedEntityIds || []).map((rel) => ({
          ...rel,
          entityId: remap(rel.entityId) || rel.entityId,
        })),
      })),
      items: (pkg.items || []).map((i) => ({
        ...i,
        id: idMap.get(i.id) || generateId(i.id, 'item'),
        worldId: newWorldId,
        creatorId: remap(i.creatorId),
        ownerId: remap(i.ownerId),
        locationId: remap(i.locationId),
      })),
      notes: (pkg.notes || []).map((n) => ({
        ...n,
        id: idMap.get(n.id) || generateId(n.id, 'note'),
        worldId: newWorldId,
        linkedEntityId: remap(n.linkedEntityId),
      })),
      maps: (pkg.maps || []).map((m) => ({
        ...m,
        id: idMap.get(m.id) || generateId(m.id, 'map'),
        worldId: newWorldId,
        markers: (m.markers || []).map((mk) => ({
          ...mk,
          locationId: remap(mk.locationId),
        })),
      })),
      links: (pkg.links || []).map((lnk) => ({
        ...lnk,
        id: 'lnk-' + Date.now() + Math.random().toString(36).substring(2, 6),
        sourceId: remap(lnk.sourceId) || lnk.sourceId,
        targetId: remap(lnk.targetId) || lnk.targetId,
      })),
    };

    return this.importWorldPackage(freshPkg, true);
  }

  // Quick stats counter for World Dashboard
  async getWorldStats(worldId: string) {
    const [
      characters,
      locations,
      factions,
      historicalEvents,
      quests,
      items,
      creatures,
      notes,
    ] = await Promise.all([
      this.getAll<Character>('characters', worldId),
      this.getAll<Location>('locations', worldId),
      this.getAll<Faction>('factions', worldId),
      this.getAll<HistoricalEvent>('historicalEvents', worldId),
      this.getAll<Quest>('quests', worldId),
      this.getAll<Item>('items', worldId),
      this.getAll<Creature>('creatures', worldId),
      this.getAll<Note>('notes', worldId),
    ]);

    const activeQuests = quests.filter((q) => q.status === 'in-progress').length;
    const completedQuests = quests.filter((q) => q.status === 'completed').length;
    const unresolvedNotes = notes.filter((n) => n.status === 'unresolved').length;

    return {
      charactersCount: characters.length,
      locationsCount: locations.length,
      factionsCount: factions.length,
      eventsCount: historicalEvents.length,
      questsCount: quests.length,
      activeQuests,
      completedQuests,
      itemsCount: items.length,
      creaturesCount: creatures.length,
      unresolvedNotes,
    };
  }
}

export const db = new WorldForgeDB();
