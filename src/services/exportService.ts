import { FullWorldPackage } from '../types/world';

export function generateWorldMarkdown(pkg: FullWorldPackage): string {
  const { world, characters, locations, politicalEntities, factions, magicOrTechSystems, creatures, historicalEvents, religions, quests, loreEntries, items, notes } = pkg;

  let md = `# ${world.name} — World Compendium\n\n`;
  md += `> **Genre:** ${world.genre} | **Era:** ${world.era} | **Tech Level:** ${world.techLevel} | **Magic Level:** ${world.magicLevel} | **Tone:** ${world.tone}\n\n`;
  md += `## World Overview\n\n${world.description}\n\n`;

  if (world.themes && world.themes.length > 0) {
    md += `**Central Themes:** ${world.themes.join(', ')}\n\n`;
  }

  if (world.privateNotes) {
    md += `### World Architect Notes\n\n${world.privateNotes}\n\n`;
  }

  md += `---\n\n## 1. Characters of Renown (${characters.length})\n\n`;
  characters.forEach((char) => {
    md += `### ${char.name} ${char.titles.length > 0 ? `(${char.titles.join(', ')})` : ''}\n`;
    if (char.aliases.length > 0) md += `*Also known as: ${char.aliases.join(', ')}*\n\n`;
    md += `- **Status:** ${char.status.toUpperCase()} | **Species:** ${char.speciesName || 'Unknown'} | **Age:** ${char.age || 'Unknown'}\n`;
    if (char.occupation) md += `- **Occupation:** ${char.occupation}\n`;
    md += `- **Appearance:** ${char.appearance || 'N/A'}\n`;
    md += `- **Personality:** ${char.personality || 'N/A'}\n`;
    if (char.goals) md += `- **Goals:** ${char.goals}\n`;
    if (char.secrets) md += `- **Secrets:** ${char.secrets}\n`;
    if (char.backstory) md += `\n**Backstory:**\n${char.backstory}\n`;
    if (char.relationships && char.relationships.length > 0) {
      md += `\n**Relationships:**\n`;
      char.relationships.forEach((rel) => {
        md += `- ${rel.type.toUpperCase()}: ${rel.description || 'Linked character'}\n`;
      });
    }
    md += `\n`;
  });

  md += `---\n\n## 2. Geography & Atlas (${locations.length})\n\n`;
  locations.forEach((loc) => {
    md += `### ${loc.name} [${loc.type.toUpperCase()}]\n`;
    if (loc.alternateNames.length > 0) md += `*Alternate names: ${loc.alternateNames.join(', ')}*\n\n`;
    md += `${loc.description}\n\n`;
    md += `- **Climate:** ${loc.climate || 'Unspecified'} | **Population:** ${loc.population || 'Unknown'}\n`;
    if (loc.government) md += `- **Government:** ${loc.government}\n`;
    if (loc.economy) md += `- **Economy:** ${loc.economy}\n`;
    if (loc.secrets) md += `- **Hidden Lore & Secrets:** ${loc.secrets}\n`;
    if (loc.travelInfo) md += `- **Travel & Transit:** ${loc.travelInfo}\n`;
    md += `\n`;
  });

  md += `---\n\n## 3. Political Powers & Nations (${politicalEntities.length})\n\n`;
  politicalEntities.forEach((pol) => {
    md += `### ${pol.name} (${pol.governmentType.toUpperCase()})\n\n`;
    if (pol.rulerTitle) md += `**Ruler:** ${pol.rulerTitle}\n\n`;
    md += `- **Stability:** ${pol.currentStability.toUpperCase()}\n`;
    md += `- **Military Strength:** ${pol.militaryStrength}\n`;
    md += `- **Laws:** ${pol.laws}\n`;
    md += `- **Economic System:** ${pol.economicSystem}\n`;
    if (pol.resources && pol.resources.length > 0) md += `- **Key Resources:** ${pol.resources.join(', ')}\n`;
    md += `\n`;
  });

  md += `---\n\n## 4. Factions & Orders (${factions.length})\n\n`;
  factions.forEach((fac) => {
    md += `### ${fac.name} [${fac.category.toUpperCase()}]\n\n`;
    md += `**Purpose:** ${fac.purpose}\n\n${fac.description}\n\n`;
    if (fac.ideology) md += `*Ideology:* "${fac.ideology}"\n\n`;
    if (fac.ranks && fac.ranks.length > 0) {
      md += `**Hierarchy:**\n`;
      fac.ranks.forEach((r) => {
        md += `1. **${r.title}**: ${r.description}\n`;
      });
      md += `\n`;
    }
  });

  md += `---\n\n## 5. Magic, Technology, & Systems (${magicOrTechSystems.length})\n\n`;
  magicOrTechSystems.forEach((sys) => {
    md += `### ${sys.name} (${sys.type.toUpperCase()})\n\n`;
    md += `- **Sources:** ${sys.sources}\n`;
    md += `- **Users:** ${sys.users}\n`;
    md += `- **Rules & Limits:** ${sys.rulesAndLimitations}\n`;
    md += `- **Costs & Consequences:** ${sys.costsAndConsequences}\n`;
    if (sys.forbiddenPractices) md += `- **Forbidden Practices:** ${sys.forbiddenPractices}\n`;
    if (sys.abilitiesOrSpells && sys.abilitiesOrSpells.length > 0) {
      md += `\n**Recognized Arts & Spells:**\n`;
      sys.abilitiesOrSpells.forEach((ab) => {
        md += `- **${ab.name}** (${ab.level}): ${ab.description} (Cost: ${ab.cost})\n`;
      });
    }
    md += `\n`;
  });

  md += `---\n\n## 6. Bestiary & Fauna (${creatures.length})\n\n`;
  creatures.forEach((crt) => {
    md += `### ${crt.name} (${crt.classification.toUpperCase()} — Threat: ${crt.threatLevel.toUpperCase()})\n\n`;
    md += `${crt.appearance}\n\n`;
    md += `- **Habitat:** ${crt.habitat} | **Intelligence:** ${crt.intelligence}\n`;
    md += `- **Abilities:** ${crt.abilities.join(', ')}\n`;
    if (crt.weaknesses && crt.weaknesses.length > 0) md += `- **Weaknesses:** ${crt.weaknesses.join(', ')}\n`;
    md += `\n`;
  });

  md += `---\n\n## 7. Timeline of Eras & Key Events (${historicalEvents.length})\n\n`;
  historicalEvents
    .slice()
    .sort((a, b) => a.numericSortYear - b.numericSortYear)
    .forEach((evt) => {
      md += `### ${evt.date}: ${evt.title || evt.name} [${evt.category.toUpperCase()}]\n\n`;
      md += `${evt.description}\n\n`;
      if (evt.causes) md += `*Causes:* ${evt.causes}\n\n`;
      if (evt.consequences) md += `*Consequences:* ${evt.consequences}\n\n`;
    });

  md += `---\n\n## 8. Relics & Items of Power (${items.length})\n\n`;
  items.forEach((it) => {
    md += `### ${it.name} (${it.rarity.toUpperCase()} ${it.type.toUpperCase()})\n\n`;
    md += `${it.description}\n\n`;
    if (it.abilities.length > 0) md += `*Abilities:* ${it.abilities.join(', ')}\n\n`;
    if (it.history) md += `*History:* ${it.history}\n\n`;
  });

  md += `---\n\n## 9. Quests & Plot Arcs (${quests.length})\n\n`;
  quests.forEach((q) => {
    md += `### ${q.title || q.name} [${q.status.toUpperCase()}]\n\n`;
    md += `${q.summary}\n\n`;
    md += `**Main Objective:** ${q.mainObjective}\n\n`;
    if (q.milestones.length > 0) {
      md += `**Milestones:**\n`;
      q.milestones.forEach((m) => {
        md += `- [${m.done ? 'x' : ' '}] ${m.text}\n`;
      });
      md += `\n`;
    }
  });

  md += `\n*Generated by WorldForge Studio on ${new Date().toLocaleDateString()}*\n`;
  return md;
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
