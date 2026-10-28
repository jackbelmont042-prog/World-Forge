import React from 'react';
import { useWorld } from '../../context/WorldContext';
import {
  Compass,
  Users,
  MapPin,
  Shield,
  Clock,
  Scroll,
  Plus,
  StickyNote,
  ChevronRight,
  Sparkles,
  Zap,
  Sword,
  CheckCircle2,
  Circle,
  BookOpen,
} from 'lucide-react';

export const WorldDashboard: React.FC = () => {
  const {
    currentWorld,
    characters,
    locations,
    factions,
    quests,
    historicalEvents,
    notes,
    stats,
    setActiveTab,
    openEntity,
    setIsCreationWizardOpen,
    setIsGeneratorOpen,
  } = useWorld();

  if (!currentWorld) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Compass className="h-12 w-12 text-[#d4af37] animate-spin-slow mb-3" />
        <h2 className="font-serif text-lg font-bold text-white">No World Loaded</h2>
        <p className="text-xs text-[#8e95a5] max-w-sm mt-1">
          Open the universe library to select an existing realm or forge a new universe.
        </p>
        <button
          onClick={() => setIsCreationWizardOpen(true)}
          className="mt-4 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black"
        >
          Create New World
        </button>
      </div>
    );
  }

  const activeQuestsList = quests.filter((q) => q.status === 'in-progress' || q.status === 'unstarted');
  const pinnedNotes = notes.filter((n) => n.pinned || n.status === 'unresolved');
  const recentEvents = historicalEvents
    .slice()
    .sort((a, b) => b.numericSortYear - a.numericSortYear)
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Hero Banner with World Aesthetic */}
      <div className="relative rounded-3xl overflow-hidden border border-[#2b3240] bg-[#131720] shadow-xl">
        {currentWorld.coverUrl ? (
          <div className="relative h-44 sm:h-56 w-full">
            <img
              src={currentWorld.coverUrl}
              alt={currentWorld.name}
              className="h-full w-full object-cover object-center opacity-40 filter saturate-120"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/60 to-transparent" />
          </div>
        ) : (
          <div className="h-28 w-full bg-gradient-to-r from-[#18202c] via-[#222a3a] to-[#161c28]" />
        )}

        {/* Floating Content on Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#d4af37]">
              <span className="font-serif tracking-widest uppercase font-semibold text-[11px]">
                {currentWorld.genre}
              </span>
              <span>·</span>
              <span className="text-[#a0a8b8]">{currentWorld.structure}</span>
              <span>·</span>
              <span className="text-[#a0a8b8]">Era: {currentWorld.era}</span>
            </div>
            <h1 className="font-serif text-xl sm:text-3xl font-extrabold text-white tracking-wide">
              {currentWorld.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#c4cbd8] line-clamp-2 leading-relaxed">
              {currentWorld.description || 'An unwritten universe awaiting your chronicle.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/50 bg-[#161b24] px-3 py-2 text-xs font-semibold text-[#f5d99b] hover:bg-[#d4af37] hover:text-black transition shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Inspire with Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div
          onClick={() => setActiveTab('characters')}
          className="rounded-2xl border border-[#232936] bg-[#14171f] p-3.5 hover:border-[#d4af37]/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-[#8b92a2] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cast</span>
            <Users className="h-3.5 w-3.5 text-[#d4af37] group-hover:scale-110 transition" />
          </div>
          <div className="font-serif text-xl font-bold text-white">{stats.charactersCount}</div>
          <div className="text-[10px] text-[#717887]">Characters tracked</div>
        </div>

        <div
          onClick={() => setActiveTab('locations')}
          className="rounded-2xl border border-[#232936] bg-[#14171f] p-3.5 hover:border-[#d4af37]/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-[#8b92a2] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Atlas</span>
            <MapPin className="h-3.5 w-3.5 text-[#d4af37] group-hover:scale-110 transition" />
          </div>
          <div className="font-serif text-xl font-bold text-white">{stats.locationsCount}</div>
          <div className="text-[10px] text-[#717887]">Settlements & sites</div>
        </div>

        <div
          onClick={() => setActiveTab('factions')}
          className="rounded-2xl border border-[#232936] bg-[#14171f] p-3.5 hover:border-[#d4af37]/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-[#8b92a2] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Factions</span>
            <Shield className="h-3.5 w-3.5 text-[#d4af37] group-hover:scale-110 transition" />
          </div>
          <div className="font-serif text-xl font-bold text-white">{stats.factionsCount}</div>
          <div className="text-[10px] text-[#717887]">Guilds & orders</div>
        </div>

        <div
          onClick={() => setActiveTab('timeline')}
          className="rounded-2xl border border-[#232936] bg-[#14171f] p-3.5 hover:border-[#d4af37]/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-[#8b92a2] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Events</span>
            <Clock className="h-3.5 w-3.5 text-[#d4af37] group-hover:scale-110 transition" />
          </div>
          <div className="font-serif text-xl font-bold text-white">{stats.eventsCount}</div>
          <div className="text-[10px] text-[#717887]">Chronicle milestones</div>
        </div>

        <div
          onClick={() => setActiveTab('quests')}
          className="rounded-2xl border border-[#232936] bg-[#14171f] p-3.5 hover:border-[#d4af37]/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-[#8b92a2] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Quests</span>
            <Scroll className="h-3.5 w-3.5 text-[#d4af37] group-hover:scale-110 transition" />
          </div>
          <div className="font-serif text-xl font-bold text-white">
            {stats.activeQuests} <span className="text-xs font-normal text-[#8b92a2]">/ {stats.questsCount}</span>
          </div>
          <div className="text-[10px] text-[#717887]">Active storylines</div>
        </div>

        <div
          onClick={() => setActiveTab('notes')}
          className="rounded-2xl border border-[#232936] bg-[#14171f] p-3.5 hover:border-[#d4af37]/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-[#8b92a2] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Drafts</span>
            <StickyNote className="h-3.5 w-3.5 text-[#d4af37] group-hover:scale-110 transition" />
          </div>
          <div className="font-serif text-xl font-bold text-white">{stats.unresolvedNotes}</div>
          <div className="text-[10px] text-[#717887]">Unresolved ideas</div>
        </div>
      </div>

      {/* Quick-Create Action Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6c7484] shrink-0 mr-1">
          Quick Create:
        </span>
        <button
          onClick={() => {
            setActiveTab('characters');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2a303e] bg-[#141820] text-xs font-medium text-[#cad0dc] hover:border-[#d4af37] hover:text-[#f5d99b] transition shrink-0"
        >
          <Plus className="h-3 w-3 text-[#d4af37]" />
          <span>Character</span>
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2a303e] bg-[#141820] text-xs font-medium text-[#cad0dc] hover:border-[#d4af37] hover:text-[#f5d99b] transition shrink-0"
        >
          <Plus className="h-3 w-3 text-[#d4af37]" />
          <span>Location</span>
        </button>
        <button
          onClick={() => setActiveTab('factions')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2a303e] bg-[#141820] text-xs font-medium text-[#cad0dc] hover:border-[#d4af37] hover:text-[#f5d99b] transition shrink-0"
        >
          <Plus className="h-3 w-3 text-[#d4af37]" />
          <span>Faction</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2a303e] bg-[#141820] text-xs font-medium text-[#cad0dc] hover:border-[#d4af37] hover:text-[#f5d99b] transition shrink-0"
        >
          <Plus className="h-3 w-3 text-[#d4af37]" />
          <span>Historical Event</span>
        </button>
        <button
          onClick={() => setActiveTab('quests')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2a303e] bg-[#141820] text-xs font-medium text-[#cad0dc] hover:border-[#d4af37] hover:text-[#f5d99b] transition shrink-0"
        >
          <Plus className="h-3 w-3 text-[#d4af37]" />
          <span>Quest</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2a303e] bg-[#141820] text-xs font-medium text-[#cad0dc] hover:border-[#d4af37] hover:text-[#f5d99b] transition shrink-0"
        >
          <Plus className="h-3 w-3 text-[#d4af37]" />
          <span>Scratch Note</span>
        </button>
      </div>

      {/* Main Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Characters & Locations Showcase */}
        <div className="lg:col-span-2 space-y-6">
          {/* Important Characters */}
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#202530] mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white">Key Characters of Renown</h3>
              </div>
              <button
                onClick={() => setActiveTab('characters')}
                className="flex items-center gap-1 text-xs text-[#d4af37] hover:underline"
              >
                <span>View Cast ({characters.length})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {characters.length === 0 ? (
              <p className="text-xs text-[#7d8597] py-4 text-center">No characters forged yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {characters.slice(0, 4).map((char) => (
                  <div
                    key={char.id}
                    onClick={() => openEntity('character', char.id)}
                    className="flex gap-3 p-3 rounded-xl border border-[#222836] bg-[#161a22] hover:border-[#d4af37]/60 cursor-pointer transition group"
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-[#2d3444] bg-[#1f2533]">
                      {char.avatarUrl ? (
                        <img src={char.avatarUrl} alt={char.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#d4af37]">
                          <Users className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-serif text-xs font-semibold text-white group-hover:text-[#d4af37] transition truncate">
                        {char.name}
                      </div>
                      <div className="text-[10px] text-[#8e95a5] truncate">
                        {char.titles[0] || char.occupation || char.speciesName || 'Wanderer'}
                      </div>
                      <div className="text-[10px] text-[#697284] line-clamp-1 mt-1">
                        {char.goals || char.personality || char.appearance}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strategic Locations & Atlas */}
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#202530] mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white">Cartography & Settlements</h3>
              </div>
              <button
                onClick={() => setActiveTab('locations')}
                className="flex items-center gap-1 text-xs text-[#d4af37] hover:underline"
              >
                <span>View Atlas ({locations.length})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {locations.length === 0 ? (
              <p className="text-xs text-[#7d8597] py-4 text-center">No locations charted yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locations.slice(0, 4).map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => openEntity('location', loc.id)}
                    className="p-3 rounded-xl border border-[#222836] bg-[#161a22] hover:border-[#d4af37]/60 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif text-xs font-semibold text-white group-hover:text-[#d4af37] transition truncate">
                        {loc.name}
                      </span>
                      <span className="text-[10px] text-[#d4af37] capitalize shrink-0">{loc.type}</span>
                    </div>
                    <p className="text-[11px] text-[#8e95a5] line-clamp-2 leading-relaxed">
                      {loc.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#636c7e] mt-2">
                      <span>Pop: {loc.population || 'Unknown'}</span>
                      {loc.climate && (
                        <>
                          <span>·</span>
                          <span className="truncate">{loc.climate}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Chronicle Milestones */}
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#202530] mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white">Chronicle of Eras</h3>
              </div>
              <button
                onClick={() => setActiveTab('timeline')}
                className="flex items-center gap-1 text-xs text-[#d4af37] hover:underline"
              >
                <span>Timeline ({historicalEvents.length})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentEvents.length === 0 ? (
              <p className="text-xs text-[#7d8597] py-4 text-center">No historical events recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => openEntity('event', evt.id)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-[#202634] bg-[#151922] hover:border-[#d4af37]/50 cursor-pointer transition"
                  >
                    <div className="shrink-0 px-2 py-1 rounded-md bg-[#d4af37]/10 text-[#d4af37] text-[10px] font-mono font-semibold">
                      {evt.date}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-serif text-xs font-semibold text-white">{evt.title || evt.name}</div>
                      <p className="text-[11px] text-[#8e95a5] line-clamp-1 mt-0.5">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Quests, Scratchpad Notes, Major Factions */}
        <div className="space-y-6">
          {/* Active Quests & Plot Arcs */}
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#202530] mb-3">
              <div className="flex items-center gap-2">
                <Scroll className="h-4 w-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white">Story Arcs & Quests</h3>
              </div>
              <button
                onClick={() => setActiveTab('quests')}
                className="text-xs text-[#d4af37] hover:underline"
              >
                Board
              </button>
            </div>

            {activeQuestsList.length === 0 ? (
              <p className="text-xs text-[#7d8597] py-4 text-center">No active plot threads.</p>
            ) : (
              <div className="space-y-3">
                {activeQuestsList.slice(0, 3).map((quest) => (
                  <div
                    key={quest.id}
                    onClick={() => openEntity('quest', quest.id)}
                    className="p-3 rounded-xl border border-[#232936] bg-[#161a22] hover:border-[#d4af37]/50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#8e95a5] mb-1">
                      <span className="uppercase text-[#d4af37] font-medium">{quest.type}</span>
                      <span className="capitalize">{quest.status.replace('-', ' ')}</span>
                    </div>
                    <div className="font-serif text-xs font-semibold text-white">{quest.title || quest.name}</div>
                    <p className="text-[11px] text-[#8e95a5] line-clamp-2 mt-1">{quest.summary}</p>
                    {quest.milestones.length > 0 && (
                      <div className="mt-2 text-[10px] text-[#717887] flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>
                          {quest.milestones.filter((m) => m.done).length} / {quest.milestones.length} milestones complete
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Factions & Power Balance */}
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#202530] mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white">Major Factions</h3>
              </div>
              <button
                onClick={() => setActiveTab('factions')}
                className="text-xs text-[#d4af37] hover:underline"
              >
                All ({factions.length})
              </button>
            </div>

            {factions.length === 0 ? (
              <p className="text-xs text-[#7d8597] py-4 text-center">No factions recorded.</p>
            ) : (
              <div className="space-y-2">
                {factions.slice(0, 3).map((fac) => (
                  <div
                    key={fac.id}
                    onClick={() => openEntity('faction', fac.id)}
                    className="p-2.5 rounded-xl border border-[#202634] bg-[#151922] hover:border-[#d4af37]/50 cursor-pointer transition"
                  >
                    <div className="font-serif text-xs font-semibold text-white truncate">{fac.name}</div>
                    <div className="text-[10px] text-[#8e95a5] capitalize">{fac.category.replace('-', ' ')}</div>
                    <p className="text-[11px] text-[#727a8c] line-clamp-1 mt-0.5">{fac.purpose}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scratchpad Ideas & Notes */}
          <div className="rounded-2xl border border-[#232936] bg-[#12151b] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#202530] mb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white">Scratchpad Ideas</h3>
              </div>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs text-[#d4af37] hover:underline"
              >
                Notes ({notes.length})
              </button>
            </div>

            {pinnedNotes.length === 0 ? (
              <p className="text-xs text-[#7d8597] py-4 text-center">No pending idea notes.</p>
            ) : (
              <div className="space-y-2.5">
                {pinnedNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => openEntity('note', note.id)}
                    className="p-3 rounded-xl border border-[#232a38] bg-[#151821] hover:border-[#d4af37]/50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-serif text-xs font-semibold text-white truncate">{note.title}</div>
                      {note.pinned && (
                        <span className="text-[10px] text-[#d4af37] font-medium">★ Pinned</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8e95a5] line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
