import { World } from '../types/world';

export interface GenerationPromptOptions {
  category:
    | 'character'
    | 'kingdom'
    | 'location'
    | 'culture'
    | 'event'
    | 'religion'
    | 'creature'
    | 'quest'
    | 'magicSystem'
    | 'plotTwist';
  themeHint?: string;
  world: World;
  apiKey?: string;
}

export interface GeneratedConcept {
  title: string;
  subtitle?: string;
  summary: string;
  details: Record<string, any>;
  tags: string[];
}

// Deep offline procedural combinatorial tables for 100% offline generation support
const OFFLINE_TABLES = {
  names: {
    prefixes: ['Val', 'Ael', 'Mor', 'Kael', 'Thal', 'Cor', 'Oryn', 'Zeph', 'Syr', 'Vael', 'Eld', 'Bryn', 'Nyx', 'Drak', 'Ash'],
    suffixes: ['gard', 'mar', 'vance', 'thas', 'dor', 'haven', 'crest', 'mire', 'spire', 'wick', 'vale', 'fell', 'brook', 'glen'],
    epithets: ['the Unbroken', 'Star-Gazer', 'the Iron Will', 'of the Weeping Mist', 'Sun-Strider', 'the Ash-Walker', 'the Quiet Hand', 'the Silver-Tongued'],
  },
  titles: [
    'First Talon of the Horizon',
    'Custodian of the Whispering Vault',
    'Keeper of the Broken Compass',
    'Harbor Sovereign of the Rifts',
    'Archon of the Silver Veil',
    'Warden of the Seventh Ridge',
  ],
  locations: {
    roots: ['Aethel', 'Cinder', 'Obsidian', 'Gale', 'Frost', 'Iron', 'Whisper', 'Sol', 'Dusk', 'Mist', 'Bramble', 'Shadow'],
    types: ['Reach', 'Spire', 'Rift', 'Bastion', 'Hollow', 'Canal', 'Sanctum', 'Plateau', 'Cove', 'Vault', 'Foundry'],
  },
  conflicts: [
    'A long-dormant subterranean power source has begun pulsating, destabilizing the floating foundations of the upper city.',
    'A rogue faction has intercepted the sacred dynasty seal and threatens to auction it at an outlaw free port.',
    'The seasonal aether storm has severed the sole sky-lane connecting the food silos to the lower mining quarters.',
    'An ancient decree from before the cataclysm was unearthed, claiming the current ruling council possesses no legitimate authority.',
    'A celestial omen indicates that the primary star is entering an unprecedented eight-year dimming cycle.',
  ],
  secrets: [
    'Carries an ancient mechanical key whose matching lock was lost three centuries ago.',
    'Secretly communicating with an exiled scholar from an opposing realm.',
    'Is the last surviving heir of an obliterated sky-house presumed extinct.',
    'Suffers from progressive crystal calcification in their right arm.',
  ],
  quests: [
    {
      title: 'The Silent Beacon of Vael',
      type: 'main-quest',
      summary: 'Re-ignite the extinguished harmonic beacon before the migrating void-whales drift through the civilian flight lanes.',
      objectives: ['Acquire three resonant aether cores', 'Repair the reflector mirror', 'Defend against scavengers'],
    },
    {
      title: 'Whispers in the Slipway',
      type: 'side-quest',
      summary: 'Investigate the disappearance of a junior navigator who discovered contraband hidden in imperial grain barges.',
      objectives: ['Interrogate the wharfmaster', 'Inspect warehouse 12', 'Decide whether to report or blackmail'],
    },
  ],
  creatures: [
    {
      name: 'Gale-Stalker Drake',
      classification: 'beast',
      threat: 'dangerous',
      habitat: 'Thermal updrafts along high sheer cliffs',
      ability: 'Emits localized ultrasonic pulses to disorient prey gliders',
    },
    {
      name: 'Chrono-Mite Swarm',
      classification: 'magical-beast',
      threat: 'moderate',
      habitat: 'Aether crystal seams and ruined laboratories',
      ability: 'Consumes temporal momentum, aging surrounding wood and metals by years in minutes',
    },
  ],
};

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function generateWorldbuildingConcept(options: GenerationPromptOptions): Promise<GeneratedConcept> {
  const { category, themeHint, world, apiKey } = options;

  // Try server-side or client Gemini API first if internet / key is present
  try {
    const prompt = `Create a rich, original, and deeply compelling ${category} for this fictional universe.
World Name: ${world.name}
Genre: ${world.genre} (${world.customGenre || ''})
Magic Level: ${world.magicLevel}
Tech Level: ${world.techLevel}
Tone: ${world.tone}
Themes: ${world.themes.join(', ')}
${themeHint ? `User focus / prompt seed: "${themeHint}"` : ''}

Respond with valid JSON containing:
{
  "title": "Name or title of the entry",
  "subtitle": "Short epithet or classification",
  "summary": "1-3 sentences rich overview",
  "details": {
    /* 3-5 key structured fields relevant to ${category}, e.g. appearance, personality, powers, secrets, objectives, weaknesses */
  },
  "tags": ["3 to 5 relevant descriptive tags"]
}`;

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        apiKey,
        entityType: category,
        worldContext: {
          name: world.name,
          genre: world.genre,
          magicLevel: world.magicLevel,
          techLevel: world.techLevel,
          tone: world.tone,
          description: world.description,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data.title) {
        return {
          title: data.data.title,
          subtitle: data.data.subtitle || '',
          summary: data.data.summary || data.data.description || '',
          details: data.data.details || {},
          tags: Array.isArray(data.data.tags) ? data.data.tags : [category],
        };
      }
    }
  } catch (err) {
    console.info('Online AI generation skipped or unreachable; falling back to offline generator.', err);
  }

  // Robust Offline Procedural Generator (Zero-latency, no network needed)
  const name1 = pickRandom(OFFLINE_TABLES.names.prefixes) + pickRandom(OFFLINE_TABLES.names.suffixes);
  const name2 = pickRandom(OFFLINE_TABLES.names.prefixes) + pickRandom(OFFLINE_TABLES.names.suffixes);
  const locName = pickRandom(OFFLINE_TABLES.locations.roots) + ' ' + pickRandom(OFFLINE_TABLES.locations.types);

  switch (category) {
    case 'character': {
      const epithet = pickRandom(OFFLINE_TABLES.names.epithets);
      return {
        title: `${name1} ${name2}`,
        subtitle: `${pickRandom(OFFLINE_TABLES.titles)}`,
        summary: `${name1} is an enigmatic figure known across ${locName} as "${epithet}". Guided by a quiet personal oath, they navigate political turmoil and shifting loyalties in pursuit of forbidden knowledge.`,
        details: {
          occupation: pickRandom(['Skyship Pilot', 'Cryptic Astromancer', 'Relic Hunter', 'Exiled Diplomat', 'Guild Machinist']),
          personality: pickRandom(['Steadfast and taciturn', 'Charming yet deceptive', 'Obsessively meticulous', 'Bold, reckless, and fiercely loyal']),
          secret: pickRandom(OFFLINE_TABLES.secrets),
          appearance: 'Wears weathered leather traveling attire with tarnished brass insignia and keen, watchful eyes.',
          goals: 'Uncover the lost coordinates to the ancestral bastion before the Hegemony locks the trade gates.',
        },
        tags: [world.genre, 'Character', 'Original', 'Offline Generator'],
      };
    }
    case 'location': {
      return {
        title: locName,
        subtitle: `Fortified ${pickRandom(['Outpost', 'Haven', 'Rift City', 'Citadel', 'Under-Canal'])}`,
        summary: `Perched on the jagged precipice of the high strata, ${locName} commands a breathtaking view of the lower fog banks and controls the primary transit gate between regional territories.`,
        details: {
          climate: pickRandom(['Howling gale winds with sudden crystal squalls', 'Damp, mist-choked, and perpetually twilight', 'Crisp, razor-thin mountain air with high radiant sun']),
          population: pickRandom(['45,000 diverse citizens and traders', 'A tight-knit garrison of 1,200 wardens', 'Over 200,000 sprawling through vertical cliff-dwellings']),
          economy: pickRandom(['Refined mineral exports and sky-docks', 'Black market relic auctions and smuggling', 'Rare herb horticulture and aeroponic farms']),
          hazard: pickRandom(OFFLINE_TABLES.conflicts),
        },
        tags: [world.genre, 'Location', 'Atlas', 'Settlement'],
      };
    }
    case 'quest': {
      const q = pickRandom(OFFLINE_TABLES.quests);
      return {
        title: q.title,
        subtitle: `${q.type.toUpperCase()} · ${world.tone.toUpperCase()}`,
        summary: q.summary,
        details: {
          mainObjective: q.summary,
          keyMilestones: q.objectives,
          consequences: 'Failure leaves the northern sky-routes vulnerable to ruthless raiders.',
          rewards: 'A royal letter of marque, rare navigation tools, and 1,000 trade sovereigns.',
        },
        tags: [world.genre, 'Quest', 'Adventure', 'Plot Hook'],
      };
    }
    case 'creature': {
      const crt = pickRandom(OFFLINE_TABLES.creatures);
      return {
        title: crt.name,
        subtitle: `${crt.threat.toUpperCase()} THREAT · ${crt.classification.toUpperCase()}`,
        summary: `A terrifying native entity found throughout the wild perimeters. Known for its ability to track acoustic resonance and hunt under cover of cloud banks.`,
        details: {
          habitat: crt.habitat,
          abilities: [crt.ability, 'Camouflage against basalt rock and fog'],
          weakness: 'Bright concentrated radiant flares disrupt its sensory receptors.',
          culturalValue: 'Fibers and bone fragments are highly prized by arcane craftsmen.',
        },
        tags: [world.genre, 'Bestiary', 'Creature'],
      };
    }
    case 'plotTwist':
    case 'event': {
      return {
        title: `The Crisis of ${locName}`,
        subtitle: `HISTORICAL TURNING POINT · ${world.era}`,
        summary: pickRandom(OFFLINE_TABLES.conflicts),
        details: {
          cause: 'A breach in the ancient non-aggression concordat between the inner spires and the outer rim clans.',
          consequences: 'Martial law declared in three provinces; price of refined crystal triples overnight.',
          keyParties: ['The High Council', 'The Free League of Navigators', 'The Outcast Guilds'],
        },
        tags: [world.genre, 'Timeline', 'Historical Conflict'],
      };
    }
    default: {
      return {
        title: `${name1} of ${locName}`,
        subtitle: 'Worldbuilding Concept',
        summary: pickRandom(OFFLINE_TABLES.conflicts),
        details: {
          significance: 'Exerts major cultural and strategic influence across surrounding territories.',
          lore: pickRandom(OFFLINE_TABLES.secrets),
        },
        tags: [world.genre, category],
      };
    }
  }
}
