/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapDocument, MapLayer, MapObject, MapPoint, MapBoundingBox, MapTheme } from '../types/mapEditor';
import { renderAssetSymbol } from './mapAssets';

export const DEFAULT_LAYERS: MapLayer[] = [
  { id: 'layer-geography', name: 'Geography & Landmass', type: 'geography', visible: true, locked: false, opacity: 1.0 },
  { id: 'layer-terrain', name: 'Terrain (Mountains & Forests)', type: 'terrain', visible: true, locked: false, opacity: 1.0 },
  { id: 'layer-water', name: 'Hydrology (Rivers & Lakes)', type: 'water', visible: true, locked: false, opacity: 1.0 },
  { id: 'layer-political', name: 'Political Territories & Borders', type: 'political', visible: true, locked: false, opacity: 0.85 },
  { id: 'layer-settlements', name: 'Settlements & Fortifications', type: 'settlements', visible: true, locked: false, opacity: 1.0 },
  { id: 'layer-infrastructure', name: 'Infrastructure & Roads', type: 'infrastructure', visible: true, locked: false, opacity: 0.9 },
  { id: 'layer-labels', name: 'Cartographic Labels', type: 'labels', visible: true, locked: false, opacity: 1.0 },
  { id: 'layer-lore', name: 'Interactive Lore Markers', type: 'lore', visible: true, locked: false, opacity: 1.0 },
];

/**
 * Create a fresh, pristine MapDocument with default layers and themes
 */
