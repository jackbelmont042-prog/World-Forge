/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapDocument } from '../types/mapEditor';
import { DEFAULT_LAYERS } from './mapCanvasEngine';
import { smoothCoastline } from './mapProcedural';

/**
 * Generate rich starter MapDocument for "The Shattered Reach" universe
 */
export function getSampleAethelgardMapDocument(worldId: string): MapDocument {
  // Main continent polygon: High Aethelgard
  const aethelgardPoints = smoothCoastline(
    [
      { x: 920, y: 380 },
      { x: 1250, y: 320 },
      { x: 1540, y: 360 },
      { x: 1720, y: 480 },
      { x: 1780, y: 650 },
      { x: 1680, y: 820 },
      { x: 1500, y: 920 },
      { x: 1220, y: 980 },
      { x: 960, y: 920 },
      { x: 800, y: 780 },
      { x: 740, y: 600 },
      { x: 810, y: 460 },
    ],
    2
  );

  // Western archipelago: The Corsair Atolls
  const atollPoints = smoothCoastline(
    [
      { x: 380, y: 720 },
      { x: 580, y: 690 },
      { x: 640, y: 820 },
      { x: 560, y: 940 },
      { x: 400, y: 960 },
      { x: 330, y: 860 },
    ],
    2
  );

  // Southern volcanic crag: The Cinder Rift
  const riftPoints = smoothCoastline(
    [
      { x: 1680, y: 1040 },
      { x: 1980, y: 1020 },
      { x: 2060, y: 1180 },
      { x: 1940, y: 1320 },
      { x: 1720, y: 1310 },
      { x: 1620, y: 1190 },
    ],
    2
  );

  // Inland Lake of Mirrors
  const lakePoints = smoothCoastline(
    [
      { x: 1180, y: 640 },
      { x: 1320, y: 620 },
      { x: 1380, y: 710 },
      { x: 1300, y: 780 },
      { x: 1160, y: 750 },
      { x: 1120, y: 690 },
    ],
    2
  );

  return {
    version: 2,
    id: 'map-aethelgard-reach-doc',
    worldId,
    title: 'The Great Sky-Archipelago Chart',
    mapType: 'world',
    canvasWidth: 2400,
    canvasHeight: 1600,
    theme: 'antique-parchment',
    layers: DEFAULT_LAYERS.map((l) => ({ ...l })),
    activeLayerId: 'layer-geography',
    historicalStates: [
      {
        id: 'hist-dawn',
        name: 'The Dawn Era',
        year: 100,
        eraName: 'First Age',
        description: 'Before the Grand Celestial Fracture; floating landmasses were contiguous.',
      },
      {
        id: 'hist-hegemony',
        name: 'Height of the Solar Hegemony',
        year: 450,
        eraName: 'Second Age',
        description: 'Imperial expansion across all upper stratums.',
      },
      {
        id: 'hist-present',
        name: 'The Present Shattered Reach',
        year: 800,
        eraName: 'Third Age',
        description: 'Fractured borderlands, contested slipways, and corsair skirmishes.',
      },
    ],
    activeHistoricalStateId: 'hist-present',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    objects: [
      // 1. Geography: Landmasses & Lakes
      {
        id: 'land-aethelgard',
        layerId: 'layer-geography',
        type: 'landmass',
        name: 'High Aethelgard Plate',
        transform: { x: 1260, y: 650, scale: 1, rotation: 0 },
        points: aethelgardPoints,
        style: { fillColor: '#ece1ca', strokeColor: '#2b2319', strokeWidth: 2.2 },
        metadata: { linkedLocationId: 'loc-high-aethelgard' },
      },
      {
        id: 'land-atolls',
        layerId: 'layer-geography',
        type: 'landmass',
        name: 'Corsair Atoll Chain',
        transform: { x: 480, y: 830, scale: 1, rotation: 0 },
        points: atollPoints,
        style: { fillColor: '#ece1ca', strokeColor: '#2b2319', strokeWidth: 2.0 },
        metadata: { linkedLocationId: 'loc-haven-dock' },
      },
      {
        id: 'land-cinder',
        layerId: 'layer-geography',
        type: 'landmass',
        name: 'The Cinder Crags',
        transform: { x: 1840, y: 1170, scale: 1, rotation: 0 },
        points: riftPoints,
        style: { fillColor: '#d9ccb8', strokeColor: '#2b2319', strokeWidth: 2.0 },
        metadata: { linkedLocationId: 'loc-cinder-rift' },
      },
      {
        id: 'lake-mirrors',
        layerId: 'layer-water',
        type: 'lake',
        name: 'Lake of Mirrors',
        transform: { x: 1250, y: 700, scale: 1, rotation: 0 },
        points: lakePoints,
        style: { fillColor: '#16202c', strokeColor: '#2d3b4e', strokeWidth: 1.8 },
        metadata: {},
      },

      // 2. Hydrology: The Celestial River
      {
        id: 'riv-aetherflow',
        layerId: 'layer-water',
        type: 'river',
        name: 'The Aetherflow Meander',
        transform: { x: 1180, y: 520, scale: 1, rotation: 0 },
        points: [
          { x: 1040, y: 460 },
          { x: 1110, y: 510 },
          { x: 1140, y: 590 },
          { x: 1190, y: 640 },
          { x: 1340, y: 750 },
          { x: 1460, y: 840 },
          { x: 1600, y: 900 },
        ],
        riverWidthStart: 2.5,
        riverWidthEnd: 8.0,
        style: { strokeColor: '#2f435a', strokeWidth: 3 },
        metadata: {},
      },

      // 3. Terrain: Mountains
      {
        id: 'mt-spire-range-1',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'Mount Solara',
        symbolId: 'mt_snowy',
        symbolCategory: 'mountains',
        transform: { x: 1020, y: 440, scale: 1.3, rotation: 0 },
        style: { fillColor: '#ded5c0', strokeColor: '#2b2319', strokeWidth: 1.8 },
        metadata: {},
      },
      {
        id: 'mt-spire-range-2',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'Eagle Peak',
        symbolId: 'mt_peak',
        symbolCategory: 'mountains',
        transform: { x: 1130, y: 430, scale: 1.1, rotation: -2 },
        style: { fillColor: '#ded5c0', strokeColor: '#2b2319', strokeWidth: 1.6 },
        metadata: {},
      },
      {
        id: 'mt-spire-range-3',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'Stormwatch Crag',
        symbolId: 'mt_ridge',
        symbolCategory: 'mountains',
        transform: { x: 1250, y: 420, scale: 1.0, rotation: 3 },
        style: { fillColor: '#ded5c0', strokeColor: '#2b2319', strokeWidth: 1.6 },
        metadata: {},
      },
      {
        id: 'mt-volc-rift',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'The Cinder Volcano',
        symbolId: 'mt_volcano',
        symbolCategory: 'mountains',
        transform: { x: 1840, y: 1150, scale: 1.35, rotation: 0 },
        style: { fillColor: '#d0beaa', strokeColor: '#2b2319', strokeWidth: 1.8 },
        metadata: { linkedLocationId: 'loc-cinder-rift' },
      },

      // 4. Terrain: Forest Groves
      {
        id: 'tree-whispering-1',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'Whispering Pine',
        symbolId: 'tree_pine',
        symbolCategory: 'trees',
        transform: { x: 920, y: 640, scale: 0.8, rotation: 0 },
        style: { fillColor: '#7c966c', strokeColor: '#1d2716', strokeWidth: 1.4 },
        metadata: {},
      },
      {
        id: 'tree-whispering-2',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'Whispering Pine',
        symbolId: 'tree_pine',
        symbolCategory: 'trees',
        transform: { x: 960, y: 680, scale: 0.85, rotation: -4 },
        style: { fillColor: '#7c966c', strokeColor: '#1d2716', strokeWidth: 1.4 },
        metadata: {},
      },
      {
        id: 'tree-whispering-3',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'Whispering Pine',
        symbolId: 'tree_pine',
        symbolCategory: 'trees',
        transform: { x: 900, y: 720, scale: 0.75, rotation: 2 },
        style: { fillColor: '#7c966c', strokeColor: '#1d2716', strokeWidth: 1.4 },
        metadata: {},
      },
      {
        id: 'tree-oak-wood-1',
        layerId: 'layer-terrain',
        type: 'symbol',
        name: 'Elder Oak',
        symbolId: 'tree_oak',
        symbolCategory: 'trees',
        transform: { x: 1480, y: 620, scale: 0.85, rotation: 0 },
        style: { fillColor: '#8ea576', strokeColor: '#1d2716', strokeWidth: 1.4 },
        metadata: {},
      },

      // 5. Settlements & Citadels
      {
        id: 'settle-capital-spire',
        layerId: 'layer-settlements',
        type: 'symbol',
        name: 'The Sunburst Spire',
        symbolId: 'cast_citadel',
        symbolCategory: 'fortifications',
        transform: { x: 1320, y: 490, scale: 1.4, rotation: 0 },
        style: { fillColor: '#e8dcbd', strokeColor: '#1d1712', strokeWidth: 2 },
        metadata: { linkedLocationId: 'loc-spire-of-aethel' },
      },
      {
        id: 'settle-haven-port',
        layerId: 'layer-settlements',
        type: 'symbol',
        name: 'Haven Sky-Dock',
        symbolId: 'settle_port',
        symbolCategory: 'settlements',
        transform: { x: 520, y: 780, scale: 1.3, rotation: 0 },
        style: { fillColor: '#e8dcbd', strokeColor: '#1d1712', strokeWidth: 2 },
        metadata: { linkedLocationId: 'loc-haven-dock' },
      },

      // 6. Infrastructure: Sky-Highway Road
      {
        id: 'road-sky-tether',
        layerId: 'layer-infrastructure',
        type: 'road',
        name: 'The Great Aether Slipway',
        transform: { x: 900, y: 630, scale: 1, rotation: 0 },
        points: [
          { x: 560, y: 770 },
          { x: 740, y: 700 },
          { x: 920, y: 600 },
          { x: 1120, y: 530 },
          { x: 1300, y: 500 },
        ],
        style: { strokeColor: '#8a6538', strokeWidth: 3, strokeDash: [8, 5] },
        metadata: { notes: 'Primary high-altitude trade conduit' },
      },

      // 7. Political: Territories
      {
        id: 'terr-solar-hegemony',
        layerId: 'layer-political',
        type: 'territory',
        name: 'Sovereignty of the Solar Hegemony',
        transform: { x: 1300, y: 560, scale: 1, rotation: 0 },
        points: smoothCoastline(
          [
            { x: 1050, y: 390 },
            { x: 1450, y: 360 },
            { x: 1620, y: 500 },
            { x: 1540, y: 720 },
            { x: 1280, y: 720 },
            { x: 1100, y: 600 },
          ],
          2
        ),
        style: {
          fillColor: 'rgba(212, 175, 55, 0.22)',
          strokeColor: '#d4af37',
          strokeWidth: 2.2,
          strokeDash: [8, 4],
        },
        metadata: { linkedFactionId: 'fac-solar-hegemony' },
      },

      // 8. Labels
      {
        id: 'lbl-aethelgard',
        layerId: 'layer-labels',
        type: 'label',
        name: 'HIGH AETHELGARD',
        label: 'HIGH AETHELGARD',
        transform: { x: 1300, y: 880, scale: 1.4, rotation: -3 },
        style: {
          fontFamily: 'Cinzel, serif',
          fontSize: 28,
          fontWeight: '700',
          textColor: '#f5e4bd',
        },
        metadata: {},
      },
      {
        id: 'lbl-corsair',
        layerId: 'layer-labels',
        type: 'label',
        name: 'THE CORSAIR REACHES',
        label: 'THE CORSAIR REACHES',
        transform: { x: 480, y: 920, scale: 1.0, rotation: 5 },
        style: {
          fontFamily: 'Cinzel, serif',
          fontSize: 20,
          fontWeight: '600',
          textColor: '#e8d2a6',
        },
        metadata: {},
      },

      // 9. Maritime Galleon
      {
        id: 'ship-zephyr-bloom',
        layerId: 'layer-infrastructure',
        type: 'symbol',
        name: 'The Zephyr Bloom (Corsair Flagship)',
        symbolId: 'mar_galleon',
        symbolCategory: 'maritime',
        transform: { x: 670, y: 640, scale: 1.25, rotation: -8 },
        style: { fillColor: '#e5d9c2', strokeColor: '#2b2319', strokeWidth: 1.8 },
        metadata: { notes: 'Lyra Valen’s corsair vessel cruising the slipstream' },
      },

      // 10. Decorative Compass Rose
      {
        id: 'dec-compass-rose',
        layerId: 'layer-geography',
        type: 'symbol',
        name: 'Cartographer’s Compass Rose',
        symbolId: 'dec_compass',
        symbolCategory: 'decorative',
        transform: { x: 260, y: 280, scale: 1.8, rotation: 0 },
        style: { fillColor: '#e2d3b2', strokeColor: '#251e15', strokeWidth: 2.0 },
        metadata: {},
      },

      // 11. Interactive Lore Markers (linked to WorldForge DB entities)
      {
        id: 'lore-marker-spire',
        layerId: 'layer-lore',
        type: 'marker',
        name: 'Sunburst Spire',
        transform: { x: 1320, y: 490, scale: 1.0, rotation: 0 },
        style: { fillColor: '#d4af37' },
        metadata: {
          linkedLocationId: 'loc-spire-of-aethel',
          notes: 'Seat of Archon Malakar and the Solar Hegemony',
        },
      },
      {
        id: 'lore-marker-haven',
        layerId: 'layer-lore',
        type: 'marker',
        name: 'Haven Sky-Dock',
        transform: { x: 520, y: 780, scale: 1.0, rotation: 0 },
        style: { fillColor: '#38bdf8' },
        metadata: {
          linkedLocationId: 'loc-haven-dock',
          notes: 'Smuggler sanctuary and skyship slipways',
        },
      },
      {
        id: 'lore-marker-cinder',
        layerId: 'layer-lore',
        type: 'marker',
        name: 'The Cinder Rift',
        transform: { x: 1840, y: 1150, scale: 1.0, rotation: 0 },
        style: { fillColor: '#f87171' },
        metadata: {
          linkedLocationId: 'loc-cinder-rift',
          notes: 'Crystal quarries and volatile aether rifts',
        },
      },
    ],
  };
}
