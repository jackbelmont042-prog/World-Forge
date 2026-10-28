import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Species, Culture, Language } from '../../types/world';
import { Globe2, Plus, Edit2, Trash2, BookOpen, Save, Sparkles } from 'lucide-react';

export const SpeciesCulturesModule: React.FC = () => {
  const { currentWorld, species, cultures, languages, refreshWorldData, openGeneratorWithCategory } = useWorld();
  const [subTab, setSubTab] = useState<'species' | 'cultures' | 'languages'>('species');

  // Species Edit
  const [editingSpecies, setEditingSpecies] = useState<Partial<Species> | null>(null);
  // Culture Edit
  const [editingCulture, setEditingCulture] = useState<Partial<Culture> | null>(null);
  // Language Edit
  const [editingLanguage, setEditingLanguage] = useState<Partial<Language> | null>(null);

  // New word form state in language
  const [newWord, setNewWord] = useState({ word: '', translation: '', partOfSpeech: 'noun' });

  // Handle Species Save
  const handleSaveSpecies = async () => {
    if (!currentWorld || !editingSpecies || !editingSpecies.name?.trim()) return;
    const item: Species = {
      id: editingSpecies.id || 'spc-' + Date.now(),
      worldId: currentWorld.id,
      name: editingSpecies.name.trim(),
      appearance: editingSpecies.appearance || '',
      physiology: editingSpecies.physiology || '',
      lifespan: editingSpecies.lifespan || '',
      abilities: editingSpecies.abilities || [],
      limitations: editingSpecies.limitations || [],
      habitat: editingSpecies.habitat || '',
      society: editingSpecies.society || '',
      variants: editingSpecies.variants || [],
      tags: editingSpecies.tags || [],
      createdAt: editingSpecies.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('species', item);
    await refreshWorldData();
    setEditingSpecies(null);
  };

  // Handle Culture Save
  const handleSaveCulture = async () => {
    if (!currentWorld || !editingCulture || !editingCulture.name?.trim()) return;
    const item: Culture = {
      id: editingCulture.id || 'cul-' + Date.now(),
      worldId: currentWorld.id,
      name: editingCulture.name.trim(),
      traditions: editingCulture.traditions || '',
      values: editingCulture.values || '',
      customs: editingCulture.customs || '',
      clothing: editingCulture.clothing || '',
      food: editingCulture.food || '',
      socialStructure: editingCulture.socialStructure || '',
      taboos: editingCulture.taboos || '',
      festivals: editingCulture.festivals || '',
      namingConventions: editingCulture.namingConventions || '',
      tags: editingCulture.tags || [],
      createdAt: editingCulture.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('cultures', item);
    await refreshWorldData();
    setEditingCulture(null);
  };

  // Handle Language Save
  const handleSaveLanguage = async () => {
    if (!currentWorld || !editingLanguage || !editingLanguage.name?.trim()) return;
    const item: Language = {
      id: editingLanguage.id || 'lang-' + Date.now(),
      worldId: currentWorld.id,
      name: editingLanguage.name.trim(),
      writingSystem: editingLanguage.writingSystem || '',
      phonetics: editingLanguage.phonetics || '',
      grammar: editingLanguage.grammar || '',
      vocabulary: editingLanguage.vocabulary || [],
      samplePhrases: editingLanguage.samplePhrases || [],
      tags: editingLanguage.tags || [],
      createdAt: editingLanguage.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('languages', item);
    await refreshWorldData();
    setEditingLanguage(null);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-[#d4af37]" />
            <span>Species, Cultures, & Languages</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Anthropology, physiology, customs, dialect dictionaries, and traditions
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-[#2b3342] bg-[#141820] p-1 text-xs">
          <button
            onClick={() => setSubTab('species')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'species' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5]'
            }`}
          >
            Species ({species.length})
          </button>
          <button
            onClick={() => setSubTab('cultures')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'cultures' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5]'
            }`}
          >
            Cultures ({cultures.length})
          </button>
          <button
            onClick={() => setSubTab('languages')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'languages' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5]'
            }`}
          >
            Languages ({languages.length})
          </button>
        </div>
      </div>

      {/* 1. Species Tab */}
      {subTab === 'species' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setEditingSpecies({ id: 'spc-' + Date.now(), name: 'New Species' })}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Species</span>
            </button>
          </div>

          {editingSpecies ? (
            <div className="p-4 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
                <h4 className="font-serif text-sm text-white">Edit Species</h4>
                <div className="flex gap-2">
                  <button onClick={() => setEditingSpecies(null)} className="text-xs text-[#8e95a5]">Cancel</button>
                  <button onClick={handleSaveSpecies} className="text-xs bg-[#d4af37] text-black px-3 py-1 rounded-lg font-semibold">Save</button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Species Name *"
                value={editingSpecies.name || ''}
                onChange={(e) => setEditingSpecies({ ...editingSpecies, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
              <textarea
                placeholder="Appearance & Physiology..."
                rows={2}
                value={editingSpecies.appearance || ''}
                onChange={(e) => setEditingSpecies({ ...editingSpecies, appearance: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Typical Lifespan (e.g. 140-180 solar cycles)"
                value={editingSpecies.lifespan || ''}
                onChange={(e) => setEditingSpecies({ ...editingSpecies, lifespan: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {species.map((spc) => (
                <div key={spc.id} className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-sm font-semibold text-white">{spc.name}</h3>
                    <button onClick={() => setEditingSpecies(spc)} className="text-xs text-[#d4af37] hover:underline">Edit</button>
                  </div>
                  <p className="text-xs text-[#a0a8b8] line-clamp-2">{spc.appearance}</p>
                  <div className="text-[10px] text-[#717887]">Lifespan: {spc.lifespan || 'Unknown'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Cultures Tab */}
      {subTab === 'cultures' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setEditingCulture({ id: 'cul-' + Date.now(), name: 'New Culture' })}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Culture</span>
            </button>
          </div>

          {editingCulture ? (
            <div className="p-4 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
                <h4 className="font-serif text-sm text-white">Edit Culture</h4>
                <div className="flex gap-2">
                  <button onClick={() => setEditingCulture(null)} className="text-xs text-[#8e95a5]">Cancel</button>
                  <button onClick={handleSaveCulture} className="text-xs bg-[#d4af37] text-black px-3 py-1 rounded-lg font-semibold">Save</button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Culture Name *"
                value={editingCulture.name || ''}
                onChange={(e) => setEditingCulture({ ...editingCulture, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
              <textarea
                placeholder="Traditions & Values..."
                rows={2}
                value={editingCulture.traditions || ''}
                onChange={(e) => setEditingCulture({ ...editingCulture, traditions: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
              <textarea
                placeholder="Food, Drink, and Garb..."
                rows={2}
                value={editingCulture.clothing || ''}
                onChange={(e) => setEditingCulture({ ...editingCulture, clothing: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {cultures.map((cul) => (
                <div key={cul.id} className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-sm font-semibold text-white">{cul.name}</h3>
                    <button onClick={() => setEditingCulture(cul)} className="text-xs text-[#d4af37] hover:underline">Edit</button>
                  </div>
                  <p className="text-xs text-[#a0a8b8] line-clamp-3 leading-relaxed">{cul.traditions || cul.values}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Languages & Dictionaries Tab */}
      {subTab === 'languages' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setEditingLanguage({ id: 'lang-' + Date.now(), name: 'New Language', vocabulary: [], samplePhrases: [] })}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Language</span>
            </button>
          </div>

          {editingLanguage ? (
            <div className="p-4 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
                <h4 className="font-serif text-sm text-white">Edit Language & Dictionary</h4>
                <div className="flex gap-2">
                  <button onClick={() => setEditingLanguage(null)} className="text-xs text-[#8e95a5]">Cancel</button>
                  <button onClick={handleSaveLanguage} className="text-xs bg-[#d4af37] text-black px-3 py-1 rounded-lg font-semibold">Save</button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Language Name *"
                value={editingLanguage.name || ''}
                onChange={(e) => setEditingLanguage({ ...editingLanguage, name: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
              <textarea
                placeholder="Writing script, alphabet, cuneiform or runic rules..."
                rows={2}
                value={editingLanguage.writingSystem || ''}
                onChange={(e) => setEditingLanguage({ ...editingLanguage, writingSystem: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />

              {/* Add Word Row */}
              <div className="p-3 rounded-xl border border-[#232936] bg-[#141820] space-y-2">
                <div className="text-[11px] font-semibold text-[#d4af37] uppercase">Add Vocabulary Word</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Native Word"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    className="flex-1 rounded-lg border border-[#282f3d] bg-[#161a22] px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Translation"
                    value={newWord.translation}
                    onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
                    className="flex-1 rounded-lg border border-[#282f3d] bg-[#161a22] px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (!newWord.word || !newWord.translation) return;
                      const vocab = [...(editingLanguage.vocabulary || []), newWord];
                      setEditingLanguage({ ...editingLanguage, vocabulary: vocab });
                      setNewWord({ word: '', translation: '', partOfSpeech: 'noun' });
                    }}
                    className="bg-[#d4af37] text-black px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {languages.map((lang) => (
                <div key={lang.id} className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-white">{lang.name}</h3>
                      <p className="text-[11px] text-[#8e95a5]">{lang.writingSystem}</p>
                    </div>
                    <button onClick={() => setEditingLanguage(lang)} className="text-xs text-[#d4af37]">Edit</button>
                  </div>

                  {lang.vocabulary.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1f242e]">
                      {lang.vocabulary.map((v, i) => (
                        <div key={i} className="p-2 rounded-xl bg-[#161a22] border border-[#202530] text-xs">
                          <span className="font-serif font-bold text-[#f5d99b]">{v.word}</span>
                          <span className="block text-[10px] text-[#8e95a5]">{v.translation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
