import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { PoliticalEntity, GovernmentType } from '../../types/world';
import { Crown, Plus, Edit2, Trash2, Shield, Save, ArrowLeft, Swords, Handshake } from 'lucide-react';

export const PoliticsModule: React.FC = () => {
  const { currentWorld, politicalEntities, characters, locations, refreshWorldData, openEntity } = useWorld();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PoliticalEntity>>({});

  const activeEntity = politicalEntities.find((p) => p.id === selectedEntityId) || null;

  const handleCreate = () => {
    if (!currentWorld) return;
    const newPol: Partial<PoliticalEntity> = {
      id: 'pol-' + Date.now(),
      worldId: currentWorld.id,
      name: 'New Realm / State',
      governmentType: 'monarchy',
      laws: '',
      militaryStrength: '',
      economicSystem: '',
      resources: [],
      currentStability: 'stable',
      diplomaticRelations: [],
      successionRules: '',
      conflicts: '',
      territoryLocationIds: [],
      tags: [],
      notes: '',
    };
    setFormData(newPol);
    setIsEditing(true);
    setSelectedEntityId(newPol.id!);
  };

  const handleSave = async () => {
    if (!currentWorld || !formData.id || !formData.name?.trim()) return;
    const entity: PoliticalEntity = {
      id: formData.id,
      worldId: currentWorld.id,
      name: formData.name.trim(),
      emblem: formData.emblem,
      governmentType: formData.governmentType || 'monarchy',
      rulerId: formData.rulerId,
      rulerTitle: formData.rulerTitle,
      capitalLocationId: formData.capitalLocationId,
      territoryLocationIds: formData.territoryLocationIds || [],
      laws: formData.laws || '',
      militaryStrength: formData.militaryStrength || '',
      economicSystem: formData.economicSystem || '',
      resources: formData.resources || [],
      currentStability: formData.currentStability || 'stable',
      diplomaticRelations: formData.diplomaticRelations || [],
      successionRules: formData.successionRules || '',
      conflicts: formData.conflicts || '',
      tags: formData.tags || [],
      notes: formData.notes || '',
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('politicalEntities', entity);
    await refreshWorldData();
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this political power?')) {
      await db.delete('politicalEntities', id, currentWorld.id);
      setSelectedEntityId(null);
      setIsEditing(false);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#d4af37]" />
            <span>Kingdoms, Governments, & Politics</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Empires, monarchies, succession laws, and diplomatic matrices
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47] shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Sovereign State</span>
        </button>
      </div>

      {!activeEntity && !isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {politicalEntities.map((pol) => {
            const ruler = characters.find((c) => c.id === pol.rulerId);
            const capital = locations.find((l) => l.id === pol.capitalLocationId);

            return (
              <div
                key={pol.id}
                onClick={() => setSelectedEntityId(pol.id)}
                className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] hover:border-[#d4af37]/60 cursor-pointer transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-semibold text-white">{pol.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37]">
                    {pol.governmentType}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#9098a8]">
                  {ruler && (
                    <div>Ruler: <span className="text-white font-medium">{ruler.name}</span> ({pol.rulerTitle || 'Monarch'})</div>
                  )}
                  {capital && (
                    <div>Capital Seat: <span className="text-[#cad0dc]">{capital.name}</span></div>
                  )}
                  <div>Stability: <span className="capitalize text-[#f5d99b]">{pol.currentStability}</span></div>
                </div>

                {pol.diplomaticRelations.length > 0 && (
                  <div className="pt-2 border-t border-[#1f242e] text-[11px] text-[#788091] flex items-center gap-1.5">
                    <Swords className="h-3.5 w-3.5 text-red-400" />
                    <span>{pol.diplomaticRelations.length} foreign diplomatic treaties active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : isEditing ? (
        <div className="rounded-2xl border border-[#2b3342] bg-[#12151b] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
            <h3 className="font-serif text-sm font-semibold text-white">
              {formData.id && politicalEntities.some((p) => p.id === formData.id) ? 'Edit Sovereign State' : 'Create Sovereign State'}
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
                <span>Save Realm</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#d4af37] mb-1">State / Realm Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Government Structure</label>
              <select
                value={formData.governmentType || 'monarchy'}
                onChange={(e) => setFormData({ ...formData, governmentType: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="monarchy">Monarchy (King / Queen / Dynasty)</option>
                <option value="empire">Empire (Autocratic Hegemony)</option>
                <option value="republic">Republic / Senate</option>
                <option value="theocracy">Theocracy (Holy Priesthood)</option>
                <option value="federation">Federation / Free Coalition</option>
                <option value="city-state">Autonomous City-State</option>
                <option value="tribal">Tribal Confederation</option>
                <option value="magocracy">Magocracy (Council of Mages)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Sovereign Ruler</label>
              <select
                value={formData.rulerId || ''}
                onChange={(e) => setFormData({ ...formData, rulerId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="">No appointed ruler</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Capital City</label>
              <select
                value={formData.capitalLocationId || ''}
                onChange={(e) => setFormData({ ...formData, capitalLocationId: e.target.value || undefined })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="">Select capital...</option>
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
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Laws, Decrees & Traditions</label>
              <textarea
                value={formData.laws || ''}
                onChange={(e) => setFormData({ ...formData, laws: e.target.value })}
                rows={2}
                placeholder="The legal code, forbidden actions, tax structures..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Military Strength & Fleet</label>
              <input
                type="text"
                value={formData.militaryStrength || ''}
                onChange={(e) => setFormData({ ...formData, militaryStrength: e.target.value })}
                placeholder="e.g. 12 Dreadnoughts, 40,000 elite guard"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        activeEntity && (
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedEntityId(null)} className="text-[#d4af37] text-xs flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <h3 className="font-serif text-base font-bold text-white">{activeEntity.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFormData({ ...activeEntity });
                    setIsEditing(true);
                  }}
                  className="rounded-xl border border-[#2b3342] px-3 py-1 text-xs text-[#cad0dc] hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(activeEntity.id)}
                  className="p-1.5 text-[#8e95a5] hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#c4cbd8]">
              {activeEntity.laws && (
                <div className="p-3 rounded-xl bg-[#161a22] border border-[#232936]">
                  <span className="font-semibold text-[#d4af37] block mb-1">Legal Code:</span>
                  <p>{activeEntity.laws}</p>
                </div>
              )}
              {activeEntity.militaryStrength && (
                <div className="p-3 rounded-xl bg-[#161a22] border border-[#232936]">
                  <span className="font-semibold text-[#d4af37] block mb-1">Military Command:</span>
                  <p>{activeEntity.militaryStrength}</p>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
