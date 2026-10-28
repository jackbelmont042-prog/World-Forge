import React, { useRef, useState, useEffect } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { WorldMap, MapMarker, Location } from '../../types/world';
import {
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  MapPin,
  Castle,
  Mountain,
  Eye,
  X,
  Upload,
  Info,
  Layers,
} from 'lucide-react';

export const InteractiveMapCanvas: React.FC = () => {
  const { currentWorld, locations, maps, refreshWorldData, openEntity } = useWorld();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeMap = maps[0] || null;

  // Viewport transform: pan & zoom
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Selected marker
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // New marker placement modal
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ x: number; y: number } | null>(null);
  const [newMarkerName, setNewMarkerName] = useState('');
  const [newMarkerLocId, setNewMarkerLocId] = useState('');
  const [newMarkerIcon, setNewMarkerIcon] = useState('city');

  // Background map image
  const [customImage, setCustomImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (activeMap?.imageUrl) {
      const img = new Image();
      img.src = activeMap.imageUrl;
      img.onload = () => setCustomImage(img);
    } else {
      setCustomImage(null);
    }
  }, [activeMap?.imageUrl]);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size
    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply transformation
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 1. Draw Map Background (Custom image OR procedural parchment texture)
    if (customImage) {
      ctx.drawImage(customImage, 0, 0, width, height);
    } else {
      // Medieval Antique Cartography Canvas
      ctx.fillStyle = '#11151c';
      ctx.fillRect(0, 0, width, height);

      // Antique parchment grid lines (lat/long)
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x <= width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Decorative compass rose watermark at bottom left
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(120, height - 120, 60, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(120, height - 120, 45, 0, Math.PI * 2);
      ctx.stroke();

      // World Title Watermark
      ctx.font = "bold 24px 'Cinzel', serif";
      ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.textAlign = 'center';
      ctx.fillText(currentWorld?.name?.toUpperCase() || 'WORLD ATLAS', width / 2, 60);

      // Topography sketches (islands, rifts)
      ctx.strokeStyle = 'rgba(180, 190, 210, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Floating continent contour
      ctx.moveTo(width * 0.35, height * 0.25);
      ctx.bezierCurveTo(width * 0.6, height * 0.15, width * 0.7, height * 0.45, width * 0.55, height * 0.55);
      ctx.bezierCurveTo(width * 0.4, height * 0.65, width * 0.25, height * 0.45, width * 0.35, height * 0.25);
      ctx.stroke();

      // Lower rift contour
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.75);
      ctx.lineTo(width * 0.8, height * 0.75);
      ctx.stroke();
    }

    // 2. Render Markers
    if (activeMap?.markers) {
      activeMap.markers.forEach((marker) => {
        const mx = (marker.x / 100) * width;
        const my = (marker.y / 100) * height;

        const isSelected = selectedMarker?.id === marker.id;

        // Pin outer glow
        ctx.beginPath();
        ctx.arc(mx, my, isSelected ? 16 : 12, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(212, 175, 55, 0.4)' : 'rgba(212, 175, 55, 0.2)';
        ctx.fill();

        // Pin core
        ctx.beginPath();
        ctx.arc(mx, my, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ffffff' : '#d4af37';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label banner
        ctx.font = isSelected ? "bold 12px 'Cinzel', serif" : "11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = isSelected ? '#ffffff' : '#e6e8eb';
        ctx.textAlign = 'center';
        ctx.fillText(marker.name, mx, my - 14);
      });
    }

    ctx.restore();
  }, [scale, offset, activeMap, selectedMarker, customImage, currentWorld]);

  // Handle Canvas Interaction: Mouse / Touch Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Click on Canvas to Select or Place Marker
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen click into world map coordinates (0-100%)
    const worldX = (clickX - offset.x) / scale;
    const worldY = (clickY - offset.y) / scale;

    const pctX = Math.round((worldX / canvas.width) * 100);
    const pctY = Math.round((worldY / canvas.height) * 100);

    // Check if clicked near an existing marker
    let hitMarker: MapMarker | null = null;
    if (activeMap?.markers) {
      for (const m of activeMap.markers) {
        const mx = (m.x / 100) * canvas.width;
        const my = (m.y / 100) * canvas.height;
        const dist = Math.hypot(worldX - mx, worldY - my);
        if (dist < 20 / scale) {
          hitMarker = m;
          break;
        }
      }
    }

    if (hitMarker) {
      setSelectedMarker(hitMarker);
      setIsPlacingMarker(false);
    } else {
      setSelectedMarker(null);
      if (pctX >= 0 && pctX <= 100 && pctY >= 0 && pctY <= 100) {
        setNewMarkerCoords({ x: pctX, y: pctY });
        setIsPlacingMarker(true);
      }
    }
  };

  const handleCreateMarker = async () => {
    if (!currentWorld || !newMarkerCoords || !newMarkerName.trim()) return;

    let targetMap = activeMap;
    if (!targetMap) {
      targetMap = {
        id: 'map-' + Date.now(),
        worldId: currentWorld.id,
        title: `${currentWorld.name} Atlas`,
        mapType: 'world',
        markers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const newMarker: MapMarker = {
      id: 'mk-' + Date.now(),
      name: newMarkerName.trim(),
      locationId: newMarkerLocId || undefined,
      x: newMarkerCoords.x,
      y: newMarkerCoords.y,
      icon: newMarkerIcon,
    };

    targetMap.markers = [...targetMap.markers, newMarker];
    targetMap.updatedAt = new Date().toISOString();

    await db.put('maps', targetMap);
    await refreshWorldData();
    setIsPlacingMarker(false);
    setNewMarkerCoords(null);
    setNewMarkerName('');
    setSelectedMarker(newMarker);
  };

  const handleDeleteMarker = async (markerId: string) => {
    if (!activeMap) return;
    const updated = {
      ...activeMap,
      markers: activeMap.markers.filter((m) => m.id !== markerId),
    };
    await db.put('maps', updated);
    setSelectedMarker(null);
    await refreshWorldData();
  };

  const handleUploadMapImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentWorld) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      let targetMap = activeMap;
      if (!targetMap) {
        targetMap = {
          id: 'map-' + Date.now(),
          worldId: currentWorld.id,
          title: `${currentWorld.name} Atlas`,
          mapType: 'world',
          markers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      targetMap.imageUrl = dataUrl;
      targetMap.updatedAt = new Date().toISOString();
      await db.put('maps', targetMap);
      await refreshWorldData();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3 pb-20 sm:pb-8">
      {/* Top Map Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#232936]">
        <div>
          <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-[#d4af37]" />
            <span>Interactive Cartographic Map</span>
          </h2>
          <p className="text-xs text-[#8e95a5]">
            Pan, zoom, and tap anywhere on the canvas to place geographical markers and settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center rounded-xl border border-[#2b3342] bg-[#141820] p-1">
            <button
              onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
              className="p-1.5 text-[#8e95a5] hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
              className="p-1.5 text-[#8e95a5] hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setScale(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 text-[#8e95a5] hover:text-white"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer rounded-xl border border-[#2b3342] bg-[#141820] px-3 py-1.5 text-xs text-[#cad0dc] hover:text-white hover:border-[#d4af37]">
            <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Upload Map Artwork</span>
            <input type="file" accept="image/*" onChange={handleUploadMapImage} className="hidden" />
          </label>
        </div>
      </div>

      {/* Interactive Map Viewport Container */}
      <div className="relative rounded-2xl border border-[#2b3342] bg-[#0c0e12] overflow-hidden shadow-2xl h-[520px] select-none">
        <canvas
          ref={canvasRef}
          width={1000}
          height={650}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          className="h-full w-full cursor-grab active:cursor-grabbing"
        />

        {/* Selected Marker Floating Card */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 rounded-2xl border border-[#d4af37] bg-[#12151c]/95 p-4 shadow-2xl backdrop-blur-md text-[#cad0dc]">
            <div className="flex items-center justify-between pb-2 border-b border-[#262c3a] mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-semibold text-white truncate">
                  {selectedMarker.name}
                </h3>
              </div>
              <button onClick={() => setSelectedMarker(null)} className="text-[#8e95a5] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-[#8e95a5] space-y-2">
              <p>Coordinates: {selectedMarker.x}%, {selectedMarker.y}%</p>
              {selectedMarker.locationId && (
                <div className="pt-1">
                  <button
                    onClick={() => openEntity('location', selectedMarker.locationId!)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#d4af37] py-2 text-xs font-semibold text-black hover:bg-[#e4bf47] transition shadow-md"
                  >
                    <span>Open Location Dossier</span>
                  </button>
                </div>
              )}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleDeleteMarker(selectedMarker.id)}
                  className="text-[11px] text-red-400 hover:underline"
                >
                  Delete Marker
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placing New Marker Modal */}
        {isPlacingMarker && newMarkerCoords && (
          <div className="absolute top-4 right-4 w-72 rounded-2xl border border-[#d4af37] bg-[#12151c]/95 p-4 shadow-2xl backdrop-blur-md text-[#cad0dc] space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#232936]">
              <h4 className="font-serif text-xs font-semibold text-white">Place New Marker</h4>
              <button onClick={() => setIsPlacingMarker(false)} className="text-[#8e95a5] hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#cad0dc] mb-1">Marker Name *</label>
              <input
                type="text"
                value={newMarkerName}
                onChange={(e) => setNewMarkerName(e.target.value)}
                placeholder="e.g. Iron Citadel, Mist Port"
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-2.5 py-1.5 text-xs text-white focus:outline-hidden"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#cad0dc] mb-1">Attach Existing Location</label>
              <select
                value={newMarkerLocId}
                onChange={(e) => {
                  setNewMarkerLocId(e.target.value);
                  const loc = locations.find((l) => l.id === e.target.value);
                  if (loc && !newMarkerName) setNewMarkerName(loc.name);
                }}
                className="w-full rounded-xl border border-[#2b3342] bg-[#161a22] px-2 py-1.5 text-xs text-white focus:outline-hidden"
              >
                <option value="">None (Custom Landmark)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsPlacingMarker(false)}
                className="rounded-lg border border-[#2b3342] px-2.5 py-1 text-xs text-[#8e95a5]"
              >
                Cancel
              </button>
              <button
                disabled={!newMarkerName.trim()}
                onClick={handleCreateMarker}
                className="rounded-lg bg-[#d4af37] px-3 py-1 text-xs font-semibold text-black hover:bg-[#e4bf47] disabled:opacity-50"
              >
                Place Marker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
