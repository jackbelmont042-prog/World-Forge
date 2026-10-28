import React, { useState, useMemo } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { downloadFile, generateWorldMarkdown } from '../../services/exportService';
import {
  Compass,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit2,
  Download,
  Upload,
  X,
  FileText,
  Clock,
  ArrowUpDown,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { World, FullWorldPackage } from '../../types/world';

export const WorldLibraryModal: React.FC = () => {
  const {
    isLibraryOpen,
    setIsLibraryOpen,
    worlds,
    currentWorld,
    switchWorld,
    setIsCreationWizardOpen,
    refreshWorldData,
  } = useWorld();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'name'>('modified');
  const [renamingWorldId, setRenamingWorldId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [deletingWorld, setDeletingWorld] = useState<World | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const filteredWorlds = useMemo(() => {
    return worlds
      .filter((w) => {
        const matchesQuery =
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.genre.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [worlds, searchQuery, sortBy]);

  if (!isLibraryOpen) return null;

  const handleDuplicate = async (worldId: string) => {
    try {
      await db.duplicateWorld(worldId);
      await refreshWorldData();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleRename = async (world: World) => {
    if (!renamingName.trim()) return;
    try {
      await db.put('worlds', {
        ...world,
        name: renamingName.trim(),
        updatedAt: new Date().toISOString(),
      });
      setRenamingWorldId(null);
      await refreshWorldData();
    } catch (err) {
      console.error('Rename failed:', err);
    }
  };

  const handleDelete = async (worldId: string) => {
    try {
      await db.deleteWorld(worldId);
      setDeletingWorld(null);
      await refreshWorldData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleExportJSON = async (worldId: string, worldName: string) => {
    const pkg = await db.exportWorldPackage(worldId);
    if (!pkg) return;
    const jsonStr = JSON.stringify(pkg, null, 2);
    downloadFile(`${worldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_worldforge.json`, jsonStr, 'application/json');
  };

  const handleExportMarkdown = async (worldId: string, worldName: string) => {
    const pkg = await db.exportWorldPackage(worldId);
    if (!pkg) return;
    const md = generateWorldMarkdown(pkg);
    downloadFile(`${worldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_compendium.md`, md, 'text/markdown');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as FullWorldPackage;
        if (!parsed.world || !parsed.world.id) {
          throw new Error('File does not match WorldForge package format.');
        }
        const imported = await db.importWorldPackage(parsed);
        await switchWorld(imported.id);
        await refreshWorldData();
      } catch (err: unknown) {
        setImportError(err instanceof Error ? err.message : 'Invalid package format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-[#303846] bg-[#12151b] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto text-[#cad0dc]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232936] px-5 py-4 bg-[#141822]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-semibold text-white">WorldForge Library</h2>
              <p className="text-[11px] text-[#8e95a5]">Manage, switch, duplicate, or export your fictional universes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-[#2c3342] bg-[#161a22] px-3 py-1.5 text-xs text-[#cad0dc] hover:text-white hover:border-[#d4af37]/50 transition">
              <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Import World</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              onClick={() => {
                setIsLibraryOpen(false);
                setIsCreationWizardOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-[#0d1015] hover:bg-[#e4bf47] transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create World</span>
            </button>

            <button
              onClick={() => setIsLibraryOpen(false)}
              className="p-1.5 rounded-lg text-[#8e95a5] hover:text-white hover:bg-[#1f2532]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {importError && (
          <div className="bg-red-950/70 border-b border-red-800 px-5 py-2 text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>Import failed: {importError}</span>
          </div>
        )}

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#232936] px-5 py-3 bg-[#111319]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#727a8c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter universes..."
              className="w-full rounded-xl border border-[#282f3d] bg-[#161922] pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#5c6475] focus:border-[#d4af37] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-[#8e95a5]">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-[#282f3d] bg-[#161922] px-2 py-1 text-xs text-white focus:outline-hidden"
            >
              <option value="modified">Recently Modified</option>
              <option value="created">Date Created</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Worlds Grid */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-3">
          {filteredWorlds.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Compass className="h-10 w-10 text-[#4c5466] mx-auto animate-pulse" />
              <h3 className="font-serif text-base text-white">No Universes Found</h3>
              <p className="text-xs text-[#7d8597] max-w-sm mx-auto">
                No worlds match your search, or your library is empty. Forge your first world to begin!
              </p>
              <button
                onClick={() => {
                  setIsLibraryOpen(false);
                  setIsCreationWizardOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-[#0d1015]"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First World</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredWorlds.map((world) => {
                const isActive = world.id === currentWorld?.id;
                const isRenaming = renamingWorldId === world.id;

                return (
                  <div
                    key={world.id}
                    className={`rounded-2xl border p-4 transition flex flex-col justify-between ${
                      isActive
                        ? 'border-[#d4af37] bg-[#191d26] shadow-lg ring-1 ring-[#d4af37]/30'
                        : 'border-[#262c38] bg-[#14171f] hover:border-[#3a4354]'
                    }`}
                  >
                    <div>
                      {/* World Cover & Title Header */}
                      <div className="flex gap-3 mb-3">
                        <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-[#2d3444] bg-[#1a1f2b]">
                          {world.coverUrl ? (
                            <img src={world.coverUrl} alt={world.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#d4af37]">
                              <Compass className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {isRenaming ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={renamingName}
                                onChange={(e) => setRenamingName(e.target.value)}
                                className="w-full rounded-lg border border-[#d4af37] bg-[#12151b] px-2 py-1 text-xs text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => handleRename(world)}
                                className="rounded-lg bg-[#d4af37] px-2 py-1 text-[11px] font-semibold text-black"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setRenamingWorldId(null)}
                                className="p-1 text-[#8e95a5] hover:text-white"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-1">
                              <h3
                                onClick={() => {
                                  switchWorld(world.id);
                                  setIsLibraryOpen(false);
                                }}
                                className="font-serif text-sm font-semibold text-white truncate cursor-pointer hover:text-[#d4af37] transition"
                              >
                                {world.name}
                              </h3>
                              <button
                                onClick={() => {
                                  setRenamingWorldId(world.id);
                                  setRenamingName(world.name);
                                }}
                                className="p-1 text-[#697284] hover:text-[#cad0dc]"
                                title="Rename world"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-[#8e95a5] mt-1">
                            <span className="capitalize text-[#d4af37] font-medium">{world.genre}</span>
                            <span>·</span>
                            <span>{world.techLevel} tech</span>
                            <span>·</span>
                            <span>{world.magicLevel} magic</span>
                          </div>

                          <p className="text-xs text-[#a0a8b8] line-clamp-2 mt-1.5 leading-relaxed">
                            {world.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      {/* Era and modified stamp */}
                      <div className="flex items-center justify-between text-[10px] text-[#727a8c] pt-2 border-t border-[#202530] mb-3">
                        <span className="truncate">Era: {world.era}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {new Date(world.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#202530]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicate(world.id)}
                          className="p-1.5 rounded-lg border border-[#2a303e] bg-[#161a22] text-[#8e95a5] hover:text-white hover:border-[#3d475c]"
                          title="Duplicate universe"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportJSON(world.id, world.name)}
                          className="p-1.5 rounded-lg border border-[#2a303e] bg-[#161a22] text-[#8e95a5] hover:text-white hover:border-[#3d475c]"
                          title="Export full JSON backup"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportMarkdown(world.id, world.name)}
                          className="p-1.5 rounded-lg border border-[#2a303e] bg-[#161a22] text-[#8e95a5] hover:text-white hover:border-[#3d475c]"
                          title="Export Markdown Compendium"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingWorld(world)}
                          className="p-1.5 rounded-lg border border-[#2a303e] bg-[#161a22] text-[#8e95a5] hover:text-red-400 hover:border-red-500/50"
                          title="Delete universe"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {isActive ? (
                        <span className="text-[11px] font-semibold text-[#d4af37] px-2.5 py-1 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30">
                          Active World
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            switchWorld(world.id);
                            setIsLibraryOpen(false);
                          }}
                          className="flex items-center gap-1 rounded-xl bg-[#202532] hover:bg-[#d4af37] hover:text-black text-white px-3 py-1.5 text-xs font-medium transition"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          <span>Open Universe</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingWorld && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-[#161318] p-5 shadow-2xl text-[#dcdfe4]">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-serif text-sm font-semibold">Destroy Universe?</h3>
              </div>
              <p className="text-xs text-[#a8a1af] leading-relaxed mb-4">
                Are you sure you want to delete <strong>{deletingWorld.name}</strong>? All characters, locations, factions, and chronicles in this world will be permanently erased from your local storage.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeletingWorld(null)}
                  className="rounded-xl border border-[#3b3442] px-3.5 py-2 text-xs font-medium text-[#cad0dc] hover:bg-[#251f2b]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingWorld.id)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
