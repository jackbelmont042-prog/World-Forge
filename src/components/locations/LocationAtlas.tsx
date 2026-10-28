import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Location, LocationType } from '../../types/world';
import {
  MapPin,
  Search,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Compass,
  Sparkles,
  Save,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

const LOCATION_TYPES: LocationType[] = [
  'continent',
  'kingdom',
  'province',
  'city',
  'town',
  'village',
  'castle',
  'dungeon',
  'ruins',
  'forest',
  'mountain',
  'river',
  'ocean',
  'island',
  'plane',
  'custom',
];

export const LocationAtlas: React.FC = () => {
  const {
    currentWorld,
    locations,
    factions,
    characters,
    refreshWorldData,
    selectedEntity,
    openEntity,
    clearSelectedEntity,
    openGeneratorWithCategory,
    setActiveTab,
  } = useWorld();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'grid'>('hierarchy');

  const activeLocId = selectedEntity?.type === 'location' ? selectedEntity.id : null;
  const activeLocation = locations.find((l) => l.id === activeLocId) || null;

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Location>>({});

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.climate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.secrets.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.alternateNames.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = typeFilter === 'all' || loc.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [locations, searchQuery, typeFilter]);

  // Hierarchical grouping: root continents/planes vs child locations
  const rootLocations = useMemo(() => {
    return locations.filter((l) => !l.parentId);
  }, [locations]);

  const handleStartCreate = (parentId?: string) => {
    if (!currentWorld) return;
    const newLoc: Partial<Location> = {
      id: 'loc-' + Date.now(),
      worldId: currentWorld.id,
      name: 'New Location',
      alternateNames: [],
      type: 'city',
      parentId,
      description: '',
      climate: '',
      population: '',
      government: '',
      culture: '',
      languages: [],
      economy: '',
      secrets: '',
      travelInfo: '',
      tags: [],
      notes: '',
    };
    setEditFormData(newLoc);
    setIsEditing(true);
    openEntity('location', newLoc.id!);
  };

  const handleStartEdit = (loc: Location) => {
    setEditFormData({ ...loc });
    setIsEditing(true);
  };

  const handleSaveLocation = async () => {
    if (!currentWorld || !editFormData.id || !editFormData.name?.trim()) return;

    const fullLoc: Location = {
      id: editFormData.id,
      worldId: currentWorld.id,
      name: editFormData.name.trim(),
      alternateNames: editFormData.alternateNames || [],
      type: editFormData.type || 'city',
      customType: editFormData.customType,
      parentId: editFormData.parentId,
      description: editFormData.description || '',
      imageUrl: editFormData.imageUrl,
      climate: editFormData.climate || '',
      population: editFormData.population || '',
      government: editFormData.government || '',
      culture: editFormData.culture || '',
      languages: editFormData.languages || [],
      economy: editFormData.economy || '',
      controllingFactionId: editFormData.controllingFactionId,
      secrets: editFormData.secrets || '',
      travelInfo: editFormData.travelInfo || '',
      mapCoordinates: editFormData.mapCoordinates,
      tags: editFormData.tags || [],
      notes: editFormData.notes || '',
      createdAt: editFormData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put('locations', fullLoc);
    await refreshWorldData();
    setIsEditing(false);
  };

  const handleDeleteLocation = async (locId: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this location? References in characters and factions will be safely cleared.')) {
      await db.delete('locations', locId, currentWorld.id);
      clearSelectedEntity();
      setIsEditing(false);
      await refreshWorldData();
    }
  };

  // Render a hierarchical location node with its children
  const renderLocationNode = (loc: Location, depth = 0) => {
    const children = locations.filter((l) => l.parentId === loc.id);

    return (
      <div key={loc.id} className="space-y-1.5" style={{ marginLeft: depth > 0 ? `${depth * 18}px` : 0 }}>
        <div
          onClick={() => openEntity('location', loc.id)}
          className="flex items-center justify-between p-3 rounded-xl border border-[#232936] bg-[#141720] hover:border-[#d4af37]/60 cursor-pointer transition group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-sm">📍</span>
            <div>
              <div className="font-serif text-xs font-semibold text-white group-hover:text-[#d4af37] transition truncate">
                {loc.name}
              </div>
              <div className="text-[10px] text-[#717887] uppercase tracking-wide">
                {loc.type} {loc.population ? `· Pop: ${loc.population}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8e95a5]">
            {children.length > 0 && (
              <span className="text-[10px] text-[#d4af37] px-2 py-0.5 rounded-full bg-[#d4af37]/10">
                {children.length} sub-sites
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-[#5e6677] group-hover:text-white" />
          </div>
        </div>

        {/* Render child locations */}
        {children.length > 0 && (
          <div className="border-l-2 border-[#262c38] pl-2 space-y-1 mt-1">
            {children.map((child) => renderLocationNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div className="flex items-center gap-3">
          {activeLocation ? (
            <button
              onClick={() => {
                clearSelectedEntity();
                setIsEditing(false);
              }}
              className="flex items-center gap-1 text-xs text-[#d4af37] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Atlas</span>
            </button>
          ) : (
            <div>
              <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#d4af37]" />
                <span>Atlas & Locations</span>
              </h2>
              <p className="text-xs text-[#8e95a5]">
                {locations.length} charted continents, realms, cities, and ancient ruins
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-1.5 rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-1.5 text-xs text-[#cad0dc] hover:text-white hover:border-[#d4af37]"
          >
            <Compass className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => openGeneratorWithCategory('location')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs font-medium text-[#f5d99b] hover:border-[#d4af37] transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate Site</span>
          </button>
          <button
            onClick={() => handleStartCreate()}
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-[#0d1015] hover:bg-[#e4bf47] transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Location</span>
          </button>
        </div>
      </div>

      {/* Main Content: List OR Detail OR Edit */}
      {!activeLocation && !isEditing ? (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#727a8c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations or secrets..."
                className="w-full rounded-xl border border-[#282f3d] bg-[#141820] pl-8 pr-3 py-2 text-xs text-white placeholder-[#5c6475] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-[#282f3d] bg-[#141820] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="all">All Types</option>
                {LOCATION_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>

              <div className="flex items-center rounded-xl border border-[#282f3d] bg-[#141820] p-1 text-xs">
                <button
                  onClick={() => setViewMode('hierarchy')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    viewMode === 'hierarchy' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5]'
                  }`}
                >
                  Hierarchy
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5]'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Location Content */}
          {filteredLocations.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[#262c38] rounded-2xl bg-[#12151b] p-6 space-y-3">
              <MapPin className="h-10 w-10 text-[#4c5466] mx-auto" />
              <h3 className="font-serif text-sm font-semibold text-white">No Locations Found</h3>
              <p className="text-xs text-[#7d8597] max-w-sm mx-auto">
                No territories match your filter. Chart a new settlement or discover an ancient ruin.
              </p>
              <button
                onClick={() => handleStartCreate()}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black"
              >
                <Plus className="h-4 w-4" />
                <span>Chart First Location</span>
              </button>
            </div>
          ) : viewMode === 'hierarchy' && typeFilter === 'all' && !searchQuery ? (
            /* Hierarchical Atlas Tree View */
            <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-4 space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>Hierarchical Atlas View</span>
              </div>
              {rootLocations.map((root) => renderLocationNode(root, 0))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredLocations.map((loc) => {
                const controllingFaction = factions.find((f) => f.id === loc.controllingFactionId);
                const parent = locations.find((l) => l.id === loc.parentId);

                return (
                  <div
                    key={loc.id}
                    onClick={() => openEntity('location', loc.id)}
                    className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] hover:border-[#d4af37]/60 cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-serif text-sm font-semibold text-white group-hover:text-[#d4af37] transition truncate">
                          {loc.name}
                        </h3>
                        <span className="text-[10px] text-[#d4af37] uppercase font-mono font-medium shrink-0">
                          {loc.type}
                        </span>
                      </div>

                      {parent && (
                        <div className="text-[10px] text-[#788091] mb-2">
                          Part of: <span className="text-[#a0a8b8]">{parent.name}</span>
                        </div>
                      )}

                      <p className="text-xs text-[#a0a8b8] line-clamp-3 leading-relaxed mb-3">
                        {loc.description || 'No geographic description recorded.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1e232e] text-[10px] text-[#717887] flex items-center justify-between">
                      <span>Pop: {loc.population || 'Unknown'}</span>
                      {controllingFaction && (
                        <span className="text-[#d4af37] truncate max-w-[130px]">
                          🛡 {controllingFaction.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : isEditing ? (
        /* Location Edit Form */
        <div className="rounded-2xl border border-[#2b3342] bg-[#12151b] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
            <h3 className="font-serif text-sm font-semibold text-white">
              {editFormData.id && locations.some((l) => l.id === editFormData.id) ? 'Edit Location' : 'Chart Location'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-[#2b3342] px-3 py-1.5 text-xs text-[#8e95a5] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocation}
                className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Location</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#d4af37] mb-1">Location Name *</label>
              <input
                type="text"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Location Type</label>
              <select
                value={editFormData.type || 'city'}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as LocationType })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                {LOCATION_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Parent Territory (Hierarchy)</label>
              <select
                value={editFormData.parentId || ''}
                onChange={(e) => setEditFormData({ ...editFormData, parentId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="">Top-Level (Continent / Plane / World Realm)</option>
                {locations
                  .filter((l) => l.id !== editFormData.id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.type})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Controlling Faction / Power</label>
              <select
                value={editFormData.controllingFactionId || ''}
                onChange={(e) => setEditFormData({ ...editFormData, controllingFactionId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="">Uncontrolled / Lawless / Sovereign Council</option>
                {factions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Climate & Environment</label>
              <input
                type="text"
                value={editFormData.climate || ''}
                onChange={(e) => setEditFormData({ ...editFormData, climate: e.target.value })}
                placeholder="High altitude alpine gale winds, radiant sun..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Population Estimate</label>
              <input
                type="text"
                value={editFormData.population || ''}
                onChange={(e) => setEditFormData({ ...editFormData, population: e.target.value })}
                placeholder="1.2 Million, 45,000, Uninhabited"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Description & Geography</label>
              <textarea
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
                placeholder="Terrain, architecture, landmarks, atmosphere..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Economy & Resources</label>
                <textarea
                  value={editFormData.economy || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, economy: e.target.value })}
                  rows={2}
                  placeholder="Mining, skyship trade, alchemical herbs..."
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Travel & Transit Guidelines</label>
                <textarea
                  value={editFormData.travelInfo || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, travelInfo: e.target.value })}
                  rows={2}
                  placeholder="How do travelers reach this site? Passports, hazards..."
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-rose-400 mb-1">Hidden Lore, Points of Interest & Secrets</label>
              <textarea
                value={editFormData.secrets || ''}
                onChange={(e) => setEditFormData({ ...editFormData, secrets: e.target.value })}
                rows={2}
                placeholder="Underground tunnels, ancient vaults, GM mysteries..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Location Dossier */
        activeLocation && (
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-[#232936] bg-[#151922] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                    {activeLocation.name}
                  </h2>
                  <span className="text-[10px] uppercase font-semibold text-[#d4af37] px-2 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30">
                    {activeLocation.type}
                  </span>
                </div>
                {activeLocation.alternateNames.length > 0 && (
                  <div className="text-xs text-[#8e95a5] italic mt-0.5">
                    Also known as: {activeLocation.alternateNames.join(', ')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartCreate(activeLocation.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#2b3342] bg-[#181d27] px-3 py-1.5 text-xs text-[#cad0dc] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Add Sub-Location</span>
                </button>
                <button
                  onClick={() => handleStartEdit(activeLocation)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#2b3342] bg-[#181d27] px-3 py-1.5 text-xs text-[#cad0dc] hover:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteLocation(activeLocation.id)}
                  className="p-2 rounded-xl border border-[#2b3342] bg-[#181d27] text-[#8e95a5] hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6 text-xs text-[#cad0dc]">
              <div>
                <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37] mb-1.5">Description</h4>
                <p className="leading-relaxed bg-[#161a22] p-3.5 rounded-xl border border-[#232936]">
                  {activeLocation.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-[#232936] bg-[#141820]">
                  <div className="text-[10px] uppercase font-semibold text-[#788091] mb-1">Climate</div>
                  <div className="text-white">{activeLocation.climate || 'Unspecified'}</div>
                </div>
                <div className="p-3 rounded-xl border border-[#232936] bg-[#141820]">
                  <div className="text-[10px] uppercase font-semibold text-[#788091] mb-1">Population</div>
                  <div className="text-white">{activeLocation.population || 'Unknown'}</div>
                </div>
                <div className="p-3 rounded-xl border border-[#232936] bg-[#141820]">
                  <div className="text-[10px] uppercase font-semibold text-[#788091] mb-1">Economy</div>
                  <div className="text-white">{activeLocation.economy || 'Unspecified'}</div>
                </div>
              </div>

              {activeLocation.travelInfo && (
                <div>
                  <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37] mb-1">Travel & Accessibility</h4>
                  <p className="leading-relaxed text-[#a0a8b8]">{activeLocation.travelInfo}</p>
                </div>
              )}

              {activeLocation.secrets && (
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/15">
                  <h4 className="font-serif text-xs uppercase font-semibold text-rose-400 mb-1">Secrets & Hidden Lore</h4>
                  <p className="leading-relaxed text-[#c8a4aa]">{activeLocation.secrets}</p>
                </div>
              )}

              {/* Notable Residents */}
              {characters.filter((c) => c.homeLocationId === activeLocation.id).length > 0 && (
                <div>
                  <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37] mb-2">Notable Residents</h4>
                  <div className="flex flex-wrap gap-2">
                    {characters
                      .filter((c) => c.homeLocationId === activeLocation.id)
                      .map((char) => (
                        <div
                          key={char.id}
                          onClick={() => openEntity('character', char.id)}
                          className="px-3 py-1.5 rounded-xl border border-[#2b3342] bg-[#161a22] hover:border-[#d4af37] cursor-pointer text-xs font-medium text-white transition"
                        >
                          {char.name} ({char.titles[0] || char.speciesName || 'Resident'})
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
