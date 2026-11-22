import type {
  Character,
  ElementType,
  MetaTier,
  StageBuff,
  SynergyReason,
  TeamArchetype,
  TeamGenerationOptions,
  TeamRecommendation,
} from '../types';

const TIER_SCORE: Record<MetaTier, number> = {
  T0: 18,
  'T0.5': 13,
  T1: 7,
  T2: 1,
  T3: -6,
};

const QUICK_SWAP_PAIRS = new Set([
  'carlotta|jinhsi',
  'carlotta|xiangli_yao',
  'changli|xiangli_yao',
  'changli|jinhsi',
  'carlotta|changli',
  'brant|changli',
  'brant|lupa',
  'changli|lupa',
  'calcharo|xiangli_yao',
  'augusta|xiangli_yao',
  'lucy|rebecca',
]);

/** Proven real-world meta cores (sorted IDs joined by '+') */
const META_CORES: Array<{ ids: string[]; label: string; bonus: number }> = [
  { ids: ['hiyuki', 'lucilla_chafe', 'suisui'], label: 'T0 Glacio Chafe Meta Core', bonus: 25 },
  { ids: ['chisa', 'suisui', 'yangyang_xuanling'], label: 'T0 Xuanling Havoc Bane (Chisa #1)', bonus: 28 },
  { ids: ['chisa', 'phrolova', 'yangyang_xuanling'], label: 'T0 Xuanling + Chisa + Phrolova', bonus: 18 },
  { ids: ['chisa', 'rebecca', 'yangyang_xuanling'], label: 'T0 Xuanling + Chisa + Rebecca', bonus: 12 },
  { ids: ['hsin_unison', 'lily', 'suoming'], label: 'T0 Hsin Unison Meta Core', bonus: 24 },
  { ids: ['hsin_unison', 'shorekeeper', 'suoming'], label: 'T0 Hsin Unison + Shorekeeper', bonus: 18 },
  { ids: ['hsin_flare', 'rover_electro', 'suisui'], label: 'T0.5 Hsin Flare + Electro Rover + Suisui', bonus: 20 },
  { ids: ['chisa', 'hsin_flare', 'rover_electro'], label: 'T0.5 Hsin Flare + Electro Rover + Chisa', bonus: 18 },
  { ids: ['buling', 'hsin_flare', 'rover_electro'], label: 'T0.5 Hsin Flare + Electro Rover + Buling', bonus: 17 },
  { ids: ['lynae_strain', 'mornye', 'suoming'], label: 'T0.5 Suoming Hypercarry + Lynae + Mornye', bonus: 18 },
  { ids: ['lynae_strain', 'shorekeeper', 'suoming'], label: 'T0.5 Suoming Hypercarry + Lynae + Shorekeeper', bonus: 17 },
  { ids: ['sanhua', 'shorekeeper', 'suoming'], label: 'T0.5 Suoming + Sanhua + Shorekeeper', bonus: 15 },
  { ids: ['denia_strain', 'mornye', 'qingxiao'], label: 'T0 Qingxiao + Denia + Mornye (#1)', bonus: 44 },
  { ids: ['lynae_strain', 'mornye', 'qingxiao'], label: 'T0 Qingxiao + Lynae + Mornye (#1)', bonus: 42 },
  { ids: ['denia_strain', 'qingxiao', 'shorekeeper'], label: 'T0 Qingxiao + Denia + Shorekeeper', bonus: 22 },
  { ids: ['denia_strain', 'qingxiao', 'verina'], label: 'T0 Qingxiao + Denia + Verina', bonus: 18 },
  { ids: ['denia_strain', 'lynae_strain', 'qingxiao'], label: 'T0 Qingxiao Dual-Tune Core', bonus: 16 },
  { ids: ['aemeath_rupture', 'lynae_rupture', 'mornye'], label: 'T0.5 Aemeath Tune Rupture (Mornye #2)', bonus: 40 },
  { ids: ['denia_strain', 'luuk_herssen', 'mornye'], label: 'Luuk + Denia + Mornye (Mornye #3)', bonus: 38 },
  { ids: ['luuk_herssen', 'lynae_strain', 'mornye'], label: 'Luuk + Lynae + Mornye', bonus: 36 },
  { ids: ['luuk_herssen', 'mornye', 'sanhua'], label: 'Luuk + Sanhua + Mornye', bonus: 34 },
  { ids: ['denia_strain', 'luuk_herssen', 'shorekeeper'], label: 'Luuk + Denia + Shorekeeper', bonus: 30 },
  { ids: ['luuk_herssen', 'lynae_strain', 'shorekeeper'], label: 'Luuk + Lynae + Shorekeeper', bonus: 28 },
  { ids: ['luuk_herssen', 'sanhua', 'shorekeeper'], label: 'Luuk + Sanhua + Shorekeeper', bonus: 26 },
  { ids: ['denia_strain', 'luuk_herssen', 'verina'], label: 'Luuk + Denia + Verina', bonus: 24 },
  { ids: ['luuk_herssen', 'lynae_strain', 'verina'], label: 'Luuk + Lynae + Verina', bonus: 22 },
  { ids: ['luuk_herssen', 'sanhua', 'verina'], label: 'Luuk + Sanhua + Verina', bonus: 20 },
  { ids: ['aemeath_burst', 'chisa', 'denia_burst'], label: 'T0.5 Aemeath Fusion Burst (Chisa #2)', bonus: 21 },
  { ids: ['aemeath_burst', 'brant', 'lupa'], label: 'T1 Aemeath Mono-Fusion', bonus: 14 },
  { ids: ['cartethyia', 'chisa', 'ciaccona'], label: 'T0.5 Cartethyia Aero Erosion (Chisa #3)', bonus: 16 },
  { ids: ['cartethyia', 'ciaccona', 'rover_aero'], label: 'Aero Erosion F2P-Friendly Core', bonus: 14 },
  { ids: ['lily', 'qiuyuan', 'sigrika'], label: 'Sigrika + Qiuyuan + Lily (BiS WiWa/Echo)', bonus: 22 },
  { ids: ['qiuyuan', 'shorekeeper', 'sigrika'], label: 'Sigrika + Qiuyuan + Shorekeeper', bonus: 16 },
  { ids: ['cantarella', 'phrolova', 'qiuyuan'], label: 'Phrolova + Qiuyuan + Cantarella (#1)', bonus: 26 },
  { ids: ['buling', 'cantarella', 'phrolova'], label: 'Phrolova + Cantarella + Buling S6', bonus: 24 },
  { ids: ['phrolova', 'qiuyuan', 'shorekeeper'], label: 'Phrolova + Qiuyuan + Shorekeeper', bonus: 8 },
  { ids: ['phrolova', 'qiuyuan', 'verina'], label: 'Phrolova + Qiuyuan + Verina', bonus: 12 },
  { ids: ['cantarella', 'phrolova', 'shorekeeper'], label: 'Phrolova + Cantarella + Shorekeeper', bonus: 8 },
  { ids: ['lucilla_echo', 'phrolova', 'shorekeeper'], label: 'Phrolova + Lucilla (Echo) Core', bonus: 8 },
  { ids: ['cantarella', 'lucilla_echo', 'phrolova'], label: 'Phrolova + Lucilla + Cantarella', bonus: 12 },
  { ids: ['brant', 'changli', 'lupa'], label: 'Tri-DPS Fusion (Changli + Brant + Lupa)', bonus: 26 },
  { ids: ['brant', 'galbrena', 'lupa'], label: 'Tri-DPS Fusion (Galbrena + Brant + Lupa)', bonus: 24 },
  { ids: ['jinhsi', 'shorekeeper', 'suoming'], label: 'Jinhsi Unison + Suoming + Shorekeeper (Prydwen)', bonus: 22 },
  { ids: ['cantarella', 'jinhsi', 'suoming'], label: 'Jinhsi Unison + Suoming + Cantarella (Prydwen)', bonus: 19 },
  { ids: ['jinhsi', 'suoming', 'verina'], label: 'Jinhsi Unison + Suoming + Verina (Prydwen)', bonus: 17 },
  { ids: ['carlotta', 'shorekeeper', 'zhezhi'], label: 'Carlotta + Zhezhi + Shorekeeper (BiS)', bonus: 34 },
  { ids: ['jinhsi', 'shorekeeper', 'zhezhi'], label: 'Jinhsi + Zhezhi + Shorekeeper (BiS)', bonus: 29 },
  { ids: ['carlotta', 'jinhsi', 'shorekeeper'], label: 'Jinhsi + Carlotta + Shorekeeper (2nd Best)', bonus: 26 },
  { ids: ['lucy', 'mornye', 'rebecca'], label: 'Lucy Hypercarry + Rebecca + Mornye (Meta)', bonus: 33 },
  { ids: ['lucy', 'rebecca', 'shorekeeper'], label: 'Lucy Hypercarry + Rebecca + Shorekeeper', bonus: 31 },
  { ids: ['lucy', 'rebecca', 'verina'], label: 'Lucy Hypercarry + Rebecca + Verina', bonus: 28 },
  { ids: ['buling', 'lucy', 'rebecca'], label: 'Lucy + Rebecca + Buling S6 (Collab Duo)', bonus: 15 },
  { ids: ['buling', 'jinhsi', 'zhezhi'], label: 'Jinhsi + Zhezhi + Buling (S6)', bonus: 18 },
  { ids: ['buling', 'carlotta', 'zhezhi'], label: 'Carlotta + Zhezhi + Buling (S6)', bonus: 18 },
  { ids: ['buling', 'carlotta', 'jinhsi'], label: 'Jinhsi + Carlotta + Buling S6 (2nd Best)', bonus: 20 },
  { ids: ['jinhsi', 'verina', 'zhezhi'], label: 'Jinhsi + Zhezhi + Verina', bonus: 15 },
  { ids: ['jinhsi', 'shorekeeper', 'yinlin'], label: 'Jinhsi + Yinlin + Shorekeeper (Prydwen)', bonus: 18 },
  { ids: ['jinhsi', 'verina', 'yinlin'], label: 'Jinhsi + Yinlin + Verina (Prydwen)', bonus: 16 },
  { ids: ['carlotta', 'verina', 'zhezhi'], label: 'Carlotta + Zhezhi + Verina', bonus: 15 },
  { ids: ['carlotta', 'jinhsi', 'verina'], label: 'Jinhsi + Carlotta + Verina (2nd Best)', bonus: 10 },
  { ids: ['carlotta', 'shorekeeper', 'xiangli_yao'], label: 'Carlotta + Xiangli Yao Quick-Swap (#3)', bonus: 16 },
  { ids: ['carlotta', 'verina', 'xiangli_yao'], label: 'Carlotta + Xiangli Yao Quick-Swap (#3)', bonus: 14 },
  { ids: ['buling', 'carlotta', 'xiangli_yao'], label: 'Carlotta + Xiangli Yao + Buling S6 (#3)', bonus: 13 },
  { ids: ['carlotta', 'shorekeeper', 'taoqi'], label: 'Carlotta + Taoqi + Shorekeeper (#4)', bonus: 10 },
  { ids: ['carlotta', 'taoqi', 'verina'], label: 'Carlotta + Taoqi + Verina (#4)', bonus: 8 },
  { ids: ['iuno', 'jingran', 'shorekeeper'], label: 'Jingran + Iuno + Shorekeeper (BiS)', bonus: 42 },
  { ids: ['iuno', 'jingran', 'verina'], label: 'Jingran + Iuno + Verina', bonus: 27 },
  { ids: ['augusta', 'iuno', 'shorekeeper'], label: 'Augusta + Iuno + Shorekeeper', bonus: 24 },
  { ids: ['augusta', 'iuno', 'verina'], label: 'Augusta + Iuno + Verina', bonus: 21 },
  { ids: ['augusta', 'buling', 'iuno'], label: 'Augusta + Iuno + Buling (S6)', bonus: 20 },
  { ids: ['augusta', 'iuno', 'mortefi'], label: 'Augusta + Iuno + Mortefi (Iuno Sustain)', bonus: 17 },
  { ids: ['jingran', 'mortefi', 'shorekeeper'], label: 'Jingran + Mortefi + Shorekeeper', bonus: 28 },
  { ids: ['jingran', 'mortefi', 'verina'], label: 'Jingran + Mortefi + Verina', bonus: 14 },
  { ids: ['lynae_rupture', 'mornye', 'xiangli_yao'], label: 'Xiangli Yao + Lynae + Mornye', bonus: 15 },
  { ids: ['lynae_strain', 'mornye', 'xiangli_yao'], label: 'Xiangli Yao + Lynae + Mornye', bonus: 14 },
  { ids: ['iuno', 'lynae_rupture', 'mornye'], label: 'Iuno DPS + Lynae + Mornye', bonus: 12 },
  { ids: ['iuno', 'lynae_strain', 'mornye'], label: 'Iuno DPS + Lynae + Mornye', bonus: 11 },
  { ids: ['phoebe', 'shorekeeper', 'zani'], label: 'Zani + Phoebe + Shorekeeper (Spectro Frazzle)', bonus: 20 },
  { ids: ['phoebe', 'verina', 'zani'], label: 'Zani + Phoebe + Verina (Spectro Frazzle)', bonus: 18 },
  { ids: ['buling', 'phoebe', 'zani'], label: 'Zani + Phoebe + Buling S6 (Spectro Frazzle)', bonus: 16 },
  { ids: ['phoebe', 'rover_spectro', 'zani'], label: 'Zani + Phoebe + Spectro Rover', bonus: 14 },
  { ids: ['camellya', 'sanhua', 'shorekeeper'], label: 'Camellya Double-Intro Core', bonus: 14 },
  { ids: ['camellya', 'sanhua', 'verina'], label: 'Camellya Double-Intro Core', bonus: 13 },
];

