/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MapPoint {
  x: number;
  y: number;
}

export interface MapBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export type MapLayerType =
  | 'geography'
  | 'terrain'
  | 'water'
  | 'political'
  | 'settlements'
  | 'infrastructure'
  | 'labels'
  | 'lore'
  | 'custom';

export interface MapLayer {
  id: string;
  name: string;
  type: MapLayerType;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0.0 - 1.0
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
}

export type MapObjectType =
  | 'landmass'        // Closed polygon coastline
  | 'lake'            // Closed inland water body
  | 'river'           // Path with spline control points
  | 'road'            // Path with dash/solid stroke
  | 'symbol'          // Illustrated cartographic stamp (mountain, tree, castle, city, etc.)
  | 'symbol_cluster'  // Multiple symbols grouped or procedurally scattered
  | 'territory'       // Closed political region polygon
  | 'label'           // Text label with typography and optional curve
  | 'marker';         // Interactive WorldForge lore marker

export interface MapObjectStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeDash?: number[];
  opacity?: number;
  roughness?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textColor?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  shadowColor?: string;
  shadowBlur?: number;
}

export interface MapObjectMetadata {
  linkedLocationId?: string;
  linkedFactionId?: string;
  linkedCharacterId?: string;
  linkedLoreId?: string;
  linkedQuestId?: string;
  childMapId?: string;    // Multi-scale drilldown (e.g. Continent -> City map)
  parentMapId?: string;
  historicalYearStart?: number;
  historicalYearEnd?: number;
  notes?: string;
  seed?: number;
  tags?: string[];
}

export interface MapObject {
  id: string;
  layerId: string;
  type: MapObjectType;
  name: string;
  transform: {
    x: number;        // Center or anchor point
    y: number;
    scale: number;
    rotation: number; // In degrees
  };
  points?: MapPoint[];        // Polygon vertices or path control points
  riverWidthStart?: number;  // Tapering width at source
  riverWidthEnd?: number;    // Tapering width at mouth
  symbolId?: string;         // Reference to asset catalog
  symbolCategory?: string;
  label?: string;            // Text content for labels
  style: MapObjectStyle;
  metadata: MapObjectMetadata;
  locked?: boolean;
}

export interface HistoricalMapState {
  id: string;
  name: string;
  year: number;
  eraName: string;
  description: string;
  hiddenObjectIds?: string[];
  objectOverrides?: Record<string, Partial<MapObject>>;
}

export type MapTheme =
  | 'antique-parchment'
  | 'dark-atlas'
  | 'topographic'
  | 'celestial'
  | 'blueprint';

export interface MapDocument {
  version: number;
  id: string;
  worldId: string;
  title: string;
  mapType: 'world' | 'continent' | 'region' | 'city' | 'dungeon';
  canvasWidth: number;   // Default 2400
  canvasHeight: number;  // Default 1600
  theme: MapTheme;
  layers: MapLayer[];
  objects: MapObject[];
  activeLayerId: string;
  historicalStates: HistoricalMapState[];
  activeHistoricalStateId?: string;
  parentMapId?: string;
  childMapIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type EditorTool =
  | 'select'
  | 'landmass_freehand'
  | 'landmass_shape'
  | 'landmass_procedural'
  | 'coastline_smooth'
  | 'cut_lake'
  | 'river'
  | 'lake'
  | 'symbol_stamp'
  | 'symbol_brush'
  | 'territory'
  | 'road'
  | 'label'
  | 'marker'
  | 'ai_assist';

export interface AssetSymbolDefinition {
  id: string;
  name: string;
  category: 'mountains' | 'trees' | 'settlements' | 'fortifications' | 'infrastructure' | 'maritime' | 'monuments' | 'decorative';
  tags: string[];
  defaultScale: number;
  aspectRatio: number;
  variationsCount?: number;
}

export interface ProceduralLandmassParams {
  continentCount: number;     // 1 - 5
  landRatio: number;          // 0.2 - 0.8
  coastlineRoughness: number;  // 0.1 - 1.0
  islandDensity: number;       // 0 - 10
  seed: number;
  smoothIterations: number;    // 1 - 4
}
