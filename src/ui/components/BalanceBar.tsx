import { formatNumber } from '../formatNumber'
import { GameState } from '../../core/GameState'
import { getGeneticsLabel } from '../../systems/geneticsSystem'

interface Props {
  state: GameState
}

export function BalanceBar({ state }: Props) {
  const g = state.genetics

  return (
    <div style={styles.container}>
      <div style={styles.top}>
        <div style={styles.balance}>
          <div>
            <div style={styles.label}>GB Coins</div>
            <div style={styles.amount}>{formatNumber(state.coins)}</div>
          </div>
          <div style={styles.diamonds}>
            <div style={styles.diamondLabel}>Алмазы</div>
            <div style={styles.diamondAmount}>💎 {state.diamonds}</div>
          </div>
        </div>
        {g && (
          <div style={styles.geneticsBadge}>
            {getGeneticsLabel(g)}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balance: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 16,
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
  diamonds: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBottom: 2,
  },
  diamondLabel: {
    color: '#888',
    fontSize: '0.6rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  diamondAmount: {
    color: '#7df9ff',
    fontSize: '1.1rem',
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
    flexShrink: 0,
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
