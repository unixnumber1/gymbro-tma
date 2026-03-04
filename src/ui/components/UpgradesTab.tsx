import { GameState } from '../../core/GameState'
import { GameAction } from '../../economy/reducer'
import { AUTO_CLICKERS_CONFIG } from '../../config/gameConfig'
import { calcAutoClickerPrice } from '../../economy/AutoClickEngine'
import { getGeneticsConfig } from '../../systems/geneticsSystem'
import { formatNumber } from '../formatNumber'

interface Props {
  state: GameState
  dispatch: (action: GameAction) => void
}

export function UpgradesTab({ state, dispatch }: Props) {
  const costMult = state.genetics ? getGeneticsConfig(state.genetics).autoClickerCostMult : 1

  return (
    <div style={styles.list}>
      {AUTO_CLICKERS_CONFIG.map(cfg => {
        const ac = state.autoClickers.find(a => a.id === cfg.id)!
        const price = calcAutoClickerPrice(cfg.id, ac.owned, costMult)
        const canAfford = state.coins >= price
        const totalIncome = cfg.incomePerSecond * ac.owned

        return (
          <button
            key={cfg.id}
            style={{
              ...styles.card,
              opacity: canAfford ? 1 : 0.5,
              borderColor: canAfford ? '#1a3060' : '#1a1a2e',
              cursor: canAfford ? 'pointer' : 'not-allowed',
            }}
            onClick={() => canAfford && dispatch({ type: 'BUY_AUTO_CLICKER', id: cfg.id })}
            disabled={!canAfford}
          >
            <span style={styles.emoji}>{cfg.emoji}</span>
            <div style={styles.info}>
              <div style={styles.name}>{cfg.name}</div>
              <div style={styles.desc}>
                {cfg.incomePerSecond} GB/сек · владеешь: <b style={{ color: '#eee' }}>{ac.owned}</b>
                {ac.owned > 0 && <span style={styles.totalInc}> (+{formatNumber(totalIncome)}/сек)</span>}
              </div>
            </div>
            <div style={styles.priceCol}>
              <span style={{ color: canAfford ? '#FFD700' : '#555', fontWeight: 800, fontSize: '0.9rem' }}>
                {formatNumber(price)}
              </span>
              <span style={styles.gbc}>GBC</span>
            </div>
          </button>
        )
      })}

      {/* Итог */}
      <div style={styles.total}>
        Суммарный авто-доход: <b style={{ color: '#FFD700' }}>{formatNumber(state.coinsPerSecond)}</b> GB/сек
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '12px 16px',
    overflowY: 'auto',
    flex: 1,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#1a1a2e',
    border: '1px solid #1a1a2e',
    borderRadius: 12,
    padding: '11px 14px',
    textAlign: 'left',
    transition: 'opacity 0.2s, border-color 0.2s',
    WebkitTapHighlightColor: 'transparent',
  },
  emoji: {
    fontSize: '1.8rem',
    lineHeight: 1,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: '#eee',
    fontWeight: 600,
    fontSize: '0.88rem',
    marginBottom: 2,
  },
  desc: {
    color: '#888',
    fontSize: '0.73rem',
  },
  totalInc: {
    color: '#6fcf6f',
  },
  priceCol: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  gbc: {
    color: '#555',
    fontSize: '0.65rem',
  },
  total: {
    marginTop: 8,
    color: '#666',
    fontSize: '0.8rem',
    textAlign: 'center',
    paddingBottom: 8,
  },
}
