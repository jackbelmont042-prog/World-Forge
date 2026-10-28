import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { EntityType } from '../../types/world';
import { Search, X, Users, MapPin, Shield, Scroll, Sword, Clock, StickyNote, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  type: EntityType;
  snippet: string;
  badge: string;
}

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    characters,
    locations,
    factions,
    items,
    quests,
    historicalEvents,
    loreEntries,
    notes,
    openEntity,
  } = useWorld();

  const [query, setQuery] = useState('');

  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const list: SearchResult[] = [];

    characters.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.titles.some((t) => t.toLowerCase().includes(q)) ||
        c.notes.toLowerCase().includes(q) ||
        c.appearance.toLowerCase().includes(q) ||
        c.backstory.toLowerCase().includes(q)
      ) {
        list.push({
          id: c.id,
          name: c.name,
          type: 'character',
          snippet: c.titles[0] || c.occupation || c.appearance || 'Character',
          badge: c.status,
        });
      }
    });

    locations.forEach((l) => {
      if (
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.secrets.toLowerCase().includes(q)
      ) {
        list.push({
          id: l.id,
          name: l.name,
          type: 'location',
          snippet: l.description.substring(0, 80) + '...',
          badge: l.type,
        });
      }
    });

    factions.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.purpose.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) {
        list.push({
          id: f.id,
          name: f.name,
          type: 'faction',
          snippet: f.purpose || f.description,
          badge: f.category,
        });
      }
    });

    quests.forEach((qst) => {
      if (qst.title.toLowerCase().includes(q) || qst.summary.toLowerCase().includes(q)) {
        list.push({
          id: qst.id,
          name: qst.title,
          type: 'quest',
          snippet: qst.summary,
          badge: qst.status,
        });
      }
    });

    historicalEvents.forEach((e) => {
      if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) {
        list.push({
          id: e.id,
          name: e.title,
          type: 'event',
          snippet: `${e.date}: ${e.description.substring(0, 70)}...`,
          badge: e.category,
        });
      }
    });

    items.forEach((it) => {
      if (it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q)) {
        list.push({
          id: it.id,
          name: it.name,
          type: 'item',
          snippet: it.description,
          badge: it.rarity,
        });
      }
    });

    notes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        list.push({
          id: n.id,
          name: n.title,
          type: 'note',
          snippet: n.content,
          badge: n.status,
        });
      }
    });

    return list;
  }, [query, characters, locations, factions, quests, historicalEvents, items, notes]);

  if (!isGlobalSearchOpen) return null;

  const handleSelect = (r: SearchResult) => {
    openEntity(r.type, r.id);
    setIsGlobalSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xs pt-16 sm:pt-20">
      <div className="w-full max-w-xl rounded-2xl border border-[#303846] bg-[#12151b] shadow-2xl overflow-hidden flex flex-col text-[#cad0dc]">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[#232936] px-4 py-3 bg-[#141822]">
          <Search className="h-4 w-4 text-[#d4af37] shrink-0 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters, places, factions, secrets, or notes..."
            className="w-full bg-transparent text-sm text-white placeholder-[#5c6475] focus:outline-hidden"
            autoFocus
          />
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="p-1 rounded-lg text-[#8e95a5] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1.5">
          {query.trim() && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#717887]">
              No entries found matching &quot;{query}&quot;.
            </div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <div
                key={`${r.type}-${r.id}`}
                onClick={() => handleSelect(r)}
                className="flex items-center justify-between p-3 rounded-xl border border-[#202532] bg-[#151922] hover:border-[#d4af37]/60 cursor-pointer transition group"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-xs font-semibold text-white group-hover:text-[#d4af37] truncate">
                      {r.name}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                      {r.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8e95a5] line-clamp-1 mt-0.5">{r.snippet}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#5e6677] group-hover:text-white shrink-0" />
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[#717887]">
              Type a word to search across the entire fictional universe.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
