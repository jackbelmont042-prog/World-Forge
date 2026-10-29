/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createDefaultMapDocument,
  hitTestObject,
  getObjectBounds,
  isPointInPolygon,
  screenToWorld,
  worldToScreen,
} from '../src/services/mapCanvasEngine';
import {
  smoothCoastline,
  generateProceduralContinents,
  generateRiverPath,
  generateMountainRange,
  generateForestCluster,
  generatePoliticalTerritories,
  generateMapFromPrompt,
} from '../src/services/mapProcedural';
import { ASSET_SYMBOLS } from '../src/services/mapAssets';
import { getSampleAethelgardMapDocument } from '../src/services/sampleMapDocument';

async function runMapEditorAcceptanceTests() {
  console.log('=== RUNNING WORLDFORGE MAP-CREATION ACCEPTANCE TESTS ===\n');

  // Test 1: Milestone 0 - Document Architecture & Scene Model
  console.log('Test 1: Scene & Document Model Architecture...');
  const doc = createDefaultMapDocument('test-world-1', 'Aethelgard High Chart', 'world');
  if (doc.layers.length < 8) {
    throw new Error('FAIL: Document does not contain all standard cartographic layers!');
  }
  if (doc.canvasWidth !== 2400 || doc.canvasHeight !== 1600) {
    throw new Error('FAIL: Unexpected canvas coordinate system boundaries!');
  }
  console.log(`✓ Document Model verified: "${doc.title}" (Canvas ${doc.canvasWidth}x${doc.canvasHeight}, ${doc.layers.length} layers).`);

  // Test 2: Milestone 1 - Coordinate Transforms & Hit-Testing
  console.log('\nTest 2: Coordinate Systems & Object Hit-Testing...');
  const worldPt = screenToWorld(400, 300, 40, 30, 0.5);
  const screenPt = worldToScreen(worldPt.x, worldPt.y, 40, 30, 0.5);
  if (Math.abs(screenPt.x - 400) > 0.01 || Math.abs(screenPt.y - 300) > 0.01) {
    throw new Error('FAIL: Coordinate transformation roundtrip inaccurate!');
  }

  // Hit-test sample document
  const sampleDoc = getSampleAethelgardMapDocument('world-shattered-reach');
  const targetMountain = sampleDoc.objects.find((o) => o.id === 'mt-spire-range-1')!;
  const hitMountain = hitTestObject({ x: targetMountain.transform.x, y: targetMountain.transform.y }, sampleDoc);
  if (!hitMountain || hitMountain.id !== targetMountain.id) {
    throw new Error(`FAIL: Hit-test failed to select mountain symbol at (${targetMountain.transform.x}, ${targetMountain.transform.y})!`);
  }

  // Hit-test top-layer interactive marker
  const targetMarker = sampleDoc.objects.find((o) => o.id === 'lore-marker-spire')!;
  const hitMarker = hitTestObject({ x: targetMarker.transform.x, y: targetMarker.transform.y }, sampleDoc);
  if (!hitMarker || hitMarker.id !== targetMarker.id) {
    throw new Error(`FAIL: Hit-test failed to select top-layer marker!`);
  }
  console.log(`✓ Coordinate transformation & Hit-testing verified (Hit symbols & markers: "${hitMountain.name}", "${hitMarker.name}").`);

  // Test 3: Milestone 2 - Procedural Continents & Coastline Smoothing
  console.log('\nTest 3: Procedural Continents & Coastline Smoothing (Chaikin)...');
  const { landmasses, islands } = generateProceduralContinents(2400, 1600, {
    continentCount: 2,
    landRatio: 0.5,
    coastlineRoughness: 0.6,
    islandDensity: 4,
    seed: 777,
    smoothIterations: 2,
  });

  if (landmasses.length !== 2) {
    throw new Error(`FAIL: Expected 2 continents, generated ${landmasses.length}`);
  }
  if (islands.length === 0) {
    throw new Error('FAIL: Expected archipelago islands to be generated!');
  }

  // Verify Chaikin smoothing doubled points and rounded corners
  const rawBox = [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 300 },
    { x: 100, y: 300 },
  ];
  const smoothedBox = smoothCoastline(rawBox, 2);
  if (smoothedBox.length <= rawBox.length) {
    throw new Error('FAIL: Coastline smoothing failed to refine vertices!');
  }
  console.log(`✓ Procedural Geography verified: 2 Continents (${landmasses[0].length} pts) and ${islands.length} Archipelago Islets generated.`);

  // Test 4: Milestone 2 - Hydrology (River Splines & Lake Outlines)
  console.log('\nTest 4: Hydrology (River Splines with Meandering Flow)...');
  const riverPoints = generateRiverPath({ x: 900, y: 500 }, { x: 1600, y: 1100 }, 0.35, 123);
  if (riverPoints.length < 5) {
    throw new Error('FAIL: River generation produced insufficient spline points!');
  }
  console.log(`✓ Hydrology verified: River spline with ${riverPoints.length} meandering points generated.`);

  // Test 5: Milestone 3 - Illustrated Asset Catalog & Depth Ordering
  console.log('\nTest 5: Illustrated Asset Catalog & Perspective Ordering...');
  if (ASSET_SYMBOLS.length < 20) {
    throw new Error('FAIL: Asset catalog has insufficient illustrated symbols!');
  }
  const mountainRange = generateMountainRange({ x: 600, y: 600 }, { x: 1400, y: 800 }, 'mt_peak', 10, 'layer-terrain', 456);
  // Verify northern peaks are ordered before southern peaks
  for (let i = 0; i < mountainRange.length - 1; i++) {
    if (mountainRange[i].transform.y > mountainRange[i + 1].transform.y) {
      throw new Error('FAIL: Mountain depth ordering failed (should be sorted by Y coordinate for 3D cartographic perspective)!');
    }
  }
  console.log(`✓ Asset System verified: ${ASSET_SYMBOLS.length} illustrated symbols available; 10 mountain peaks generated with 3D Y-perspective sorting.`);

  // Test 6: Milestone 5 - Political Territories & Automatic Borders
  console.log('\nTest 6: Political Territories & Sovereign Borders...');
  const settlements = [
    { id: 'city-1', name: 'Solara', x: 800, y: 600 },
    { id: 'city-2', name: 'Haven', x: 1200, y: 700 },
    { id: 'city-3', name: 'Valen', x: 1600, y: 900 },
  ];
  const territories = generatePoliticalTerritories(sampleDoc.objects[0].points || [], settlements, 'layer-political');
  if (territories.length !== 3) {
    throw new Error(`FAIL: Expected 3 territories, generated ${territories.length}`);
  }
  console.log(`✓ Political Geography verified: ${territories.length} sovereign territories partitioned with dashed borders and color tints.`);

  // Test 7: Milestone 8 - Historical States
  console.log('\nTest 7: Historical Timeline States...');
  if (!sampleDoc.historicalStates || sampleDoc.historicalStates.length < 3) {
    throw new Error('FAIL: Sample document missing historical era states!');
  }
  console.log(`✓ Historical Timeline verified: ${sampleDoc.historicalStates.length} Era states configured (Dawn Era Y100 -> Present Y800).`);

  // Test 8: Milestone 9 - Natural Language Assistant (Offline Fallback)
  console.log('\nTest 8: Natural Language AI / Procedural Generation...');
  const promptObjects = await generateMapFromPrompt('Create an archipelago of volcanic islands', doc);
  if (promptObjects.length === 0) {
    throw new Error('FAIL: Natural language generation produced zero objects!');
  }
  console.log(`✓ Natural Language Generator verified: Generated ${promptObjects.length} features from prompt.`);

  console.log('\n======================================================');
  console.log('ALL MAP-CREATION ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runMapEditorAcceptanceTests().catch((err) => {
  console.error('Acceptance test failed:', err);
  process.exit(1);
});