function pairKey(a: Character, b: Character): string {
  return [a.id, b.id].sort().join('|');
}

/**
 * Normalizes multi-mode characters (Rover elements, Aemeath, Denia, Lucilla, Phoebe, Hsin, Lynae)
 * to a single shared identity so a player can only use one mode at a time / within the same vigor pool.
 */
function getIdentityKey(char: Character): string {
  if (char.id.startsWith('rover_')) return 'rover';
  if (char.id.startsWith('aemeath_')) return 'aemeath';
  if (char.id.startsWith('denia_')) return 'denia';
  if (char.id.startsWith('lucilla_')) return 'lucilla';
  if (char.id.startsWith('hsin_')) return 'hsin';
  if (char.id.startsWith('lynae_')) return 'lynae';
  return char.id;
}

function hasTag(char: Character, tag: string): boolean {
  const lower = tag.toLowerCase();
  return (
    char.mechanicsTags.some((t) => t.toLowerCase().includes(lower)) ||
    char.primaryDamageTypes.some((t) => t.toLowerCase().includes(lower))
  );
}

function isHealer(char: Character): boolean {
  return char.role === 'Support / Healer' || hasTag(char, 'Healer');
}

function isShielder(char: Character): boolean {
  return hasTag(char, 'Shielder');
}

