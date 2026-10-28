import React, { useState, useEffect } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import {
  generateWorldbuildingConcept,
  GeneratedConcept,
  GenerationPromptOptions,
} from '../../services/generatorService';
import { Sparkles, X, RefreshCw, Check, Edit2, AlertCircle, ShieldCheck } from 'lucide-react';

export const GenerationAssistantModal: React.FC = () => {
  const {
    currentWorld,
    isGeneratorOpen,
    setIsGeneratorOpen,
    generatorCategorySeed,
    refreshWorldData,
    openEntity,
  } = useWorld();

  const [category, setCategory] = useState<GenerationPromptOptions['category']>('character');
  const [themeHint, setThemeHint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewConcept, setPreviewConcept] = useState<GeneratedConcept | null>(null);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSummary, setEditedSummary] = useState('');

  useEffect(() => {
    if (generatorCategorySeed) {
      setCategory(generatorCategorySeed as any);
    }
  }, [generatorCategorySeed]);

  if (!isGeneratorOpen || !currentWorld) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateWorldbuildingConcept({
        category,
        themeHint: themeHint.trim(),
        world: currentWorld,
        apiKey: apiKey.trim() || undefined,
      });
      setPreviewConcept(result);
      setEditedTitle(result.title);
      setEditedSummary(result.summary);
      setIsEditingPreview(false);
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAndSave = async () => {
    if (!previewConcept || !currentWorld) return;
    const finalTitle = editedTitle.trim() || previewConcept.title;
    const finalSummary = editedSummary.trim() || previewConcept.summary;

    switch (category) {
      case 'character': {
        const charId = 'char-' + Date.now();
        await db.put('characters', {
          id: charId,
          worldId: currentWorld.id,
          name: finalTitle,
          aliases: [],
          titles: [previewConcept.subtitle || 'Generated Hero'],
          status: 'living',
          appearance: previewConcept.details?.appearance || '',
          personality: previewConcept.details?.personality || '',
          strengths: [],
          weaknesses: [],
          skills: [],
          goals: previewConcept.details?.goals || '',
          fears: '',
          secrets: previewConcept.details?.secret || '',
          backstory: finalSummary,
          factionIds: [],
          relationships: [],
          family: { parentIds: [], childIds: [], spouseIds: [], siblingIds: [] },
          itemIds: [],
          timelineEvents: [],
          tags: previewConcept.tags || [],
          customFields: [],
          notes: 'Created via Generation Assistant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await refreshWorldData();
        setIsGeneratorOpen(false);
        openEntity('character', charId);
        break;
      }
      case 'location': {
        const locId = 'loc-' + Date.now();
        await db.put('locations', {
          id: locId,
          worldId: currentWorld.id,
          name: finalTitle,
          alternateNames: [],
          type: 'settlement' as any,
          description: finalSummary,
          climate: previewConcept.details?.climate || '',
          population: previewConcept.details?.population || '',
          government: '',
          culture: '',
          languages: [],
          economy: previewConcept.details?.economy || '',
          secrets: previewConcept.details?.hazard || '',
          travelInfo: '',
          tags: previewConcept.tags || [],
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await refreshWorldData();
        setIsGeneratorOpen(false);
        openEntity('location', locId);
        break;
      }
      case 'quest': {
        const qId = 'qst-' + Date.now();
        await db.put('quests', {
          id: qId,
          worldId: currentWorld.id,
          title: finalTitle,
          type: 'main-quest',
          status: 'in-progress',
          summary: finalSummary,
          mainObjective: previewConcept.details?.mainObjective || finalSummary,
          milestones: (previewConcept.details?.keyMilestones || []).map((m: string, i: number) => ({
            id: 'm-' + i,
            text: m,
            done: false,
          })),
          characterIds: [],
          locationIds: [],
          factionIds: [],
          prerequisites: '',
          outcomes: previewConcept.details?.consequences || '',
          rewards: previewConcept.details?.rewards || '',
          tags: previewConcept.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await refreshWorldData();
        setIsGeneratorOpen(false);
        openEntity('quest', qId);
        break;
      }
      case 'creature': {
        const crtId = 'crt-' + Date.now();
        await db.put('creatures', {
          id: crtId,
          worldId: currentWorld.id,
          name: finalTitle,
          classification: 'monster',
          threatLevel: 'dangerous',
          appearance: finalSummary,
          habitat: previewConcept.details?.habitat || '',
          behavior: '',
          intelligence: 'animalistic',
          diet: '',
          abilities: Array.isArray(previewConcept.details?.abilities) ? previewConcept.details.abilities : [],
          weaknesses: previewConcept.details?.weakness ? [previewConcept.details.weakness] : [],
          culturalSignificance: previewConcept.details?.culturalValue || '',
          knownLocationIds: [],
          tags: previewConcept.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await refreshWorldData();
        setIsGeneratorOpen(false);
        openEntity('creature', crtId);
        break;
      }
      default: {
        const noteId = 'note-' + Date.now();
        await db.put('notes', {
          id: noteId,
          worldId: currentWorld.id,
          title: finalTitle,
          content: `${finalSummary}\n\nDetails: ${JSON.stringify(previewConcept.details, null, 2)}`,
          status: 'accepted',
          pinned: true,
          tags: previewConcept.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await refreshWorldData();
        setIsGeneratorOpen(false);
        openEntity('note', noteId);
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-[#303846] bg-[#12151b] shadow-2xl flex flex-col text-[#cad0dc] my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232936] px-5 py-4 bg-[#141822]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-semibold text-white">
                WorldForge Generation Studio
              </h2>
              <p className="text-[11px] text-[#8e95a5]">
                Harmonized with: <span className="text-[#d4af37]">{currentWorld.name}</span> ({currentWorld.genre})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGeneratorOpen(false)}
            className="p-1.5 rounded-lg text-[#8e95a5] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-1.5">
              Generation Focus
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'character', label: 'Character' },
                { id: 'location', label: 'Location' },
                { id: 'quest', label: 'Quest / Plot' },
                { id: 'creature', label: 'Creature' },
                { id: 'event', label: 'Event' },
                { id: 'magicSystem', label: 'Magic System' },
                { id: 'religion', label: 'Religion' },
                { id: 'plotTwist', label: 'Plot Twist' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCategory(opt.id as any)}
                  className={`p-2 rounded-xl text-xs font-medium border transition ${
                    category === opt.id
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5d99b]'
                      : 'border-[#262c38] bg-[#161a22] text-[#8e95a5] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#cad0dc] mb-1">
              Creative Prompt / Seed (Optional)
            </label>
            <input
              type="text"
              value={themeHint}
              onChange={(e) => setThemeHint(e.target.value)}
              placeholder="e.g. An exiled skyship navigator harboring a forbidden starlight parasite..."
              className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3.5 py-2 text-xs text-white placeholder-[#5c6475] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#717887]">
              Uses Gemini 3.8 Flash when online, or rich local fantasy codex when offline.
            </span>
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black hover:bg-[#e4bf47] transition shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Synthesizing...' : 'Generate Suggestion'}</span>
            </button>
          </div>

          {/* Generated Result Preview */}
          {previewConcept && (
            <div className="mt-4 p-4 rounded-2xl border border-[#d4af37]/50 bg-[#161b24] space-y-3">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  {isEditingPreview ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full rounded-lg border border-[#d4af37] bg-[#12151b] px-2 py-1 text-sm text-white"
                    />
                  ) : (
                    <h3 className="font-serif text-sm font-bold text-white">{editedTitle}</h3>
                  )}
                  {previewConcept.subtitle && (
                    <span className="text-[10px] text-[#d4af37] uppercase tracking-wide">
                      {previewConcept.subtitle}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setIsEditingPreview(!isEditingPreview)}
                  className="p-1 text-[#8e95a5] hover:text-[#d4af37]"
                  title="Edit before saving"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isEditingPreview ? (
                <textarea
                  rows={3}
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full rounded-lg border border-[#2b3342] bg-[#12151b] p-2 text-xs text-white"
                />
              ) : (
                <p className="text-xs text-[#cad0dc] leading-relaxed">{editedSummary}</p>
              )}

              {previewConcept.details && Object.keys(previewConcept.details).length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#12151b] border border-[#232936] text-[11px] text-[#8e95a5] space-y-1">
                  {Object.entries(previewConcept.details).map(([k, v]) => (
                    <div key={k} className="leading-snug">
                      <strong className="text-[#cad0dc] capitalize">{k}:</strong>{' '}
                      {Array.isArray(v) ? v.join(', ') : String(v)}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#232936]">
                <button
                  onClick={() => setPreviewConcept(null)}
                  className="text-xs text-[#8e95a5] hover:text-white"
                >
                  Discard
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1 rounded-xl border border-[#2b3342] px-3 py-1.5 text-xs text-[#cad0dc]"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleAcceptAndSave}
                    className="flex items-center gap-1 rounded-xl bg-[#d4af37] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47] shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept & Add to World</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
