import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { HistoricalEvent, EventCategory } from '../../types/world';
import { Clock, Plus, Edit2, Trash2, Save, Sparkles, AlertTriangle, CheckCircle, ArrowDownUp } from 'lucide-react';

const EVENT_CATEGORIES: EventCategory[] = [
  'war',
  'treaty',
  'dynasty',
  'disaster',
  'discovery',
  'migration',
  'revolution',
  'religion',
  'milestone',
  'custom',
];

export const TimelineModule: React.FC = () => {
  const { currentWorld, historicalEvents, characters, locations, factions, refreshWorldData, openGeneratorWithCategory } = useWorld();
  const [editingEvent, setEditingEvent] = useState<Partial<HistoricalEvent> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());

  const sortedEvents = useMemo(() => {
    return historicalEvents
      .filter((e) => categoryFilter === 'all' || e.category === categoryFilter)
      .slice()
      .sort((a, b) => a.numericSortYear - b.numericSortYear);
  }, [historicalEvents, categoryFilter]);

  // Contradiction detection engine
  const contradictions = useMemo(() => {
    const list: { eventId: string; warning: string }[] = [];

    historicalEvents.forEach((evt) => {
      // Check linked characters for temporal sanity
      evt.characterIds.forEach((charId) => {
        const char = characters.find((c) => c.id === charId);
        if (char) {
          // If character is marked deceased and event is much later, or birth was recorded in personal timeline
          const birthEvent = char.timelineEvents.find((t) => t.title.toLowerCase().includes('birth'));
          if (birthEvent) {
            const birthYearNum = parseInt(birthEvent.year.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(birthYearNum) && evt.numericSortYear < birthYearNum) {
              list.push({
                eventId: evt.id,
                warning: `Contradiction: ${char.name} is listed in "${evt.title || evt.name}" (Year ${evt.numericSortYear}), which occurs before their recorded birth in ${birthEvent.year}.`,
              });
            }
          }
        }
      });
    });

    return list;
  }, [historicalEvents, characters]);

  const handleSave = async () => {
    if (!currentWorld || !editingEvent || !editingEvent.title?.trim()) return;
    const evt: HistoricalEvent = {
      id: editingEvent.id || 'evt-' + Date.now(),
      worldId: currentWorld.id,
      title: editingEvent.title.trim(),
      date: editingEvent.date || 'Year 0',
      numericSortYear: Number(editingEvent.numericSortYear) || 0,
      era: editingEvent.era || currentWorld.era || 'Current Era',
      category: editingEvent.category || 'milestone',
      description: editingEvent.description || '',
      causes: editingEvent.causes || '',
      consequences: editingEvent.consequences || '',
      characterIds: editingEvent.characterIds || [],
      locationIds: editingEvent.locationIds || [],
      factionIds: editingEvent.factionIds || [],
      politicalEntityIds: editingEvent.politicalEntityIds || [],
      tags: editingEvent.tags || [],
      createdAt: editingEvent.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('historicalEvents', evt);
    await refreshWorldData();
    setEditingEvent(null);
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this historical chronicle event?')) {
      await db.delete('historicalEvents', id, currentWorld.id);
      setEditingEvent(null);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#d4af37]" />
            <span>Timeline & Historical Chronicles</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Chronological eras, treaties, cataclysms, and historical contradiction detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openGeneratorWithCategory('event')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs text-[#f5d99b]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate Event</span>
          </button>
          <button
            onClick={() =>
              setEditingEvent({
                id: 'evt-' + Date.now(),
                title: 'New Milestone',
                date: 'Year 500',
                numericSortYear: 500,
                era: currentWorld?.era || 'Current Era',
                category: 'milestone',
                characterIds: [],
                locationIds: [],
                factionIds: [],
              })
            }
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Contradiction Warnings Banner */}
      {contradictions.length > 0 && (
        <div className="space-y-2">
          {contradictions.map((c, i) => {
            if (dismissedWarnings.has(c.eventId)) return null;
            return (
              <div
                key={i}
                className="p-3 rounded-xl border border-amber-500/50 bg-amber-950/20 text-xs text-amber-200 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{c.warning}</span>
                </div>
                <button
                  onClick={() => setDismissedWarnings(new Set([...dismissedWarnings, c.eventId]))}
                  className="px-2 py-0.5 rounded-md bg-amber-900/50 hover:bg-amber-800 text-[11px] text-amber-300 font-medium shrink-0"
                >
                  Override Warning
                </button>
              </div>
            );
          })}
        </div>
      )}

      {editingEvent ? (
        <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
            <h4 className="font-serif text-sm font-semibold text-white">Record Historical Milestone</h4>
            <div className="flex gap-2">
              <button onClick={() => setEditingEvent(null)} className="text-xs text-[#8e95a5]">Cancel</button>
              <button onClick={handleSave} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save Event</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#d4af37] mb-1">Event Title *</label>
              <input
                type="text"
                value={editingEvent.title || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Category</label>
              <select
                value={editingEvent.category || 'milestone'}
                onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Calendar Date String</label>
              <input
                type="text"
                placeholder="e.g. Year 742 of the Floating Sun"
                value={editingEvent.date || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Numeric Year (for ordering)</label>
              <input
                type="number"
                value={editingEvent.numericSortYear ?? 0}
                onChange={(e) => setEditingEvent({ ...editingEvent, numericSortYear: Number(e.target.value) })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Era Name</label>
              <input
                type="text"
                value={editingEvent.era || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, era: e.target.value })}
                placeholder="Dawn of the Shards"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Historical Narrative</label>
              <textarea
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                rows={3}
                placeholder="What occurred? Who struck the blow, or what cataclysm erupted?"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Causes & Precursors</label>
                <textarea
                  value={editingEvent.causes || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, causes: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#cad0dc] mb-1">Consequences & Aftermath</label>
                <textarea
                  value={editingEvent.consequences || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, consequences: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#2b3342] space-y-6">
          {sortedEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline pin point */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#0f1115] bg-[#d4af37] ring-4 ring-[#0f1115] group-hover:scale-125 transition" />

              <div className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#d4af37] px-2.5 py-0.5 rounded-lg bg-[#d4af37]/10">
                      {evt.date}
                    </span>
                    <span className="text-[10px] text-[#717887] uppercase">· {evt.era}</span>
                    <span className="text-[10px] text-[#8e95a5] capitalize uppercase font-mono">[{evt.category}]</span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setEditingEvent(evt)} className="text-xs text-[#d4af37]">Edit</button>
                    <button onClick={() => handleDelete(evt.id)} className="text-xs text-[#8e95a5] hover:text-red-400">Delete</button>
                  </div>
                </div>

                <h3 className="font-serif text-sm font-semibold text-white">{evt.title || evt.name}</h3>
                <p className="text-xs text-[#a0a8b8] leading-relaxed">{evt.description}</p>

                {(evt.causes || evt.consequences) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1e232e] text-[11px] text-[#788091]">
                    {evt.causes && <div><strong className="text-[#a0a8b8]">Cause:</strong> {evt.causes}</div>}
                    {evt.consequences && <div><strong className="text-[#a0a8b8]">Result:</strong> {evt.consequences}</div>}
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