function isQuickSwap(char: Character): boolean {
  return hasTag(char, 'Quick-Swap') || hasTag(char, 'Dual-DPS');
}

function isDoubleIntroSub(char: Character): boolean {
  return hasTag(char, 'Double Intro');
}

function scoreOutroBuff(buffer: Character, receiver: Character): { points: number; matched: string[] } {
  let points = 0;
  const matched: string[] = [];

  for (const rawTag of buffer.outroBuffTags) {
    const tag = rawTag.toLowerCase();
    if (tag === 'damage outro' || tag === 'coordinated attack forte') continue;

    // 1. Negative Status / Mechanic-specific Outros MUST be checked BEFORE generic element matching
    //    so e.g. "Glacio Chafe DMG +60%" never falsely matches non-Chafe Glacio carries like Carlotta.
    if (
      tag.includes('glacio chafe') ||
      tag.includes('aero erosion') ||
      tag.includes('spectro frazzle') ||
      tag.includes('fusion burst') ||
      tag.includes('havoc bane') ||
      tag.includes('max negative status') ||
      tag.includes('max aero erosion') ||
      tag.includes('tune rupture')
    ) {
      if (
        (tag.includes('glacio chafe') && hasTag(receiver, 'Glacio Chafe')) ||
        (tag.includes('aero erosion') && !tag.includes('max aero') && hasTag(receiver, 'Aero Erosion')) ||
        (tag.includes('spectro frazzle') && hasTag(receiver, 'Spectro Frazzle')) ||
        (tag.includes('fusion burst') && hasTag(receiver, 'Fusion Burst')) ||
        (tag.includes('havoc bane') && hasTag(receiver, 'Havoc Bane')) ||
        (tag.includes('tune rupture') && hasTag(receiver, 'Tune Rupture')) ||
        (tag.includes('max negative status') &&
          (hasTag(receiver, 'Glacio Chafe') ||
            hasTag(receiver, 'Aero Erosion') ||
            hasTag(receiver, 'Spectro Frazzle') ||
            hasTag(receiver, 'Havoc Bane') ||
            hasTag(receiver, 'Fusion Burst'))) ||
        (tag.includes('max aero erosion') && hasTag(receiver, 'Aero Erosion'))
      ) {
        points += 18;
        matched.push(rawTag);
      }
      continue;
    }

    // 2. Conditional Tune Strain / Tune Break Outros (e.g. Denia: All DMG +15-40%, Mornye: Tune Break Team DMG +25%)
    if (tag.includes('15-40%') || tag.includes('tune break')) {
      if (hasTag(receiver, 'Tune Strain') || hasTag(receiver, 'Tune Rupture') || hasTag(receiver, 'Tune Break')) {
        points += 16;
        matched.push(rawTag);
      } else {
        points += 4;
      }
      continue;
    }

    // 2b. Suisui Negative Status + ATK-scaling conditional buffs (does NOT buff HP-scaling Cartethyia or Tune Strain)
    if (tag.includes('negative status team dmg')) {
      const usesNegStatus =
        hasTag(receiver, 'Glacio Chafe') ||
        hasTag(receiver, 'Aero Erosion') ||
        hasTag(receiver, 'Spectro Frazzle') ||
        hasTag(receiver, 'Havoc Bane') ||
        hasTag(receiver, 'Fusion Burst');
      if (usesNegStatus && !hasTag(receiver, 'HP-Scaling')) {
        points += 16;
        matched.push(rawTag);
      } else if (!hasTag(receiver, 'HP-Scaling')) {
        points += 3;
      }
      continue;
    }

    if (tag.includes('team atk') || tag.includes('atk +')) {
      if (!hasTag(receiver, 'HP-Scaling')) {
        points += tag.includes('20%') ? 8 : 6;
        matched.push(rawTag);
      }
      continue;
    }

    // 2c. Lily Unison / Echo conditional DMG +25%
    if (tag.includes('unison/echo team dmg')) {
      if (hasTag(receiver, 'Unison') || hasTag(receiver, 'Echo Skill')) {
        points += 17;
        matched.push(rawTag);
      } else {
        points += 7;
      }
      continue;
    }

    // 3. Universal team / incoming DMG buffs
    if (tag.includes('all dmg')) {
      points += tag.includes('25%') ? 15 : tag.includes('20%') ? 13 : 10;
      matched.push(rawTag);
      continue;
    }

    // 4. Generic Element DMG Deepen
    if (tag.includes(receiver.element.toLowerCase())) {
      points += 13;
      matched.push(rawTag);
      continue;
    }

    // 5. Attack-Type Deepen
    if (
      (tag.includes('basic attack') && receiver.primaryDamageTypes.includes('Basic Attack')) ||
      (tag.includes('heavy attack') && receiver.primaryDamageTypes.includes('Heavy Attack')) ||
      (tag.includes('resonance skill') && receiver.primaryDamageTypes.includes('Resonance Skill')) ||
      (tag.includes('resonance liberation') && receiver.primaryDamageTypes.includes('Resonance Liberation')) ||
      (tag.includes('echo skill') && receiver.primaryDamageTypes.includes('Echo Skill')) ||
      (tag.includes('coordinated attack') && receiver.primaryDamageTypes.includes('Coordinated Attack'))
    ) {
      points += tag.includes('50%') || tag.includes('38%') ? 16 : 13;
      matched.push(rawTag);
    }
  }

  return { points, matched };
}

