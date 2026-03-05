import { GameState } from '../../core/GameState'
import { GOALS } from '../../systems/goalsSystem'
import { GOALS_BONUS_PER_GOAL } from '../../config/gameConfig'

interface Props {
  state: GameState
}

export function GoalsTab({ state }: Props) {
  const totalBonus = state.completedGoals.length * GOALS_BONUS_PER_GOAL

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Цели</span>
        <span style={styles.headerBonus}>
          Бонус: +{Math.round(totalBonus * 100)}% к доходу
        </span>
      </div>

      {GOALS.map(goal => {
        const done = state.completedGoals.includes(goal.id)
        const progress = goal.check(state)
        return (
          <div
            key={goal.id}
            style={{
              ...styles.card,
              borderColor: done ? '#27ae6088' : progress ? '#FFD70044' : '#1a1a3e',
              background: done ? '#0a1a0a' : '#1a1a2e',
            }}
          >
            <div style={styles.emoji}>{done ? '✅' : goal.emoji}</div>
            <div style={styles.info}>
              <div style={{ ...styles.title, color: done ? '#6fcf6f' : '#eee' }}>
                {goal.title}
              </div>
              <div style={styles.desc}>{goal.description}</div>
              <div style={{ ...styles.bonus, color: done ? '#6fcf6f' : '#888' }}>
                {goal.bonusDesc}
              </div>
            </div>
            {done && <div style={styles.doneTag}>ГОТОВО</div>}
          </div>
        )
      })}

      {state.completedGoals.length === GOALS.length && (
        <div style={styles.allDone}>
          🏆 Все цели выполнены! Максимальный бонус: +{Math.round(totalBonus * 100)}%
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 16px',
    overflowY: 'auto',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#666',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  headerBonus: {
    color: '#FFD700',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 12,
    padding: '12px 14px',
    transition: 'background 0.3s, border-color 0.3s',
  },
  emoji: {
    fontSize: '1.6rem',
    lineHeight: 1,
    flexShrink: 0,
    width: 32,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  title: {
    fontWeight: 700,
    fontSize: '0.88rem',
  },
  desc: {
    color: '#888',
    fontSize: '0.73rem',
  },
  bonus: {
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  doneTag: {
    background: '#27ae60',
    color: '#fff',
    fontSize: '0.6rem',
    fontWeight: 800,
    padding: '3px 7px',
    borderRadius: 6,
    flexShrink: 0,
    letterSpacing: '0.05em',
  },
  allDone: {
    textAlign: 'center',
    color: '#FFD700',
    fontWeight: 700,
    fontSize: '0.9rem',
    padding: '12px 8px',
    background: '#1e1a08',
    borderRadius: 12,
    border: '1px solid #5a4000',
    marginTop: 4,
  },
}
