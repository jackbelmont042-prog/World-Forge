import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Faction, FactionCategory, FactionRank } from '../../types/world';
import { Shield, Plus, Edit2, Trash2, ArrowLeft, Save, Users, MapPin, Sparkles } from 'lucide-react';

const FACTION_CATEGORIES: FactionCategory[] = [
  'guild',
  'religious-order',
  'secret-society',
  'mercenary',
  'military',
  'criminal',
  'adventurers',
  'scholarly',
  'political',
  'custom',
];

export const FactionsModule: React.FC = () => {
  const { currentWorld, factions, characters, locations, refreshWorldData, openEntity, openGeneratorWithCategory } = useWorld();
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Faction>>({});

  const activeFaction = factions.find((f) => f.id === selectedFactionId) || null;

  const handleCreate = () => {
    if (!currentWorld) return;
    const newFac: Partial<Faction> = {
      id: 'fac-' + Date.now(),
      worldId: currentWorld.id,
      name: 'New Organization',
      category: 'guild',
      description: '',
      purpose: '',
      memberIds: [],
      ideology: '',
      resources: '',
      ranks: [
        { rank: 1, title: 'Initiate', description: 'Apprentice member' },
        { rank: 2, title: 'Officer', description: 'Proven agent' },
      ],
      allies: [],
      enemies: [],
      secrets: '',
      tags: [],
      notes: '',
    };
    setFormData(newFac);
    setIsEditing(true);
    setSelectedFactionId(newFac.id!);
  };

  const handleSave = async () => {
    if (!currentWorld || !formData.id || !formData.name?.trim()) return;
    const fullFac: Faction = {
      id: formData.id,
      worldId: currentWorld.id,
      name: formData.name.trim(),
      symbol: formData.symbol,
      category: formData.category || 'guild',
      description: formData.description || '',
      purpose: formData.purpose || '',
      leaderId: formData.leaderId,
      headquartersLocationId: formData.headquartersLocationId,
      memberIds: formData.memberIds || [],
      ideology: formData.ideology || '',
      resources: formData.resources || '',
      ranks: formData.ranks || [],
      allies: formData.allies || [],
      enemies: formData.enemies || [],
      secrets: formData.secrets || '',
      tags: formData.tags || [],
      notes: formData.notes || '',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('factions', fullFac);
    await refreshWorldData();
    setIsEditing(false);
  };

  const handleDelete = async (facId: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this faction? References in character profiles will be safely removed.')) {
      await db.delete('factions', facId, currentWorld.id);
      setSelectedFactionId(null);
      setIsEditing(false);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#d4af37]" />
            <span>Factions, Orders, & Secret Societies</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Guilds, mercenary syndicates, holy orders, and outlaw brotherhoods
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openGeneratorWithCategory('kingdom')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs text-[#f5d99b]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate Faction</span>
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Faction</span>
          </button>
        </div>
      </div>

      {!activeFaction && !isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {factions.map((fac) => {
            const hq = locations.find((l) => l.id === fac.headquartersLocationId);
            const leader = characters.find((c) => c.id === fac.leaderId);

            return (
              <div
                key={fac.id}
                onClick={() => setSelectedFactionId(fac.id)}
                className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] hover:border-[#d4af37]/60 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-serif text-sm font-semibold text-white truncate">{fac.name}</h3>
                    <span className="text-[10px] text-[#d4af37] uppercase font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/10">
                      {fac.category.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#a0a8b8] line-clamp-2 mb-2 leading-relaxed">
                    {fac.purpose || fac.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1e232e] text-[10px] text-[#788091] space-y-1">
                  {leader && <div>Leader: <span className="text-white">{leader.name}</span></div>}
                  {hq && <div>HQ: <span className="text-[#a0a8b8]">{hq.name}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : isEditing ? (
        <div className="rounded-2xl border border-[#2b3342] bg-[#12151b] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
            <h3 className="font-serif text-sm font-semibold text-white">
              {formData.id && factions.some((f) => f.id === formData.id) ? 'Edit Faction' : 'Forge Faction'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-[#2b3342] px-3 py-1.5 text-xs text-[#8e95a5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-1.5 text-xs font-semibold text-black"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Faction</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#d4af37] mb-1">Faction Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Category</label>
              <select
                value={formData.category || 'guild'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                {FACTION_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Leader</label>
              <select
                value={formData.leaderId || ''}
                onChange={(e) => setFormData({ ...formData, leaderId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="">No designated leader</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Headquarters</label>
              <select
                value={formData.headquartersLocationId || ''}
                onChange={(e) => setFormData({ ...formData, headquartersLocationId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="">No headquarters</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Purpose & Mission</label>
              <textarea
                value={formData.purpose || ''}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                rows={2}
                placeholder="What is this organization trying to achieve?"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Detailed Description & History</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Origins, public reputation, uniform, rituals..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Ideology & Creed</label>
              <input
                type="text"
                value={formData.ideology || ''}
                onChange={(e) => setFormData({ ...formData, ideology: e.target.value })}
                placeholder="e.g. The sky belongs to those who dare to fly."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        activeFaction && (
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedFactionId(null)} className="text-[#d4af37] text-xs flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Factions</span>
                </button>
                <h3 className="font-serif text-base font-bold text-white">{activeFaction.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFormData({ ...activeFaction });
                    setIsEditing(true);
                  }}
                  className="rounded-xl border border-[#2b3342] px-3 py-1 text-xs text-[#cad0dc]"
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(activeFaction.id)} className="p-1.5 text-[#8e95a5] hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#cad0dc]">
              <div className="p-3.5 rounded-xl bg-[#161a22] border border-[#232936]">
                <h4 className="font-serif font-semibold text-[#d4af37] mb-1">Mission</h4>
                <p>{activeFaction.purpose || activeFaction.description}</p>
              </div>

              {activeFaction.ideology && (
                <div className="p-3 rounded-xl bg-[#141820] border border-[#232936] italic text-[#f5d99b]">
                  &quot;{activeFaction.ideology}&quot;
                </div>
              )}

              {activeFaction.ranks.length > 0 && (
                <div>
                  <h4 className="font-serif font-semibold text-[#d4af37] mb-2">Rank Hierarchy</h4>
                  <div className="space-y-1.5">
                    {activeFaction.ranks.map((r) => (
                      <div key={r.rank} className="p-2.5 rounded-xl bg-[#161a22] border border-[#232936] flex items-center justify-between">
                        <span className="font-semibold text-white">{r.title}</span>
                        <span className="text-[#8e95a5]">{r.description}</span>
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
