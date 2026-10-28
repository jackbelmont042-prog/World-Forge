import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import {
  Character,
  CharacterRelationship,
  CharacterRelationType,
  EntityType,
} from '../../types/world';
import {
  Users,
  Search,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Heart,
  Shield,
  MapPin,
  Sparkles,
  GitFork,
  Link as LinkIcon,
  X,
  Check,
  ChevronDown,
  UserCheck,
  Save,
} from 'lucide-react';

const RELATION_TYPES: { type: CharacterRelationType; label: string; inverse: CharacterRelationType }[] = [
  { type: 'friend', label: 'Friend', inverse: 'friend' },
  { type: 'enemy', label: 'Enemy', inverse: 'enemy' },
  { type: 'rival', label: 'Rival', inverse: 'rival' },
  { type: 'ally', label: 'Ally', inverse: 'ally' },
  { type: 'mentor', label: 'Mentor', inverse: 'student' },
  { type: 'student', label: 'Student', inverse: 'mentor' },
  { type: 'parent', label: 'Parent', inverse: 'child' },
  { type: 'child', label: 'Child', inverse: 'parent' },
  { type: 'sibling', label: 'Sibling', inverse: 'sibling' },
  { type: 'spouse', label: 'Spouse', inverse: 'spouse' },
  { type: 'ruler', label: 'Ruler', inverse: 'subject' },
  { type: 'subject', label: 'Subject', inverse: 'ruler' },
  { type: 'custom', label: 'Custom', inverse: 'custom' },
];

