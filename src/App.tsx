import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Check, Pin, Play, RotateCcw, Search, Sparkles, Swords, Users } from 'lucide-react';
import { CharacterAvatar } from './components/CharacterAvatar';
import { RerunTracker } from './components/RerunTracker';
import { loadCharacters } from './lib/csvParser';
import { generateEndgameMatrixTeams } from './lib/teamBuilder';
import type {
  Character,
  ElementType,
  RoleType,
  TeamRecommendation,
} from './types';

const STORAGE_KEY = 'wuwa_owned_characters_v2';

const ELEMENTS: Array<ElementType | 'All'> = ['All', 'Fusion', 'Glacio', 'Electro', 'Aero', 'Spectro', 'Havoc'];
const ROLES: Array<RoleType | 'All'> = ['All', 'Main DPS', 'Sub-DPS / Hybrid', 'Support / Healer'];

function getBaseCharacterKey(id: string): { key: string; label: string } {
  if (id.startsWith('rover_')) return { key: 'rover', label: 'Rover (All Elements)' };
  if (id.startsWith('aemeath_')) return { key: 'aemeath', label: 'Aemeath (All Modes)' };
  if (id.startsWith('denia_')) return { key: 'denia', label: 'Denia (All Modes)' };
  if (id.startsWith('lucilla_')) return { key: 'lucilla', label: 'Lucilla (All Modes)' };
  if (id.startsWith('hsin_')) return { key: 'hsin', label: 'Hsin (All Modes)' };
  if (id.startsWith('lynae_')) return { key: 'lynae', label: 'Lynae (All Modes)' };
  return { key: id, label: '' };
}

