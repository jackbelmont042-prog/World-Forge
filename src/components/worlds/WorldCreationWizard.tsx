import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import {
  WorldGenre,
  TechLevel,
  MagicLevel,
  WorldTone,
  WorldStructure,
  World,
} from '../../types/world';
import { Compass, Sparkles, X, ChevronRight, ChevronLeft, Check, Image as ImageIcon } from 'lucide-react';

const PRESET_COVERS = [
  { label: 'Floating Sky Islands', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Gothic Dark Realm', url: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ancient Forest Shrine', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Desert Sand Kingdom', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sci-Fi Star Citadel', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
];

export const WorldCreationWizard: React.FC = () => {
  const { isCreationWizardOpen, setIsCreationWizardOpen, switchWorld, refreshWorldData } = useWorld();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<WorldGenre>('high-fantasy');
  const [customGenre, setCustomGenre] = useState('');
  const [techLevel, setTechLevel] = useState<TechLevel>('medieval');
  const [customTechLevel, setCustomTechLevel] = useState('');
  const [magicLevel, setMagicLevel] = useState<MagicLevel>('medium');
  const [customMagicLevel, setCustomMagicLevel] = useState('');
  const [tone, setTone] = useState<WorldTone>('epic');
  const [customTone, setCustomTone] = useState('');
  const [structure, setStructure] = useState<WorldStructure>('continent');
  const [customStructure, setCustomStructure] = useState('');
  const [themesInput, setThemesInput] = useState('Lost Civilization, Dynastic Conflict, Ancient Relics');
  const [era, setEra] = useState('Third Age of the Sun');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [privateNotes, setPrivateNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isCreationWizardOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const themes = themesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await db.createWorld({
        name: name.trim(),
        description: description.trim(),
        genre,
        customGenre: genre === 'custom' ? customGenre : undefined,
        techLevel,
        customTechLevel: techLevel === 'custom' ? customTechLevel : undefined,
        magicLevel,
        customMagicLevel: magicLevel === 'custom' ? customMagicLevel : undefined,
        tone,
        customTone: tone === 'custom' ? customTone : undefined,
        structure,
        customStructure: structure === 'custom' ? customStructure : undefined,
        themes,
        era: era.trim() || 'Current Era',
        coverUrl,
        privateNotes: privateNotes.trim(),
      });

      await switchWorld(created.id);
      await refreshWorldData();
      setIsCreationWizardOpen(false);
      // Reset form
      setName('');
      setDescription('');
      setStep(1);
    } catch (err) {
      console.error('Failed to create universe:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-[#303846] bg-[#12151b] shadow-2xl overflow-hidden flex flex-col my-auto text-[#cad0dc]">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-[#232936] px-5 py-4 bg-[#141822]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-semibold text-white">
                World Genesis Wizard
              </h2>
              <p className="text-[11px] text-[#8e95a5]">Step {step} of 3 · Construct your universe</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreationWizardOpen(false)}
            className="p-1.5 rounded-lg text-[#8e95a5] hover:text-white hover:bg-[#1f2532]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-1">
                  Universe Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elden Mire, The Silver Expanse, Val-Kharad"
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3.5 py-2.5 text-sm text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-1">
                  Core Premise & Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What is this world? What happened to make it unique? What tensions drive its history?"
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3.5 py-2.5 text-xs text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#cad0dc] mb-1">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as WorldGenre)}
                    className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-hidden"
                  >
                    <option value="high-fantasy">High Fantasy (Grand Magic)</option>
                    <option value="dark-fantasy">Dark Fantasy (Grim & Perilous)</option>
                    <option value="low-fantasy">Low Fantasy (Subtle Magic)</option>
                    <option value="science-fantasy">Science Fantasy (Tech & Sorcery)</option>
                    <option value="sci-fi">Hard / Space Sci-Fi</option>
                    <option value="post-apocalyptic">Post-Apocalyptic</option>
                    <option value="historical">Historical / Mythic Fiction</option>
                    <option value="custom">Custom Genre</option>
                  </select>
                  {genre === 'custom' && (
                    <input
                      type="text"
                      placeholder="Specify custom genre"
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#2b3342] bg-[#161a22] px-2.5 py-1.5 text-xs text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#cad0dc] mb-1">World Structure</label>
                  <select
                    value={structure}
                    onChange={(e) => setStructure(e.target.value as WorldStructure)}
                    className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-hidden"
                  >
                    <option value="planet">Single Planet / Globe</option>
                    <option value="continent">Continental Landmass</option>
                    <option value="archipelago">Island Archipelago / Sky Islands</option>
                    <option value="realm">Flat Earth / Dimensional Realm</option>
                    <option value="multiverse">Multiverse / Planar Sphere</option>
                    <option value="custom">Custom Geography</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Narrative Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['epic', 'grim', 'mysterious', 'hopeful', 'whimsical'] as WorldTone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`p-2 rounded-xl text-xs font-medium capitalize border transition ${
                        tone === t
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5d99b]'
                          : 'border-[#2b3342] bg-[#161a22] text-[#8e95a5] hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#cad0dc] mb-1">Technology Level</label>
                  <select
                    value={techLevel}
                    onChange={(e) => setTechLevel(e.target.value as TechLevel)}
                    className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-hidden"
                  >
                    <option value="stone-age">Stone Age / Prehistoric</option>
                    <option value="bronze-age">Bronze / Iron Antiquity</option>
                    <option value="medieval">High Medieval / Feudal</option>
                    <option value="renaissance">Renaissance & Sail</option>
                    <option value="steampunk">Steampunk & Clockwork</option>
                    <option value="industrial">Industrial Revolution</option>
                    <option value="modern">Modern Information Era</option>
                    <option value="sci-fi">Interplanetary Sci-Fi</option>
                    <option value="futuristic">Far-Future Dyson Sphere</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#cad0dc] mb-1">Magic / Arcane Level</label>
                  <select
                    value={magicLevel}
                    onChange={(e) => setMagicLevel(e.target.value as MagicLevel)}
                    className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-hidden"
                  >
                    <option value="none">None (Pure Physics / Mundane)</option>
                    <option value="low">Low (Rare, Folk Superstition)</option>
                    <option value="medium">Medium (Trained Wizards, Covens)</option>
                    <option value="high">High (Omnipresent Magic Infrastructure)</option>
                    <option value="wild">Wild / Cataclysmic Anomaly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Current Historical Era / Year</label>
                <input
                  type="text"
                  value={era}
                  onChange={(e) => setEra(e.target.value)}
                  placeholder="e.g. 840 After the Fall, Year of the Shattered Crown"
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">
                  Central World Themes (comma separated)
                </label>
                <input
                  type="text"
                  value={themesInput}
                  onChange={(e) => setThemesInput(e.target.value)}
                  placeholder="Forbidden Alchemy, Religious Schism, Sky Exploration"
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Private Architect Notes</label>
                <textarea
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  rows={2}
                  placeholder="Secrets, future plot hooks, or GM notes not revealed to players..."
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-2">
                  Select Visual World Aesthetic Cover
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_COVERS.map((preset) => (
                    <div
                      key={preset.url}
                      onClick={() => setCoverUrl(preset.url)}
                      className={`group relative h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        coverUrl === preset.url ? 'border-[#d4af37] scale-102' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[10px] font-medium text-white truncate">{preset.label}</span>
                      </div>
                      {coverUrl === preset.url && (
                        <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[#d4af37] text-black flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Or Custom Cover Image URL</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://example.com/map-artwork.jpg"
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-[#2b3342] bg-[#161a22]/80 space-y-1.5">
                <div className="font-serif text-sm font-semibold text-white">{name || 'Untitled Realm'}</div>
                <div className="flex flex-wrap gap-x-2 text-[11px] text-[#8e95a5]">
                  <span>{genre}</span>
                  <span>·</span>
                  <span>{techLevel} tech</span>
                  <span>·</span>
                  <span>{magicLevel} magic</span>
                  <span>·</span>
                  <span>{tone} tone</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t border-[#232936] px-5 py-3.5 bg-[#141822]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-[#2b3342] bg-[#161a22] px-3.5 py-2 text-xs font-medium text-[#cad0dc] hover:text-white hover:bg-[#1f2532] transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              disabled={step === 1 && !name.trim()}
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-[#0d1015] hover:bg-[#e4bf47] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              disabled={!name.trim() || submitting}
              onClick={handleCreate}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-5 py-2 text-xs font-semibold text-[#0d1015] hover:bg-[#e4bf47] transition shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>{submitting ? 'Forging World...' : 'Forge Universe'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
