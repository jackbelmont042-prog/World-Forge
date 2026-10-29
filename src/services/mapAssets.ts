/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetSymbolDefinition, MapObjectStyle } from '../types/mapEditor';

export const ASSET_SYMBOLS: AssetSymbolDefinition[] = [
  // Mountains
  { id: 'mt_peak', name: 'Sharp Peak', category: 'mountains', tags: ['mountain', 'peak', 'alpine', 'rock'], defaultScale: 1.0, aspectRatio: 1.2 },
  { id: 'mt_snowy', name: 'Snowy Peak', category: 'mountains', tags: ['mountain', 'snow', 'glacier', 'high'], defaultScale: 1.1, aspectRatio: 1.2 },
  { id: 'mt_volcano', name: 'Active Volcano', category: 'mountains', tags: ['volcano', 'smoke', 'fire', 'crater'], defaultScale: 1.2, aspectRatio: 1.1 },
  { id: 'mt_mesa', name: 'Plateau / Mesa', category: 'mountains', tags: ['mesa', 'plateau', 'desert', 'flat'], defaultScale: 1.0, aspectRatio: 1.4 },
  { id: 'mt_hills', name: 'Rolling Hills', category: 'mountains', tags: ['hills', 'lowland', 'mound', 'green'], defaultScale: 0.8, aspectRatio: 1.6 },
  { id: 'mt_ridge', name: 'Jagged Ridge', category: 'mountains', tags: ['ridge', 'crag', 'cliff', 'range'], defaultScale: 1.0, aspectRatio: 1.5 },

  // Trees & Vegetation
  { id: 'tree_pine', name: 'Conifer Pine', category: 'trees', tags: ['pine', 'conifer', 'evergreen', 'taiga'], defaultScale: 0.6, aspectRatio: 1.5 },
  { id: 'tree_oak', name: 'Broadleaf Oak', category: 'trees', tags: ['oak', 'deciduous', 'forest', 'wood'], defaultScale: 0.65, aspectRatio: 1.1 },
  { id: 'tree_palm', name: 'Tropical Palm', category: 'trees', tags: ['palm', 'tropical', 'coast', 'jungle'], defaultScale: 0.7, aspectRatio: 1.4 },
  { id: 'tree_dead', name: 'Twisted Dead Tree', category: 'trees', tags: ['dead', 'wasteland', 'blight', 'swamp'], defaultScale: 0.6, aspectRatio: 1.3 },
  { id: 'tree_swamp', name: 'Swamp Mangrove', category: 'trees', tags: ['swamp', 'marsh', 'wetland', 'bayou'], defaultScale: 0.65, aspectRatio: 1.2 },

  // Castles & Fortifications
  { id: 'cast_citadel', name: 'Grand Citadel', category: 'fortifications', tags: ['castle', 'citadel', 'imperial', 'stronghold'], defaultScale: 1.2, aspectRatio: 1.3 },
  { id: 'cast_fortress', name: 'Stone Fortress', category: 'fortifications', tags: ['fortress', 'keep', 'ramparts', 'bastion'], defaultScale: 1.1, aspectRatio: 1.2 },
  { id: 'cast_tower', name: 'Watchtower', category: 'fortifications', tags: ['tower', 'outpost', 'beacon', 'spire'], defaultScale: 0.9, aspectRatio: 1.8 },
  { id: 'cast_moated', name: 'Moated Castle', category: 'fortifications', tags: ['moat', 'castle', 'island', 'baron'], defaultScale: 1.1, aspectRatio: 1.2 },
  { id: 'cast_outpost', name: 'Border Gate / Outpost', category: 'fortifications', tags: ['gate', 'outpost', 'checkpoint', 'wall'], defaultScale: 0.9, aspectRatio: 1.4 },

  // Settlements
  { id: 'settle_capital', name: 'High Imperial Capital', category: 'settlements', tags: ['capital', 'metropolis', 'crown', 'palace'], defaultScale: 1.4, aspectRatio: 1.3 },
  { id: 'settle_walled', name: 'Walled Town', category: 'settlements', tags: ['city', 'town', 'walls', 'houses'], defaultScale: 1.0, aspectRatio: 1.2 },
  { id: 'settle_village', name: 'Rural Village', category: 'settlements', tags: ['village', 'hamlet', 'thatched', 'rural'], defaultScale: 0.8, aspectRatio: 1.3 },
  { id: 'settle_port', name: 'Coastal Port / Harbor', category: 'settlements', tags: ['port', 'harbor', 'docks', 'coastal'], defaultScale: 1.1, aspectRatio: 1.4 },
  { id: 'settle_camp', name: 'Nomadic Camp / Tents', category: 'settlements', tags: ['camp', 'tents', 'yurt', 'nomad'], defaultScale: 0.8, aspectRatio: 1.2 },

  // Infrastructure
  { id: 'infra_bridge', name: 'Stone Arch Bridge', category: 'infrastructure', tags: ['bridge', 'river', 'crossing', 'stone'], defaultScale: 1.0, aspectRatio: 1.6 },
  { id: 'infra_shrine', name: 'Roadside Shrine', category: 'infrastructure', tags: ['shrine', 'waypoint', 'altar', 'chapel'], defaultScale: 0.7, aspectRatio: 1.3 },
  { id: 'infra_gate', name: 'Mountain Pass Gate', category: 'infrastructure', tags: ['pass', 'gate', 'chokepoint', 'wall'], defaultScale: 0.9, aspectRatio: 1.4 },

  // Maritime & Beasts
  { id: 'mar_galleon', name: 'Three-Masted Galleon', category: 'maritime', tags: ['ship', 'galleon', 'fleet', 'sea'], defaultScale: 1.1, aspectRatio: 1.2 },
  { id: 'mar_caravel', name: 'Merchant Caravel', category: 'maritime', tags: ['caravel', 'merchant', 'boat', 'coastal'], defaultScale: 0.9, aspectRatio: 1.2 },
  { id: 'mar_serpent', name: 'Great Sea Serpent', category: 'maritime', tags: ['serpent', 'monster', 'deep', 'ocean'], defaultScale: 1.3, aspectRatio: 1.8 },
  { id: 'mar_kraken', name: 'Emerging Kraken', category: 'maritime', tags: ['kraken', 'tentacles', 'beast', 'hazard'], defaultScale: 1.3, aspectRatio: 1.4 },

  // Monuments & Ruins
  { id: 'mon_ruin', name: 'Sunken Temple Ruin', category: 'monuments', tags: ['ruin', 'temple', 'ancient', 'columns'], defaultScale: 1.0, aspectRatio: 1.2 },
  { id: 'mon_monolith', name: 'Standing Stone Circle', category: 'monuments', tags: ['monolith', 'stonehenge', 'druid', 'runes'], defaultScale: 0.9, aspectRatio: 1.3 },
  { id: 'mon_pyramid', name: 'Desert Step-Pyramid', category: 'monuments', tags: ['pyramid', 'tomb', 'desert', 'ziggurat'], defaultScale: 1.2, aspectRatio: 1.3 },
  { id: 'mon_dragon', name: 'Giant Dragon Skull', category: 'monuments', tags: ['dragon', 'skull', 'bones', 'graveyard'], defaultScale: 1.0, aspectRatio: 1.4 },

  // Decorative
  { id: 'dec_compass', name: 'Ornate Antique Compass', category: 'decorative', tags: ['compass', 'rose', 'north', 'nautical'], defaultScale: 1.6, aspectRatio: 1.0 },
  { id: 'dec_cartouche', name: 'Decorative Cartouche Frame', category: 'decorative', tags: ['frame', 'cartouche', 'title', 'scroll'], defaultScale: 2.0, aspectRatio: 2.2 },
  { id: 'dec_scale', name: 'Map Scale Bar (Leagues)', category: 'decorative', tags: ['scale', 'miles', 'leagues', 'measurement'], defaultScale: 1.5, aspectRatio: 4.0 },
];

