import React, { useRef, useState, useEffect } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { LoreEntry, EntityType, EntityLink } from '../../types/world';
import { Share2, BookOpen, Plus, Edit2, Trash2, Search, ArrowRight, Save } from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const TYPE_COLORS: Record<string, string> = {
  character: '#d4af37',
  location: '#4ade80',
  political: '#c084fc',
  faction: '#38bdf8',
  item: '#f43f5e',
  event: '#fb923c',
  lore: '#facc15',
  quest: '#e879f9',
};

export const LoreKnowledgeGraph: React.FC = () => {
  const {
    currentWorld,
    loreEntries,
    characters,
    locations,
    factions,
    items,
    quests,
    historicalEvents,
    links,
    refreshWorldData,
    openEntity,
  } = useWorld();

  const [activeTab, setActiveTab] = useState<'graph' | 'encyclopedia'>('graph');
  const [editingLore, setEditingLore] = useState<Partial<LoreEntry> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Build Graph Nodes from Entities
  useEffect(() => {
    const list: GraphNode[] = [];
    const width = 800;
    const height = 550;

    const addNodes = (items: { id: string; name: string }[], type: EntityType) => {
      items.forEach((item) => {
        list.push({
          id: item.id,
          name: item.name,
          type,
          x: width / 2 + (Math.random() - 0.5) * 400,
          y: height / 2 + (Math.random() - 0.5) * 350,
          vx: 0,
          vy: 0,
          radius: type === 'character' || type === 'location' ? 14 : 10,
          color: TYPE_COLORS[type] || '#d4af37',
        });
      });
    };

    addNodes(characters, 'character');
    addNodes(locations, 'location');
    addNodes(factions, 'faction');
    addNodes(items, 'item');
    addNodes(quests.map((q) => ({ id: q.id, name: q.title || q.name || 'Quest' })), 'quest');
    addNodes(historicalEvents.map((e) => ({ id: e.id, name: e.title || e.name || 'Event' })), 'event');

    nodesRef.current = list;
  }, [characters, locations, factions, items, quests, historicalEvents]);

  // Run Physics Simulation & Render on Canvas
  useEffect(() => {
    if (activeTab !== 'graph') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const simulate = () => {
      const nodes = nodesRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 180) {
            const force = (180 - dist) / 180;
            const fx = (dx / dist) * force * 0.8;
            const fy = (dy / dist) * force * 0.8;
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }

        // Center pull gravity
        const cdx = width / 2 - nodes[i].x;
        const cdy = height / 2 - nodes[i].y;
        nodes[i].vx += cdx * 0.002;
        nodes[i].vy += cdy * 0.002;

        // Damping
        nodes[i].vx *= 0.88;
        nodes[i].vy *= 0.88;
        nodes[i].x += nodes[i].vx;
        nodes[i].y += nodes[i].vy;

        // Clamp boundaries
        nodes[i].x = Math.max(30, Math.min(width - 30, nodes[i].x));
        nodes[i].y = Math.max(30, Math.min(height - 30, nodes[i].y));
      }

      // Draw
      ctx.clearRect(0, 0, width, height);

      // Draw Links / Relationships
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 1.5;

      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.sourceId);
        const targetNode = nodes.find((n) => n.id === link.targetId);
        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();

          // Link label
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          ctx.font = "9px 'Plus Jakarta Sans', sans-serif";
          ctx.fillStyle = 'rgba(212, 175, 55, 0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(link.relationship, midX, midY - 3);
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected ? 6 : 3), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(212, 175, 55, 0.15)';
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = isSelected ? "bold 11px 'Cinzel', serif" : "10px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.radius + 12);
      });

      if (isRunning) {
        animFrameRef.current = requestAnimationFrame(simulate);
      }
    };

    animFrameRef.current = requestAnimationFrame(simulate);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeTab, links, selectedNode]);

  // Click on Canvas Node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = nodesRef.current.find((n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 5);
    if (hit) {
      setSelectedNode(hit);
    } else {
      setSelectedNode(null);
    }
  };

  const handleSaveLore = async () => {
    if (!currentWorld || !editingLore || !editingLore.title?.trim()) return;
    const entry: LoreEntry = {
      id: editingLore.id || 'lore-' + Date.now(),
      worldId: currentWorld.id,
      title: editingLore.title.trim(),
      category: editingLore.category || 'General Lore',
      content: editingLore.content || '',
      relatedEntityIds: editingLore.relatedEntityIds || [],
      tags: editingLore.tags || [],
      createdAt: editingLore.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('loreEntries', entry);
    await refreshWorldData();
    setEditingLore(null);
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#d4af37]" />
            <span>Lore Encyclopedia & Knowledge Graph</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Visual relationship graph and cross-referenced compendium entries
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-[#2b3342] bg-[#141820] p-1 text-xs">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'graph' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5]'
            }`}
          >
            Visual Graph
          </button>
          <button
            onClick={() => setActiveTab('encyclopedia')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'encyclopedia' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5]'
            }`}
          >
            Encyclopedia ({loreEntries.length})
          </button>
        </div>
      </div>

      {activeTab === 'graph' ? (
        <div className="relative rounded-2xl border border-[#2b3342] bg-[#0c0e12] overflow-hidden shadow-2xl h-[520px]">
          <canvas
            ref={canvasRef}
            width={850}
            height={550}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer"
          />

          {/* Node detail callout on selection */}
          {selectedNode && (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 rounded-2xl border border-[#d4af37] bg-[#12151c]/95 p-4 shadow-2xl backdrop-blur-md text-[#cad0dc] space-y-2">
              <div className="flex justify-between items-center pb-1 border-b border-[#232936]">
                <h4 className="font-serif text-sm font-semibold text-white">{selectedNode.name}</h4>
                <span className="text-[10px] uppercase font-mono text-[#d4af37]">{selectedNode.type}</span>
              </div>
              <p className="text-xs text-[#8e95a5]">
                Connected in the universe network. Click below to inspect the full entity record.
              </p>
              <button
                onClick={() => openEntity(selectedNode.type, selectedNode.id)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#d4af37] py-2 text-xs font-semibold text-black hover:bg-[#e4bf47] transition shadow-md"
              >
                <span>Open {selectedNode.type} record</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Lore Encyclopedia Entries */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search lore entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-xl border border-[#282f3d] bg-[#141820] px-3 py-1.5 text-xs text-white"
            />
            <button
              onClick={() =>
                setEditingLore({
                  id: 'lore-' + Date.now(),
                  title: 'New Lore Article',
                  category: 'Philosophy & Myth',
                  content: '',
                  relatedEntityIds: [],
                })
              }
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#e4bf47]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Lore Entry</span>
            </button>
          </div>

          {editingLore ? (
            <div className="p-5 rounded-2xl border border-[#2b3342] bg-[#12151b] space-y-3">
              <div className="flex justify-between pb-2 border-b border-[#232936]">
                <h4 className="font-serif text-sm font-semibold text-white">Edit Lore Article</h4>
                <div className="flex gap-2">
                  <button onClick={() => setEditingLore(null)} className="text-xs text-[#8e95a5]">Cancel</button>
                  <button onClick={handleSaveLore} className="text-xs bg-[#d4af37] text-black px-4 py-1.5 rounded-lg font-semibold">Save Article</button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Article Title *"
                value={editingLore.title || ''}
                onChange={(e) => setEditingLore({ ...editingLore, title: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
              <textarea
                placeholder="Full article content and historical accounts..."
                rows={5}
                value={editingLore.content || ''}
                onChange={(e) => setEditingLore({ ...editingLore, content: e.target.value })}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-3 py-2 text-xs text-white"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loreEntries.map((le) => (
                <div key={le.id} className="p-4 rounded-2xl border border-[#232936] bg-[#13161e] space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-sm font-semibold text-white">{le.title}</h3>
                    <span className="text-[10px] text-[#d4af37]">{le.category}</span>
                  </div>
                  <p className="text-xs text-[#a0a8b8] line-clamp-3 leading-relaxed">{le.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
