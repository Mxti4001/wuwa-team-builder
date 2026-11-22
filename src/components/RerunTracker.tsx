import { useMemo, useState } from 'react';
import { BANNER_PHASES, getBannerStatus, RERUN_HISTORY } from '../data/rerunHistory';
import type { Character } from '../types';
import { CharacterAvatar } from './CharacterAvatar';

function getCellColor(count: number): { bg: string; fg: string } {
  if (count <= 0) return { bg: '#05070c', fg: '#64748b' };
  if (count <= 4) return { bg: '#4db380', fg: '#07130d' };
  if (count <= 7) return { bg: '#a3c962', fg: '#0f1705' };
  if (count <= 10) return { bg: '#e6c24f', fg: '#1a1202' };
  if (count <= 15) return { bg: '#e67e35', fg: '#1c0b02' };
  return { bg: '#c92a2a', fg: '#ffffff' };
}

export function RerunTracker({ allCharacters }: { allCharacters: Character[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'debut' | 'longest'>('debut');

  const charMap = useMemo(() => {
    const map = new Map<string, Character>();
    for (const c of allCharacters) map.set(c.id, c);
    return map;
  }, [allCharacters]);

  const rows = useMemo(() => {
    const computed = RERUN_HISTORY.map((entry) => {
      const char = charMap.get(entry.characterId);
      const bannerSet = new Set(entry.banners);
      const cells: Array<{ type: 'empty' | 'banner' | 'wait'; count: number; phaseKey: string }> = [];

      let started = false;
      let waitCount = 0;

      for (const p of BANNER_PHASES) {
        if (bannerSet.has(p.key)) {
          started = true;
          waitCount = 0;
          cells.push({ type: 'banner', count: 0, phaseKey: p.key });
        } else if (!started) {
          cells.push({ type: 'empty', count: 0, phaseKey: p.key });
        } else {
          waitCount += 1;
          cells.push({ type: 'wait', count: waitCount, phaseKey: p.key });
        }
      }

      const bannerStatus = getBannerStatus(entry.banners);

      return {
        characterId: entry.characterId,
        name: char?.name.split(' (')[0] ?? entry.characterId,
        char,
        cells,
        phasesSinceLast: waitCount,
        daysSinceLast: bannerStatus.daysSinceLast,
        bannerStatus,
      };
    });

    const filtered = search.trim()
      ? computed.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
      : computed;

    if (sortBy === 'longest') {
      return [...filtered].sort((a, b) => b.daysSinceLast - a.daysSinceLast);
    }
    return filtered;
  }, [charMap, search, sortBy]);

  // Group patches for the 2-row header
  const patches = useMemo(() => {
    const list: string[] = [];
    for (const p of BANNER_PHASES) {
      if (!list.includes(p.patch)) list.push(p.patch);
    }
    return list;
  }, []);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Limited 5★ Banner &amp; Rerun Tracker (1.0 – 3.8)</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            Shows each Resonator&apos;s debut/rerun banners and how many phases &amp; days have passed since their last banner ended.
          </p>
        </div>
        <div className="btn-row" style={{ alignItems: 'center' }}>
          <input
            className="search-input"
            style={{ width: 210, padding: '6px 10px' }}
            placeholder="Filter character..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={`btn ${sortBy === 'debut' ? 'active' : ''}`}
            onClick={() => setSortBy('debut')}
          >
            Sort: Newest → Oldest
          </button>
          <button
            className={`btn ${sortBy === 'longest' ? 'active' : ''}`}
            onClick={() => setSortBy('longest')}
          >
            Sort: Longest Wait
          </button>
        </div>
      </div>

      <div className="rerun-table-wrap">
        <table className="rerun-table">
          <thead>
            <tr>
              <th rowSpan={2} className="rerun-sticky-name">
                Resonator
              </th>
              {patches.map((patch) => (
                <th key={patch} colSpan={2} className="rerun-patch-th">
                  {patch}
                </th>
              ))}
              <th rowSpan={2} className="rerun-days-th">
                Since Last Banner
              </th>
            </tr>
            <tr>
              {BANNER_PHASES.map((p) => (
                <th key={p.key} className="rerun-phase-th">
                  {p.phase}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.characterId}>
                <td className="rerun-sticky-name">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {row.char && <CharacterAvatar character={row.char} size={24} />}
                    <span>{row.name}</span>
                  </div>
                </td>
                {row.cells.map((cell) => {
                  if (cell.type === 'empty') {
                    return <td key={cell.phaseKey} className="rerun-cell-empty" />;
                  }
                  if (cell.type === 'banner') {
                    return (
                      <td
                        key={cell.phaseKey}
                        className="rerun-cell-banner"
                        title={`${row.name} Banner in ${cell.phaseKey.replace('_', ' ')}`}
                      >
                        {row.char && <CharacterAvatar character={row.char} size={26} />}
                      </td>
                    );
                  }
                  const { bg, fg } = getCellColor(cell.count);
                  return (
                    <td
                      key={cell.phaseKey}
                      className="rerun-cell-wait"
                      style={{ background: bg, color: fg }}
                      title={`${row.name}: ${cell.count} phase(s) since last banner (${cell.phaseKey.replace('_', ' ')})`}
                    >
                      {cell.count}
                    </td>
                  );
                })}
                <td
                  className="rerun-days-td"
                  style={{
                    color:
                      row.bannerStatus.status === 'active'
                        ? '#6ee7b7'
                        : row.bannerStatus.status === 'upcoming'
                          ? '#7dd3fc'
                          : row.daysSinceLast >= 300
                            ? '#fca5a5'
                            : '#f1f5f9',
                  }}
                >
                  {row.bannerStatus.status === 'active'
                    ? 'Active (0d)'
                    : row.bannerStatus.status === 'upcoming'
                      ? `${row.daysSinceLast}d (Rerun ${row.bannerStatus.upcomingStart?.slice(5)})`
                      : `${row.daysSinceLast} days`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
