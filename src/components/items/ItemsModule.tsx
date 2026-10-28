import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Item, ItemRarity } from '../../types/world';
import { Sword, Plus, Edit2, Trash2, Save, Sparkles } from 'lucide-react';

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'text-gray-400 bg-gray-900 border-gray-700',
  uncommon: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
  rare: 'text-blue-400 bg-blue-950/40 border-blue-500/40',
  'very-rare': 'text-purple-400 bg-purple-950/40 border-purple-500/40',
  legendary: 'text-amber-400 bg-amber-950/40 border-amber-500/40',
  mythic: 'text-rose-400 bg-rose-950/40 border-rose-500/40',
  unique: 'text-yellow-300 bg-yellow-950/40 border-yellow-500/40',
};

export const ItemsModule: React.FC = () => {
  const { currentWorld, items, characters, locations, refreshWorldData, openEntity } = useWorld();
  const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);

  const handleSave = async () => {
    if (!currentWorld || !editingItem || !editingItem.name?.trim()) return;
    const itm: Item = {
      id: editingItem.id || 'item-' + Date.now(),
      worldId: currentWorld.id,
      name: editingItem.name.trim(),
      type: editingItem.type || 'artifact',
      rarity: editingItem.rarity || 'rare',
      description: editingItem.description || '',
      creatorId: editingItem.creatorId,
      ownerId: editingItem.ownerId,
      locationId: editingItem.locationId,
      abilities: editingItem.abilities || [],
      history: editingItem.history || '',
      tags: editingItem.tags || [],
      createdAt: editingItem.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('items', itm);
    await refreshWorldData();
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this item?')) {
      await db.delete('items', id, currentWorld.id);
      setEditingItem(null);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Sword className="h-5 w-5 text-[#d4af37]" />
            <span>Artifacts, Relics, & Equipment</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Legendary weapons, ancient books, potions, tools, and relics of power
          </p>
        </div>

        <button
          onClick={() =>
            setEditingItem({
              id: 'item-' + Date.now(),
              name: 'New Relic',
              type: 'artifact',
              rarity: 'rare',
              abilities: [],
            })
          }
          className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Item</span>
        </button>
      </div>

      {editingItem ? (
        <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
            <h4 className="font-serif text-sm font-semibold text-white">Item Forge</h4>
            <div className="flex gap-2">
              <button onClick={() => setEditingItem(null)} className="text-xs text-[#8e95a5]">Cancel</button>
              <button onClick={handleSave} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save Item</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#d4af37] mb-1">Item Name *</label>
              <input
                type="text"
                value={editingItem.name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Classification</label>
              <select
                value={editingItem.type || 'artifact'}
                onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="weapon">Weapon</option>
                <option value="armor">Armor</option>
                <option value="artifact">Artifact</option>
                <option value="relic">Relic</option>
                <option value="potion">Potion / Elixir</option>
                <option value="book">Book / Tome</option>
                <option value="tool">Tool / Instrument</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Rarity Tier</label>
              <select
                value={editingItem.rarity || 'rare'}
                onChange={(e) => setEditingItem({ ...editingItem, rarity: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="very-rare">Very Rare</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
                <option value="unique">Unique</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Description & Physical Form</label>
              <textarea
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Abilities & Arcane Properties (comma separated)</label>
              <input
                type="text"
                value={(editingItem.abilities || []).join(', ')}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    abilities: e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                  })
                }
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((it) => {
            const badgeClass = RARITY_COLORS[it.rarity] || RARITY_COLORS.rare;
            const owner = characters.find((c) => c.id === it.ownerId);

            return (
              <div key={it.id} className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-sm font-semibold text-white">{it.name}</h3>
                    <span className={`text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {it.rarity}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#788091] capitalize">{it.type}</div>
                  <p className="text-xs text-[#a0a8b8] line-clamp-2 mt-1 leading-relaxed">{it.description}</p>
                </div>

                <div className="pt-2 border-t border-[#1e232e] text-[10px] text-[#717887] flex justify-between items-center">
                  <span>Owner: {owner ? owner.name : 'Unclaimed'}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingItem(it)} className="text-[#d4af37] text-xs">Edit</button>
                    <button onClick={() => handleDelete(it.id)} className="text-[#8e95a5] hover:text-red-400 text-xs">Delete</button>
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
