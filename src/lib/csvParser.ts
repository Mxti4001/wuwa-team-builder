import csvRaw from '../../characters.csv?raw';
import bossesCsvRaw from '../../matrix_bosses.csv?raw';
import type { Character, ElementType, MatrixBossConfig, MetaTier, OutroTarget, RoleType } from '../types';

function splitTags(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Simple RFC-4180-compatible single-line CSV splitter (supports quoted commas).
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function loadCharacters(): Character[] {
  const lines = csvRaw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const colIndex = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const get = (name: string) => cols[colIndex(name)] ?? '';

    return {
      id: get('id'),
      name: get('name'),
      rarity: Number(get('rarity')) === 4 ? 4 : 5,
      element: get('element') as ElementType,
      weapon: get('weapon'),
      role: get('role') as RoleType,
      primaryDamageTypes: splitTags(get('primary_damage_type')),
      outroBuffTags: splitTags(get('outro_buff_tags')),
      outroTarget: (get('outro_target') === 'All Team' ? 'All Team' : 'Next Resonator') as OutroTarget,
      outroDurationS: Number(get('outro_duration_s')) || 0,
      mechanicsTags: splitTags(get('mechanics_tags')),
      synergyNeeds: splitTags(get('synergy_needs')),
      metaTier: (get('meta_tier') || 'T2') as MetaTier,
      outroDescription: get('outro_description'),
      signatureWeaponBuff: get('signature_weapon_buff') || undefined,
    };
  });
}

export function loadMatrixBosses(): MatrixBossConfig[] {
  const lines = bossesCsvRaw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const colIndex = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const get = (name: string) => cols[colIndex(name)] ?? '';

    const weakMechanics = splitTags(get('weak_mechanics')).map((item) => {
      const [tag, pts] = item.split(':');
      return { tag: tag.trim(), score: Number(pts) || 35 };
    });

    return {
      name: get('name'),
      element: (get('element') || 'Neutral') as ElementType | 'Neutral',
      weakMechanics,
      resistedElement: (get('resisted_element') || 'None') as ElementType | 'None',
      baseFit: Number(get('base_fit')) || 0,
      reason: get('reason'),
    };
  });
}
