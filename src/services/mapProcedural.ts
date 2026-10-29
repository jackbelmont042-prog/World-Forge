/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapPoint, MapObject, ProceduralLandmassParams, MapDocument } from '../types/mapEditor';

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
export function createPRNG(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Chaikin's corner-cutting algorithm to smoothly round jagged polygon coastlines
 */
export function smoothCoastline(points: MapPoint[], iterations: number = 2): MapPoint[] {
  if (points.length < 3) return points;

  let current = [...points];

  for (let it = 0; it < iterations; it++) {
    const next: MapPoint[] = [];
    const len = current.length;

    for (let i = 0; i < len; i++) {
      const p0 = current[i];
      const p1 = current[(i + 1) % len];

      // Q = 0.75 * p0 + 0.25 * p1
      const q: MapPoint = {
        x: p0.x * 0.75 + p1.x * 0.25,
        y: p0.y * 0.75 + p1.y * 0.25,
      };

      // R = 0.25 * p0 + 0.75 * p1
      const r: MapPoint = {
        x: p0.x * 0.25 + p1.x * 0.75,
        y: p0.y * 0.25 + p1.y * 0.75,
      };

      next.push(q, r);
    }

    current = next;
  }

  return current;
}

/**
 * Inject natural fractal irregularities and inlets into a polygon coastline
 */
export function jitterCoastline(points: MapPoint[], amplitude: number = 15, seed: number = 42): MapPoint[] {
  const rand = createPRNG(seed);
  const result: MapPoint[] = [];
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % len];

    result.push(p0);

    // Midpoint with normal offset
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;

    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 30) {
      const nx = -dy / dist;
      const ny = dx / dist;
      const offset = (rand() - 0.5) * amplitude * 2;

      result.push({
        x: midX + nx * offset,
        y: midY + ny * offset,
      });
    }
  }

  return result;
}

/**
 * Generate procedural continents and archipelagos (Milestone 2 & 9)
 */
export function generateProceduralContinents(
  canvasWidth: number,
  canvasHeight: number,
  params: ProceduralLandmassParams
): { landmasses: MapPoint[][]; islands: MapPoint[][] } {
  const rand = createPRNG(params.seed);
  const landmasses: MapPoint[][] = [];
  const islands: MapPoint[][] = [];

  const count = Math.max(1, Math.min(5, params.continentCount));
  const baseRadius = Math.min(canvasWidth, canvasHeight) * (0.18 + params.landRatio * 0.22);

  // Generate main continents
  for (let c = 0; c < count; c++) {
    // Distribute centers across canvas quadrants
    const col = c % 2;
    const row = Math.floor(c / 2);
    const centerX = (canvasWidth / (count > 1 ? 2.5 : 2)) * (col + 0.8) + (rand() - 0.5) * 180;
    const centerY = (canvasHeight / (count > 2 ? 2.2 : 2)) * (row + 0.8) + (rand() - 0.5) * 140;

    const numPoints = 24 + Math.floor(params.coastlineRoughness * 28);
    const rawPoints: MapPoint[] = [];

    // Elliptical elongation factors
    const stretchX = 0.8 + rand() * 0.6;
    const stretchY = 0.8 + rand() * 0.6;
    const rotationAng = rand() * Math.PI * 2;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      // Multi-octave harmonic noise for natural bays & peninsulas
      const harmonic1 = Math.sin(angle * 3 + c * 2.1) * 0.28 * params.coastlineRoughness;
      const harmonic2 = Math.cos(angle * 7 - c * 1.4) * 0.16 * params.coastlineRoughness;
      const harmonic3 = Math.sin(angle * 13 + c) * 0.08 * params.coastlineRoughness;
      const noise = (rand() - 0.5) * 0.18 * params.coastlineRoughness;

      const r = baseRadius * (0.85 + harmonic1 + harmonic2 + harmonic3 + noise);
      const lx = Math.cos(angle) * r * stretchX;
      const ly = Math.sin(angle) * r * stretchY;

      // Rotate around continent center
      const rx = lx * Math.cos(rotationAng) - ly * Math.sin(rotationAng);
      const ry = lx * Math.sin(rotationAng) + ly * Math.cos(rotationAng);

      rawPoints.push({
        x: Math.max(80, Math.min(canvasWidth - 80, centerX + rx)),
        y: Math.max(80, Math.min(canvasHeight - 80, centerY + ry)),
      });
    }

    const smoothed = smoothCoastline(rawPoints, params.smoothIterations || 2);
    landmasses.push(smoothed);
  }

  // Generate archipelago islands around the coastlines
  const islandCount = Math.floor(params.islandDensity * 3);
  for (let k = 0; k < islandCount; k++) {
    const parentLand = landmasses[Math.floor(rand() * landmasses.length)];
    const anchorPoint = parentLand[Math.floor(rand() * parentLand.length)];

    // Distance offset outward from coast
    const dist = 70 + rand() * 160;
    const ang = rand() * Math.PI * 2;
    const ix = Math.max(50, Math.min(canvasWidth - 50, anchorPoint.x + Math.cos(ang) * dist));
    const iy = Math.max(50, Math.min(canvasHeight - 50, anchorPoint.y + Math.sin(ang) * dist));

    const islandRadius = 18 + rand() * 45;
    const islandPointsCount = 10 + Math.floor(rand() * 8);
    const islandRaw: MapPoint[] = [];

    for (let j = 0; j < islandPointsCount; j++) {
      const a = (j / islandPointsCount) * Math.PI * 2;
      const r = islandRadius * (0.7 + (rand() - 0.5) * 0.45);
      islandRaw.push({
        x: ix + Math.cos(a) * r,
        y: iy + Math.sin(a) * r,
      });
    }

    islands.push(smoothCoastline(islandRaw, 2));
  }

  return { landmasses, islands };
}

