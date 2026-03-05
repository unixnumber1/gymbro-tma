import { GameState } from '../../core/GameState'
import { GameAction } from '../../economy/reducer'
import { AUTO_CLICKERS_CONFIG } from '../../config/gameConfig'
import { calcAutoClickerPrice } from '../../economy/AutoClickEngine'
import { formatNumber } from '../formatNumber'

interface Props {
  state: GameState
  dispatch: (action: GameAction) => void
}

function levelLabel(owned: number): { text: string; color: string } {
  if (owned === 0) return { text: '', color: '#555' }
  if (owned === 1) return { text: 'Lv.1', color: '#4a9' }
  if (owned === 2) return { text: 'Lv.2', color: '#FFD700' }
  return { text: `Lv.${owned}`, color: '#ff8800' }
}

export function UpgradesTab({ state, dispatch }: Props) {
  return (
    <div style={styles.list}>
      {AUTO_CLICKERS_CONFIG.map(cfg => {
        const ac = state.autoClickers.find(a => a.id === cfg.id)!
        const price = calcAutoClickerPrice(cfg.id, ac.owned, state.genetics, state.appearanceStage)
        const canAfford = state.coins >= price
        const totalIncome = cfg.incomePerSecond * ac.owned
        const lv = levelLabel(ac.owned)

        return (
          <button
            key={cfg.id}
            style={{
              ...styles.card,
              opacity: canAfford ? 1 : 0.55,
              borderColor: canAfford ? '#1a3060' : '#1a1a2e',
              cursor: canAfford ? 'pointer' : 'not-allowed',
            }}
            onClick={() => canAfford && dispatch({ type: 'BUY_AUTO_CLICKER', id: cfg.id })}
            disabled={!canAfford}
          >
            <span style={styles.emoji}>{cfg.emoji}</span>
            <div style={styles.info}>
              <div style={styles.nameRow}>
                <span style={styles.name}>{cfg.name}</span>
                {ac.owned > 0 && (
                  <span style={{ ...styles.lvBadge, color: lv.color, borderColor: lv.color + '55' }}>
                    {lv.text}
                  </span>
                )}
              </div>
              <div style={styles.desc}>
                {formatNumber(cfg.incomePerSecond)} GB/сек
                {ac.owned > 0 && (
                  <span style={styles.totalInc}> · итого: {formatNumber(totalIncome)}/сек</span>
                )}
              </div>
            </div>
            <div style={styles.priceCol}>
              <span style={{ color: canAfford ? '#FFD700' : '#555', fontWeight: 800, fontSize: '0.88rem' }}>
                {formatNumber(price)}
              </span>
              <span style={styles.gbc}>GBC</span>
            </div>
          </button>
        )
      })}

      <div style={styles.total}>
        Авто-доход: <b style={{ color: '#FFD700' }}>{formatNumber(state.coinsPerSecond)}</b> GB/сек
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    padding: '10px 14px',
    overflowY: 'auto',
    flex: 1,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#1a1a2e',
    border: '1px solid #1a1a2e',
    borderRadius: 11,
    padding: '9px 12px',
    textAlign: 'left',
    transition: 'opacity 0.2s, border-color 0.2s',
    WebkitTapHighlightColor: 'transparent',
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
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    color: '#eee',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  lvBadge: {
    fontSize: '0.6rem',
    fontWeight: 800,
    border: '1px solid',
    borderRadius: 4,
    padding: '1px 5px',
    letterSpacing: '0.04em',
  },
  desc: {
    color: '#888',
    fontSize: '0.7rem',
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
    fontSize: '0.62rem',
  },
  total: {
    marginTop: 6,
    color: '#666',
    fontSize: '0.78rem',
    textAlign: 'center',
    paddingBottom: 8,
  },
}