function scoreMechanicNeeds(carry: Character, teammates: Character[]): { points: number; reasons: string[] } {
  let points = 0;
  const reasons: string[] = [];
  const seenReasons = new Set<string>();

  const pushReason = (r: string) => {
    if (!seenReasons.has(r)) {
      seenReasons.add(r);
      reasons.push(r);
    }
  };

  for (const need of carry.synergyNeeds) {
    const n = need.toLowerCase();
    if (n === 'universal dmg amp' || n === 'energy regen') continue;

    if (n === 'coordinated attack') {
      const coordMate = teammates.find((t) => hasTag(t, 'Coordinated Attack'));
      if (coordMate) {
        points += 18;
        pushReason(`${coordMate.name} supplies Coordinated Attacks for ${carry.name}`);
      }
      continue;
    }

    if (n === 'glacio chafe') {
      const mate = teammates.find((t) => hasTag(t, 'Glacio Chafe'));
      if (mate) {
        points += 20;
        pushReason(`${mate.name} enables Glacio Chafe synergy`);
      }
      continue;
    }

    if (n === 'aero erosion') {
      const mate = teammates.find((t) => t.primaryDamageTypes.includes('Aero Erosion'));
      if (mate) {
        points += 20;
        pushReason(`${mate.name} generates Aero Erosion stacks for ${carry.name}`);
      } else {
        points -= 16;
      }
      continue;
    }

    if (n === 'max erosion stacks') {
      const mate = teammates.find((t) =>
        t.outroBuffTags.some(
          (b) => b.toLowerCase().includes('max aero erosion') || b.toLowerCase().includes('max negative status')
        )
      );
      if (mate) {
        points += 14;
        pushReason(`${mate.name} raises max Aero Erosion stacks`);
      }
      continue;
    }

    if (n === 'spectro frazzle') {
      const mate = teammates.find((t) => hasTag(t, 'Spectro Frazzle'));
      if (mate) {
        points += 20;
        pushReason(`${mate.name} applies Spectro Frazzle`);
      }
      continue;
    }

    if (n === 'max negative status stacks') {
      const mate = teammates.find((t) =>
        t.outroBuffTags.some((b) => b.toLowerCase().includes('max negative status'))
      );
      if (mate) {
        points += 16;
        pushReason(`${mate.name} raises Negative Status max stacks`);
      }
      continue;
    }

    if (n === 'unison enabler') {
      const mate = teammates.find((t) => hasTag(t, 'Unison'));
      if (mate) {
        points += 20;
        pushReason(`${mate.name} enables Unison rotations`);
      }
      continue;
    }

    if (n.includes('echo skill')) {
      const mate = teammates.find(
        (t) => hasTag(t, 'Echo Skill') || t.outroBuffTags.some((b) => b.toLowerCase().includes('echo skill'))
      );
      if (mate) {
        points += 16;
        pushReason(`${mate.name} amplifies Echo Skill DMG`);
      }
      continue;
    }

    if (n.includes('tune')) {
      const mate = teammates.find((t) => hasTag(t, 'Tune Rupture') || hasTag(t, 'Tune Strain') || hasTag(t, 'Tune Break'));
      if (mate) {
        points += 15;
        pushReason(`${mate.name} triggers Tune Break/Rupture synergy`);
      }
    }
  }

  return { points, reasons };
}

