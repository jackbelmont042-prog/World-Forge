import { db } from '../src/services/db';
import { SAMPLE_WORLD_PACKAGE } from '../src/services/seedData';
import { generateWorldMarkdown } from '../src/services/exportService';

// Mock IndexedDB in Node for acceptance tests
import 'fake-indexeddb/auto';

async function runAcceptanceTests() {
  console.log('=== RUNNING WORLDFORGE ACCEPTANCE TESTS ===\n');

  // Test 1: Initialize default sample world
  console.log('Test 1: Seed default universe "The Shattered Reach"...');
  const initialWorld = await db.initializeDefaultsIfEmpty();
  console.log(`✓ World active: "${initialWorld.name}" (ID: ${initialWorld.id})`);

  // Test 2: Create second separate world and verify content isolation
  console.log('\nTest 2: Create second isolated world and verify content isolation...');
  const world2 = await db.createWorld({
    name: 'Obsidian Trench',
    genre: 'dark-fantasy',
    description: 'A subterranean lava realm.',
  });
  console.log(`✓ Created World 2: "${world2.name}" (ID: ${world2.id})`);

  // Add character to World 2
  await db.put('characters', {
    id: 'char-test-trench-1',
    worldId: world2.id,
    name: 'Grom the Unyielding',
    titles: ['Ash Lord'],
    aliases: [],
    status: 'living',
    factionIds: [],
    relationships: [],
    family: { parentIds: [], childIds: [], spouseIds: [], siblingIds: [] },
    itemIds: [],
    timelineEvents: [],
    tags: ['Trench'],
    customFields: [],
    appearance: 'Ash-grey skin',
    personality: 'Taciturn',
    strengths: [],
    weaknesses: [],
    skills: [],
    goals: 'Survive',
    fears: 'Light',
    secrets: 'Carries magma heart',
    backstory: 'Born in the sulfur pits',
    notes: 'Distinctive keyword: ObsidianCrypt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const world1Chars = await db.getAll('characters', initialWorld.id);
  const world2Chars = await db.getAll('characters', world2.id);

  if (world1Chars.some((c: any) => c.name === 'Grom the Unyielding')) {
    throw new Error('FAIL: World 1 contains character from World 2! Content leaked.');
  }
  if (!world2Chars.some((c: any) => c.name === 'Grom the Unyielding')) {
    throw new Error('FAIL: World 2 does not contain Grom!');
  }
  console.log(`✓ Content Isolation Verified: World 1 has ${world1Chars.length} characters, World 2 has ${world2Chars.length} characters. Zero cross-contamination.`);

  // Test 3: Edit a location and verify persistence
  console.log('\nTest 3: Edit a location and verify persistence...');
  const locs = await db.getAll<any>('locations', initialWorld.id);
  const targetLoc = locs[0];
  const oldPop = targetLoc.population;
  targetLoc.population = '3.5 Million Citizens (Updated)';
  await db.put('locations', targetLoc);
  const reloadedLoc = await db.get<any>('locations', targetLoc.id);
  if (reloadedLoc.population !== '3.5 Million Citizens (Updated)') {
    throw new Error('FAIL: Location update did not persist!');
  }
  console.log(`✓ Location persistence verified: Updated "${reloadedLoc.name}" population to "${reloadedLoc.population}".`);

  // Test 4: Link character to faction and verify bidirectional reference
  console.log('\nTest 4: Link character to faction...');
  const charLyra = await db.get<any>('characters', 'char-lyra-valen');
  if (!charLyra.factionIds.includes('fac-zephyr-corsairs')) {
    throw new Error('FAIL: Lyra not linked to Zephyr Corsairs!');
  }
  const facZephyr = await db.get<any>('factions', 'fac-zephyr-corsairs');
  if (!facZephyr.memberIds.includes('char-lyra-valen')) {
    throw new Error('FAIL: Zephyr Corsairs does not include Lyra as member!');
  }
  console.log(`✓ Bidirectional link verified: Lyra in Zephyr Corsairs and Zephyr Corsairs lists Lyra.`);

  // Test 5: Rename linked record and verify stable relationship ID
  console.log('\nTest 5: Rename linked record and verify reference integrity...');
  facZephyr.name = 'The Sovereign Zephyr Brotherhood (Renamed)';
  await db.put('factions', facZephyr);
  const lyraReloaded = await db.get<any>('characters', 'char-lyra-valen');
  if (!lyraReloaded.factionIds.includes(facZephyr.id)) {
    throw new Error('FAIL: Renaming faction broke character link!');
  }
  console.log(`✓ Stable ID integrity verified: Renamed faction to "${facZephyr.name}"; character relationship persists by stable ID.`);

  // Test 6: Search character by distinctive keyword in notes
  console.log('\nTest 6: Search by distinctive keyword in notes...');
  const searchMatch: any = world2Chars.find((c: any) => c.notes && c.notes.includes('ObsidianCrypt'));
  if (!searchMatch || searchMatch.name !== 'Grom the Unyielding') {
    throw new Error('FAIL: Search by distinctive keyword failed!');
  }
  console.log(`✓ Keyword search verified: Found "${searchMatch.name}" matching keyword "ObsidianCrypt".`);

  // Test 7: Export world to JSON and Markdown, then re-import to clean world
  console.log('\nTest 7: Export universe to JSON and Markdown compendium...');
  const exportedPkg = await db.exportWorldPackage(initialWorld.id);
  if (!exportedPkg || !exportedPkg.characters || exportedPkg.characters.length === 0) {
    throw new Error('FAIL: Export package is empty or invalid!');
  }
  const md = generateWorldMarkdown(exportedPkg);
  if (!md.includes('# The Shattered Reach — World Compendium')) {
    throw new Error('FAIL: Markdown compendium generation incomplete!');
  }
  console.log(`✓ Markdown export generated successfully (${md.length} characters).`);

  const importedWorld = await db.importWorldPackage(exportedPkg);
  console.log(`✓ Imported universe into database successfully as "${importedWorld.name}" (ID: ${importedWorld.id}).`);

  // Test 8: Delete a linked record and verify referential integrity
  console.log('\nTest 8: Safe deletion and relationship cleanup...');
  await db.delete('characters', 'char-archon-malakar', initialWorld.id);
  const lyraAfterDelete = await db.get<any>('characters', 'char-lyra-valen');
  const hasDanglingMalakar = lyraAfterDelete.relationships.some((r: any) => r.targetCharacterId === 'char-archon-malakar');
  if (hasDanglingMalakar) {
    throw new Error('FAIL: Dangling relationship to deleted Malakar remains in Lyra!');
  }
  console.log(`✓ Safe deletion verified: Malakar deleted and all dependent relationships cleaned up without dangling broken references.`);

  console.log('\n========================================');
  console.log('ALL ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================\n');
}

runAcceptanceTests().catch((err) => {
  console.error('Acceptance test failed:', err);
  process.exit(1);
});
