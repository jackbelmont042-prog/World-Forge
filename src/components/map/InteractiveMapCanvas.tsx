/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useWorld } from '../../context/WorldContext';
import { db } from '../../services/db';
import { WorldMap, Location } from '../../types/world';
import {
  MapDocument,
  MapObject,
  MapLayer,
  EditorTool,
  MapPoint,
  MapTheme,
  ProceduralLandmassParams,
} from '../../types/mapEditor';
import {
  createDefaultMapDocument,
  renderMapDocument,
  screenToWorld,
  worldToScreen,
  hitTestObject,
  getObjectBounds,
  exportMapToImage,
} from '../../services/mapCanvasEngine';
import { ASSET_SYMBOLS } from '../../services/mapAssets';
import {
  smoothCoastline,
  generateProceduralContinents,
  generateRiverPath,
  generateMountainRange,
  generateForestCluster,
  generatePoliticalTerritories,
  generateMapFromPrompt,
} from '../../services/mapProcedural';
import { getSampleAethelgardMapDocument } from '../../services/sampleMapDocument';
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
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Layers,
  Download,
  Sparkles,
  Undo2,
  Redo2,
  Maximize2,
  Sliders,
  X,
  ChevronDown,
  ChevronUp,
  Move,
  PenTool,
  Palette,
  Calendar,
  Check,
  Trees,
  Shield,
  Type,
  Navigation,
  Globe,
  Settings,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const InteractiveMapCanvas: React.FC = () => {
  const { currentWorld, locations, maps, refreshWorldData, openEntity } = useWorld();

  // Active Map and MapDocument
  const [activeMapId, setActiveMapId] = useState<string>(maps[0]?.id || '');
  const activeMap = maps.find((m) => m.id === activeMapId) || maps[0] || null;

  const [document, setDocument] = useState<MapDocument>(() => {
    if (activeMap?.document) {
      return activeMap.document;
    }
    if (currentWorld?.id === 'world-shattered-reach') {
      return getSampleAethelgardMapDocument('world-shattered-reach');
    }
    return createDefaultMapDocument(currentWorld?.id || 'world-custom', 'Cartographic Chart');
  });

  // Undo / Redo History Stack (Milestone 1.4)
  const [history, setHistory] = useState<MapDocument[]>([]);
  const [future, setFuture] = useState<MapDocument[]>([]);

  const pushHistory = useCallback(
    (newDoc: MapDocument) => {
      setHistory((prev) => [...prev.slice(-25), document]);
      setFuture([]);
      setDocument(newDoc);
    },
    [document]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [document, ...f]);
    setDocument(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, document]);
    setDocument(next);
  };

  // Sync active map changes
  useEffect(() => {
    if (activeMap) {
      if (activeMap.document) {
        setDocument(activeMap.document);
      } else if (currentWorld?.id === 'world-shattered-reach') {
        const sampleDoc = getSampleAethelgardMapDocument('world-shattered-reach');
        setDocument(sampleDoc);
      } else {
        setDocument(createDefaultMapDocument(currentWorld?.id || 'world-custom', activeMap.title, activeMap.mapType));
      }
    }
  }, [activeMapId]);

  // Autosave to IndexedDB with debounce
  useEffect(() => {
    if (!activeMap || !document) return;
    const timer = setTimeout(async () => {
      try {
        const updatedMap: WorldMap = {
          ...activeMap,
          document,
          updatedAt: new Date().toISOString(),
        };
        await db.put('maps', updatedMap);
      } catch (err) {
        console.error('Failed to autosave map document:', err);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [document, activeMap]);

  // Viewport transformation: Pan & Zoom
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(0.45);
  const [offset, setOffset] = useState({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Tool Modes (Milestone 1.1)
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const selectedObject = document.objects.find((o) => o.id === selectedObjectId) || null;

  // Active Symbol Palette Selection
  const [activeSymbolId, setActiveSymbolId] = useState<string>('mt_peak');
  const [symbolScale, setSymbolScale] = useState<number>(1.0);
  const [symbolBrushMode, setSymbolBrushMode] = useState<'stamp' | 'brush' | 'cluster'>('stamp');
  const [showAssetDrawer, setShowAssetDrawer] = useState<boolean>(false);
  const [assetCategory, setAssetCategory] = useState<string>('mountains');

  // Drawing state (freehand coastline / river spline points)
  const [drawingPoints, setDrawingPoints] = useState<MapPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // UI Panels
  const [showLayersModal, setShowLayersModal] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showProceduralModal, setShowProceduralModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTimelineBar, setShowTimelineBar] = useState(false);
  const [showNewLocationModal, setShowNewLocationModal] = useState(false);

  // Procedural settings (Milestone 2 & 9)
  const [procParams, setProcParams] = useState<ProceduralLandmassParams>({
    continentCount: 2,
    landRatio: 0.5,
    coastlineRoughness: 0.5,
    islandDensity: 4,
    seed: 42,
    smoothIterations: 2,
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Export settings (Milestone 10)
  const [exportScale, setExportScale] = useState<number>(2);
  const [exportTransparent, setExportTransparent] = useState<boolean>(false);

  // New location profile fields
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('city');
  const [newLocRuler, setNewLocRuler] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');

  // -------------------------------------------------------------
  // CANVAS RENDERING
  // -------------------------------------------------------------
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions
    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply pan & zoom
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Render complete document scene
    renderMapDocument(ctx, document, selectedObjectId);

    // Render active drawing path preview
    if (drawingPoints.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y);
      for (let i = 1; i < drawingPoints.length; i++) {
        ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y);
      }

      if (activeTool === 'landmass_freehand' || activeTool === 'territory' || activeTool === 'lake') {
        ctx.closePath();
        ctx.fillStyle = activeTool === 'territory' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(236, 226, 203, 0.5)';
        ctx.fill();
      }

      ctx.strokeStyle = activeTool === 'river' ? '#38bdf8' : activeTool === 'territory' ? '#d4af37' : '#2b2319';
      ctx.lineWidth = activeTool === 'river' ? 4 : 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // Render Minimap
    const mini = minimapRef.current;
    if (mini) {
      const mctx = mini.getContext('2d');
      if (mctx) {
        mctx.clearRect(0, 0, mini.width, mini.height);
        const miniScale = Math.min(mini.width / document.canvasWidth, mini.height / document.canvasHeight);

        mctx.save();
        mctx.scale(miniScale, miniScale);
        renderMapDocument(mctx, document, null);
        mctx.restore();

        // Minimap viewport rectangle
        const vpX = (-offset.x / scale) * miniScale;
        const vpY = (-offset.y / scale) * miniScale;
        const vpW = (width / scale) * miniScale;
        const vpH = (height / scale) * miniScale;

        mctx.strokeStyle = '#38bdf8';
        mctx.lineWidth = 1.5;
        mctx.strokeRect(vpX, vpY, vpW, vpH);
      }
    }
  }, [document, selectedObjectId, scale, offset, drawingPoints, activeTool]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redrawCanvas();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

  // -------------------------------------------------------------
  // GESTURE & TOUCH NAVIGATION (Milestone 1.1)
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPoint = screenToWorld(screenX, screenY, offset.x, offset.y, scale);

    // Two finger / middle click / pan tool defaults to navigation
    if (e.buttons === 4 || e.pointerType === 'touch' && e.altKey) {
      setIsPanning(true);
      setPanStart({ x: screenX - offset.x, y: screenY - offset.y });
      return;
    }

    if (activeTool === 'select') {
      const hit = hitTestObject(worldPoint, document);
      if (hit) {
        setSelectedObjectId(hit.id);
        setShowInspector(true);
        // Start dragging object
        setIsPanning(true);
        setPanStart({ x: screenX, y: screenY });
      } else {
        setSelectedObjectId(null);
        // Canvas Pan
        setIsPanning(true);
        setPanStart({ x: screenX - offset.x, y: screenY - offset.y });
      }
    } else if (activeTool === 'symbol_stamp') {
      // Stamp symbol at world coordinate
      const newObj: MapObject = {
        id: `sym-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        layerId: document.activeLayerId || 'layer-terrain',
        type: 'symbol',
        name: activeSymbolId.replace('_', ' ').toUpperCase(),
        symbolId: activeSymbolId,
        symbolCategory: assetCategory,
        transform: {
          x: worldPoint.x,
          y: worldPoint.y,
          scale: symbolScale,
          rotation: (Math.random() - 0.5) * 6,
        },
        style: {
          fillColor: activeSymbolId.startsWith('tree') ? '#7c966c' : '#ded5c0',
          strokeColor: '#2b2319',
          strokeWidth: 1.6,
        },
        metadata: { seed: Date.now() },
      };
      pushHistory({
        ...document,
        objects: [...document.objects, newObj],
      });
      setSelectedObjectId(newObj.id);
    } else if (activeTool === 'landmass_freehand' || activeTool === 'river' || activeTool === 'territory' || activeTool === 'lake' || activeTool === 'road') {
      setIsDrawing(true);
      setDrawingPoints([worldPoint]);
    } else if (activeTool === 'marker') {
      // Place new interactive lore marker
      setNewLocName(`New Landmark ${document.objects.filter((o) => o.type === 'marker').length + 1}`);
      setShowNewLocationModal(true);
      setDrawingPoints([worldPoint]);
    } else if (activeTool === 'label') {
      const text = prompt('Enter Cartographic Label Text:', 'The Great Reach');
      if (text) {
        const newLabel: MapObject = {
          id: `lbl-${Date.now()}`,
          layerId: 'layer-labels',
          type: 'label',
          name: text,
          label: text,
          transform: { x: worldPoint.x, y: worldPoint.y, scale: 1.2, rotation: 0 },
          style: {
            fontFamily: 'Cinzel, serif',
            fontSize: 24,
            fontWeight: '600',
            textColor: '#f5e4bd',
          },
          metadata: {},
        };
        pushHistory({ ...document, objects: [...document.objects, newLabel] });
        setSelectedObjectId(newLabel.id);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isPanning) {
      if (activeTool === 'select' && selectedObject && !e.altKey) {
        // Drag selected object
        const dx = (screenX - panStart.x) / scale;
        const dy = (screenY - panStart.y) / scale;
        setPanStart({ x: screenX, y: screenY });

        setDocument((prev) => ({
          ...prev,
          objects: prev.objects.map((o) => {
            if (o.id !== selectedObject.id) return o;
            if (o.points) {
              return {
                ...o,
                points: o.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
                transform: { ...o.transform, x: o.transform.x + dx, y: o.transform.y + dy },
              };
            }
            return {
              ...o,
              transform: { ...o.transform, x: o.transform.x + dx, y: o.transform.y + dy },
            };
          }),
        }));
      } else {
        // Pan canvas
        setOffset({
          x: screenX - panStart.x,
          y: screenY - panStart.y,
        });
      }
    } else if (isDrawing) {
      const worldPoint = screenToWorld(screenX, screenY, offset.x, offset.y, scale);
      const lastPoint = drawingPoints[drawingPoints.length - 1];
      if (!lastPoint || Math.hypot(worldPoint.x - lastPoint.x, worldPoint.y - lastPoint.y) > 12) {
        setDrawingPoints((pts) => [...pts, worldPoint]);
      }
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isDrawing && drawingPoints.length > 2) {
      setIsDrawing(false);

      if (activeTool === 'landmass_freehand') {
        const smoothed = smoothCoastline(drawingPoints, 2);
        const newLand: MapObject = {
          id: `land-${Date.now()}`,
          layerId: 'layer-geography',
          type: 'landmass',
          name: `Continent ${document.objects.filter((o) => o.type === 'landmass').length + 1}`,
          transform: { x: drawingPoints[0].x, y: drawingPoints[0].y, scale: 1, rotation: 0 },
          points: smoothed,
          style: { fillColor: '#ece1ca', strokeColor: '#2b2319', strokeWidth: 2.2 },
          metadata: {},
        };
        pushHistory({ ...document, objects: [...document.objects, newLand] });
        setSelectedObjectId(newLand.id);
      } else if (activeTool === 'river') {
        const newRiver: MapObject = {
          id: `riv-${Date.now()}`,
          layerId: 'layer-water',
          type: 'river',
          name: `River ${document.objects.filter((o) => o.type === 'river').length + 1}`,
          transform: { x: drawingPoints[0].x, y: drawingPoints[0].y, scale: 1, rotation: 0 },
          points: drawingPoints,
          riverWidthStart: 2,
          riverWidthEnd: 7,
          style: { strokeColor: '#2f435a', strokeWidth: 3 },
          metadata: {},
        };
        pushHistory({ ...document, objects: [...document.objects, newRiver] });
        setSelectedObjectId(newRiver.id);
      } else if (activeTool === 'territory') {
        const smoothed = smoothCoastline(drawingPoints, 2);
        const newTerr: MapObject = {
          id: `terr-${Date.now()}`,
          layerId: 'layer-political',
          type: 'territory',
          name: `Sovereignty of Territory ${document.objects.filter((o) => o.type === 'territory').length + 1}`,
          transform: { x: drawingPoints[0].x, y: drawingPoints[0].y, scale: 1, rotation: 0 },
          points: smoothed,
          style: {
            fillColor: 'rgba(212, 175, 55, 0.22)',
            strokeColor: '#d4af37',
            strokeWidth: 2.2,
            strokeDash: [8, 4],
          },
          metadata: {},
        };
        pushHistory({ ...document, objects: [...document.objects, newTerr] });
        setSelectedObjectId(newTerr.id);
      } else if (activeTool === 'lake') {
        const smoothed = smoothCoastline(drawingPoints, 2);
        const newLake: MapObject = {
          id: `lake-${Date.now()}`,
          layerId: 'layer-water',
          type: 'lake',
          name: `Inland Lake ${document.objects.filter((o) => o.type === 'lake').length + 1}`,
          transform: { x: drawingPoints[0].x, y: drawingPoints[0].y, scale: 1, rotation: 0 },
          points: smoothed,
          style: { fillColor: '#16202c', strokeColor: '#2d3b4e', strokeWidth: 1.8 },
          metadata: {},
        };
        pushHistory({ ...document, objects: [...document.objects, newLake] });
        setSelectedObjectId(newLake.id);
      } else if (activeTool === 'road') {
        const newRoad: MapObject = {
          id: `road-${Date.now()}`,
          layerId: 'layer-infrastructure',
          type: 'road',
          name: `Highway ${document.objects.filter((o) => o.type === 'road').length + 1}`,
          transform: { x: drawingPoints[0].x, y: drawingPoints[0].y, scale: 1, rotation: 0 },
          points: drawingPoints,
          style: { strokeColor: '#8a6538', strokeWidth: 2.5, strokeDash: [6, 4] },
          metadata: {},
        };
        pushHistory({ ...document, objects: [...document.objects, newRoad] });
        setSelectedObjectId(newRoad.id);
      }
      setDrawingPoints([]);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.max(0.15, Math.min(3.5, scale * zoomFactor));

    // Zoom centered on cursor
    setOffset({
      x: mouseX - (mouseX - offset.x) * (newScale / scale),
      y: mouseY - (mouseY - offset.y) * (newScale / scale),
    });
    setScale(newScale);
  };

  // Zoom control shortcuts
  const handleZoomIn = () => setScale((s) => Math.min(3.5, s * 1.25));
  const handleZoomOut = () => setScale((s) => Math.max(0.15, s * 0.8));
  const handleResetZoom = () => {
    setScale(0.45);
    setOffset({ x: 40, y: 30 });
  };
  const handleFitScreen = () => {
    const container = containerRef.current;
    if (!container) return;
    const fitScale = Math.min(
      (container.clientWidth - 40) / document.canvasWidth,
      (container.clientHeight - 40) / document.canvasHeight
    );
    setScale(fitScale);
    setOffset({
      x: (container.clientWidth - document.canvasWidth * fitScale) / 2,
      y: (container.clientHeight - document.canvasHeight * fitScale) / 2,
    });
  };

  // Object Operations (Milestone 1.3)
  const handleDeleteSelected = () => {
    if (!selectedObjectId) return;
    pushHistory({
      ...document,
      objects: document.objects.filter((o) => o.id !== selectedObjectId),
    });
    setSelectedObjectId(null);
  };

  const handleDuplicateSelected = () => {
    if (!selectedObject) return;
    const duplicated: MapObject = {
      ...selectedObject,
      id: `${selectedObject.type}-${Date.now()}`,
      name: `${selectedObject.name} (Copy)`,
      transform: {
        ...selectedObject.transform,
        x: selectedObject.transform.x + 40,
        y: selectedObject.transform.y + 40,
      },
      points: selectedObject.points ? selectedObject.points.map((p) => ({ x: p.x + 40, y: p.y + 40 })) : undefined,
    };
    pushHistory({ ...document, objects: [...document.objects, duplicated] });
    setSelectedObjectId(duplicated.id);
  };

  const handleToggleLockSelected = () => {
    if (!selectedObject) return;
    setDocument((prev) => ({
      ...prev,
      objects: prev.objects.map((o) => (o.id === selectedObject.id ? { ...o, locked: !o.locked } : o)),
    }));
  };

  // Procedural Landmass Generation (Milestone 2.1)
  const handleGenerateProceduralContinents = () => {
    const { landmasses, islands } = generateProceduralContinents(
      document.canvasWidth,
      document.canvasHeight,
      procParams
    );

    const newLandmassObjects: MapObject[] = [
      ...landmasses.map((pts, i) => ({
        id: `proc-cont-${Date.now()}-${i}`,
        layerId: 'layer-geography',
        type: 'landmass' as const,
        name: `Continent ${i + 1}`,
        transform: { x: pts[0]?.x || 1000, y: pts[0]?.y || 800, scale: 1, rotation: 0 },
        points: pts,
        style: { fillColor: '#ece1ca', strokeColor: '#2b2319', strokeWidth: 2.2 },
        metadata: { seed: procParams.seed },
      })),
      ...islands.map((pts, j) => ({
        id: `proc-isle-${Date.now()}-${j}`,
        layerId: 'layer-geography',
        type: 'landmass' as const,
        name: `Islet ${j + 1}`,
        transform: { x: pts[0]?.x || 500, y: pts[0]?.y || 500, scale: 1, rotation: 0 },
        points: pts,
        style: { fillColor: '#ece1ca', strokeColor: '#2b2319', strokeWidth: 2.0 },
        metadata: { seed: procParams.seed + j },
      })),
    ];

    pushHistory({
      ...document,
      objects: [...document.objects, ...newLandmassObjects],
    });
    setShowProceduralModal(false);
  };

  // Natural Language AI Generator (Milestone 9.3)
  const handleAiGenerateFeatures = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const generated = await generateMapFromPrompt(aiPrompt, document, {
        genre: currentWorld?.genre,
        tone: currentWorld?.tone,
        description: currentWorld?.description,
      });

      if (generated && generated.length > 0) {
        pushHistory({
          ...document,
          objects: [...document.objects, ...generated],
        });
        setAiPrompt('');
        setShowProceduralModal(false);
      }
    } catch (err) {
      console.error('AI map generation failed:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Create Location Profile from Map (Milestone 7.2)
  const handleSaveLocationProfile = async () => {
    if (!newLocName.trim() || drawingPoints.length === 0) return;
    const pt = drawingPoints[0];

    const locId = `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newLocation: Location = {
      id: locId,
      worldId: currentWorld?.id || 'world-1',
      name: newLocName,
      alternateNames: [],
      type: newLocType as any,
      description: newLocDesc || `Founded on the cartographic reaches at coordinates (${Math.round(pt.x)}, ${Math.round(pt.y)}).`,
      government: newLocRuler ? `Ruled by ${newLocRuler}` : 'Autonomous Town Council',
      population: '12,000',
      climate: 'Temperate',
      culture: 'Regional Maritime & Trade',
      languages: ['Common Trade Tongue'],
      economy: 'Trade & Local Crafts',
      secrets: '',
      travelInfo: 'Marked on the Cartographic Chart.',
      mapCoordinates: { x: (pt.x / document.canvasWidth) * 100, y: (pt.y / document.canvasHeight) * 100 },
      tags: ['Map Generated', newLocType],
      notes: 'Profile initialized directly from WorldForge Cartographic Studio.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.put('locations', newLocation);
    await refreshWorldData();

    // Create corresponding MapMarker object on canvas
    const newMarker: MapObject = {
      id: `marker-${Date.now()}`,
      layerId: 'layer-lore',
      type: 'marker',
      name: newLocName,
      transform: { x: pt.x, y: pt.y, scale: 1.0, rotation: 0 },
      style: { fillColor: '#d4af37' },
      metadata: {
        linkedLocationId: locId,
        notes: newLocDesc,
      },
    };

    pushHistory({ ...document, objects: [...document.objects, newMarker] });
    setSelectedObjectId(newMarker.id);
    setShowNewLocationModal(false);
    setDrawingPoints([]);
  };

  // High Resolution Export (Milestone 10.3)
  const handleTriggerExport = () => {
    const dataUrl = exportMapToImage(document, exportScale);
    if (!dataUrl) return;

    const link = window.document.createElement('a');
    link.download = `${document.title.replace(/\s+/g, '_')}_${exportScale}x.png`;
    link.href = dataUrl;
    link.click();
    setShowExportModal(false);
  };

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-[#0c0f14] text-[#cad0dc] select-none">
      {/* ------------------------------------------------------------- */}
      {/* TOP CARTOGRAPHIC CONTROL BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="z-20 flex h-13 items-center justify-between border-b border-[#232936] bg-[#12161f]/95 px-3 py-1.5 backdrop-blur-md">
        {/* Left: Map title & Multi-scale selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#303848] bg-[#161b26] px-2.5 py-1 text-xs">
            <Globe className="h-4 w-4 text-[#d4af37]" />
            <select
              value={activeMap?.id}
              onChange={(e) => setActiveMapId(e.target.value)}
              className="bg-transparent font-serif font-semibold text-white focus:outline-none cursor-pointer text-xs"
            >
              {maps.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#12161f] text-white">
                  {m.title} ({m.mapType})
                </option>
              ))}
            </select>
          </div>

          {/* Theme switcher */}
          <select
            value={document.theme}
            onChange={(e) => setDocument((d) => ({ ...d, theme: e.target.value as MapTheme }))}
            className="hidden sm:inline-block rounded-lg border border-[#2b3342] bg-[#151922] px-2 py-1 text-[11px] text-[#9ba3b4]"
          >
            <option value="antique-parchment">Antique Parchment</option>
            <option value="dark-atlas">Dark Atlas</option>
            <option value="blueprint">Arcane Blueprint</option>
          </select>
        </div>

        {/* Center: Undo / Redo / History (Milestone 1.4) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="rounded-lg p-1.5 text-[#8e95a5] hover:bg-[#1d2330] hover:text-white disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={future.length === 0}
            className="rounded-lg p-1.5 text-[#8e95a5] hover:bg-[#1d2330] hover:text-white disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Zoom controls, Layers, AI & Export */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center rounded-lg border border-[#262d3a] bg-[#141822] p-0.5">
            <button onClick={handleZoomOut} className="p-1 hover:text-white" title="Zoom Out">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:text-white" title="Zoom In">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleFitScreen} className="p-1 hover:text-white" title="Fit to Screen">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleResetZoom} className="p-1 hover:text-white" title="Reset View">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Timeline Bar Toggle */}
          <button
            onClick={() => setShowTimelineBar((v) => !v)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              showTimelineBar
                ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]'
                : 'border-[#2e3748] bg-[#161b25] text-[#9ba3b4] hover:text-white'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Timeline</span>
          </button>

          {/* Layers Toggle */}
          <button
            onClick={() => setShowLayersModal((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-[#2e3748] bg-[#161b25] px-2.5 py-1 text-xs font-medium text-[#9ba3b4] hover:border-[#d4af37] hover:text-white"
          >
            <Layers className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="hidden md:inline">Layers ({document.layers.filter((l) => l.visible).length})</span>
          </button>

          {/* Procedural & AI Generator */}
          <button
            onClick={() => setShowProceduralModal(true)}
            className="flex items-center gap-1 rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-2.5 py-1 text-xs font-medium text-[#e8c76b] hover:bg-[#d4af37]/20 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="hidden md:inline">Generate</span>
          </button>

          {/* High-res Export */}
          <button
            onClick={() => setShowExportModal(true)}
            className="rounded-lg bg-[#c99a3e] px-2.5 py-1 text-xs font-semibold text-black hover:bg-[#dfb04e] transition"
          >
            <Download className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HISTORICAL TIMELINE SCRUBBER (Milestone 8) */}
      {/* ------------------------------------------------------------- */}
      {showTimelineBar && (
        <div className="z-15 flex items-center justify-between border-b border-[#293242] bg-[#10141d] px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-[#d4af37]">Historical Atlas Era:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {document.historicalStates.map((state) => (
                <button
                  key={state.id}
                  onClick={() => setDocument((d) => ({ ...d, activeHistoricalStateId: state.id }))}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                    document.activeHistoricalStateId === state.id
                      ? 'bg-[#d4af37] text-black font-semibold'
                      : 'bg-[#181d28] text-[#8e95a5] hover:text-white'
                  }`}
                >
                  {state.name} (Year {state.year})
                </button>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-[#788296] hidden md:block">
            {document.historicalStates.find((s) => s.id === document.activeHistoricalStateId)?.description}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN INTERACTIVE CANVAS VIEWPORT */}
      {/* ------------------------------------------------------------- */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-[#0c0f14]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
        />

        {/* Minimap in bottom right */}
        <div className="absolute bottom-18 right-3 z-10 hidden sm:block overflow-hidden rounded-xl border border-[#303848] bg-[#121620]/80 shadow-2xl backdrop-blur-xs">
          <canvas ref={minimapRef} width={160} height={106} className="block" />
        </div>

        {/* Selected Object Quick Action Floating HUD */}
        {selectedObject && (
          <div className="absolute top-3 left-3 z-15 flex items-center gap-1.5 rounded-xl border border-[#343d4f] bg-[#121620]/90 p-1.5 shadow-xl backdrop-blur-md">
            <span className="px-2 text-xs font-semibold text-white truncate max-w-[140px]">
              {selectedObject.name}
            </span>
            <button
              onClick={() => setShowInspector(true)}
              className="rounded-lg p-1 text-[#8e95a5] hover:bg-[#1f2533] hover:text-white"
              title="Inspect Properties"
            >
              <Sliders className="h-4 w-4" />
            </button>
            <button
              onClick={handleDuplicateSelected}
              className="rounded-lg p-1 text-[#8e95a5] hover:bg-[#1f2533] hover:text-white"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleToggleLockSelected}
              className="rounded-lg p-1 text-[#8e95a5] hover:bg-[#1f2533] hover:text-white"
              title={selectedObject.locked ? 'Unlock' : 'Lock'}
            >
              {selectedObject.locked ? <Lock className="h-4 w-4 text-[#d4af37]" /> : <Unlock className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDeleteSelected}
              className="rounded-lg p-1 text-red-400 hover:bg-red-500/20"
              title="Delete Object"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {selectedObject.metadata?.linkedLocationId && (
              <button
                onClick={() => openEntity('location', selectedObject.metadata.linkedLocationId!)}
                className="rounded-lg bg-[#d4af37]/20 px-2 py-0.5 text-[10px] font-semibold text-[#d4af37] hover:bg-[#d4af37]/30"
              >
                View Dossier
              </button>
            )}
          </div>
        )}

        {/* Drawing hint pill */}
        {isDrawing && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-15 rounded-full border border-[#38bdf8]/40 bg-[#0c121d]/90 px-3 py-1 text-xs text-[#38bdf8] shadow-lg backdrop-blur-xs">
            Drawing {activeTool.replace('_', ' ')}... Release pointer to close &amp; smooth stroke
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE BOTTOM TOOLBAR (Milestone 1.2) */}
      {/* ------------------------------------------------------------- */}
      <div className="z-20 border-t border-[#232936] bg-[#12161f]/95 px-2 py-1.5 backdrop-blur-md">
        <div className="flex items-center justify-around gap-1 overflow-x-auto text-[11px]">
          {/* 1. Select / Transform */}
          <button
            onClick={() => setActiveTool('select')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition ${
              activeTool === 'select' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5] hover:text-white'
            }`}
          >
            <Move className="h-4 w-4" />
            <span>Select</span>
          </button>

          {/* 2. Landmass Drawing */}
          <button
            onClick={() => setActiveTool('landmass_freehand')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition ${
              activeTool === 'landmass_freehand'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'text-[#8e95a5] hover:text-white'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>Coastline</span>
          </button>

          {/* 3. Asset Stamp & Brush */}
          <button
            onClick={() => {
              setActiveTool('symbol_stamp');
              setShowAssetDrawer(true);
            }}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition ${
              activeTool === 'symbol_stamp' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5] hover:text-white'
            }`}
          >
            <Mountain className="h-4 w-4" />
            <span>Assets</span>
          </button>

          {/* 4. Hydrology: Rivers & Lakes */}
          <button
            onClick={() => setActiveTool('river')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition ${
              activeTool === 'river' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5] hover:text-white'
            }`}
          >
            <Navigation className="h-4 w-4 rotate-45" />
            <span>River</span>
          </button>

          {/* 5. Political Territories */}
          <button
            onClick={() => setActiveTool('territory')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition ${
              activeTool === 'territory' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5] hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Territory</span>
          </button>

          {/* 6. Cartographic Labels */}
          <button
            onClick={() => setActiveTool('label')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition ${
              activeTool === 'label' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5] hover:text-white'
            }`}
          >
            <Type className="h-4 w-4" />
            <span>Label</span>
          </button>

          {/* 7. Lore Markers */}
          <button
            onClick={() => setActiveTool('marker')}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 transition ${
              activeTool === 'marker' ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5] hover:text-white'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Marker</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ASSET CATALOG DRAWER (Milestone 3.1) */}
      {/* ------------------------------------------------------------- */}
      {showAssetDrawer && (
        <div className="absolute bottom-16 inset-x-0 z-30 max-h-72 border-t border-[#2e3648] bg-[#121620]/95 p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#252c3c]">
            <div className="flex items-center gap-2 overflow-x-auto">
              {['mountains', 'trees', 'fortifications', 'settlements', 'infrastructure', 'maritime', 'monuments', 'decorative'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setAssetCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-xs capitalize transition ${
                      assetCategory === cat ? 'bg-[#d4af37] text-black font-semibold' : 'text-[#8e95a5] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
            <button onClick={() => setShowAssetDrawer(false)} className="text-[#8e95a5] hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-6 gap-2 overflow-y-auto max-h-48 p-1">
            {ASSET_SYMBOLS.filter((s) => s.category === assetCategory).map((sym) => (
              <button
                key={sym.id}
                onClick={() => {
                  setActiveSymbolId(sym.id);
                  setActiveTool('symbol_stamp');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                  activeSymbolId === sym.id
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]'
                    : 'border-[#262e3d] bg-[#151a24] text-[#8e95a5] hover:border-[#38455a] hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold mb-1 truncate w-full">{sym.name}</div>
                <div className="text-[10px] text-[#717b8f]">Scale: {sym.defaultScale}x</div>
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-[#8e95a5] pt-2 border-t border-[#252c3c]">
            <span>Tap on canvas to stamp symbol with hand-drawn organic variation</span>
            <div className="flex items-center gap-2">
              <span>Scale:</span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={symbolScale}
                onChange={(e) => setSymbolScale(parseFloat(e.target.value))}
                className="w-24 accent-[#d4af37]"
              />
              <span className="font-mono text-[11px] text-white">{symbolScale}x</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONTEXTUAL PROPERTY INSPECTOR (Milestone 1.2) */}
      {/* ------------------------------------------------------------- */}
      {showInspector && selectedObject && (
        <div className="absolute top-14 right-3 z-30 w-72 rounded-2xl border border-[#303848] bg-[#121620]/95 p-4 shadow-2xl backdrop-blur-md text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#252c3c]">
            <h4 className="font-serif font-semibold text-white">Object Properties</h4>
            <button onClick={() => setShowInspector(false)} className="text-[#8e95a5] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label className="text-[11px] text-[#7e8798]">Name</label>
              <input
                type="text"
                value={selectedObject.name}
                onChange={(e) =>
                  setDocument((d) => ({
                    ...d,
                    objects: d.objects.map((o) => (o.id === selectedObject.id ? { ...o, name: e.target.value } : o)),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#2b3342] bg-[#161b25] px-2.5 py-1 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#7e8798]">Position X</label>
                <div className="font-mono text-white text-[11px]">{Math.round(selectedObject.transform.x)} px</div>
              </div>
              <div>
                <label className="text-[11px] text-[#7e8798]">Position Y</label>
                <div className="font-mono text-white text-[11px]">{Math.round(selectedObject.transform.y)} px</div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#7e8798]">Scale ({selectedObject.transform.scale.toFixed(2)}x)</label>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.05"
                value={selectedObject.transform.scale}
                onChange={(e) =>
                  setDocument((d) => ({
                    ...d,
                    objects: d.objects.map((o) =>
                      o.id === selectedObject.id
                        ? { ...o, transform: { ...o.transform, scale: parseFloat(e.target.value) } }
                        : o
                    ),
                  }))
                }
                className="mt-1 w-full accent-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#7e8798]">Rotation ({Math.round(selectedObject.transform.rotation)}°)</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedObject.transform.rotation}
                onChange={(e) =>
                  setDocument((d) => ({
                    ...d,
                    objects: d.objects.map((o) =>
                      o.id === selectedObject.id
                        ? { ...o, transform: { ...o.transform, rotation: parseInt(e.target.value) } }
                        : o
                    ),
                  }))
                }
                className="mt-1 w-full accent-[#d4af37]"
              />
            </div>

            {/* Layer Assignment */}
            <div>
              <label className="text-[11px] text-[#7e8798]">Layer</label>
              <select
                value={selectedObject.layerId}
                onChange={(e) =>
                  setDocument((d) => ({
                    ...d,
                    objects: d.objects.map((o) => (o.id === selectedObject.id ? { ...o, layerId: e.target.value } : o)),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#2b3342] bg-[#161b25] px-2.5 py-1 text-white text-xs"
              >
                {document.layers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Location Entity */}
            <div className="pt-2 border-t border-[#252c3c]">
              <label className="text-[11px] text-[#7e8798]">Linked WorldForge Location</label>
              <select
                value={selectedObject.metadata.linkedLocationId || ''}
                onChange={(e) =>
                  setDocument((d) => ({
                    ...d,
                    objects: d.objects.map((o) =>
                      o.id === selectedObject.id
                        ? { ...o, metadata: { ...o.metadata, linkedLocationId: e.target.value || undefined } }
                        : o
                    ),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#2b3342] bg-[#161b25] px-2.5 py-1 text-white text-xs"
              >
                <option value="">None (Independent Object)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDuplicateSelected}
                className="flex-1 rounded-lg border border-[#2b3342] py-1.5 text-xs text-white hover:border-[#d4af37]"
              >
                Duplicate
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 rounded-lg bg-red-500/20 py-1.5 text-xs text-red-400 hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LAYERS MANAGER MODAL (Milestone 4.1) */}
      {/* ------------------------------------------------------------- */}
      {showLayersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303848] bg-[#121620] p-5 shadow-2xl text-[#cad0dc]">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#d4af37]" />
                <h3 className="font-serif font-semibold text-white">Cartographic Layers</h3>
              </div>
              <button onClick={() => setShowLayersModal(false)} className="text-[#8e95a5] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {document.layers.map((layer) => {
                const count = document.objects.filter((o) => o.layerId === layer.id).length;
                return (
                  <div
                    key={layer.id}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition ${
                      document.activeLayerId === layer.id
                        ? 'border-[#d4af37]/60 bg-[#d4af37]/10'
                        : 'border-[#262e3d] bg-[#161a24]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setDocument((d) => ({
                            ...d,
                            layers: d.layers.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l)),
                          }))
                        }
                        className="text-[#8e95a5] hover:text-white"
                      >
                        {layer.visible ? <Eye className="h-4 w-4 text-[#d4af37]" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
                      </button>
                      <button
                        onClick={() =>
                          setDocument((d) => ({
                            ...d,
                            layers: d.layers.map((l) => (l.id === layer.id ? { ...l, locked: !l.locked } : l)),
                          }))
                        }
                        className="text-[#8e95a5] hover:text-white"
                      >
                        {layer.locked ? <Lock className="h-4 w-4 text-red-400" /> : <Unlock className="h-4 w-4" />}
                      </button>
                      <span className="font-medium text-white">{layer.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#7e8798]">{count} objs</span>
                      <button
                        onClick={() => setDocument((d) => ({ ...d, activeLayerId: layer.id }))}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                          document.activeLayerId === layer.id
                            ? 'bg-[#d4af37] text-black'
                            : 'bg-[#252c3c] text-[#8e95a5] hover:text-white'
                        }`}
                      >
                        {document.activeLayerId === layer.id ? 'Active' : 'Set Active'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowLayersModal(false)}
                className="rounded-xl bg-[#2b3342] px-4 py-2 text-xs font-semibold text-white hover:bg-[#374153]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PROCEDURAL GENERATION & AI MODAL (Milestone 2.1 & 9) */}
      {/* ------------------------------------------------------------- */}
      {showProceduralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#303848] bg-[#121620] p-5 shadow-2xl text-[#cad0dc]">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#d4af37]" />
                <h3 className="font-serif font-semibold text-white">Procedural &amp; AI Cartography Engine</h3>
              </div>
              <button onClick={() => setShowProceduralModal(false)} className="text-[#8e95a5] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Natural Language Prompt Assistant */}
              <div className="rounded-xl border border-[#343e50] bg-[#161c28] p-3 space-y-2">
                <label className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#d4af37]" />
                  Natural-Language Map Generator
                </label>
                <p className="text-[11px] text-[#8e95a5]">
                  Describe any geographical feature (e.g. &quot;A chain of volcanic islands east of the mainland with a smoking peak&quot; or &quot;A dense pine forest with a river flowing through it&quot;).
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Create a crescent archipelago of volcanic islands..."
                    className="flex-1 rounded-lg border border-[#2b3342] bg-[#10141d] px-3 py-1.5 text-white placeholder-gray-500 text-xs"
                  />
                  <button
                    onClick={handleAiGenerateFeatures}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="rounded-lg bg-[#d4af37] px-3 py-1.5 font-semibold text-black hover:bg-[#e4bf47] disabled:opacity-40 transition"
                  >
                    {isAiGenerating ? 'Forging...' : 'Generate'}
                  </button>
                </div>
              </div>

              {/* Parametric Procedural Continents */}
              <div className="rounded-xl border border-[#262e3d] bg-[#141822] p-3 space-y-3">
                <div className="font-semibold text-white">Parametric Continents &amp; Archipelagos</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#7e8798]">Continents Count: {procParams.continentCount}</label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={procParams.continentCount}
                      onChange={(e) => setProcParams((p) => ({ ...p, continentCount: parseInt(e.target.value) }))}
                      className="w-full accent-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#7e8798]">Land Ratio: {Math.round(procParams.landRatio * 100)}%</label>
                    <input
                      type="range"
                      min="0.2"
                      max="0.8"
                      step="0.05"
                      value={procParams.landRatio}
                      onChange={(e) => setProcParams((p) => ({ ...p, landRatio: parseFloat(e.target.value) }))}
                      className="w-full accent-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#7e8798]">Coastline Complexity: {Math.round(procParams.coastlineRoughness * 100)}%</label>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={procParams.coastlineRoughness}
                      onChange={(e) => setProcParams((p) => ({ ...p, coastlineRoughness: parseFloat(e.target.value) }))}
                      className="w-full accent-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#7e8798]">Island Density: {procParams.islandDensity}</label>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={procParams.islandDensity}
                      onChange={(e) => setProcParams((p) => ({ ...p, islandDensity: parseInt(e.target.value) }))}
                      className="w-full accent-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#7e8798]">Seed: {procParams.seed}</span>
                  <button
                    onClick={() => setProcParams((p) => ({ ...p, seed: Math.floor(Math.random() * 99999) }))}
                    className="text-[11px] text-[#d4af37] hover:underline"
                  >
                    Randomize Seed
                  </button>
                </div>

                <button
                  onClick={handleGenerateProceduralContinents}
                  className="w-full rounded-xl bg-[#c99a3e] py-2 text-xs font-semibold text-black hover:bg-[#dfb04e] transition"
                >
                  Generate Continents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1-CLICK CREATE LOCATION PROFILE MODAL (Milestone 7.2) */}
      {/* ------------------------------------------------------------- */}
      {showNewLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#303848] bg-[#121620] p-5 shadow-2xl text-[#cad0dc]">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#d4af37]" />
                <h3 className="font-serif font-semibold text-white">Create Location Profile from Map</h3>
              </div>
              <button
                onClick={() => {
                  setShowNewLocationModal(false);
                  setDrawingPoints([]);
                }}
                className="text-[#8e95a5] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#7e8798]">Location Name *</label>
                <input
                  type="text"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2b3342] bg-[#161b25] px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7e8798]">Location Type</label>
                <select
                  value={newLocType}
                  onChange={(e) => setNewLocType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2b3342] bg-[#161b25] px-3 py-1.5 text-white text-xs"
                >
                  <option value="city">City / Metropolis</option>
                  <option value="castle">Castle / Stronghold</option>
                  <option value="village">Village / Hamlet</option>
                  <option value="ruin">Ancient Ruins</option>
                  <option value="dungeon">Dungeon / Cavern</option>
                  <option value="port">Coastal / Sky Port</option>
                  <option value="mountain">Mountain Summit</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#7e8798]">Ruler / Controlling Authority</label>
                <input
                  type="text"
                  value={newLocRuler}
                  onChange={(e) => setNewLocRuler(e.target.value)}
                  placeholder="e.g. Archon Malakar"
                  className="mt-1 w-full rounded-lg border border-[#2b3342] bg-[#161b25] px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#7e8798]">Short Description</label>
                <textarea
                  rows={3}
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
                  placeholder="Atmosphere, geographical importance, and lore..."
                  className="mt-1 w-full rounded-lg border border-[#2b3342] bg-[#161b25] px-3 py-1.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowNewLocationModal(false);
                    setDrawingPoints([]);
                  }}
                  className="rounded-xl border border-[#2b3342] px-4 py-2 text-xs text-[#8e95a5]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLocationProfile}
                  className="rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-semibold text-black hover:bg-[#e4bf47]"
                >
                  Create &amp; Place Marker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HIGH-RES EXPORT MODAL (Milestone 10.3) */}
      {/* ------------------------------------------------------------- */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#303848] bg-[#121620] p-5 shadow-2xl text-[#cad0dc]">
            <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-[#d4af37]" />
                <h3 className="font-serif font-semibold text-white">Export Cartographic Map</h3>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-[#8e95a5] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-[#7e8798]">Resolution Multiplier</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[1, 2, 4].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => setExportScale(mult)}
                      className={`rounded-lg py-1.5 font-mono text-xs border transition ${
                        exportScale === mult
                          ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                          : 'border-[#262e3d] bg-[#161a24] text-[#8e95a5]'
                      }`}
                    >
                      {mult}x ({document.canvasWidth * mult} &times; {document.canvasHeight * mult})
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#161c28] border border-[#262e3d] text-[11px] text-[#8e95a5]">
                Direct offscreen canvas rendering ensures ultra-crisp line weights, vector symbol clarity, and zero screen capture artifacts.
              </div>

              <button
                onClick={handleTriggerExport}
                className="w-full rounded-xl bg-[#c99a3e] py-2.5 text-xs font-semibold text-black hover:bg-[#dfb04e] transition"
              >
                Download High-Resolution PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