export function createDefaultMapDocument(
  worldId: string,
  title: string = 'New Cartographic Chart',
  mapType: 'world' | 'continent' | 'region' | 'city' | 'dungeon' = 'continent'
): MapDocument {
  const id = `map-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    version: 2,
    id,
    worldId,
    title,
    mapType,
    canvasWidth: 2400,
    canvasHeight: 1600,
    theme: 'antique-parchment',
    layers: DEFAULT_LAYERS.map((l) => ({ ...l })),
    objects: [],
    activeLayerId: 'layer-geography',
    historicalStates: [
      {
        id: 'hist-dawn-era',
        name: 'The Dawn Era',
        year: 100,
        eraName: 'First Age',
        description: 'Pristine wilderness before the rise of the Great Empires.',
      },
      {
        id: 'hist-golden-age',
        name: 'The Golden Imperium',
        year: 450,
        eraName: 'Second Age',
        description: 'Imperial territorial expansion and road networks.',
      },
      {
        id: 'hist-current-era',
        name: 'The Current Era',
        year: 800,
        eraName: 'Third Age',
        description: 'Fractured borderlands and corsair havens.',
      },
    ],
    activeHistoricalStateId: 'hist-current-era',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Screen to World coordinate translation
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): MapPoint {
  return {
    x: (screenX - offsetX) / scale,
    y: (screenY - offsetY) / scale,
  };
}

/**
 * World to Screen coordinate translation
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): MapPoint {
  return {
    x: worldX * scale + offsetX,
    y: worldY * scale + offsetY,
  };
}

/**
 * Check if a point is inside a closed polygon (Ray-casting algorithm)
 */
export function isPointInPolygon(point: MapPoint, vs: MapPoint[]): boolean {
  if (vs.length < 3) return false;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x;
    const yi = vs[i].y;
    const xj = vs[j].x;
    const yj = vs[j].y;

    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Calculate distance from point to line segment
 */
export function distToSegment(p: MapPoint, v: MapPoint, w: MapPoint): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

/**
 * Compute bounding box of an object
 */
export function getObjectBounds(obj: MapObject): MapBoundingBox {
  if (obj.points && obj.points.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of obj.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  // Symbol or label bounds
  const size = Math.max(20, (obj.transform.scale || 1) * 35);
  const cx = obj.transform.x;
  const cy = obj.transform.y;
  return {
    minX: cx - size,
    minY: cy - size,
    maxX: cx + size,
    maxY: cy + size,
    width: size * 2,
    height: size * 2,
  };
}

/**
 * Hit test: find clicked object at world coordinate
 */
export function hitTestObject(point: MapPoint, doc: MapDocument): MapObject | null {
  // Check in reverse layer order (top layers first)
  const layerMap = new Map(doc.layers.map((l) => [l.id, l]));

  // Sort objects by layer index descending
  const sortedObjects = [...doc.objects].reverse();

  for (const obj of sortedObjects) {
    const layer = layerMap.get(obj.layerId);
    if (!layer || !layer.visible || layer.locked || obj.locked) continue;

    // Check hit based on object type
    if (obj.type === 'symbol' || obj.type === 'marker') {
      const bounds = getObjectBounds(obj);
      if (point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY) {
        return obj;
      }
    } else if (obj.type === 'label') {
      const bounds = getObjectBounds(obj);
      if (point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY) {
        return obj;
      }
    } else if (obj.type === 'river' || obj.type === 'road') {
      if (obj.points && obj.points.length > 1) {
        const threshold = (obj.riverWidthStart || obj.style.strokeWidth || 4) + 12;
        for (let i = 0; i < obj.points.length - 1; i++) {
          const d = distToSegment(point, obj.points[i], obj.points[i + 1]);
          if (d <= threshold) return obj;
        }
      }
    } else if (obj.type === 'landmass' || obj.type === 'lake' || obj.type === 'territory') {
      if (obj.points && obj.points.length > 2) {
        if (isPointInPolygon(point, obj.points)) {
          return obj;
        }
      }
    }
  }

  return null;
}

/**
 * Draw background cartographic canvas according to theme
 */
export function renderCanvasBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: MapTheme = 'antique-parchment'
): void {
  ctx.save();

  if (theme === 'antique-parchment') {
    // Warm manuscript sea background
    ctx.fillStyle = '#10141b';
    ctx.fillRect(0, 0, width, height);

    // Oceanic rhumb lines & antique navigation grid
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;

    const step = 120;
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

    // Outer neatline border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, width - 48, height - 48);
  } else if (theme === 'dark-atlas') {
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(100, 120, 160, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  } else {
    // Blueprint / Topo
    ctx.fillStyle = '#0f1a24';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(40, 140, 200, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Render a single MapObject onto canvas
 */
export function renderMapObject(
  ctx: CanvasRenderingContext2D,
  obj: MapObject,
  isSelected: boolean = false
): void {
  ctx.save();

  const opacity = obj.style.opacity !== undefined ? obj.style.opacity : 1.0;
  ctx.globalAlpha = opacity;

  switch (obj.type) {
    case 'landmass': {
      if (obj.points && obj.points.length > 2) {
        // Coastal water tint halo (soft outer shadow)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i].x, obj.points[i].y);
        }
        ctx.closePath();

        // Coastline ripples
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
        ctx.lineWidth = (obj.style.strokeWidth || 2) + 8;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
        ctx.lineWidth = (obj.style.strokeWidth || 2) + 16;
        ctx.stroke();

        // Main parchment land fill
        ctx.fillStyle = obj.style.fillColor || '#ece2cb';
        ctx.fill();

        // Crisp ink coastline
        ctx.strokeStyle = obj.style.strokeColor || '#2c2217';
        ctx.lineWidth = obj.style.strokeWidth || 2;
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'lake': {
      if (obj.points && obj.points.length > 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i].x, obj.points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = obj.style.fillColor || '#121822';
        ctx.fill();
        ctx.strokeStyle = obj.style.strokeColor || '#2a3547';
        ctx.lineWidth = obj.style.strokeWidth || 1.8;
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'river': {
      if (obj.points && obj.points.length > 1) {
        ctx.save();
        const startW = obj.riverWidthStart || 2;
        const endW = obj.riverWidthEnd || 7;
        const stroke = obj.style.strokeColor || '#364963';

        // Draw segmented line with progressive tapering width
        const len = obj.points.length;
        for (let i = 0; i < len - 1; i++) {
          const t = i / (len - 1);
          const w = startW + (endW - startW) * t;

          ctx.beginPath();
          ctx.moveTo(obj.points[i].x, obj.points[i].y);
          ctx.lineTo(obj.points[i + 1].x, obj.points[i + 1].y);
          ctx.strokeStyle = stroke;
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
        ctx.restore();
      }
      break;
    }

    case 'road': {
      if (obj.points && obj.points.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i].x, obj.points[i].y);
        }
        ctx.strokeStyle = obj.style.strokeColor || '#7d5c34';
        ctx.lineWidth = obj.style.strokeWidth || 2.5;
        ctx.setLineDash(obj.style.strokeDash || [6, 4]);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'territory': {
      if (obj.points && obj.points.length > 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(obj.points[0].x, obj.points[0].y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i].x, obj.points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = obj.style.fillColor || 'rgba(212, 175, 55, 0.2)';
        ctx.fill();

        ctx.strokeStyle = obj.style.strokeColor || '#d4af37';
        ctx.lineWidth = obj.style.strokeWidth || 2;
        ctx.setLineDash(obj.style.strokeDash || [8, 4]);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'symbol': {
      if (obj.symbolId) {
        renderAssetSymbol(
          ctx,
          obj.symbolId,
          obj.transform.x,
          obj.transform.y,
          obj.transform.scale || 1.0,
          obj.transform.rotation || 0,
          obj.style,
          obj.metadata?.seed || 0
        );
      }
      break;
    }

    case 'label': {
      ctx.save();
      ctx.translate(obj.transform.x, obj.transform.y);
      if (obj.transform.rotation) {
        ctx.rotate((obj.transform.rotation * Math.PI) / 180);
      }
      const scale = obj.transform.scale || 1.0;
      const fontSize = (obj.style.fontSize || 22) * scale;
      const font = `${obj.style.fontWeight || '600'} ${fontSize}px ${obj.style.fontFamily || 'Cinzel, Georgia, serif'}`;

      ctx.font = font;
      ctx.textAlign = obj.style.textAnchor === 'start' ? 'left' : obj.style.textAnchor === 'end' ? 'right' : 'center';
      ctx.textBaseline = 'middle';

      // Subtle drop glow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = obj.style.textColor || '#f3e6cb';
      ctx.fillText(obj.label || obj.name, 0, 0);

      // Outer outline
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#18120c';
      ctx.lineWidth = 2.5;
      ctx.strokeText(obj.label || obj.name, 0, 0);
      ctx.fillText(obj.label || obj.name, 0, 0);
      ctx.restore();
      break;
    }

    case 'marker': {
      // Interactive Lore Marker with pulse ring
      ctx.save();
      const cx = obj.transform.x;
      const cy = obj.transform.y;
      const s = (obj.transform.scale || 1.0) * 18;

      // Glow halo
      ctx.beginPath();
      ctx.arc(cx, cy, s * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
      ctx.fill();

      // Pin body
      ctx.beginPath();
      ctx.arc(cx, cy, s, 0, Math.PI * 2);
      ctx.fillStyle = obj.style.fillColor || '#d4af37';
      ctx.fill();
      ctx.strokeStyle = '#11151c';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#11151c';
      ctx.fill();

      // Marker Name Tag below
      ctx.font = `600 13px Plus Jakarta Sans, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText(obj.name, cx, cy + s + 15);
      ctx.restore();
      break;
    }
  }

  // Draw selection highlight bounding box
  if (isSelected) {
    const bounds = getObjectBounds(obj);
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(bounds.minX - 4, bounds.minY - 4, bounds.width + 8, bounds.height + 8);

    // Corner handle
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(bounds.maxX + 4 - 4, bounds.maxY + 4 - 4, 8, 8);
    ctx.fillRect(bounds.minX - 4 - 4, bounds.minY - 4 - 4, 8, 8);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Render the entire MapDocument scene
 */
export function renderMapDocument(
  ctx: CanvasRenderingContext2D,
  doc: MapDocument,
  selectedObjectId?: string | null,
  layerFilter?: (layer: MapLayer) => boolean
): void {
  const width = doc.canvasWidth;
  const height = doc.canvasHeight;

  // Background
  renderCanvasBackground(ctx, width, height, doc.theme);

  // Group objects by layer
  const layerMap = new Map(doc.layers.map((l) => [l.id, l]));

  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    if (layerFilter && !layerFilter(layer)) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity;

    const layerObjects = doc.objects.filter((o) => o.layerId === layer.id);

    // If terrain layer, sort symbols by Y for 3D perspective depth!
    if (layer.type === 'terrain') {
      layerObjects.sort((a, b) => a.transform.y - b.transform.y);
    }

    for (const obj of layerObjects) {
      renderMapObject(ctx, obj, obj.id === selectedObjectId);
    }

    ctx.restore();
  }
}

/**
 * Render high-resolution export image (Milestone 10)
 */
export function exportMapToImage(
  doc: MapDocument,
  scaleFactor: number = 2.0,
  includeLayers?: string[]
): string {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = doc.canvasWidth * scaleFactor;
  exportCanvas.height = doc.canvasHeight * scaleFactor;

  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scaleFactor, scaleFactor);

  const filter = includeLayers
    ? (layer: MapLayer) => includeLayers.includes(layer.id)
    : undefined;

  renderMapDocument(ctx, doc, null, filter);
  return exportCanvas.toDataURL('image/png', 0.95);
}
