import { GameState } from '../../core/GameState'
import { ACHIEVEMENTS, getCompletedLevel, TIER_COLORS, AchievementDef } from '../../systems/achievementsSystem'
import { formatNumber } from '../formatNumber'

interface Props {
  state: GameState
}

function ProgressBar({ fraction }: { fraction: number }) {
  return (
    <div style={{ height: 5, background: '#0a0a1a', borderRadius: 3, overflow: 'hidden', margin: '5px 0' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(1, fraction) * 100}%`,
        background: 'linear-gradient(90deg, #0066ff, #00aaff)',
        borderRadius: 3,
        transition: 'width 0.3s',
      }} />
    </div>
  )
}

function AchievementCard({ ach, state }: { ach: AchievementDef; state: GameState }) {
  const currentLevel = getCompletedLevel(ach, state)
  const currentVal = ach.getValue(state)
  const nextLevel = ach.levels[currentLevel]
  const maxed = currentLevel >= ach.levels.length
  const totalDiamonds = ach.levels.slice(0, currentLevel).reduce((s, l) => s + l.diamonds, 0)

  const fraction = nextLevel ? Math.min(1, currentVal / nextLevel.threshold) : 1

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>{ach.icon}</span>
        <div style={styles.cardTitle}>
          <span style={styles.achName}>{ach.name}</span>
          <span style={styles.category}>{ach.categoryIcon} {ach.category}</span>
        </div>
        {totalDiamonds > 0 && (
          <span style={styles.earnedBadge}>+{totalDiamonds} 💎</span>
        )}
      </div>

      {!maxed ? (
        <>
          <div style={styles.progressLabel}>
            <span style={styles.progressVal}>{formatNumber(currentVal)}</span>
            <span style={styles.progressSep}>/</span>
            <span style={styles.progressNext}>{formatNumber(nextLevel.threshold)}</span>
            <span style={styles.progressLvLabel}>{nextLevel.label}</span>
          </div>
          <ProgressBar fraction={fraction} />
        </>
      ) : (
        <div style={styles.maxedRow}>Максимальный уровень! 🎉</div>
      )}

      <div style={styles.levels}>
        {ach.levels.map((lvl, i) => {
          const done = i < currentLevel
          const isCurrent = i === currentLevel
          return (
            <div
              key={i}
              style={{
                ...styles.levelBadge,
                borderColor: done ? TIER_COLORS[lvl.tier] : isCurrent ? TIER_COLORS[lvl.tier] + '55' : '#222',
                background: done ? TIER_COLORS[lvl.tier] + '22' : '#0a0a1a',
                opacity: done || isCurrent ? 1 : 0.4,
              }}
            >
              <span style={{ color: done ? TIER_COLORS[lvl.tier] : isCurrent ? TIER_COLORS[lvl.tier] : '#555', fontSize: '0.6rem', fontWeight: 800 }}>
                {done ? '✓' : isCurrent ? '▶' : '○'}
              </span>
              <span style={{ color: done ? TIER_COLORS[lvl.tier] : '#666', fontSize: '0.58rem', fontWeight: 700 }}>
                +{lvl.diamonds}💎
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AchievementsTab({ state }: Props) {
  const totalDiamonds = state.diamonds
  const totalPossible = ACHIEVEMENTS.reduce((s, a) => s + a.levels.reduce((ls, l) => ls + l.diamonds, 0), 0)
  const earned = ACHIEVEMENTS.reduce((s, a) => {
    const lvl = getCompletedLevel(a, state)
    return s + a.levels.slice(0, lvl).reduce((ls, l) => ls + l.diamonds, 0)
  }, 0)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Достижения</span>
        <span style={styles.headerDiamonds}>💎 {totalDiamonds} | Собрано: {earned}/{totalPossible}</span>
      </div>

      {ACHIEVEMENTS.map(ach => (
        <AchievementCard key={ach.id} ach={ach} state={state} />
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '10px 14px',
    overflowY: 'auto',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    color: '#666',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  headerDiamonds: {
    color: '#7df9ff',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  card: {
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 12,
    padding: '11px 13px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flexShrink: 0,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  cardIcon: {
    fontSize: '1.4rem',
    lineHeight: 1,
    width: 28,
    textAlign: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  achName: {
    color: '#eee',
    fontSize: '0.88rem',
    fontWeight: 700,
  },
  category: {
    color: '#666',
    fontSize: '0.65rem',
    fontWeight: 600,
  },
  earnedBadge: {
    color: '#7df9ff',
    fontSize: '0.72rem',
    fontWeight: 800,
    background: '#0a1a20',
    border: '1px solid #2a4a50',
    borderRadius: 6,
    padding: '2px 7px',
    flexShrink: 0,
  },
  progressLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  progressVal: {
    color: '#eee',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  progressSep: {
    color: '#444',
    fontSize: '0.72rem',
  },
  progressNext: {
    color: '#888',
    fontSize: '0.72rem',
    fontVariantNumeric: 'tabular-nums',
  },
  progressLvLabel: {
    color: '#555',
    fontSize: '0.65rem',
    marginLeft: 2,
  },
  maxedRow: {
    color: '#FFD700',
    fontSize: '0.75rem',
    fontWeight: 700,
    textAlign: 'center',
    padding: '4px 0',
  },
  levels: {
    display: 'flex',
    gap: 5,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    border: '1px solid',
    borderRadius: 5,
    padding: '2px 6px',
  },
}