export const CharacterEncyclopedia: React.FC = () => {
  const {
    currentWorld,
    characters,
    locations,
    factions,
    items,
    refreshWorldData,
    selectedEntity,
    openEntity,
    clearSelectedEntity,
    openGeneratorWithCategory,
  } = useWorld();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [factionFilter, setFactionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'profile' | 'relationships' | 'ancestry'>('profile');

  // Active viewing/editing character
  const activeCharId = selectedEntity?.type === 'character' ? selectedEntity.id : null;
  const activeCharacter = characters.find((c) => c.id === activeCharId) || null;

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Character>>({});

  // Add Relationship Modal state
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [targetCharId, setTargetCharId] = useState('');
  const [relType, setRelType] = useState<CharacterRelationType>('friend');
  const [relDesc, setRelDesc] = useState('');

  // Filtered list
  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.titles.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.appearance.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.goals.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchFaction = factionFilter === 'all' || c.factionIds.includes(factionFilter);

      return matchSearch && matchStatus && matchFaction;
    });
  }, [characters, searchQuery, statusFilter, factionFilter]);

  const handleStartCreate = () => {
    if (!currentWorld) return;
    const newChar: Partial<Character> = {
      id: 'char-' + Date.now(),
      worldId: currentWorld.id,
      name: 'New Character',
      aliases: [],
      titles: [],
      status: 'living',
      gender: 'Unspecified',
      appearance: '',
      personality: '',
      strengths: [],
      weaknesses: [],
      skills: [],
      goals: '',
      fears: '',
      secrets: '',
      backstory: '',
      factionIds: [],
      relationships: [],
      family: { parentIds: [], childIds: [], spouseIds: [], siblingIds: [] },
      itemIds: [],
      timelineEvents: [],
      tags: [],
      customFields: [],
      notes: '',
    };
    setEditFormData(newChar);
    setIsEditing(true);
    openEntity('character', newChar.id!);
  };

  const handleStartEdit = (char: Character) => {
    setEditFormData({ ...char });
    setIsEditing(true);
  };

  const handleSaveCharacter = async () => {
    if (!currentWorld || !editFormData.id || !editFormData.name?.trim()) return;

    const fullChar: Character = {
      id: editFormData.id,
      worldId: currentWorld.id,
      name: editFormData.name.trim(),
      aliases: editFormData.aliases || [],
      titles: editFormData.titles || [],
      avatarUrl: editFormData.avatarUrl,
      speciesName: editFormData.speciesName || 'Human',
      age: editFormData.age || '',
      lifespan: editFormData.lifespan || '',
      gender: editFormData.gender || '',
      status: editFormData.status || 'living',
      occupation: editFormData.occupation || '',
      homeLocationId: editFormData.homeLocationId,
      factionIds: editFormData.factionIds || [],
      appearance: editFormData.appearance || '',
      personality: editFormData.personality || '',
      strengths: editFormData.strengths || [],
      weaknesses: editFormData.weaknesses || [],
      skills: editFormData.skills || [],
      goals: editFormData.goals || '',
      fears: editFormData.fears || '',
      secrets: editFormData.secrets || '',
      backstory: editFormData.backstory || '',
      relationships: editFormData.relationships || [],
      family: editFormData.family || { parentIds: [], childIds: [], spouseIds: [], siblingIds: [] },
      itemIds: editFormData.itemIds || [],
      timelineEvents: editFormData.timelineEvents || [],
      tags: editFormData.tags || [],
      customFields: editFormData.customFields || [],
      notes: editFormData.notes || '',
      createdAt: editFormData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put('characters', fullChar);
    await refreshWorldData();
    setIsEditing(false);
  };

  const handleDeleteCharacter = async (charId: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this character permanently? References across factions and relationships will be safely updated.')) {
      await db.delete('characters', charId, currentWorld.id);
      clearSelectedEntity();
      setIsEditing(false);
      await refreshWorldData();
    }
  };

  // Add Bidirectional Relationship
  const handleAddRelationship = async () => {
    if (!activeCharacter || !targetCharId) return;
    const targetChar = characters.find((c) => c.id === targetCharId);
    if (!targetChar) return;

    const relConfig = RELATION_TYPES.find((r) => r.type === relType);
    const inverseType = relConfig ? relConfig.inverse : relType;

    // 1. Update source
    const newRelSource: CharacterRelationship = {
      id: 'rel-' + Date.now(),
      targetCharacterId: targetCharId,
      type: relType,
      description: relDesc,
    };
    const updatedSource = {
      ...activeCharacter,
      relationships: [...activeCharacter.relationships.filter((r) => r.targetCharacterId !== targetCharId), newRelSource],
    };

    // 2. Update target bidirectionally
    const newRelTarget: CharacterRelationship = {
      id: 'rel-' + Date.now() + '-inv',
      targetCharacterId: activeCharacter.id,
      type: inverseType,
      description: relDesc,
    };
    const updatedTarget = {
      ...targetChar,
      relationships: [...targetChar.relationships.filter((r) => r.targetCharacterId !== activeCharacter.id), newRelTarget],
    };

    await db.put('characters', updatedSource);
    await db.put('characters', updatedTarget);
    await refreshWorldData();
    setIsRelModalOpen(false);
    setTargetCharId('');
    setRelDesc('');
  };

  const handleRemoveRelationship = async (targetId: string) => {
    if (!activeCharacter) return;
    const updatedSource = {
      ...activeCharacter,
      relationships: activeCharacter.relationships.filter((r) => r.targetCharacterId !== targetId),
    };
    await db.put('characters', updatedSource);

    // Also remove from target if exists
    const target = characters.find((c) => c.id === targetId);
    if (target) {
      const updatedTarget = {
        ...target,
        relationships: target.relationships.filter((r) => r.targetCharacterId !== activeCharacter.id),
      };
      await db.put('characters', updatedTarget);
    }
    await refreshWorldData();
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div className="flex items-center gap-3">
          {activeCharacter ? (
            <button
              onClick={() => {
                clearSelectedEntity();
                setIsEditing(false);
              }}
              className="flex items-center gap-1 text-xs text-[#d4af37] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cast</span>
            </button>
          ) : (
            <div>
              <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-[#d4af37]" />
                <span>Character Encyclopedia</span>
              </h2>
              <p className="text-xs text-[#8e95a5]">
                {characters.length} characters with interconnected relationships & ancestry
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openGeneratorWithCategory('character')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs font-medium text-[#f5d99b] hover:border-[#d4af37] transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate Concept</span>
          </button>
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-[#0d1015] hover:bg-[#e4bf47] transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Character</span>
          </button>
        </div>
      </div>

      {/* Main View: List OR Character Detail */}
      {!activeCharacter && !isEditing ? (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#727a8c]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, title, goals, or notes..."
                className="w-full rounded-xl border border-[#282f3d] bg-[#141820] pl-8 pr-3 py-2 text-xs text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-[#282f3d] bg-[#141820] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="living">Living</option>
                <option value="deceased">Deceased</option>
                <option value="missing">Missing</option>
                <option value="undead">Undead</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={factionFilter}
                onChange={(e) => setFactionFilter(e.target.value)}
                className="w-full rounded-xl border border-[#282f3d] bg-[#141820] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="all">All Factions</option>
                {factions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredCharacters.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[#262c38] rounded-2xl bg-[#12151b] p-6 space-y-3">
              <Users className="h-10 w-10 text-[#4c5466] mx-auto" />
              <h3 className="font-serif text-sm font-semibold text-white">No Characters Found</h3>
              <p className="text-xs text-[#7d8597] max-w-sm mx-auto">
                No individuals match your filter. Forge a new character or generate an evocative hero concept.
              </p>
              <button
                onClick={handleStartCreate}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black"
              >
                <Plus className="h-4 w-4" />
                <span>Create Character</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCharacters.map((char) => {
                const homeLoc = locations.find((l) => l.id === char.homeLocationId);
                const charFactions = factions.filter((f) => char.factionIds.includes(f.id));

                return (
                  <div
                    key={char.id}
                    onClick={() => openEntity('character', char.id)}
                    className="flex flex-col justify-between p-4 rounded-2xl border border-[#242a36] bg-[#13161e] hover:border-[#d4af37]/60 cursor-pointer transition shadow-xs group"
                  >
                    <div>
                      {/* Top identity row */}
                      <div className="flex gap-3 mb-2.5">
                        <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-[#2b3240] bg-[#191e29]">
                          {char.avatarUrl ? (
                            <img src={char.avatarUrl} alt={char.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#d4af37]">
                              <Users className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-sm font-semibold text-white group-hover:text-[#d4af37] transition truncate">
                            {char.name}
                          </h3>
                          {char.titles[0] && (
                            <div className="text-[11px] text-[#d4af37] truncate font-medium">
                              {char.titles[0]}
                            </div>
                          )}
                          <div className="text-[10px] text-[#788091] truncate">
                            {char.speciesName || 'Unknown Species'} · {char.status}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#a0a8b8] line-clamp-2 leading-relaxed mb-3">
                        {char.personality || char.backstory || char.appearance || 'No description recorded.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1e232e] text-[10px] text-[#697284] flex items-center justify-between">
                      <div className="truncate max-w-[140px]">
                        {homeLoc ? <span>📍 {homeLoc.name}</span> : <span>Wanderer</span>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {char.relationships.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[#d4af37]">
                            <Heart className="h-3 w-3" />
                            {char.relationships.length}
                          </span>
                        )}
                        {charFactions.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[#8e95a5]">
                            <Shield className="h-3 w-3" />
                            {charFactions.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : isEditing ? (
        /* Edit Form */
        <div className="rounded-2xl border border-[#2b3342] bg-[#12151b] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
            <h3 className="font-serif text-sm font-semibold text-white">
              {editFormData.id && characters.some((c) => c.id === editFormData.id) ? 'Edit Character' : 'Forge Character'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-[#2b3342] px-3 py-1.5 text-xs text-[#8e95a5] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCharacter}
                className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Character</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#d4af37] mb-1">Full Name *</label>
              <input
                type="text"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Titles & Honorifics (comma separated)</label>
              <input
                type="text"
                value={(editFormData.titles || []).join(', ')}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    titles: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="High Navigator, Archon, Knight of the Veil"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Aliases & Nicknames</label>
              <input
                type="text"
                value={(editFormData.aliases || []).join(', ')}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    aliases: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="The Glass Corsair, Shadow-Walker"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Portrait Image URL</label>
              <input
                type="url"
                value={editFormData.avatarUrl || ''}
                onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                placeholder="https://example.com/portrait.jpg"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Species / Race</label>
              <input
                type="text"
                value={editFormData.speciesName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, speciesName: e.target.value })}
                placeholder="Celestine Aethel, Human, High Elf"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Age</label>
                <input
                  type="text"
                  value={editFormData.age || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  placeholder="34 cycles"
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Status</label>
                <select
                  value={editFormData.status || 'living'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="living">Living</option>
                  <option value="deceased">Deceased</option>
                  <option value="missing">Missing</option>
                  <option value="undead">Undead</option>
                  <option value="ascended">Ascended / Mythic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Home Settlement / Location</label>
              <select
                value={editFormData.homeLocationId || ''}
                onChange={(e) => setEditFormData({ ...editFormData, homeLocationId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="">No fixed home</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Faction Membership</label>
              <select
                multiple
                value={editFormData.factionIds || []}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                  setEditFormData({ ...editFormData, factionIds: opts });
                }}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden h-20"
              >
                {factions.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-[#6b7384]">Hold Ctrl/Cmd to select multiple</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Physical Appearance</label>
              <textarea
                value={editFormData.appearance || ''}
                onChange={(e) => setEditFormData({ ...editFormData, appearance: e.target.value })}
                rows={2}
                placeholder="Hair, scars, attire, posture, distinctive hallmarks..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Personality & Mannerisms</label>
              <textarea
                value={editFormData.personality || ''}
                onChange={(e) => setEditFormData({ ...editFormData, personality: e.target.value })}
                rows={2}
                placeholder="Demeanor, moral code, speech quirks, flaws..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Goals & Motivations</label>
                <textarea
                  value={editFormData.goals || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, goals: e.target.value })}
                  rows={2}
                  placeholder="What drives this character?"
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Secrets & Hidden Fears</label>
                <textarea
                  value={editFormData.secrets || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, secrets: e.target.value })}
                  rows={2}
                  placeholder="Things they conceal from allies..."
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Comprehensive Backstory</label>
              <textarea
                value={editFormData.backstory || ''}
                onChange={(e) => setEditFormData({ ...editFormData, backstory: e.target.value })}
                rows={4}
                placeholder="Origins, defining traumas, key achievements..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Character Record */
        activeCharacter && (
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] overflow-hidden shadow-xl">
            {/* Header profile banner */}
            <div className="p-5 border-b border-[#232936] bg-[#151922] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 border-2 border-[#d4af37]/60 bg-[#1e2432] shadow-md">
                  {activeCharacter.avatarUrl ? (
                    <img src={activeCharacter.avatarUrl} alt={activeCharacter.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#d4af37]">
                      <Users className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                      {activeCharacter.name}
                    </h2>
                    <span className="text-[10px] uppercase font-semibold text-[#d4af37] px-2 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30">
                      {activeCharacter.status}
                    </span>
                  </div>

                  {activeCharacter.titles.length > 0 && (
                    <div className="text-xs text-[#d4af37] font-medium mt-0.5">
                      {activeCharacter.titles.join(' · ')}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#8e95a5] mt-1">
                    <span>{activeCharacter.speciesName || 'Unknown Species'}</span>
                    {activeCharacter.age && (
                      <>
                        <span>·</span>
                        <span>{activeCharacter.age}</span>
                      </>
                    )}
                    {activeCharacter.occupation && (
                      <>
                        <span>·</span>
                        <span>{activeCharacter.occupation}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleStartEdit(activeCharacter)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#2b3342] bg-[#181d27] px-3 py-1.5 text-xs text-[#cad0dc] hover:text-white hover:border-[#d4af37]/60"
                >
                  <Edit2 className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => handleDeleteCharacter(activeCharacter.id)}
                  className="p-2 rounded-xl border border-[#2b3342] bg-[#181d27] text-[#8e95a5] hover:text-red-400 hover:border-red-500/50"
                  title="Delete character"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Segmented Detail Tabs */}
            <div className="flex border-b border-[#232936] bg-[#13161f] px-4 gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2.5 px-3 text-xs font-medium border-b-2 transition ${
                  activeTab === 'profile'
                    ? 'border-[#d4af37] text-[#f5d99b]'
                    : 'border-transparent text-[#7e8799] hover:text-white'
                }`}
              >
                Lore & Dossier
              </button>
              <button
                onClick={() => setActiveTab('relationships')}
                className={`py-2.5 px-3 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'relationships'
                    ? 'border-[#d4af37] text-[#f5d99b]'
                    : 'border-transparent text-[#7e8799] hover:text-white'
                }`}
              >
                <span>Relationships</span>
                <span className="text-[10px] text-[#717887]">({activeCharacter.relationships.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('ancestry')}
                className={`py-2.5 px-3 text-xs font-medium border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'ancestry'
                    ? 'border-[#d4af37] text-[#f5d99b]'
                    : 'border-transparent text-[#7e8799] hover:text-white'
                }`}
              >
                <GitFork className="h-3 w-3" />
                <span>Family & Ancestry</span>
              </button>
            </div>

            {/* Tab 1: Profile & Dossier */}
            {activeTab === 'profile' && (
              <div className="p-5 space-y-6 text-xs text-[#c4cbd8]">
                {/* Backstory */}
                {activeCharacter.backstory && (
                  <div>
                    <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37] mb-1.5">Backstory</h4>
                    <p className="leading-relaxed bg-[#161a22] p-3.5 rounded-xl border border-[#232936]">
                      {activeCharacter.backstory}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Appearance & Personality */}
                  <div className="p-3.5 rounded-xl border border-[#232936] bg-[#141820] space-y-2">
                    <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37]">Appearance</h4>
                    <p className="leading-relaxed text-[#a0a8b8]">{activeCharacter.appearance || 'N/A'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#232936] bg-[#141820] space-y-2">
                    <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37]">Personality</h4>
                    <p className="leading-relaxed text-[#a0a8b8]">{activeCharacter.personality || 'N/A'}</p>
                  </div>

                  {/* Motivations & Secrets */}
                  <div className="p-3.5 rounded-xl border border-[#232936] bg-[#141820] space-y-2">
                    <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37]">Goals & Motivations</h4>
                    <p className="leading-relaxed text-[#a0a8b8]">{activeCharacter.goals || 'None recorded'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#232936] bg-[#141820] space-y-2">
                    <h4 className="font-serif text-xs uppercase font-semibold text-rose-400">Secrets & Fears</h4>
                    <p className="leading-relaxed text-[#a0a8b8]">{activeCharacter.secrets || 'None recorded'}</p>
                  </div>
                </div>

                {/* Items & Belongings */}
                {activeCharacter.itemIds.length > 0 && (
                  <div>
                    <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37] mb-2">Relics & Possessions</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCharacter.itemIds.map((itemId) => {
                        const item = items.find((i) => i.id === itemId);
                        if (!item) return null;
                        return (
                          <div
                            key={item.id}
                            onClick={() => openEntity('item', item.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#2b3342] bg-[#161a22] hover:border-[#d4af37] cursor-pointer transition text-xs"
                          >
                            <span className="font-medium text-white">{item.name}</span>
                            <span className="text-[10px] text-[#d4af37] ml-1.5 uppercase font-mono">[{item.rarity}]</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Bidirectional Relationships */}
            {activeTab === 'relationships' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#202530]">
                  <p className="text-xs text-[#8e95a5]">
                    All connections between {activeCharacter.name} and other individuals in this world.
                  </p>
                  <button
                    onClick={() => setIsRelModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Relationship</span>
                  </button>
                </div>

                {activeCharacter.relationships.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#727a8c]">
                    No character relationships established yet. Click &quot;Add Relationship&quot; above to connect with peers, rivals, or mentors.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCharacter.relationships.map((rel) => {
                      const target = characters.find((c) => c.id === rel.targetCharacterId);
                      if (!target) return null;

                      return (
                        <div
                          key={rel.id}
                          className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-[#232936] bg-[#151922]"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              onClick={() => openEntity('character', target.id)}
                              className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-[#2b3342] cursor-pointer hover:border-[#d4af37]"
                            >
                              {target.avatarUrl ? (
                                <img src={target.avatarUrl} alt={target.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[#d4af37] bg-[#1d2330]">
                                  <Users className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div
                                onClick={() => openEntity('character', target.id)}
                                className="font-serif text-xs font-semibold text-white hover:text-[#d4af37] cursor-pointer truncate"
                              >
                                {target.name}
                              </div>
                              <div className="text-[10px] text-[#d4af37] capitalize font-medium">
                                {rel.type}
                              </div>
                              {rel.description && (
                                <p className="text-[11px] text-[#8e95a5] mt-1 leading-snug">
                                  {rel.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveRelationship(rel.targetCharacterId)}
                            className="p-1 text-[#697284] hover:text-red-400"
                            title="Remove link"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Ancestry & Family Tree */}
            {activeTab === 'ancestry' && (
              <div className="p-5 space-y-4">
                <div className="p-4 rounded-xl border border-[#232936] bg-[#141720] text-center space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-white">Genealogical Ancestry</h4>
                  <p className="text-xs text-[#8e95a5]">
                    Lineage mapping for {activeCharacter.name}.
                  </p>

                  {/* Visual Node Diagram */}
                  <div className="flex flex-col items-center gap-4 py-4">
                    {/* Parents */}
                    <div className="flex items-center gap-3">
                      {activeCharacter.family.parentIds.length > 0 ? (
                        activeCharacter.family.parentIds.map((pid) => {
                          const p = characters.find((c) => c.id === pid);
                          return (
                            <div
                              key={pid}
                              onClick={() => p && openEntity('character', p.id)}
                              className="px-3 py-1.5 rounded-xl border border-[#d4af37]/50 bg-[#191e28] text-xs font-medium text-white cursor-pointer hover:border-[#d4af37]"
                            >
                              Parent: {p ? p.name : 'Unknown Parent'}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-xs text-[#6e7787] italic">Ancestry origins shrouded in myth</div>
                      )}
                    </div>

                    <div className="h-6 w-px bg-[#d4af37]/40" />

                    {/* Current Character Centerpiece */}
                    <div className="p-3 rounded-2xl border-2 border-[#d4af37] bg-[#1d2330] text-center shadow-lg">
                      <div className="font-serif text-sm font-bold text-[#f5d99b]">{activeCharacter.name}</div>
                      <div className="text-[10px] text-[#8e95a5]">{activeCharacter.speciesName}</div>
                    </div>

                    <div className="h-6 w-px bg-[#d4af37]/40" />

                    {/* Siblings & Descendants */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {activeCharacter.family.siblingIds.map((sid) => {
                        const s = characters.find((c) => c.id === sid);
                        return (
                          <div
                            key={sid}
                            onClick={() => s && openEntity('character', s.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#2e3748] bg-[#161a22] text-xs text-white cursor-pointer hover:border-[#d4af37]"
                          >
                            Sibling: {s ? s.name : 'Sibling'}
                          </div>
                        );
                      })}
                      {activeCharacter.family.siblingIds.length === 0 && (
                        <div className="text-xs text-[#6e7787] italic">No recorded siblings</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Add Relationship Modal */}
      {isRelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#303846] bg-[#12151b] p-5 shadow-2xl text-[#cad0dc] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#232936]">
              <h3 className="font-serif text-sm font-semibold text-white">Connect Character</h3>
              <button onClick={() => setIsRelModalOpen(false)} className="text-[#8e95a5] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Target Individual *</label>
              <select
                value={targetCharId}
                onChange={(e) => setTargetCharId(e.target.value)}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                <option value="">Select a character...</option>
                {characters
                  .filter((c) => c.id !== activeCharacter?.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.titles[0] || c.speciesName || 'Character'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Relationship Dynamic</label>
              <select
                value={relType}
                onChange={(e) => setRelType(e.target.value as CharacterRelationType)}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              >
                {RELATION_TYPES.map((r) => (
                  <option key={r.type} value={r.type}>
                    {r.label} (Bidirectional &quot;{r.inverse}&quot;)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Context & Lore Details</label>
              <textarea
                value={relDesc}
                onChange={(e) => setRelDesc(e.target.value)}
                rows={2}
                placeholder="e.g. Sworn blood pact during the Siege of Sol-Aethel..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232936]">
              <button
                onClick={() => setIsRelModalOpen(false)}
                className="rounded-xl border border-[#2b3342] px-3.5 py-2 text-xs text-[#8e95a5]"
              >
                Cancel
              </button>
              <button
                disabled={!targetCharId}
                onClick={handleAddRelationship}
                className="rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black hover:bg-[#e4bf47] disabled:opacity-50"
              >
                Establish Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
