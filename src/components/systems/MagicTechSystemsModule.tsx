import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { MagicOrTechSystem } from '../../types/world';
import { Zap, Plus, Edit2, Trash2, Save, Sparkles, AlertTriangle } from 'lucide-react';

export const MagicTechSystemsModule: React.FC = () => {
  const { currentWorld, magicOrTechSystems, refreshWorldData, openGeneratorWithCategory } = useWorld();
  const [editingSystem, setEditingSystem] = useState<Partial<MagicOrTechSystem> | null>(null);

  const handleSave = async () => {
    if (!currentWorld || !editingSystem || !editingSystem.name?.trim()) return;
    const sys: MagicOrTechSystem = {
      id: editingSystem.id || 'sys-' + Date.now(),
      worldId: currentWorld.id,
      name: editingSystem.name.trim(),
      type: editingSystem.type || 'magic',
      sources: editingSystem.sources || '',
      users: editingSystem.users || '',
      learningMethod: editingSystem.learningMethod || '',
      rulesAndLimitations: editingSystem.rulesAndLimitations || '',
      costsAndConsequences: editingSystem.costsAndConsequences || '',
      categoriesOrSchools: editingSystem.categoriesOrSchools || [],
      abilitiesOrSpells: editingSystem.abilitiesOrSpells || [],
      forbiddenPractices: editingSystem.forbiddenPractices || '',
      tags: editingSystem.tags || [],
      createdAt: editingSystem.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('magicOrTechSystems', sys);
    await refreshWorldData();
    setEditingSystem(null);
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this system definition?')) {
      await db.delete('magicOrTechSystems', id, currentWorld.id);
      setEditingSystem(null);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#d4af37]" />
            <span>Magic, Technology, & Power Systems</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Hard & soft arcane physics, power costs, technological energy grids, and forbidden rites
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openGeneratorWithCategory('magicSystem')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs text-[#f5d99b]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate System</span>
          </button>
          <button
            onClick={() => setEditingSystem({ id: 'sys-' + Date.now(), name: 'New Arcane System', type: 'magic' })}
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New System</span>
          </button>
        </div>
      </div>

      {editingSystem ? (
        <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
            <h4 className="font-serif text-sm font-semibold text-white">System Architecture</h4>
            <div className="flex gap-2">
              <button onClick={() => setEditingSystem(null)} className="text-xs text-[#8e95a5]">Cancel</button>
              <button onClick={handleSave} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save System</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#d4af37] mb-1">System Name *</label>
              <input
                type="text"
                value={editingSystem.name || ''}
                onChange={(e) => setEditingSystem({ ...editingSystem, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Paradigm</label>
              <select
                value={editingSystem.type || 'magic'}
                onChange={(e) => setEditingSystem({ ...editingSystem, type: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="magic">Magic / Sorcery</option>
                <option value="technology">Technology / Science</option>
                <option value="hybrid">Magitech / Hybrid</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Power Source & Fuel</label>
              <textarea
                value={editingSystem.sources || ''}
                onChange={(e) => setEditingSystem({ ...editingSystem, sources: e.target.value })}
                rows={2}
                placeholder="Where does the power come from? (Star crystals, ley lines, coal-steam, divine grace...)"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Rules, Limitations & Laws of Physics</label>
              <textarea
                value={editingSystem.rulesAndLimitations || ''}
                onChange={(e) => setEditingSystem({ ...editingSystem, rulesAndLimitations: e.target.value })}
                rows={3}
                placeholder="What CANNOT be done? Conservation of energy, material components, line of sight..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-rose-400 mb-1">Costs, Tolls & Dark Consequences</label>
              <textarea
                value={editingSystem.costsAndConsequences || ''}
                onChange={(e) => setEditingSystem({ ...editingSystem, costsAndConsequences: e.target.value })}
                rows={2}
                placeholder="Physical toll, madness, fuel depletion, radiation..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-red-400 mb-1">Forbidden Arts & Heresies</label>
              <textarea
                value={editingSystem.forbiddenPractices || ''}
                onChange={(e) => setEditingSystem({ ...editingSystem, forbiddenPractices: e.target.value })}
                rows={2}
                placeholder="Practices banned by imperial law or dangerous to world integrity..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {magicOrTechSystems.map((sys) => (
            <div key={sys.id} className="p-5 rounded-2xl border border-[#232936] bg-[#13161e] space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#202530]">
                <div>
                  <h3 className="font-serif text-base font-bold text-white">{sys.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37]">
                    {sys.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingSystem(sys)} className="text-xs text-[#d4af37]">Edit</button>
                  <button onClick={() => handleDelete(sys.id)} className="text-xs text-[#8e95a5] hover:text-red-400">Delete</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#cad0dc]">
                <div className="p-3 rounded-xl bg-[#161a22] border border-[#232936]">
                  <span className="font-semibold text-[#d4af37] block mb-1">Source & Origin:</span>
                  <p>{sys.sources}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#161a22] border border-[#232936]">
                  <span className="font-semibold text-[#d4af37] block mb-1">Limitations & Rules:</span>
                  <p>{sys.rulesAndLimitations}</p>
                </div>
              </div>

              {sys.abilitiesOrSpells && sys.abilitiesOrSpells.length > 0 && (
                <div>
                  <h4 className="font-serif text-xs uppercase font-semibold text-[#d4af37] mb-2">Canonical Spells / Arts</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sys.abilitiesOrSpells.map((ab, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#161a22] border border-[#202530] text-xs space-y-1">
                        <div className="flex justify-between text-white font-semibold">
                          <span>{ab.name}</span>
                          <span className="text-[10px] text-[#d4af37]">{ab.level}</span>
                        </div>
                        <p className="text-[11px] text-[#8e95a5]">{ab.description}</p>
                        <div className="text-[10px] text-[#717887]">Cost: {ab.cost}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
