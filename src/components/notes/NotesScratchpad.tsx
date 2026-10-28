import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { Note, EntityType } from '../../types/world';
import { StickyNote, Plus, Pin, Trash2, Edit2, Save, ArrowRight, Check, X, Sparkles } from 'lucide-react';

export const NotesScratchpad: React.FC = () => {
  const { currentWorld, notes, refreshWorldData, openEntity } = useWorld();
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [convertModalNote, setConvertModalNote] = useState<Note | null>(null);

  const handleSave = async () => {
    if (!currentWorld || !editingNote || !editingNote.title?.trim()) return;
    const n: Note = {
      id: editingNote.id || 'note-' + Date.now(),
      worldId: currentWorld.id,
      title: editingNote.title.trim(),
      content: editingNote.content || '',
      status: editingNote.status || 'unresolved',
      pinned: editingNote.pinned || false,
      linkedEntityId: editingNote.linkedEntityId,
      linkedEntityType: editingNote.linkedEntityType,
      tags: editingNote.tags || [],
      createdAt: editingNote.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('notes', n);
    await refreshWorldData();
    setEditingNote(null);
  };

  const handleTogglePin = async (note: Note) => {
    await db.put('notes', { ...note, pinned: !note.pinned });
    await refreshWorldData();
  };

  const handleDelete = async (id: string) => {
    if (!currentWorld) return;
    if (confirm('Delete this draft note?')) {
      await db.delete('notes', id, currentWorld.id);
      setEditingNote(null);
      await refreshWorldData();
    }
  };

  // Convert Note to Formal Entity
  const handleConvertNote = async (targetType: EntityType) => {
    if (!currentWorld || !convertModalNote) return;
    const note = convertModalNote;

    switch (targetType) {
      case 'character': {
        const charId = 'char-' + Date.now();
        await db.put('characters', {
          id: charId,
          worldId: currentWorld.id,
          name: note.title,
          aliases: [],
          titles: [],
          status: 'living',
          appearance: '',
          personality: '',
          strengths: [],
          weaknesses: [],
          skills: [],
          goals: '',
          fears: '',
          secrets: '',
          backstory: note.content,
          factionIds: [],
          relationships: [],
          family: { parentIds: [], childIds: [], spouseIds: [], siblingIds: [] },
          itemIds: [],
          timelineEvents: [],
          tags: note.tags,
          customFields: [],
          notes: `Converted from note: ${note.title}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await db.put('notes', { ...note, status: 'accepted', linkedEntityId: charId, linkedEntityType: 'character' });
        await refreshWorldData();
        setConvertModalNote(null);
        openEntity('character', charId);
        break;
      }
      case 'location': {
        const locId = 'loc-' + Date.now();
        await db.put('locations', {
          id: locId,
          worldId: currentWorld.id,
          name: note.title,
          alternateNames: [],
          type: 'settlement' as any,
          description: note.content,
          climate: '',
          population: '',
          government: '',
          culture: '',
          languages: [],
          economy: '',
          secrets: '',
          travelInfo: '',
          tags: note.tags,
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await db.put('notes', { ...note, status: 'accepted', linkedEntityId: locId, linkedEntityType: 'location' });
        await refreshWorldData();
        setConvertModalNote(null);
        openEntity('location', locId);
        break;
      }
      case 'quest': {
        const qId = 'qst-' + Date.now();
        await db.put('quests', {
          id: qId,
          worldId: currentWorld.id,
          title: note.title,
          type: 'side-quest',
          status: 'in-progress',
          summary: note.content,
          mainObjective: note.title,
          milestones: [],
          characterIds: [],
          locationIds: [],
          factionIds: [],
          prerequisites: '',
          outcomes: '',
          rewards: '',
          tags: note.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await db.put('notes', { ...note, status: 'accepted', linkedEntityId: qId, linkedEntityType: 'quest' });
        await refreshWorldData();
        setConvertModalNote(null);
        openEntity('quest', qId);
        break;
      }
      case 'lore': {
        const loreId = 'lore-' + Date.now();
        await db.put('loreEntries', {
          id: loreId,
          worldId: currentWorld.id,
          title: note.title,
          category: 'Scratchpad Concepts',
          content: note.content,
          relatedEntityIds: [],
          tags: note.tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await db.put('notes', { ...note, status: 'accepted', linkedEntityId: loreId, linkedEntityType: 'lore' });
        await refreshWorldData();
        setConvertModalNote(null);
        openEntity('lore', loreId);
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-[#d4af37]" />
            <span>Scratchpad & Ideas</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Quickly capture sparks of inspiration and convert them into formal characters, sites, or quests
          </p>
        </div>

        <button
          onClick={() =>
            setEditingNote({
              id: 'note-' + Date.now(),
              title: 'Fresh Thought',
              content: '',
              status: 'unresolved',
              pinned: true,
              tags: [],
            })
          }
          className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Scratch Note</span>
        </button>
      </div>

      {editingNote ? (
        <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#232936]">
            <h4 className="font-serif text-sm font-semibold text-white">Edit Scratch Note</h4>
            <div className="flex gap-2">
              <button onClick={() => setEditingNote(null)} className="text-xs text-[#8e95a5]">Cancel</button>
              <button onClick={handleSave} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save Note</button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Note Title *"
            value={editingNote.title || ''}
            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
            className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
          />

          <textarea
            placeholder="Capture worldbuilding thoughts, sudden dialogue fragments, or lore theories..."
            rows={4}
            value={editingNote.content || ''}
            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
            className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
          />

          <div className="flex items-center gap-4 text-xs text-[#cad0dc]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editingNote.pinned || false}
                onChange={(e) => setEditingNote({ ...editingNote, pinned: e.target.checked })}
              />
              <span>Pin to top</span>
            </label>
            <select
              value={editingNote.status || 'unresolved'}
              onChange={(e) => setEditingNote({ ...editingNote, status: e.target.value as any })}
              className="rounded-lg border border-[#282f3d] bg-[#161a22] px-2 py-1 text-xs text-white"
            >
              <option value="unresolved">Unresolved</option>
              <option value="accepted">Accepted / Canon</option>
              <option value="discarded">Discarded</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                note.pinned
                  ? 'border-[#d4af37]/60 bg-[#161b24]'
                  : 'border-[#232936] bg-[#13161e]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h3 className="font-serif text-sm font-semibold text-white truncate">{note.title}</h3>
                  <button
                    onClick={() => handleTogglePin(note)}
                    className={`p-1 ${note.pinned ? 'text-[#d4af37]' : 'text-[#586173] hover:text-[#d4af37]'}`}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-[#a0a8b8] line-clamp-4 leading-relaxed mb-3 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1e232e] text-[10px] text-[#717887] flex justify-between items-center">
                <span className="capitalize">{note.status}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConvertModalNote(note)}
                    className="flex items-center gap-1 text-[#d4af37] font-semibold hover:underline"
                  >
                    <span>Convert</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingNote(note)} className="text-[#cad0dc] hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(note.id)} className="text-[#8e95a5] hover:text-red-400">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Convert Note to Entity Modal */}
      {convertModalNote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#303846] bg-[#12151b] p-5 shadow-2xl text-[#cad0dc] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#232936]">
              <h3 className="font-serif text-sm font-semibold text-white">Convert Note into Canon Entry</h3>
              <button onClick={() => setConvertModalNote(null)} className="text-[#8e95a5] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#9098a8]">
              Convert &quot;<strong>{convertModalNote.title}</strong>&quot; into a formal entry:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleConvertNote('character')}
                className="p-3 rounded-xl border border-[#2b3342] bg-[#161a22] hover:border-[#d4af37] text-left text-xs font-medium text-white transition"
              >
                👤 Character
              </button>
              <button
                onClick={() => handleConvertNote('location')}
                className="p-3 rounded-xl border border-[#2b3342] bg-[#161a22] hover:border-[#d4af37] text-left text-xs font-medium text-white transition"
              >
                📍 Location
              </button>
              <button
                onClick={() => handleConvertNote('quest')}
                className="p-3 rounded-xl border border-[#2b3342] bg-[#161a22] hover:border-[#d4af37] text-left text-xs font-medium text-white transition"
              >
                📜 Quest / Plot
              </button>
              <button
                onClick={() => handleConvertNote('lore')}
                className="p-3 rounded-xl border border-[#2b3342] bg-[#161a22] hover:border-[#d4af37] text-left text-xs font-medium text-white transition"
              >
                📖 Lore Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