function orderRotation(members: Character[], archetype: TeamArchetype): [Character, Character, Character] {
  const sorted = [...members].sort((a, b) => {
    const scorePos = (c: Character) => {
      if (c.role === 'Support / Healer' || (c.outroTarget === 'All Team' && isHealer(c))) return 0;
      if (c.role === 'Sub-DPS / Hybrid' && c.outroTarget === 'Next Resonator') return 1;
      if (c.role === 'Sub-DPS / Hybrid') return 1;
      return 2;
    };
    const diff = scorePos(a) - scorePos(b);
    if (diff !== 0) return diff;
    if (archetype === 'Dual-DPS Quick-Swap') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return [sorted[0], sorted[1], sorted[2]];
}

function applyStageBuff(
  members: Character[],
  carries: Character[],
  stageBuff: StageBuff
): { points: number; reason?: SynergyReason } {
  if (stageBuff === 'none') return { points: 0 };

  if (stageBuff === 'negative_status') {
    const hasNeg = members.some((m) =>
      ['Glacio Chafe', 'Aero Erosion', 'Spectro Frazzle', 'Havoc Bane', 'Fusion Burst'].some((s) =>
        hasTag(m, s)
      )
    );
    return hasNeg
      ? { points: 14, reason: { type: 'mechanic', label: 'Matches Stage Buff: Negative Status DMG' } }
      : { points: -4 };
  }

  if (stageBuff === 'coordinated_attack') {
    const hasCoord = members.some((m) => hasTag(m, 'Coordinated Attack'));
    return hasCoord
      ? { points: 14, reason: { type: 'mechanic', label: 'Matches Stage Buff: Coordinated Attack' } }
      : { points: -4 };
  }

  if (stageBuff === 'echo_unison') {
    const hasEchoOrUnison = members.some((m) => hasTag(m, 'Echo Skill') || hasTag(m, 'Unison'));
    return hasEchoOrUnison
      ? { points: 14, reason: { type: 'mechanic', label: 'Matches Stage Buff: Echo Skill / Unison' } }
      : { points: -4 };
  }

  if (stageBuff === 'energy_drain') {
    const hasBatteryOrConcerto = members.some(
      (m) => hasTag(m, 'Concerto Efficient') || hasTag(m, 'Energy Battery')
    );
    return hasBatteryOrConcerto
      ? { points: 10, reason: { type: 'mechanic', label: 'Counters Energy/Concerto Drain debuff' } }
      : { points: -14, reason: { type: 'warning', label: 'Vulnerable to Energy/Concerto Drain debuff' } };
  }

  const dmgMap: Record<string, string> = {
    basic_attack: 'Basic Attack',
    heavy_attack: 'Heavy Attack',
    resonance_skill: 'Resonance Skill',
    resonance_liberation: 'Resonance Liberation',
  };
  const targetDmg = dmgMap[stageBuff];
  if (targetDmg && carries.some((c) => c.primaryDamageTypes.includes(targetDmg))) {
    return { points: 12, reason: { type: 'mechanic', label: `Matches Stage Buff: ${targetDmg} DMG` } };
  }

  return { points: 0 };
}

export function evaluateTeam(
  a: Character,
  b: Character,
  c: Character,
  options?: Pick<TeamGenerationOptions, 'gameMode' | 'bossResistances' | 'stageBuff'>
): TeamRecommendation {
  const members = [a, b, c];
  const sortedIds = [a.id, b.id, c.id].sort().join('+');
  const mainDpsList = members.filter((m) => m.role === 'Main DPS');
  const subDpsList = members.filter((m) => m.role === 'Sub-DPS / Hybrid');
  const supportList = members.filter((m) => m.role === 'Support / Healer');

  const reasons: SynergyReason[] = [];
  let score = 0;

  // 1. Archetype & Role Balance
  let archetype: TeamArchetype = 'Hypercarry';
  const hasQuickSwapDuo =
    (mainDpsList.length === 2 && isQuickSwap(mainDpsList[0]) && isQuickSwap(mainDpsList[1])) ||
    QUICK_SWAP_PAIRS.has(pairKey(a, b)) ||
    QUICK_SWAP_PAIRS.has(pairKey(a, c)) ||
    QUICK_SWAP_PAIRS.has(pairKey(b, c));

  const isNegativeStatusCore = members.some((m) =>
    ['Glacio Chafe', 'Aero Erosion', 'Spectro Frazzle', 'Havoc Bane', 'Fusion Burst'].some((st) =>
      hasTag(m, st)
    )
  );

  if (mainDpsList.length === 2 && hasQuickSwapDuo) {
    archetype = 'Dual-DPS Quick-Swap';
    score += 20;
    const [d1, d2] = mainDpsList;
    if (QUICK_SWAP_PAIRS.has(pairKey(d1, d2))) score += 6;
    reasons.push({
      type: 'quickswap',
      label: `Dual-DPS Quick-Swap core: ${d1.name} ⇄ ${d2.name}`,
    });
  } else if (mainDpsList.length === 0 && subDpsList.length >= 2 && hasQuickSwapDuo) {
    archetype = 'Dual-DPS Quick-Swap';
    score += 22;
    reasons.push({
      type: 'quickswap',
      label: 'Triple Hybrid Quick-Swap chain (continuous Outro buffs)',
    });
  } else if (mainDpsList.length === 1 && subDpsList.length >= 1 && supportList.length >= 1) {
    const doubleIntroSub = subDpsList.find(isDoubleIntroSub);
    const dps = mainDpsList[0];
    const outroMatch = doubleIntroSub ? scoreOutroBuff(doubleIntroSub, dps) : { points: 0, matched: [] };

    if (doubleIntroSub && outroMatch.points > 0 && !isNegativeStatusCore) {
      archetype = 'Double Intro';
      score += 23;
      reasons.push({
        type: 'doubleintro',
        label: `Double Intro: Support & ${dps.name} funnel Outros into ${doubleIntroSub.name} to speed up Concerto`,
      });
    } else {
      archetype = isNegativeStatusCore ? 'Mechanic / Status Core' : 'Hypercarry';
      score += 21;
    }
  } else if (mainDpsList.length === 1 && subDpsList.length === 2) {
    archetype = isNegativeStatusCore ? 'Mechanic / Status Core' : 'Hypercarry';
    score += 17;
  } else if (mainDpsList.length >= 2 && !hasQuickSwapDuo) {
    score -= 35;
    reasons.push({
      type: 'warning',
      label: 'Multiple field-hungry Main DPS without Quick-Swap synergy',
    });
  } else if (mainDpsList.length === 0 && !hasQuickSwapDuo) {
    const hasHybridCarry = subDpsList.some((m) => hasTag(m, 'Dual-DPS'));
    if (hasHybridCarry && subDpsList.length >= 2) {
      archetype = 'Hypercarry';
      score += 18;
    } else {
      score -= 30;
      reasons.push({
        type: 'warning',
        label: 'Missing a primary Main DPS or Quick-Swap carry',
      });
    }
  }

  // 2. Sustain Check
  const healers = members.filter(isHealer);
  const shielders = members.filter(isShielder);
  if (healers.length > 0) {
    score += 12;
    reasons.push({
      type: 'sustain',
      label: `Sustain: ${healers.map((h) => h.name).join(' & ')}`,
    });
  } else if (shielders.length > 0) {
    score += 7;
    reasons.push({
      type: 'sustain',
      label: `Shield sustain: ${shielders.map((s) => s.name).join(' & ')}`,
    });
  } else {
    score -= 22;
    reasons.push({
      type: 'warning',
      label: 'No Healer or Shielder (not recommended for endgame)',
    });
  }

  // 3. Rotation & Outro Buffs
  const ordered = orderRotation(members, archetype);
  const [slot1, slot2, slot3] = ordered;

  if (slot1.outroTarget === 'All Team') {
    const outro1 = scoreOutroBuff(slot1, slot3);
    score += outro1.points;
    if (outro1.matched.length > 0) {
      reasons.push({
        type: 'outro',
        label: `${slot1.name} (All Team): ${outro1.matched.join(', ')}`,
      });
    }
  } else {
    const outro1to2 = scoreOutroBuff(slot1, slot2);
    score += Math.round(outro1to2.points * 0.6);
    if (outro1to2.matched.length > 0) {
      reasons.push({
        type: 'outro',
        label: `${slot1.name} → ${slot2.name}: ${outro1to2.matched.join(', ')}`,
      });
    }
  }

  const outro2to3 = scoreOutroBuff(slot2, slot3);
  score += outro2to3.points;
  const isCollabDuo =
    (slot2.id === 'rebecca' && slot3.id === 'lucy') ||
    (slot2.id === 'lucy' && slot3.id === 'rebecca');

  if (outro2to3.matched.length > 0) {
    reasons.push({
      type: 'outro',
      label: `${slot2.name} → ${slot3.name}: ${outro2to3.matched.join(', ')}`,
    });
  } else if (isCollabDuo) {
    score += 14;
    reasons.push({
      type: 'quickswap',
      label: 'Lucy + Rebecca Collab synergy (dual-element Quick-Swap)',
    });
  } else if (slot2.role === 'Sub-DPS / Hybrid' && archetype !== 'Dual-DPS Quick-Swap') {
    score -= 14;
    reasons.push({
      type: 'warning',
      label: `${slot2.name} Outro does not match ${slot3.name}`,
    });
  }

  if (archetype === 'Dual-DPS Quick-Swap') {
    const outro3to2 = scoreOutroBuff(slot3, slot2);
    if (outro3to2.points > 0) {
      score += Math.round(outro3to2.points * 0.5);
    }
  }

  // 4. Mechanic / Status Synergy
  const carries = mainDpsList.length > 0 ? mainDpsList : [slot3];
  for (const carry of carries) {
    const teammates = members.filter((m) => m.id !== carry.id);
    const mech = scoreMechanicNeeds(carry, teammates);
    score += mech.points;
    for (const r of mech.reasons) {
      reasons.push({ type: 'mechanic', label: r });
    }
  }

  // 5. Shorekeeper vs Verina rule + Buling S6 Caution + Character Power Level
  if (members.some((m) => m.id === 'shorekeeper') && archetype !== 'Double Intro') {
    score += 5;
  }
  if (members.some((m) => m.id === 'verina') && archetype === 'Double Intro') {
    score += 6;
    reasons.push({
      type: 'doubleintro',
      label: 'Verina fast Concerto makes her optimal for Double Intro rotations',
    });
  }
  if (
    members.some((m) => m.id === 'buling') &&
    carries.some((c) => c.primaryDamageTypes.includes('Resonance Skill'))
  ) {
    reasons.push({
      type: 'warning',
      label: 'Caution: Buling grants +50% Skill DMG at S6 (only +25% at S0–S5)',
    });
  }

  const avgTier = members.reduce((sum, m) => sum + TIER_SCORE[m.metaTier], 0) / 3;
  score += Math.round(avgTier * 1.3);

  const primaryCarry = mainDpsList[0] ?? slot3;
  if (primaryCarry.metaTier === 'T2') {
    score -= 12;
    reasons.push({ type: 'warning', label: `${primaryCarry.name} has lower endgame DPS ceiling (T2)` });
  } else if (primaryCarry.metaTier === 'T3') {
    score -= 22;
    reasons.push({ type: 'warning', label: `${primaryCarry.name} has low endgame DPS ceiling (T3)` });
  }

  // 6. Proven Real-World Meta Core Bonus
  let isMetaCore = false;
  const matchedCore = META_CORES.find((core) => core.ids.slice().sort().join('+') === sortedIds);
  if (matchedCore) {
    score += matchedCore.bonus;
    isMetaCore = true;
    reasons.unshift({ type: 'mechanic', label: `Meta Comp: ${matchedCore.label}` });
  }

  if (
    members.some((m) => m.id === 'jingran') &&
    members.some((m) => m.id === 'buling')
  ) {
    score -= 14;
    reasons.push({
      type: 'warning',
      label: 'Jingran prefers Shorekeeper or Verina over Buling',
    });
  }

  // Zani & Phoebe strict pair requirement: lone Zani or lone Phoebe is not viable
  const hasZani = members.some((m) => m.id === 'zani');
  const hasPhoebe = members.some((m) => m.id === 'phoebe');
  if (hasZani !== hasPhoebe) {
    score -= 45;
    reasons.unshift({
      type: 'warning',
      label: hasZani
        ? 'Zani requires Phoebe to apply Spectro Frazzle'
        : 'Phoebe requires Zani to form a viable Spectro Frazzle team',
    });
  }

  if (
    members.some((m) => m.id === 'carlotta') &&
    members.some((m) => m.id === 'lumi')
  ) {
    score -= 25;
    reasons.push({
      type: 'warning',
      label: "Lumi's 10s Outro expires too early for Carlotta (use Zhezhi, Jinhsi, Xiangli Yao, or Taoqi)",
    });
  }

  // Penalize Brant + Changli without Lupa so they always pair with Lupa
  if (
    members.some((m) => m.id === 'brant') &&
    members.some((m) => m.id === 'changli') &&
    !members.some((m) => m.id === 'lupa')
  ) {
    score -= 22;
    reasons.push({
      type: 'warning',
      label: 'Brant + Changli strongly prefer Lupa as their 3rd Fusion Quick-Swap partner',
    });
  }

  // 7. Game Mode & Stage Condition Adjustments
  const gameMode = options?.gameMode ?? 'general';
  if (gameMode === 'whimpering_wastes') {
    const aoeCount = members.filter(
      (m) => hasTag(m, 'AoE') || hasTag(m, 'Whimpering Wastes') || hasTag(m, 'Crowd Control')
    ).length;
    if (aoeCount > 0) {
      score += aoeCount * 6;
      reasons.push({ type: 'mechanic', label: 'Strong AoE / wave-clear for Whimpering Wastes' });
    } else {
      score -= 8;
    }
  } else if (gameMode === 'toa') {
    const stBurst = carries.some((c) => hasTag(c, 'Burst') || hasTag(c, 'Nuke') || c.metaTier === 'T0');
    if (stBurst) {
      score += 6;
    }
  }

  // 8. Boss Element Resistance Penalty
  const bossResistances: ElementType[] = options?.bossResistances ?? [];
  if (bossResistances.length > 0) {
    const resistedCarries = carries.filter((c) => bossResistances.includes(c.element));
    if (resistedCarries.length > 0) {
      score -= 45 * resistedCarries.length;
      reasons.unshift({
        type: 'warning',
        label: `Resisted by Boss: ${resistedCarries.map((c) => `${c.name} (${c.element} RES)`).join(', ')}`,
      });
    }
  }

  // 9. Stage Buff / Debuff
  if (options?.stageBuff && options.stageBuff !== 'none') {
    const buffResult = applyStageBuff(members, carries, options.stageBuff);
    score += buffResult.points;
    if (buffResult.reason) reasons.push(buffResult.reason);
  }

  const rawScore = Math.round(score);
  const normalizedScore = Math.max(0, Math.min(100, rawScore));

  const rotationHint =
    archetype === 'Dual-DPS Quick-Swap'
      ? `${slot1.name} (Buff/Heal) → ${slot2.name} ⇄ ${slot3.name} (Quick-Swap)`
      : archetype === 'Double Intro'
        ? `${slot1.name} (Outro) → ${slot2.name} (Intro #1) → ${slot3.name} (Outro) → ${slot2.name} (Intro #2) → ${slot3.name}`
        : `${slot1.name} (Buff/Heal) → ${slot2.name} (Outro) → ${slot3.name} (DPS)`;

  return {
    id: sortedIds,
    members: ordered,
    score: normalizedScore,
    rawScore,
    archetype,
    rotationHint,
    reasons: reasons.slice(0, 5),
    isMetaCore,
  };
}

export function generateTopTeams(
  ownedCharacters: Character[],
  options?: Partial<TeamGenerationOptions>
): TeamRecommendation[] {
  const n = ownedCharacters.length;
  if (n < 3) return [];

  const pinnedId = options?.pinnedCharacterId ?? null;
  const archetypeFilter = options?.archetypeFilter ?? 'All';
  const limit = options?.limit ?? 60;
  const minScore = options?.gameMode === 'endgame_matrix' ? 62 : 45;

  const results: TeamRecommendation[] = [];

  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      for (let k = j + 1; k < n; k++) {
        const a = ownedCharacters[i];
        const b = ownedCharacters[j];
        const c = ownedCharacters[k];

        // Cannot have two different Rover forms in the same team
        if (
          new Set([getIdentityKey(a), getIdentityKey(b), getIdentityKey(c)]).size < 3
        ) {
          continue;
        }

        if (pinnedId && a.id !== pinnedId && b.id !== pinnedId && c.id !== pinnedId) {
          continue;
        }

        const team = evaluateTeam(a, b, c, {
          gameMode: options?.gameMode ?? 'general',
          bossResistances: options?.bossResistances ?? [],
          stageBuff: options?.stageBuff ?? 'none',
        });

        if (archetypeFilter !== 'All' && team.archetype !== archetypeFilter) {
          continue;
        }
        if (team.score >= minScore) {
          results.push(team);
        }
      }
    }
  }

  results.sort((x, y) => (y.rawScore ?? y.score) - (x.rawScore ?? x.score));
  return results.slice(0, limit);
}

