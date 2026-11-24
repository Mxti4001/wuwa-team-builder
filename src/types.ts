export type ElementType = 'Aero' | 'Spectro' | 'Havoc' | 'Fusion' | 'Glacio' | 'Electro';
export type RoleType = 'Main DPS' | 'Sub-DPS / Hybrid' | 'Support / Healer';
export type MetaTier = 'T0' | 'T0.5' | 'T1' | 'T2' | 'T3';
export type OutroTarget = 'Next Resonator' | 'All Team';

export interface Character {
  id: string;
  name: string;
  rarity: 4 | 5;
  element: ElementType;
  weapon: string;
  role: RoleType;
  primaryDamageTypes: string[];
  outroBuffTags: string[];
  outroTarget: OutroTarget;
  outroDurationS: number;
  mechanicsTags: string[];
  synergyNeeds: string[];
  metaTier: MetaTier;
  outroDescription: string;
  signatureWeaponBuff?: string;
}

export type TeamArchetype =
  | 'Hypercarry'
  | 'Dual-DPS Quick-Swap'
  | 'Double Intro'
  | 'Mechanic / Status Core';

export interface SynergyReason {
  type: 'outro' | 'mechanic' | 'quickswap' | 'doubleintro' | 'sustain' | 'warning';
  label: string;
}

export type GameMode = 'endgame_matrix';

export type StageBuff =
  | 'none'
  | 'negative_status'
  | 'coordinated_attack'
  | 'echo_unison'
  | 'basic_attack'
  | 'heavy_attack'
  | 'resonance_skill'
  | 'resonance_liberation'
  | 'energy_drain';

export interface TeamGenerationOptions {
  gameMode: GameMode;
  bossResistances: ElementType[];
  stageBuff: StageBuff;
  pinnedCharacterId?: string | null;
  archetypeFilter?: TeamArchetype | 'All';
  emergencyResonatorId?: string | null;
  limit?: number;
}

export interface BossRecommendation {
  name: string;
  element: ElementType | 'Neutral';
  reason: string;
  imageUrl?: string;
}

export interface MatrixBossConfig {
  name: string;
  element: ElementType | 'Neutral';
  weakMechanics: Array<{ tag: string; score: number }>;
  resistedElement: ElementType | 'None';
  baseFit: number;
  reason: string;
  imageUrl?: string;
}

export interface TeamRecommendation {
  id: string;
  /** Ordered in recommended rotation: [Slot 1, Slot 2, Slot 3] */
  members: [Character, Character, Character];
  score: number;
  rawScore?: number;
  archetype: TeamArchetype;
  rotationHint: string;
  reasons: SynergyReason[];
  isMetaCore?: boolean;
  recommendedBoss?: BossRecommendation;
  /** Optional room label for ToA (6 rooms) or Whimpering Wastes (2 halves) */
  roomLabel?: string;
}
