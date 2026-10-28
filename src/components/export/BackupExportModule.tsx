import React, { useState } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { downloadFile, generateWorldMarkdown } from '../../services/exportService';
import { FullWorldPackage } from '../../types/world';
import { Download, Upload, FileText, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

export const BackupExportModule: React.FC = () => {
  const { currentWorld, refreshWorldData, switchWorld } = useWorld();
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message: string } | null>(null);

  if (!currentWorld) return null;

  const handleExportJSON = async () => {
    const pkg = await db.exportWorldPackage(currentWorld.id);
    if (!pkg) return;
    const jsonStr = JSON.stringify(pkg, null, 2);
    downloadFile(
      `${currentWorld.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_backup.json`,
      jsonStr,
      'application/json'
    );
  };

  const handleExportMarkdown = async () => {
    const pkg = await db.exportWorldPackage(currentWorld.id);
    if (!pkg) return;
    const md = generateWorldMarkdown(pkg);
    downloadFile(
      `${currentWorld.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_compendium.md`,
      md,
      'text/markdown'
    );
  };

  const handleImportPackage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as FullWorldPackage;
        if (!parsed.world || !parsed.world.id) {
          throw new Error('File does not match WorldForge schema specification.');
        }

        const savedWorld = await db.importWorldPackage(parsed);
        await switchWorld(savedWorld.id);
        await refreshWorldData();
        setImportStatus({ success: true, message: `Successfully imported "${savedWorld.name}"!` });
      } catch (err: unknown) {
        setImportStatus({
          success: false,
          message: err instanceof Error ? err.message : 'Invalid backup format',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      <div className="pb-3 border-b border-[#232936]">
        <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-[#d4af37]" />
          <span>Data Backup, Export, & Universal Portability</span>
        </h2>
        <p className="text-xs text-[#8e95a5]">
          Your universes belong to you. Zero vendor lock-in. 100% offline JSON and Markdown exports.
        </p>
      </div>

      {importStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            importStatus.success
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
              : 'border-red-500/40 bg-red-950/20 text-red-300'
          }`}
        >
          {importStatus.success ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />}
          <span>{importStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Full JSON Backup */}
        <div className="p-5 rounded-2xl border border-[#232936] bg-[#12151b] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-white font-serif font-semibold text-sm mb-1.5">
              <Download className="h-4 w-4 text-[#d4af37]" />
              <span>Full Universe JSON Backup</span>
            </div>
            <p className="text-xs text-[#8e95a5] leading-relaxed">
              Downloads a complete machine-readable snapshot of {currentWorld.name}, including all characters, relations, atlas coordinates, factions, magic systems, and chronology.
            </p>
          </div>
          <button
            onClick={handleExportJSON}
            className="w-full rounded-xl bg-[#d4af37] py-2 text-xs font-semibold text-black hover:bg-[#e4bf47] transition shadow-md"
          >
            Download .JSON Backup
          </button>
        </div>

        {/* Card 2: Markdown Compendium Book */}
        <div className="p-5 rounded-2xl border border-[#232936] bg-[#12151b] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-white font-serif font-semibold text-sm mb-1.5">
              <FileText className="h-4 w-4 text-[#d4af37]" />
              <span>Markdown Compendium Guide</span>
            </div>
            <p className="text-xs text-[#8e95a5] leading-relaxed">
              Generates a beautifully formatted world compendium book ready for Obsidian, Scrivener, Notion, or printing out for tabletop campaigns.
            </p>
          </div>
          <button
            onClick={handleExportMarkdown}
            className="w-full rounded-xl border border-[#d4af37]/60 bg-[#161a22] py-2 text-xs font-semibold text-[#f5d99b] hover:bg-[#1f2532] transition"
          >
            Export .MD Compendium
          </button>
        </div>

        {/* Card 3: Restore / Import */}
        <div className="p-5 rounded-2xl border border-[#232936] bg-[#12151b] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-white font-serif font-semibold text-sm mb-1.5">
              <Upload className="h-4 w-4 text-[#d4af37]" />
              <span>Import Universe Package</span>
            </div>
            <p className="text-xs text-[#8e95a5] leading-relaxed">
              Load a previously exported .json world. Automatically detects duplicate IDs and validates data integrity safely.
            </p>
          </div>
          <label className="w-full flex items-center justify-center cursor-pointer rounded-xl border border-[#2b3342] bg-[#181d27] py-2 text-xs font-semibold text-white hover:border-[#d4af37] transition">
            <span>Select .JSON File</span>
            <input type="file" accept=".json" onChange={handleImportPackage} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