/**
 * Generate a winding river path from highland mountain toward sea/lake
 */
export function generateRiverPath(
  source: MapPoint,
  mouth: MapPoint,
  meanderFactor: number = 0.35,
  seed: number = 101
): MapPoint[] {
  const rand = createPRNG(seed);
  const steps = 7 + Math.floor(rand() * 5);
  const points: MapPoint[] = [source];

  const dx = mouth.x - source.x;
  const dy = mouth.y - source.y;
  const dist = Math.hypot(dx, dy);
  const nx = -dy / dist;
  const ny = dx / dist;

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const baseX = source.x + dx * t;
    const baseY = source.y + dy * t;

    // Meandering sine wave + random variance
    const meander = Math.sin(t * Math.PI * 3) * dist * meanderFactor * 0.25;
    const noise = (rand() - 0.5) * dist * meanderFactor * 0.2;
    const totalOffset = meander + noise;

    points.push({
      x: baseX + nx * totalOffset,
      y: baseY + ny * totalOffset,
    });
  }

  points.push(mouth);
  return points;
}

/**
 * Generate a mountain range arc with overlapping 3D depth ordering
 */
export function generateMountainRange(
  startPoint: MapPoint,
  endPoint: MapPoint,
  symbolId: string = 'mt_peak',
  count: number = 14,
  layerId: string,
  seed: number = 202
): MapObject[] {
  const rand = createPRNG(seed);
  const objects: MapObject[] = [];

  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const dist = Math.hypot(dx, dy);
  const nx = -dy / dist;
  const ny = dx / dist;

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    // Arc curvature
    const arcHeight = Math.sin(t * Math.PI) * 40 * (rand() > 0.5 ? 1 : -1);
    const lateralJitter = (rand() - 0.5) * 35;
    const totalNorm = arcHeight + lateralJitter;

    const x = startPoint.x + dx * t + nx * totalNorm;
    const y = startPoint.y + dy * t + ny * totalNorm;

    // Center peaks are higher than ends
    const peakCurve = Math.sin(t * Math.PI);
    const scale = 0.8 + peakCurve * 0.5 + (rand() - 0.5) * 0.2;

    objects.push({
      id: `mt-${Date.now()}-${i}-${Math.floor(rand() * 1000)}`,
      layerId,
      type: 'symbol',
      name: `Mountain Peak ${i + 1}`,
      symbolId,
      symbolCategory: 'mountains',
      transform: {
        x,
        y,
        scale,
        rotation: (rand() - 0.5) * 8, // slight natural tilt
      },
      style: {
        fillColor: '#ded5c0',
        strokeColor: '#2b2319',
        strokeWidth: 1.6,
      },
      metadata: { seed: seed + i },
    });
  }

  // Sort mountains by Y coordinate so northern peaks are drawn behind southern peaks!
  objects.sort((a, b) => a.transform.y - b.transform.y);
  return objects;
}

/**
 * Generate a forest grove cluster of trees
 */
