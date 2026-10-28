import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Quest, QuestStatus, QuestType, QuestMilestone } from '../../types/world';
import { Scroll, Plus, Edit2, Trash2, CheckCircle2, Circle, Save, Sparkles, LayoutGrid, List } from 'lucide-react';

const STATUS_COLUMNS: { status: QuestStatus; label: string }[] = [
  { status: 'unstarted', label: 'Unstarted' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'foreshadowed', label: 'Foreshadowed' },
];

export const QuestsModule: React.FC = () => {
  const { currentWorld, quests, characters, locations, factions, refreshWorldData, openGeneratorWithCategory } = useWorld();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [editingQuest, setEditingQuest] = useState<Partial<Quest> | null>(null);

  // New milestone draft text
  const [newMilestoneText, setNewMilestoneText] = useState('');

  const handleToggleMilestone = async (quest: Quest, milestoneId: string) => {
    const updatedMilestones = quest.milestones.map((m) =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    );
    const updatedQuest: Quest = {
      ...quest,
      milestones: updatedMilestones,
      status: updatedMilestones.every((m) => m.done) && updatedMilestones.length > 0 ? 'completed' : quest.status,
      updatedAt: new Date().toISOString(),
    };
    await db.put('quests', updatedQuest);
    await refreshWorldData();
  };

  const handleSave = async () => {
    if (!currentWorld || !editingQuest || !editingQuest.title?.trim()) return;
    const q: Quest = {
      id: editingQuest.id || 'qst-' + Date.now(),
      worldId: currentWorld.id,
      title: editingQuest.title.trim(),
      type: editingQuest.type || 'main-quest',
      status: editingQuest.status || 'in-progress',
      summary: editingQuest.summary || '',
      mainObjective: editingQuest.mainObjective || '',
      milestones: editingQuest.milestones || [],
      characterIds: editingQuest.characterIds || [],
      locationIds: editingQuest.locationIds || [],
      factionIds: editingQuest.factionIds || [],
      prerequisites: editingQuest.prerequisites || '',
      outcomes: editingQuest.outcomes || '',
      rewards: editingQuest.rewards || '',
      tags: editingQuest.tags || [],
      createdAt: editingQuest.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('quests', q);
    await refreshWorldData();
    setEditingQuest(null);
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this quest / plot thread?')) {
      await db.delete('quests', id, currentWorld.id);
      setEditingQuest(null);
      await refreshWorldData();
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Scroll className="h-5 w-5 text-[#d4af37]" />
            <span>Quests, Plot Threads, & Campaign Planning</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Main plot lines, foreshadowing, interactive milestone checklists, and Kanban board
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#2b3342] bg-[#141820] p-1 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg ${viewMode === 'board' ? 'bg-[#d4af37] text-black' : 'text-[#8e95a5]'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[#d4af37] text-black' : 'text-[#8e95a5]'}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => openGeneratorWithCategory('quest')}
            className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#161a22] px-3 py-1.5 text-xs text-[#f5d99b]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Generate Plot</span>
          </button>
          <button
            onClick={() =>
              setEditingQuest({
                id: 'qst-' + Date.now(),
                title: 'New Story Arc',
                type: 'main-quest',
                status: 'in-progress',
                milestones: [],
              })
            }
            className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Quest</span>
          </button>
        </div>
      </div>

      {editingQuest ? (
        <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
            <h4 className="font-serif text-sm font-semibold text-white">Quest / Plot Dossier</h4>
            <div className="flex gap-2">
              <button onClick={() => setEditingQuest(null)} className="text-xs text-[#8e95a5]">Cancel</button>
              <button onClick={handleSave} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save Plot</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#d4af37] mb-1">Quest Title *</label>
              <input
                type="text"
                value={editingQuest.title || ''}
                onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Status</label>
              <select
                value={editingQuest.status || 'in-progress'}
                onChange={(e) => setEditingQuest({ ...editingQuest, status: e.target.value as any })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              >
                <option value="unstarted">Unstarted</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
                <option value="foreshadowed">Foreshadowed</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#cad0dc] mb-1">Premise & Narrative Summary</label>
              <textarea
                value={editingQuest.summary || ''}
                onChange={(e) => setEditingQuest({ ...editingQuest, summary: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Milestones editor */}
            <div className="p-3 rounded-xl border border-[#232936] bg-[#141820] space-y-2">
              <div className="text-[11px] font-semibold text-[#d4af37] uppercase">Interactive Objectives & Milestones</div>
              <div className="space-y-1.5">
                {(editingQuest.milestones || []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#161a22] border border-[#202530] text-xs">
                    <span className={m.done ? 'line-through text-[#717887]' : 'text-white'}>{m.text}</span>
                    <button
                      onClick={() =>
                        setEditingQuest({
                          ...editingQuest,
                          milestones: (editingQuest.milestones || []).filter((item) => item.id !== m.id),
                        })
                      }
                      className="text-[#8e95a5] hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="New milestone / objective..."
                  value={newMilestoneText}
                  onChange={(e) => setNewMilestoneText(e.target.value)}
                  className="flex-1 rounded-lg border border-[#282f3d] bg-[#161a22] px-2.5 py-1.5 text-xs text-white"
                />
                <button
                  onClick={() => {
                    if (!newMilestoneText.trim()) return;
                    const ms: QuestMilestone = {
                      id: 'm-' + Date.now(),
                      text: newMilestoneText.trim(),
                      done: false,
                    };
                    setEditingQuest({
                      ...editingQuest,
                      milestones: [...(editingQuest.milestones || []), ms],
                    });
                    setNewMilestoneText('');
                  }}
                  className="bg-[#d4af37] text-black px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Add Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {STATUS_COLUMNS.map((col) => {
            const columnQuests = quests.filter((q) => q.status === col.status);

            return (
              <div key={col.status} className="rounded-2xl border border-[#232936] bg-[#101217] p-3 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#202530]">
                  <span className="font-serif text-xs font-semibold text-white">{col.label}</span>
                  <span className="text-[10px] text-[#717887] tabular-nums font-mono">
                    {columnQuests.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {columnQuests.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl border border-[#242a38] bg-[#151922] space-y-2 shadow-xs"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-serif text-xs font-semibold text-white">{q.title}</h4>
                        <button onClick={() => setEditingQuest(q)} className="text-[10px] text-[#d4af37]">Edit</button>
                      </div>
                      <p className="text-[11px] text-[#8e95a5] line-clamp-2 leading-relaxed">{q.summary}</p>

                      {/* Interactive Milestones */}
                      {q.milestones.length > 0 && (
                        <div className="pt-2 border-t border-[#1e232e] space-y-1">
                          {q.milestones.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => handleToggleMilestone(q, m.id)}
                              className="flex items-center gap-1.5 text-[10px] cursor-pointer text-[#cad0dc] hover:text-white"
                            >
                              {m.done ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="h-3 w-3 text-[#717887] shrink-0" />
                              )}
                              <span className={m.done ? 'line-through text-[#6e7584]' : ''}>{m.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {quests.map((q) => (
            <div key={q.id} className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm font-semibold text-white">{q.title}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                    {q.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingQuest(q)} className="text-xs text-[#d4af37]">Edit</button>
                  <button onClick={() => handleDelete(q.id)} className="text-xs text-[#8e95a5] hover:text-red-400">Delete</button>
                </div>
              </div>
              <p className="text-xs text-[#a0a8b8]">{q.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
