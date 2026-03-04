import { formatNumber } from '../formatNumber'
import { GameState } from '../../core/GameState'
import { GENETICS_CONFIGS } from '../../systems/geneticsSystem'

interface Props {
  state: GameState
}

export function BalanceBar({ state }: Props) {
  const genetics = state.genetics ? GENETICS_CONFIGS[state.genetics] : null

  return (
    <div style={styles.container}>
      <div style={styles.top}>
        <div style={styles.balance}>
          <span style={styles.label}>GB Coins</span>
          <span style={styles.amount}>{formatNumber(state.coins)}</span>
        </div>
        {genetics && (
          <div style={styles.geneticsBadge}>
            {genetics.emoji} {genetics.label}
          </div>
        )}
      </div>
      <div style={styles.stats}>
        <span style={styles.stat}>⚡ {formatNumber(state.currentClickIncome)}/тап</span>
        <span style={styles.stat}>🕐 {formatNumber(state.coinsPerSecond)}/сек</span>
        {state.prestigePoints > 0 && (
          <span style={styles.stat}>⭐ {state.prestigePoints} очков</span>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '10px 16px 6px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    borderBottom: '1px solid #0f3460',
    flexShrink: 0,
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balance: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  label: {
    color: '#888',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  amount: {
    color: '#FFD700',
    fontSize: '1.7rem',
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  geneticsBadge: {
    color: '#aaa',
    fontSize: '0.72rem',
    fontWeight: 600,
    background: '#1a1a3a',
    padding: '3px 8px',
    borderRadius: 6,
    border: '1px solid #2a2a4a',
  },
  stats: {
    display: 'flex',
    gap: 14,
  },
  stat: {
    color: '#aaa',
    fontSize: '0.75rem',
  },
}