export function generateForestCluster(
  center: MapPoint,
  radius: number = 120,
  treeCount: number = 25,
  symbolId: string = 'tree_pine',
  layerId: string,
  seed: number = 303
): MapObject[] {
  const rand = createPRNG(seed);
  const objects: MapObject[] = [];

  for (let i = 0; i < treeCount; i++) {
    // Uniform disc sampling with density falloff at edges
    const r = Math.sqrt(rand()) * radius;
    const theta = rand() * Math.PI * 2;

    const x = center.x + Math.cos(theta) * r;
    const y = center.y + Math.sin(theta) * r;
    const scale = 0.5 + (rand() - 0.5) * 0.25;

    objects.push({
      id: `tree-${Date.now()}-${i}-${Math.floor(rand() * 1000)}`,
      layerId,
      type: 'symbol',
      name: `Grove Tree ${i + 1}`,
      symbolId,
      symbolCategory: 'trees',
      transform: {
        x,
        y,
        scale,
        rotation: (rand() - 0.5) * 12,
      },
      style: {
        fillColor: '#8ca17c',
        strokeColor: '#1d2716',
        strokeWidth: 1.2,
      },
      metadata: { seed: seed + i },
    });
  }

  // Sort top to bottom for natural perspective
  objects.sort((a, b) => a.transform.y - b.transform.y);
  return objects;
}

/**
 * Partition a landmass into political kingdoms/territories (Milestone 5)
 */
export function generatePoliticalTerritories(
  landmass: MapPoint[],
  settlements: { id: string; name: string; x: number; y: number; factionId?: string }[],
  layerId: string
): MapObject[] {
  if (settlements.length === 0) return [];

  const territoryColors = [
    'rgba(196, 60, 50, 0.22)',
    'rgba(50, 110, 180, 0.22)',
    'rgba(190, 150, 40, 0.22)',
    'rgba(70, 150, 90, 0.22)',
    'rgba(140, 70, 170, 0.22)',
    'rgba(180, 100, 40, 0.22)',
  ];

  const bordersColors = [
    '#a83226',
    '#255896',
    '#9e7b1a',
    '#2e7040',
    '#703387',
    '#994e19',
  ];

  // For each settlement, generate an organic territorial polygon centered around it
  return settlements.map((settle, idx) => {
    const radius = 180 + (idx % 3) * 40;
    const pts: MapPoint[] = [];
    const numPts = 16;
    for (let p = 0; p < numPts; p++) {
      const ang = (p / numPts) * Math.PI * 2;
      const r = radius * (0.8 + Math.sin(ang * 3 + idx) * 0.2);
      pts.push({
        x: settle.x + Math.cos(ang) * r,
        y: settle.y + Math.sin(ang) * r,
      });
    }

    const smoothed = smoothCoastline(pts, 2);

    return {
      id: `terr-${Date.now()}-${idx}`,
      layerId,
      type: 'territory',
      name: `Territory of ${settle.name}`,
      transform: { x: settle.x, y: settle.y, scale: 1, rotation: 0 },
      points: smoothed,
      style: {
        fillColor: territoryColors[idx % territoryColors.length],
        strokeColor: bordersColors[idx % bordersColors.length],
        strokeWidth: 2.5,
        strokeDash: [6, 4],
      },
      metadata: {
        linkedLocationId: settle.id,
        linkedFactionId: settle.factionId,
      },
    };
  });
}

/**
 * Natural language AI map generation (Milestone 9)
 * Interprets user prompts to create continents, islands, mountain arcs, and settlements.
 */