/**
 * Endgame Matrix:
 * - Support / Healer units get 2 Vigor (max 2 uses), EXCEPT Rover and Youhu (1 Vigor).
 * - Non-support units get 1 Vigor, EXCEPT the Rotating Emergency Resonator (+1 extra Vigor = 2 uses).
 * - Multi-mode characters share one identity key & Vigor pool.
 */
export function generateEndgameMatrixTeams(
  ownedCharacters: Character[],
  options?: Partial<TeamGenerationOptions>
): TeamRecommendation[] {
  const allCandidates = generateTopTeams(ownedCharacters, {
    ...options,
    gameMode: 'endgame_matrix',
    limit: Infinity,
  });

  const emergencyId = options?.emergencyResonatorId ?? 'lucilla';

  const getMaxVigor = (char: Character): number => {
    const key = getIdentityKey(char);
    let vigor = 1;
    if ((char.role === 'Support / Healer' || key === 'mornye') && key !== 'rover' && key !== 'youhu') {
      vigor = 2;
    }
    if (emergencyId && key === emergencyId && vigor < 2) {
      vigor += 1;
    }
    return vigor;
  };

  const usageCount = new Map<string, number>();
  const usedTeamIds = new Set<string>();
  const picked: TeamRecommendation[] = [];

  for (const team of allCandidates) {
    if (team.score < 62) break;
    if (usedTeamIds.has(team.id)) continue;

    const canUse = team.members.every((m) => {
      const key = getIdentityKey(m);
      return (usageCount.get(key) ?? 0) < getMaxVigor(m);
    });

    if (canUse) {
      picked.push(team);
      usedTeamIds.add(team.id);
      team.members.forEach((m) => {
        const key = getIdentityKey(m);
        usageCount.set(key, (usageCount.get(key) ?? 0) + 1);
      });
    }
  }

  return picked;
}
export function generateNonOverlappingTeams(
  ownedCharacters: Character[],
  options?: Partial<TeamGenerationOptions> & { maxTeams?: number; roomLabels?: string[] }
): TeamRecommendation[] {
  const allCandidates = generateTopTeams(ownedCharacters, {
    ...options,
    gameMode: options?.gameMode ?? 'endgame_matrix',
    limit: Infinity,
  });

  const maxTeams = options?.maxTeams ?? Infinity;
  const roomLabels = options?.roomLabels;
  const picked: TeamRecommendation[] = [];
  const usedKeys = new Set<string>();

  for (const team of allCandidates) {
    if (team.score < 62) break;
    const keys = team.members.map(getIdentityKey);
    if (keys.every((k) => !usedKeys.has(k))) {
      picked.push({
        ...team,
        roomLabel: roomLabels?.[picked.length],
      });
      keys.forEach((k) => usedKeys.add(k));
      if (picked.length >= maxTeams) break;
    }
  }

  return picked;
}

/**
 * Tower of Adversity (ToA): Generates 3–6 unique teams with good synergy,
 * where each character (including multi-mode characters) can be used up to 2 times.
 */
export function generateToATeams(
  ownedCharacters: Character[],
  options?: Partial<TeamGenerationOptions>
): TeamRecommendation[] {
  const allCandidates = generateTopTeams(ownedCharacters, {
    ...options,
    gameMode: 'toa',
    limit: Infinity,
  });

  const usageCount = new Map<string, number>();
  const usedTeamIds = new Set<string>();
  const picked: TeamRecommendation[] = [];

  for (const team of allCandidates) {
    if (team.score < 64) break;
    if (usedTeamIds.has(team.id)) continue;

    const keys = team.members.map(getIdentityKey);
    if (keys.every((k) => (usageCount.get(k) ?? 0) < 2)) {
      picked.push({
        ...team,
        roomLabel: `ToA Team ${picked.length + 1}`,
      });
      usedTeamIds.add(team.id);
      keys.forEach((k) => usageCount.set(k, (usageCount.get(k) ?? 0) + 1));
      if (picked.length >= 6) break;
    }
  }

  return picked;
}
