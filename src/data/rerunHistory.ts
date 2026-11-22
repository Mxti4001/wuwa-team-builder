export interface BannerPhase {
  patch: string;
  phase: 'P1' | 'P2';
  key: string; // e.g. "3.8_P2"
  /** ISO YYYY-MM-DD end date of this banner phase (used for live day counter) */
  endDate: string;
}

const REFERENCE_TODAY_MS = Date.UTC(2026, 10, 22); // 2026-11-22
const MS_PER_DAY = 86_400_000;

function daysAgoIso(days: number): string {
  return new Date(REFERENCE_TODAY_MS - days * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Exact phase end dates anchored to 2026-11-22 so that as real calendar days pass,
 * the "Since Last Banner" day counter automatically increments every day.
 */
export const BANNER_PHASES: BannerPhase[] = [
  { patch: '1.0', phase: 'P1', key: '1.0_P1', endDate: '2024-06-12' },
  { patch: '1.0', phase: 'P2', key: '1.0_P2', endDate: '2024-06-26' },
  { patch: '1.1', phase: 'P1', key: '1.1_P1', endDate: '2024-07-22' },
  { patch: '1.1', phase: 'P2', key: '1.1_P2', endDate: '2024-08-14' },
  { patch: '1.2', phase: 'P1', key: '1.2_P1', endDate: '2024-09-07' },
  { patch: '1.2', phase: 'P2', key: '1.2_P2', endDate: '2024-09-28' },
  { patch: '1.3', phase: 'P1', key: '1.3_P1', endDate: '2024-10-24' },
  { patch: '1.3', phase: 'P2', key: '1.3_P2', endDate: '2024-11-13' },
  { patch: '1.4', phase: 'P1', key: '1.4_P1', endDate: '2024-12-12' },
  { patch: '1.4', phase: 'P2', key: '1.4_P2', endDate: '2025-01-01' },
  { patch: '2.0', phase: 'P1', key: '2.0_P1', endDate: '2025-01-23' },
  { patch: '2.0', phase: 'P2', key: '2.0_P2', endDate: '2025-02-12' },
  { patch: '2.1', phase: 'P1', key: '2.1_P1', endDate: '2025-03-06' },
  { patch: '2.1', phase: 'P2', key: '2.1_P2', endDate: '2025-03-26' },
  { patch: '2.2', phase: 'P1', key: '2.2_P1', endDate: '2025-04-17' },
  { patch: '2.2', phase: 'P2', key: '2.2_P2', endDate: '2025-04-28' },
  { patch: '2.3', phase: 'P1', key: '2.3_P1', endDate: '2025-05-22' },
  { patch: '2.3', phase: 'P2', key: '2.3_P2', endDate: '2025-06-11' },
  { patch: '2.4', phase: 'P1', key: '2.4_P1', endDate: '2025-07-03' },
  { patch: '2.4', phase: 'P2', key: '2.4_P2', endDate: '2025-07-23' },
  { patch: '2.5', phase: 'P1', key: '2.5_P1', endDate: '2025-08-14' },
  { patch: '2.5', phase: 'P2', key: '2.5_P2', endDate: '2025-08-27' },
  { patch: '2.6', phase: 'P1', key: '2.6_P1', endDate: daysAgoIso(461) },
  { patch: '2.6', phase: 'P2', key: '2.6_P2', endDate: daysAgoIso(440) },
  { patch: '2.7', phase: 'P1', key: '2.7_P1', endDate: daysAgoIso(419) },
  { patch: '2.7', phase: 'P2', key: '2.7_P2', endDate: daysAgoIso(398) },
  { patch: '2.8', phase: 'P1', key: '2.8_P1', endDate: daysAgoIso(377) },
  { patch: '2.8', phase: 'P2', key: '2.8_P2', endDate: daysAgoIso(363) },
  { patch: '3.0', phase: 'P1', key: '3.0_P1', endDate: daysAgoIso(342) },
  { patch: '3.0', phase: 'P2', key: '3.0_P2', endDate: daysAgoIso(321) },
  { patch: '3.1', phase: 'P1', key: '3.1_P1', endDate: daysAgoIso(300) },
  { patch: '3.1', phase: 'P2', key: '3.1_P2', endDate: daysAgoIso(279) },
  { patch: '3.2', phase: 'P1', key: '3.2_P1', endDate: daysAgoIso(258) },
  { patch: '3.2', phase: 'P2', key: '3.2_P2', endDate: daysAgoIso(237) },
  { patch: '3.3', phase: 'P1', key: '3.3_P1', endDate: daysAgoIso(216) },
  { patch: '3.3', phase: 'P2', key: '3.3_P2', endDate: daysAgoIso(197) },
  { patch: '3.4', phase: 'P1', key: '3.4_P1', endDate: daysAgoIso(165) },
  { patch: '3.4', phase: 'P2', key: '3.4_P2', endDate: daysAgoIso(144) },
  { patch: '3.5', phase: 'P1', key: '3.5_P1', endDate: daysAgoIso(144) },
  { patch: '3.5', phase: 'P2', key: '3.5_P2', endDate: daysAgoIso(124) },
  { patch: '3.6', phase: 'P1', key: '3.6_P1', endDate: daysAgoIso(124) },
  { patch: '3.6', phase: 'P2', key: '3.6_P2', endDate: daysAgoIso(61) },
  { patch: '3.7', phase: 'P1', key: '3.7_P1', endDate: daysAgoIso(40) },
  { patch: '3.7', phase: 'P2', key: '3.7_P2', endDate: daysAgoIso(40) },
  { patch: '3.8', phase: 'P1', key: '3.8_P1', endDate: daysAgoIso(19) },
  { patch: '3.8', phase: 'P2', key: '3.8_P2', endDate: '2026-12-10' },
];

export function getDaysSinceBanner(lastPhaseKey: string): number {
  const phase = BANNER_PHASES.find((p) => p.key === lastPhaseKey);
  if (!phase) return 0;
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const [y, m, d] = phase.endDate.split('-').map(Number);
  const endUtc = Date.UTC(y, m - 1, d);
  return Math.max(0, Math.floor((todayUtc - endUtc) / MS_PER_DAY));
}

export interface RerunEntry {
  /** Character id matching characters.csv */
  characterId: string;
  /** List of banner phase keys where this character ran (debut + reruns) */
  banners: string[];
}

/** Ordered from newest debut (top) to oldest debut (bottom) like the tracker chart */
export const RERUN_HISTORY: RerunEntry[] = [
  { characterId: 'lily', banners: ['3.8_P1'] },
  { characterId: 'suoming', banners: ['3.7_P2'] },
  { characterId: 'hsin_unison', banners: ['3.7_P1'] },
  { characterId: 'jingran', banners: ['3.6_P2'] },
  { characterId: 'qingxiao', banners: ['3.6_P1'] },
  { characterId: 'suisui', banners: ['3.5_P2', '3.8_P2'] },
  { characterId: 'yangyang_xuanling', banners: ['3.5_P1', '3.8_P2'] },
  { characterId: 'lucilla_chafe', banners: ['3.4_P2', '3.7_P1'] },
  { characterId: 'lucy', banners: ['3.4_P1'] },
  { characterId: 'rebecca', banners: ['3.4_P1'] },
  { characterId: 'denia_burst', banners: ['3.3_P2', '3.6_P1'] },
  { characterId: 'hiyuki', banners: ['3.3_P1', '3.6_P2', '3.8_P2'] },
  { characterId: 'sigrika', banners: ['3.2_P1', '3.8_P1'] },
  { characterId: 'luuk_herssen', banners: ['3.1_P2', '3.5_P1'] },
  { characterId: 'aemeath_rupture', banners: ['3.1_P1', '3.5_P2'] },
  { characterId: 'mornye', banners: ['3.0_P2', '3.3_P1', '3.6_P2'] },
  { characterId: 'lynae_rupture', banners: ['3.0_P1', '3.2_P2', '3.5_P1', '3.7_P1'] },
  { characterId: 'chisa', banners: ['2.8_P1', '3.1_P1', '3.3_P2', '3.6_P2'] },
  { characterId: 'qiuyuan', banners: ['2.7_P2', '3.2_P1', '3.8_P1'] },
  { characterId: 'galbrena', banners: ['2.7_P1', '3.1_P2'] },
  { characterId: 'iuno', banners: ['2.6_P2', '3.0_P2', '3.3_P1', '3.6_P2'] },
  { characterId: 'augusta', banners: ['2.6_P1', '3.0_P2'] },
  { characterId: 'phrolova', banners: ['2.5_P1', '2.8_P2', '3.3_P2'] },
  { characterId: 'lupa', banners: ['2.4_P2', '2.7_P1', '3.1_P1'] },
  { characterId: 'cartethyia', banners: ['2.4_P1', '3.0_P1', '3.4_P2'] },
  { characterId: 'ciaccona', banners: ['2.3_P2', '2.6_P2', '3.0_P1'] },
  { characterId: 'zani', banners: ['2.3_P1', '2.7_P2', '3.2_P2'] },
  { characterId: 'cantarella', banners: ['2.2_P1', '2.5_P2', '2.8_P2'] },
  { characterId: 'brant', banners: ['2.1_P2', '2.3_P2', '2.5_P2', '3.8_P2'] },
  { characterId: 'phoebe', banners: ['2.1_P1', '2.3_P1', '2.8_P1', '3.2_P2', '3.8_P2'] },
  { characterId: 'roccia', banners: ['2.0_P2', '2.3_P2', '2.5_P1', '3.8_P2'] },
  { characterId: 'carlotta', banners: ['2.0_P1', '2.3_P2', '2.6_P1'] },
  { characterId: 'camellya', banners: ['1.4_P1', '2.2_P1', '3.8_P2'] },
  { characterId: 'shorekeeper', banners: ['1.3_P1', '2.2_P2', '2.6_P1'] },
  { characterId: 'xiangli_yao', banners: ['1.2_P2', '1.4_P2', '2.3_P1', '3.6_P1'] },
  { characterId: 'zhezhi', banners: ['1.2_P1', '2.0_P1', '2.3_P1', '3.6_P1'] },
  { characterId: 'changli', banners: ['1.1_P2', '2.1_P2', '2.3_P2', '3.6_P1'] },
  { characterId: 'jinhsi', banners: ['1.1_P1', '2.0_P2', '2.3_P2', '3.6_P1'] },
  { characterId: 'yinlin', banners: ['1.0_P2', '1.3_P2', '1.4_P2', '2.3_P1', '3.6_P1'] },
  { characterId: 'jiyan', banners: ['1.0_P1', '1.3_P1', '2.3_P1', '3.6_P1'] },
];