export async function generateMapFromPrompt(
  prompt: string,
  doc: MapDocument,
  worldContext?: { genre?: string; tone?: string; description?: string }
): Promise<MapObject[]> {
  // Try online Gemini 3.8 Flash proxy first
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `The user wants to generate map features for a fantasy cartographic canvas (width: ${doc.canvasWidth}, height: ${doc.canvasHeight}).
User request: "${prompt}".
Generate an array of map objects in JSON format with fields:
- type: 'landmass' | 'river' | 'symbol' | 'territory' | 'label'
- name: string
- x: number (between 200 and ${doc.canvasWidth - 200})
- y: number (between 200 and ${doc.canvasHeight - 200})
- symbolId?: (e.g. 'mt_peak', 'mt_volcano', 'tree_pine', 'settle_capital', 'cast_citadel', 'mar_serpent', 'mon_ruin')
- points?: array of {x, y} for landmass/river
- label?: string for labels
Return directly JSON: { "features": [ ... ] }`,
        systemInstruction: 'You are an expert cartographic systems designer. Return valid JSON only.',
        worldContext,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.features)) {
        return json.data.features.map((f: any, idx: number) => ({
          id: `ai-feat-${Date.now()}-${idx}`,
          layerId: f.type === 'landmass' ? 'layer-geography' : f.type === 'symbol' ? 'layer-terrain' : 'layer-settlements',
          type: f.type || 'symbol',
          name: f.name || 'AI Feature',
          transform: { x: f.x || 1200, y: f.y || 800, scale: 1, rotation: 0 },
          points: f.points,
          symbolId: f.symbolId || 'mt_peak',
          symbolCategory: f.symbolId?.startsWith('mt') ? 'mountains' : f.symbolId?.startsWith('tree') ? 'trees' : 'settlements',
          label: f.label || f.name,
          style: {
            fillColor: f.type === 'landmass' ? '#efe5cf' : '#d2c5a8',
            strokeColor: '#2b2319',
            strokeWidth: 1.8,
          },
          metadata: { notes: `Generated from prompt: "${prompt}"` },
        }));
      }
    }
  } catch (e) {
    console.warn('AI generation proxy unavailable, falling back to deterministic procedural generator.');
  }

  // Robust offline procedural combinatorial generator
  const pLower = prompt.toLowerCase();
  const newObjects: MapObject[] = [];
  const seed = Math.floor(Math.random() * 99999);

  if (pLower.includes('island') || pLower.includes('archipelago')) {
    // Generate island chain
    const count = pLower.includes('chain') ? 5 : 3;
    const startX = 600;
    const startY = 700;
    for (let i = 0; i < count; i++) {
      const ix = startX + i * 260 + (Math.sin(i) * 80);
      const iy = startY + (Math.cos(i) * 120);
      const rad = 60 + (i === 0 ? 50 : 25);
      const pts: MapPoint[] = [];
      for (let j = 0; j < 14; j++) {
        const a = (j / 14) * Math.PI * 2;
        const r = rad * (0.8 + Math.sin(a * 3) * 0.2);
        pts.push({ x: ix + Math.cos(a) * r, y: iy + Math.sin(a) * r });
      }

      newObjects.push({
        id: `island-proc-${seed}-${i}`,
        layerId: 'layer-geography',
        type: 'landmass',
        name: `Isle of ${['Ember', 'Mist', 'Sirens', 'Storm', 'Coral'][i % 5]}`,
        transform: { x: ix, y: iy, scale: 1, rotation: 0 },
        points: smoothCoastline(pts, 2),
        style: { fillColor: '#ece1ca', strokeColor: '#2b2319', strokeWidth: 2 },
        metadata: { notes: 'Generated island chain' },
      });

      if (pLower.includes('volcano') && i === 0) {
        newObjects.push({
          id: `volc-${seed}`,
          layerId: 'layer-terrain',
          type: 'symbol',
          name: 'Smoking Caldera',
          symbolId: 'mt_volcano',
          symbolCategory: 'mountains',
          transform: { x: ix, y: iy - 10, scale: 1.3, rotation: 0 },
          style: { fillColor: '#ded5c0', strokeColor: '#2b2319', strokeWidth: 1.8 },
          metadata: {},
        });
      }
    }
  } else if (pLower.includes('mountain') || pLower.includes('range')) {
    // Generate mountain range arc across center
    const mtRange = generateMountainRange(
      { x: 500, y: 700 },
      { x: 1900, y: 900 },
      pLower.includes('volcano') ? 'mt_volcano' : 'mt_peak',
      16,
      'layer-terrain',
      seed
    );
    newObjects.push(...mtRange);
  } else if (pLower.includes('forest') || pLower.includes('woods')) {
    // Generate large forest sprawl
    const forest = generateForestCluster(
      { x: 1200, y: 800 },
      180,
      35,
      pLower.includes('pine') ? 'tree_pine' : 'tree_oak',
      'layer-terrain',
      seed
    );
    newObjects.push(...forest);
  } else {
    // Default: Landmass continent with mountains and capital
    const { landmasses } = generateProceduralContinents(doc.canvasWidth, doc.canvasHeight, {
      continentCount: 1,
      landRatio: 0.55,
      coastlineRoughness: 0.5,
      islandDensity: 4,
      seed,
      smoothIterations: 2,
    });

    if (landmasses[0]) {
      newObjects.push({
        id: `continent-${seed}`,
        layerId: 'layer-geography',
        type: 'landmass',
        name: 'The New Continent',
        transform: { x: 1200, y: 800, scale: 1, rotation: 0 },
        points: landmasses[0],
        style: { fillColor: '#ece1ca', strokeColor: '#2b2319', strokeWidth: 2.2 },
        metadata: {},
      });

      // Add spine of mountains
      const mountains = generateMountainRange({ x: 900, y: 650 }, { x: 1500, y: 950 }, 'mt_peak', 8, 'layer-terrain', seed + 1);
      newObjects.push(...mountains);
    }
  }

  return newObjects;
}
