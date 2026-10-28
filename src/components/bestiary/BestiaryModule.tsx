import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Creature, CreatureThreat } from '../../types/world';
import { Bug, Plus, Edit2, Trash2, Save, Sparkles, ShieldAlert } from 'lucide-react';

const THREAT_COLORS: Record<CreatureThreat, string> = {
  harmless: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  low: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
  moderate: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  dangerous: 'text-orange-400 bg-orange-950/40 border-orange-500/30',
  cataclysmic: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
  legendary: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
};

export const BestiaryModule: React.FC = () => {
  const { currentWorld, creatures, refreshWorldData, openGeneratorWithCategory } = useWorld();
  const [editingCreature, setEditingCreature] = useState<Partial<Creature> | null>(null);

  const handleSave = async () => {
    if (!currentWorld || !editingCreature || !editingCreature.name?.trim()) return;
    const crt: Creature = {
      id: editingCreature.id || 'crt-' + Date.now(),
      worldId: currentWorld.id,
      name: editingCreature.name.trim(),
      classification: editingCreature.classification || 'monster',
      threatLevel: editingCreature.threatLevel || 'moderate',
      appearance: editingCreature.appearance || '',
      habitat: editingCreature.habitat || '',
      behavior: editingCreature.behavior || '',
      intelligence: editingCreature.intelligence || 'animalistic',
      diet: editingCreature.diet || '',
      abilities: editingCreature.abilities || [],
      weaknesses: editingCreature.weaknesses || [],
      culturalSignificance: editingCreature.culturalSignificance || '',
      knownLocationIds: editingCreature.knownLocationIds || [],
      tags: editingCreature.tags || [],
      createdAt: editingCreature.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('creatures', crt);
    await refreshWorldData();
    setEditingCreature(null);
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this creature record?')) {
      await db.delete('creatures', id, currentWorld.id);
      setEditingCreature(null);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Bug className="h-5 w-5 text-[#d4af37]" />
            <span>Bestiary & Creature Database</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Monsters, void-beasts, leviathans, threat levels, and ecological habitats
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openGeneratorWithCategory('creature')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs text-[#f5d99b]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate Creature</span>
          </button>
          <button
            onClick={() =>
              setEditingCreature({
                id: 'crt-' + Date.now(),
                name: 'New Beast',
                classification: 'monster',
                threatLevel: 'dangerous',
              })
            }
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Creature</span>
          </button>
        </div>
      </div>

      {editingCreature ? (
        <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
            <h4 className="font-serif text-sm font-semibold text-white">Creature Dossier</h4>
            <div className="flex gap-2">
              <button onClick={() => setEditingCreature(null)} className="text-xs text-[#8e95a5]">Cancel</button>
              <button onClick={handleSave} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save Creature</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#d4af37] mb-1">Name *</label>
              <input
                type="text"
                value={editingCreature.name || ''}
                onChange={(e) => setEditingCreature({ ...editingCreature, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Classification</label>
              <select
                value={editingCreature.classification || 'monster'}
                onChange={(e) => setEditingCreature({ ...editingCreature, classification: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="monster">Monster</option>
                <option value="beast">Wild Beast</option>
                <option value="dragon">Dragon / Wyrm</option>
                <option value="spirit">Spirit / Elemental</option>
                <option value="undead">Undead</option>
                <option value="magical-beast">Magical Beast</option>
                <option value="artificial">Artificial / Golem</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Threat Level</label>
              <select
                value={editingCreature.threatLevel || 'moderate'}
                onChange={(e) => setEditingCreature({ ...editingCreature, threatLevel: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="harmless">Harmless</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="dangerous">Dangerous</option>
                <option value="cataclysmic">Cataclysmic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Physical Description & Anatomy</label>
              <textarea
                value={editingCreature.appearance || ''}
                onChange={(e) => setEditingCreature({ ...editingCreature, appearance: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Habitat & Nesting Grounds</label>
                <input
                  type="text"
                  value={editingCreature.habitat || ''}
                  onChange={(e) => setEditingCreature({ ...editingCreature, habitat: e.target.value })}
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Diet & Feeding Behavior</label>
                <input
                  type="text"
                  value={editingCreature.diet || ''}
                  onChange={(e) => setEditingCreature({ ...editingCreature, diet: e.target.value })}
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creatures.map((crt) => {
            const badgeClass = THREAT_COLORS[crt.threatLevel] || THREAT_COLORS.moderate;

            return (
              <div key={crt.id} className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-white">{crt.name}</h3>
                    <span className="text-[10px] text-[#788091] capitalize">{crt.classification}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {crt.threatLevel}
                  </span>
                </div>

                <p className="text-xs text-[#a0a8b8] line-clamp-3 leading-relaxed">{crt.appearance}</p>

                <div className="pt-2 border-t border-[#1e232e] text-[10px] text-[#717887] flex justify-between items-center">
                  <span>Habitat: {crt.habitat || 'Unspecified'}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCreature(crt)} className="text-[#d4af37] text-xs">Edit</button>
                    <button onClick={() => handleDelete(crt.id)} className="text-[#8e95a5] hover:text-red-400 text-xs">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
