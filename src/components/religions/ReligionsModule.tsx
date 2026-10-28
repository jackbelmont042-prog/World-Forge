import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Religion, PantheonDeity } from '../../types/world';
import { Flame, Plus, Edit2, Trash2, Save, Sparkles } from 'lucide-react';

export const ReligionsModule: React.FC = () => {
  const { currentWorld, religions, refreshWorldData, openGeneratorWithCategory } = useWorld();
  const [editingReligion, setEditingReligion] = useState<Partial<Religion> | null>(null);

  const handleSave = async () => {
    if (!currentWorld || !editingReligion || !editingReligion.name?.trim()) return;
    const rel: Religion = {
      id: editingReligion.id || 'rel-' + Date.now(),
      worldId: currentWorld.id,
      name: editingReligion.name.trim(),
      pantheonDeities: editingReligion.pantheonDeities || [],
      beliefs: editingReligion.beliefs || '',
      originMyth: editingReligion.originMyth || '',
      disputedVersions: editingReligion.disputedVersions || [],
      sacredTexts: editingReligion.sacredTexts || '',
      symbols: editingReligion.symbols || '',
      rituals: editingReligion.rituals || '',
      holidays: editingReligion.holidays || '',
      followersDescription: editingReligion.followersDescription || '',
      associatedLocationIds: editingReligion.associatedLocationIds || [],
      tags: editingReligion.tags || [],
      createdAt: editingReligion.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('religions', rel);
    await refreshWorldData();
    setEditingReligion(null);
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this faith / religion?')) {
      await db.delete('religions', id, currentWorld.id);
      setEditingReligion(null);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#d4af37]" />
            <span>Religions, Pantheons, & Myths</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Divine pantheons, creation legends, sacred texts, holidays, and disputed heresies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openGeneratorWithCategory('religion')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs text-[#f5d99b]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate Myth</span>
          </button>
          <button
            onClick={() =>
              setEditingReligion({
                id: 'rel-' + Date.now(),
                name: 'New Faith',
                pantheonDeities: [],
                disputedVersions: [],
              })
            }
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Faith</span>
          </button>
        </div>
      </div>

      {editingReligion ? (
        <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
            <h4 className="font-serif text-sm font-semibold text-white">Scripture & Faith</h4>
            <div className="flex gap-2">
              <button onClick={() => setEditingReligion(null)} className="text-xs text-[#8e95a5]">Cancel</button>
              <button onClick={handleSave} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save Faith</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d4af37] mb-1">Faith / Church Name *</label>
            <input
              type="text"
              value={editingReligion.name || ''}
              onChange={(e) => setEditingReligion({ ...editingReligion, name: e.target.value })}
              className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Core Beliefs & Doctrine</label>
              <textarea
                value={editingReligion.beliefs || ''}
                onChange={(e) => setEditingReligion({ ...editingReligion, beliefs: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Creation Myth & Cosmic Origin</label>
              <textarea
                value={editingReligion.originMyth || ''}
                onChange={(e) => setEditingReligion({ ...editingReligion, originMyth: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1">Disputed Versions & Heretical Variations</label>
              <textarea
                value={(editingReligion.disputedVersions || []).join('\n')}
                onChange={(e) => setEditingReligion({ ...editingReligion, disputedVersions: e.target.value.split('\n').filter(Boolean) })}
                rows={2}
                placeholder="Separate each competing or heretical version by line..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {religions.map((rel) => (
            <div key={rel.id} className="p-5 rounded-2xl border border-[#232936] bg-[#13161e] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#202530]">
                <h3 className="font-serif text-base font-bold text-white">{rel.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditingReligion(rel)} className="text-xs text-[#d4af37]">Edit</button>
                  <button onClick={() => handleDelete(rel.id)} className="text-xs text-[#8e95a5] hover:text-red-400">Delete</button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#cad0dc]">
                <p className="bg-[#161a22] p-3 rounded-xl border border-[#232936]">{rel.beliefs}</p>
                {rel.originMyth && (
                  <div>
                    <span className="font-semibold text-[#d4af37] block mb-1">Creation Myth:</span>
                    <p className="text-[#a0a8b8] leading-relaxed">{rel.originMyth}</p>
                  </div>
                )}
                {rel.pantheonDeities.length > 0 && (
                  <div className="pt-2">
                    <span className="font-semibold text-[#d4af37] block mb-2">Deities & Avatars:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rel.pantheonDeities.map((d, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-[#161a22] border border-[#202530]">
                          <span className="font-semibold text-white">{d.name}</span>
                          <span className="block text-[10px] text-[#d4af37]">{d.domain}</span>
                          <p className="text-[11px] text-[#8e95a5] mt-1">{d.myth}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