/**
 * High-performance vector canvas rendering of illustrated cartographic assets.
 * Rendered with antique etching line-art, warm hatching, and soft shading.
 */
export function renderAssetSymbol(
  ctx: CanvasRenderingContext2D,
  symbolId: string,
  x: number,
  y: number,
  scale: number = 1.0,
  rotation: number = 0,
  style: MapObjectStyle = {},
  jitterSeed: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  const s = Math.max(0.1, scale * 30);
  ctx.scale(s, s);

  const stroke = style.strokeColor || '#231e17';
  const fill = style.fillColor || '#e8dfcc';
  const width = (style.strokeWidth || 1.8) / s;

  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  ctx.lineWidth = Math.max(0.04, Math.min(0.15, width));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Seeded micro-jitter for hand-drawn organic feel
  const jx = Math.sin(jitterSeed * 12.9898) * 0.05;
  const jy = Math.cos(jitterSeed * 78.233) * 0.05;

  switch (symbolId) {
    case 'mt_peak':
    case 'mt_ridge': {
      // Main central pyramid peak
      ctx.beginPath();
      ctx.moveTo(0 + jx, -1);
      ctx.lineTo(-0.9, 0.8 + jy);
      ctx.lineTo(0.9, 0.8 + jy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ridge line (crest)
      ctx.beginPath();
      ctx.moveTo(0 + jx, -1);
      ctx.quadraticCurveTo(-0.1, 0.1, 0.1, 0.8 + jy);
      ctx.stroke();

      // Hatching / Shading on right slope
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const t = 0.2 + i * 0.18;
        const startX = t * 0.1;
        const startY = -1 + t * 1.8;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + 0.35 * (1 - t * 0.3), startY + 0.15);
      }
      ctx.stroke();
      break;
    }

    case 'mt_snowy': {
      // Mountain base
      ctx.beginPath();
      ctx.moveTo(0 + jx, -1.1);
      ctx.lineTo(-1.0, 0.8 + jy);
      ctx.lineTo(1.0, 0.8 + jy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Snowcap cap line
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0 + jx, -1.1);
      ctx.lineTo(-0.4, -0.4);
      ctx.lineTo(-0.15, -0.28);
      ctx.lineTo(0.1, -0.38);
      ctx.lineTo(0.4, -0.42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center ridge
      ctx.beginPath();
      ctx.moveTo(0 + jx, -1.1);
      ctx.quadraticCurveTo(0.05, 0.0, -0.05, 0.8 + jy);
      ctx.stroke();
      break;
    }

    case 'mt_volcano': {
      // Volcano cone with caldera
      ctx.beginPath();
      ctx.moveTo(-0.4, -0.7);
      ctx.lineTo(0.4, -0.7);
      ctx.lineTo(1.1, 0.8);
      ctx.lineTo(-1.1, 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crater ellipse
      ctx.beginPath();
      ctx.ellipse(0, -0.7, 0.4, 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#3a201c';
      ctx.fill();
      ctx.stroke();

      // Smoke billow curls
      ctx.strokeStyle = 'rgba(70, 60, 50, 0.6)';
      ctx.beginPath();
      ctx.arc(0.1, -1.1, 0.25, 0, Math.PI * 2);
      ctx.arc(0.35, -1.4, 0.3, 0, Math.PI * 2);
      ctx.arc(-0.1, -1.5, 0.35, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'mt_hills': {
      // Overlapping rolling mounds
      ctx.beginPath();
      ctx.arc(-0.45, 0.4, 0.55, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0.4, 0.45, 0.5, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0.0, 0.2, 0.65, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'tree_pine': {
      // Trunk
      ctx.beginPath();
      ctx.moveTo(0, 0.5);
      ctx.lineTo(0, 0.9);
      ctx.lineWidth = ctx.lineWidth * 1.5;
      ctx.stroke();

      // Conifer tiers (top, mid, bottom)
      ctx.beginPath();
      ctx.moveTo(0, -0.9);
      ctx.lineTo(-0.35, -0.3);
      ctx.lineTo(-0.15, -0.3);
      ctx.lineTo(-0.5, 0.2);
      ctx.lineTo(-0.25, 0.2);
      ctx.lineTo(-0.65, 0.65);
      ctx.lineTo(0.65, 0.65);
      ctx.lineTo(0.25, 0.2);
      ctx.lineTo(0.5, 0.2);
      ctx.lineTo(0.15, -0.3);
      ctx.lineTo(0.35, -0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'tree_oak': {
      // Trunk
      ctx.beginPath();
      ctx.moveTo(-0.1, 0.3);
      ctx.lineTo(-0.1, 0.9);
      ctx.lineTo(0.1, 0.9);
      ctx.lineTo(0.1, 0.3);
      ctx.stroke();

      // Foliage cloud
      ctx.beginPath();
      ctx.arc(0, -0.2, 0.55, 0, Math.PI * 2);
      ctx.arc(-0.35, -0.05, 0.4, 0, Math.PI * 2);
      ctx.arc(0.35, -0.05, 0.4, 0, Math.PI * 2);
      ctx.arc(0, 0.2, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'tree_palm': {
      // Curved trunk
      ctx.beginPath();
      ctx.moveTo(-0.2, 0.9);
      ctx.quadraticCurveTo(-0.05, 0.2, 0.05, -0.3);
      ctx.stroke();

      // Palm fronds arching outward
      const angles = [-0.9, -0.5, -0.1, 0.3, 0.7];
      angles.forEach((ang) => {
        ctx.beginPath();
        ctx.moveTo(0.05, -0.3);
        const ex = 0.05 + Math.cos(ang) * 0.7;
        const ey = -0.3 + Math.sin(ang) * 0.5;
        ctx.quadraticCurveTo(0.05 + Math.cos(ang) * 0.4, -0.3 + Math.sin(ang) * 0.1 - 0.2, ex, ey);
        ctx.stroke();
      });
      break;
    }

    case 'cast_citadel':
    case 'cast_fortress': {
      // Base curtain wall
      ctx.fillRect(-0.7, 0.1, 1.4, 0.7);
      ctx.strokeRect(-0.7, 0.1, 1.4, 0.7);

      // Central Great Keep
      ctx.fillRect(-0.4, -0.6, 0.8, 0.7);
      ctx.strokeRect(-0.4, -0.6, 0.8, 0.7);

      // Left and right flank towers
      ctx.fillRect(-0.85, -0.4, 0.35, 1.2);
      ctx.strokeRect(-0.85, -0.4, 0.35, 1.2);

      ctx.fillRect(0.5, -0.4, 0.35, 1.2);
      ctx.strokeRect(0.5, -0.4, 0.35, 1.2);

      // Spire roofs / battlements
      ctx.beginPath();
      ctx.moveTo(-0.85, -0.4);
      ctx.lineTo(-0.67, -0.85);
      ctx.lineTo(-0.5, -0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0.5, -0.4);
      ctx.lineTo(0.67, -0.85);
      ctx.lineTo(0.85, -0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Main Keep roof with pennant banner
      ctx.beginPath();
      ctx.moveTo(-0.4, -0.6);
      ctx.lineTo(0, -1.0);
      ctx.lineTo(0.4, -0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pennant flag on top
      ctx.beginPath();
      ctx.moveTo(0, -1.0);
      ctx.lineTo(0, -1.25);
      ctx.lineTo(0.25, -1.15);
      ctx.lineTo(0, -1.05);
      ctx.fill();
      ctx.stroke();

      // Portcullis arch
      ctx.beginPath();
      ctx.arc(0, 0.6, 0.2, Math.PI, 0);
      ctx.lineTo(0.2, 0.8);
      ctx.lineTo(-0.2, 0.8);
      ctx.closePath();
      ctx.fillStyle = '#1a1815';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'settle_capital': {
      // Multi-tier skyline with dome and walls
      ctx.fillRect(-0.8, 0.2, 1.6, 0.6);
      ctx.strokeRect(-0.8, 0.2, 1.6, 0.6);

      // Central Dome Cathedral
      ctx.beginPath();
      ctx.arc(0, -0.1, 0.45, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Spire needles
      [-0.55, 0.55].forEach((pos) => {
        ctx.beginPath();
        ctx.moveTo(pos - 0.1, 0.2);
        ctx.lineTo(pos, -0.7);
        ctx.lineTo(pos + 0.1, 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // City gates
      ctx.beginPath();
      ctx.arc(0, 0.65, 0.15, Math.PI, 0);
      ctx.lineTo(0.15, 0.8);
      ctx.lineTo(-0.15, 0.8);
      ctx.fillStyle = '#111';
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'settle_walled':
    case 'settle_village': {
      // Group of rustic houses
      [-0.4, 0.2].forEach((hx, idx) => {
        const hy = idx === 0 ? 0.3 : 0.1;
        ctx.fillRect(hx, hy, 0.45, 0.5);
        ctx.strokeRect(hx, hy, 0.45, 0.5);

        // Roof
        ctx.beginPath();
        ctx.moveTo(hx - 0.05, hy);
        ctx.lineTo(hx + 0.22, hy - 0.3);
        ctx.lineTo(hx + 0.5, hy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case 'settle_port': {
      // Pier wooden platform
      ctx.fillRect(-0.8, 0.4, 1.6, 0.15);
      ctx.strokeRect(-0.8, 0.4, 1.6, 0.15);

      // Lighthouse tower on right
      ctx.fillRect(0.3, -0.5, 0.3, 0.9);
      ctx.strokeRect(0.3, -0.5, 0.3, 0.9);

      // Lantern light glass
      ctx.beginPath();
      ctx.moveTo(0.25, -0.5);
      ctx.lineTo(0.45, -0.8);
      ctx.lineTo(0.65, -0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Warehouse house on left
      ctx.fillRect(-0.7, 0.0, 0.5, 0.4);
      ctx.strokeRect(-0.7, 0.0, 0.5, 0.4);
      break;
    }

    case 'mar_galleon': {
      // Ship hull
      ctx.beginPath();
      ctx.moveTo(-0.9, 0.1);
      ctx.quadraticCurveTo(-0.4, 0.5, 0.6, 0.4);
      ctx.lineTo(0.85, 0.1);
      ctx.lineTo(0.7, 0.2);
      ctx.lineTo(-0.7, 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Masts & billowed sails
      [-0.3, 0.2].forEach((mx) => {
        ctx.beginPath();
        ctx.moveTo(mx, 0.2);
        ctx.lineTo(mx, -0.9);
        ctx.stroke();

        // Billowing square sail
        ctx.beginPath();
        ctx.moveTo(mx - 0.35, -0.75);
        ctx.quadraticCurveTo(mx, -0.65, mx + 0.35, -0.75);
        ctx.lineTo(mx + 0.3, -0.25);
        ctx.quadraticCurveTo(mx, -0.15, mx - 0.3, -0.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      break;
    }

    case 'mon_ruin': {
      // Classical crumbling columns
      [-0.6, -0.2, 0.3, 0.7].forEach((cx, idx) => {
        const h = idx === 1 ? 0.4 : 0.8;
        ctx.fillRect(cx - 0.08, 0.8 - h, 0.16, h);
        ctx.strokeRect(cx - 0.08, 0.8 - h, 0.16, h);
      });

      // Broken pediment architrave
      ctx.beginPath();
      ctx.moveTo(-0.75, -0.05);
      ctx.lineTo(0.0, -0.3);
      ctx.lineTo(0.2, -0.15);
      ctx.stroke();
      break;
    }

    case 'dec_compass': {
      // 8-Pointed Cartographic Compass Rose
      const rOuter = 1.0;
      const rInner = 0.35;

      ctx.beginPath();
      ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, rOuter * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal 4 points & intercardinal 4 points
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 - Math.PI / 2;
        const len = i % 2 === 0 ? rOuter : rOuter * 0.65;
        const p1x = Math.cos(ang) * len;
        const p1y = Math.sin(ang) * len;

        const leftAng = ang - Math.PI / 8;
        const p2x = Math.cos(leftAng) * rInner;
        const p2y = Math.sin(leftAng) * rInner;

        const rightAng = ang + Math.PI / 8;
        const p3x = Math.cos(rightAng) * rInner;
        const p3y = Math.sin(rightAng) * rInner;

        // Dark half
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.closePath();
        ctx.fillStyle = stroke;
        ctx.fill();

        // Light half
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p3x, p3y);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.stroke();
      }

      // North 'N' letter
      ctx.font = 'bold 0.4px serif';
      ctx.fillStyle = stroke;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('N', 0, -rOuter - 0.08);
      break;
    }

    default: {
      // Generic waypoint marker if symbol unknown
      ctx.beginPath();
      ctx.arc(0, 0, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