export function App() {
  const allCharacters = useMemo(() => loadCharacters(), []);

  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {
      // ignore storage errors
    }
    return new Set(
      allCharacters
        .filter((c) => c.rarity === 4 || c.id.startsWith('rover_'))
        .map((c) => c.id)
    );
  });

  const [page, setPage] = useState<'builder' | 'reruns'>('builder');
  const [search, setSearch] = useState('');
  const [elementFilter, setElementFilter] = useState<ElementType | 'All'>('All');
  const [roleFilter, setRoleFilter] = useState<RoleType | 'All'>('All');
  const [rarityFilter, setRarityFilter] = useState<'All' | 5 | 4>('All');
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [emergencyResonatorId, setEmergencyResonatorId] = useState<string>('lucilla');
  const [needsRegenerate, setNeedsRegenerate] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number; inTable: boolean; tableAtStart: boolean } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    const target = e.target as HTMLElement | null;
    const tableWrap = target?.closest('.rerun-table-wrap') as HTMLElement | null;
    touchStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      inTable: Boolean(tableWrap),
      tableAtStart: tableWrap ? tableWrap.scrollLeft <= 2 : true,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.4) return;

    // Swipe right-to-left: Team Builder -> Rerun Tracker
    if (dx < -70 && page === 'builder') {
      setPage('reruns');
      return;
    }

    // Swipe left-to-right: Rerun Tracker -> Team Builder
    if (dx > 70 && page === 'reruns' && (!start.inTable || start.tableAtStart)) {
      setPage('builder');
    }
  };

  const vigorCharacterOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of allCharacters) {
      const { key, label } = getBaseCharacterKey(c.id);
      if (!map.has(key)) {
        map.set(key, label || c.name);
      }
    }
    return [...map.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allCharacters]);

  const ownedCharacters = useMemo(
    () => allCharacters.filter((c) => ownedIds.has(c.id)),
    [allCharacters, ownedIds]
  );

  const runGeneration = (
    chars: Character[],
    pinned: string | null,
    emergencyId: string
  ): TeamRecommendation[] => {
    return generateEndgameMatrixTeams(chars, {
      gameMode: 'endgame_matrix',
      bossResistances: [],
      stageBuff: 'none',
      pinnedCharacterId: pinned,
      archetypeFilter: 'All',
      emergencyResonatorId: emergencyId,
    });
  };

  const [recommendedTeams, setRecommendedTeams] = useState<TeamRecommendation[]>(() =>
    runGeneration(
      allCharacters.filter((c) => ownedIds.has(c.id)),
      null,
      'lucilla'
    )
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...ownedIds]));
    } catch {
      // ignore storage errors
    }
  }, [ownedIds]);

  const handleGenerate = () => {
    const teams = runGeneration(
      ownedCharacters,
      pinnedId,
      emergencyResonatorId
    );
    setRecommendedTeams(teams);
    setNeedsRegenerate(false);
  };

  const toggleOwned = (id: string) => {
    setOwnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (pinnedId === id) setPinnedId(null);
      } else {
        next.add(id);
      }
      return next;
    });
    setNeedsRegenerate(true);
  };

  const togglePin = (e: React.MouseEvent, char: Character) => {
    e.stopPropagation();
    if (!ownedIds.has(char.id)) {
      setOwnedIds((prev) => new Set(prev).add(char.id));
    }
    setPinnedId((prev) => (prev === char.id ? null : char.id));
    setNeedsRegenerate(true);
  };

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter((c) => {
      if (elementFilter !== 'All' && c.element !== elementFilter) return false;
      if (roleFilter !== 'All' && c.role !== roleFilter) return false;
      if (rarityFilter !== 'All' && c.rarity !== rarityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          c.name.toLowerCase().includes(q) ||
          c.primaryDamageTypes.some((d) => d.toLowerCase().includes(q)) ||
          c.mechanicsTags.some((m) => m.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [allCharacters, elementFilter, roleFilter, rarityFilter, search]);

  const pinnedChar = allCharacters.find((c) => c.id === pinnedId) ?? null;

  return (
    <div className="app-shell" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <header className="header">
        <div>
          <h1>Wuthering Waves — Smart Team Builder</h1>
          <p>
            Select your Resonators, set your Endgame Matrix Vigor Buff, then click Generate.
          </p>
          <p style={{ color: '#fcd34d', fontSize: '0.8rem', marginTop: 6 }}>
            ★ Assumptions: All 4★ Resonators are evaluated at S6 (e.g., Buling S6 grants +50% Resonance Skill DMG Bonus instead of +25% at S0–S5), and all 5★ Resonators are evaluated with their personal (signature) weapon buffs.
          </p>
          <p className="mobile-swipe-hint">
            Swipe ← for Rerun Tracker · Swipe → to return
          </p>
        </div>
        <div className="header-stats">
          <div className="btn-row">
            <button
              className={`btn ${page === 'builder' ? 'active' : ''}`}
              onClick={() => setPage('builder')}
            >
              <Swords size={14} /> Team Builder
            </button>
            <button
              className={`btn ${page === 'reruns' ? 'active' : ''}`}
              onClick={() => setPage('reruns')}
            >
              <CalendarClock size={14} /> Rerun Tracker (1.0–3.8)
            </button>
          </div>
          <span className="pill">
            <Users size={15} />
            Owned: <strong>{ownedCharacters.length}</strong> / {allCharacters.length}
          </span>
          {pinnedChar && (
            <button
              className="btn active"
              onClick={() => {
                setPinnedId(null);
                setNeedsRegenerate(true);
              }}
            >
              <Pin size={14} /> Pinned: {pinnedChar.name} ×
            </button>
          )}
        </div>
      </header>

      {page === 'reruns' ? (
        <RerunTracker allCharacters={allCharacters} />
      ) : (
        <div className="main-grid">
          {/* LEFT PANEL: MY ROSTER */}
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <Sparkles size={18} /> 1. Select Your Resonators
              </h2>
              <div className="btn-row">
                <button
                  className="btn"
                  onClick={() => {
                    setOwnedIds(new Set(allCharacters.map((c) => c.id)));
                    setNeedsRegenerate(true);
                  }}
                >
                  Select All
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setOwnedIds(new Set());
                    setPinnedId(null);
                    setNeedsRegenerate(true);
                  }}
                >
                  <RotateCcw size={13} /> Clear
                </button>
              </div>
            </div>

            <div className="filters">
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: 11, top: 11, color: '#94a3b8' }}
                />
                <input
                  className="search-input"
                  style={{ paddingLeft: 34 }}
                  placeholder="Search character, damage type, or mechanic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="filter-chips">
                {ELEMENTS.map((el) => (
                  <button
                    key={el}
                    className={`chip ${elementFilter === el ? 'active' : ''}`}
                    onClick={() => setElementFilter(el)}
                  >
                    {el}
                  </button>
                ))}
              </div>

              <div className="filter-chips">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    className={`chip ${roleFilter === role ? 'active' : ''}`}
                    onClick={() => setRoleFilter(role)}
                  >
                    {role}
                  </button>
                ))}
                {(['All', 5, 4] as const).map((r) => (
                  <button
                    key={String(r)}
                    className={`chip ${rarityFilter === r ? 'active' : ''}`}
                    onClick={() => setRarityFilter(r)}
                  >
                    {r === 'All' ? 'All ★' : `${r}★`}
                  </button>
                ))}
              </div>
            </div>

            <div className="roster-grid">
              {filteredCharacters.map((char) => {
                const owned = ownedIds.has(char.id);
                const pinned = pinnedId === char.id;
                return (
                  <div
                    key={char.id}
                    className={`char-card ${owned ? 'owned' : ''} ${pinned ? 'pinned' : ''}`}
                    onClick={() => toggleOwned(char.id)}
                    title={char.outroDescription}
                  >
                    <div className="char-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <CharacterAvatar character={char} size={42} />
                        <span className="char-name">{char.name}</span>
                      </div>
                      <span className={char.rarity === 5 ? 'rarity-5' : 'rarity-4'} style={{ fontSize: '0.75rem', flexShrink: 0 }}>
                        {char.rarity}★
                      </span>
                    </div>

                    <div className="char-meta">
                      <span className={`tag el-${char.element}`}>{char.element}</span>
                      <span className="tag">{char.role.replace(' / Hybrid', '').replace(' / Healer', '')}</span>
                      <span className="tag">{char.metaTier}</span>
                    </div>

                    <div className="char-dmg-line" style={{ fontSize: '0.71rem', color: '#94a3b8', lineHeight: 1.3 }}>
                      {char.primaryDamageTypes.slice(0, 2).join(' · ')}
                    </div>

                    <div className="char-actions">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {owned ? (
                          <>
                            <Check size={12} color="#38bdf8" /> Owned
                          </>
                        ) : (
                          'Click to own'
                        )}
                      </span>
                      <button
                        className={`pin-btn ${pinned ? 'active' : ''}`}
                        onClick={(e) => togglePin(e, char)}
                        title="Build teams around this character"
                      >
                        {pinned ? 'Pinned' : 'Pin'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* RIGHT PANEL: CONDITIONS + RECOMMENDED TEAMS */}
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <Swords size={18} /> 2. Endgame Matrix &amp; Teams
              </h2>
              <span className="pill">{recommendedTeams.length} Teams</span>
            </div>

            <div className="condition-box">
              <div>
                <div className="condition-label">Matrix Character Vigor Buff (+1 Extra Vigor)</div>
                <select
                  className="select-input"
                  value={emergencyResonatorId}
                  onChange={(e) => {
                    setEmergencyResonatorId(e.target.value);
                    setNeedsRegenerate(true);
                  }}
                >
                  <option value="">None</option>
                  {vigorCharacterOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: 4 }}>
                  Endgame Matrix: Support/Healers (incl. Mornye; excl. Rover &amp; Youhu) have 2 Vigor, plus +1 Vigor for the selected Resonator.
                </div>
              </div>

              <button className="generate-btn" onClick={handleGenerate}>
                <Play size={16} />
                {needsRegenerate ? 'Generate Recommended Teams (Changes Pending)' : 'Generate Recommended Teams'}
              </button>
            </div>

            {ownedCharacters.length < 3 ? (
              <div className="empty-state">
                Select at least <strong>3 Resonators</strong> on the left and click <strong>Generate Recommended Teams</strong>.
              </div>
            ) : recommendedTeams.length === 0 ? (
              <div className="empty-state">
                No viable teams matched your current roster or filters. Try selecting more Resonators and clicking Generate.
              </div>
            ) : (
              <div className="team-list">
                {recommendedTeams.map((team, idx) => (
                  <article key={team.id} className="team-card">
                    <div className="team-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#94a3b8' }}>#{idx + 1}</strong>
                        {team.roomLabel && (
                          <span
                            className="archetype-badge"
                            style={{
                              background: 'rgba(99, 102, 241, 0.2)',
                              color: '#c7d2fe',
                              borderColor: 'rgba(129, 140, 248, 0.45)',
                            }}
                          >
                            {team.roomLabel}
                          </span>
                        )}
                        <span className="archetype-badge">{team.archetype}</span>
                        {team.isMetaCore && (
                          <span className="score-badge" style={{ background: 'rgba(251,191,36,0.16)', color: '#fcd34d', borderColor: 'rgba(251,191,36,0.4)' }}>
                            Meta Core
                          </span>
                        )}
                      </div>
                      <span className="score-badge">Synergy {team.score}/100</span>
                    </div>

                    <div className="team-slots">
                      {team.members.map((member, slotIdx) => (
                        <div key={member.id} className="slot-box">
                          <div className="slot-label">
                            Slot {slotIdx + 1} · {member.role.split(' / ')[0]}
                          </div>
                          <div className="slot-name">{member.name}</div>
                          <div className="slot-sub">
                            <span className={`el-${member.element}`}>{member.element}</span> · {member.metaTier} · {member.weapon}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rotation-bar">
                      <strong>Rotation:</strong> {team.rotationHint}
                    </div>

                    <ul className="reasons-list">
                      {team.reasons.map((r, rIdx) => (
                        <li key={rIdx} className="reason-item">
                          <span className={`reason-dot dot-${r.type}`} />
                          <span>{r.label}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
