import { useState } from 'react'
import { GameState } from '../../core/GameState'
import { GameAction } from '../../economy/reducer'
import { SHOP_ITEMS, formatBoostTime, ShopItem } from '../../systems/shopSystem'
import { rollGenetics, getGeneticsLabel, GeneticsStats } from '../../systems/geneticsSystem'

interface Props {
  state: GameState
  dispatch: (action: GameAction) => void
}

function RerollModal({
  options,
  onPick,
  onClose,
}: {
  options: GeneticsStats[]
  onPick: (g: GeneticsStats) => void
  onClose: () => void
}) {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.box}>
        <div style={modalStyles.title}>🎲 Выбери генетику</div>
        <div style={modalStyles.subtitle}>Выбери один из трёх вариантов</div>
        {options.map((g, i) => (
          <button
            key={i}
            style={modalStyles.optionBtn}
            onClick={() => onPick(g)}
          >
            <div style={modalStyles.optionLabel}>{getGeneticsLabel(g)}</div>
            <div style={modalStyles.optionStats}>
              <span style={{ color: g.clickMult >= 1 ? '#6fcf6f' : '#e88' }}>👊 x{g.clickMult.toFixed(1)}</span>
              <span style={{ color: g.passiveMult >= 1 ? '#6fcf6f' : '#e88' }}>🕐 x{g.passiveMult.toFixed(1)}</span>
              <span style={{ color: g.upgradeDiscount >= 1 ? '#6fcf6f' : '#e88' }}>💰 x{g.upgradeDiscount.toFixed(1)}</span>
            </div>
          </button>
        ))}
        <button style={modalStyles.cancelBtn} onClick={onClose}>Отмена</button>
      </div>
    </div>
  )
}

export function ShopTab({ state, dispatch }: Props) {
  const [rerollOptions, setRerollOptions] = useState<GeneticsStats[] | null>(null)
  const now = Date.now()

  const clickBoostActive = state.shopClickBoostEndTime > now
  const passiveBoostActive = state.shopPassiveBoostEndTime > now
  const hasActiveBoosts = clickBoostActive || passiveBoostActive

  function handleBuy(item: ShopItem) {
    if (item.type === 'genetics_reroll') {
      if (state.diamonds < 25) return
      setRerollOptions([rollGenetics(), rollGenetics(), rollGenetics()])
      return
    }
    dispatch({ type: 'BUY_SHOP_ITEM', itemId: item.id })
  }

  function handlePickGenetics(g: GeneticsStats) {
    dispatch({ type: 'BUY_GENETICS_REROLL', genetics: g })
    setRerollOptions(null)
  }

  function getBuyLabel(item: ShopItem): string {
    if (item.type === 'skin') {
      if (state.ownedSkins.includes(item.id)) {
        return state.activeSkin === item.id ? 'Активно' : 'Надеть'
      }
    }
    return `${item.cost} 💎`
  }

  function canAfford(item: ShopItem): boolean {
    if (item.type === 'skin' && state.ownedSkins.includes(item.id)) return true
    return state.diamonds >= item.cost
  }

  const permClickCount = Math.round(state.permanentClickBonus / 0.1)
  const permPassiveCount = Math.round(state.permanentPassiveBonus / 0.1)

  return (
    <div style={styles.container}>
      {/* Active boosts */}
      {hasActiveBoosts && (
        <div style={styles.activeBoostsCard}>
          <div style={styles.sectionLabel}>Активные бусты</div>
          {clickBoostActive && (
            <div style={styles.activeBoostRow}>
              <span>⚡ Буст кликов x2</span>
              <span style={styles.boostTimer}>{formatBoostTime(state.shopClickBoostEndTime)}</span>
            </div>
          )}
          {passiveBoostActive && (
            <div style={styles.activeBoostRow}>
              <span>🤖 Буст автодохода x2</span>
              <span style={styles.boostTimer}>{formatBoostTime(state.shopPassiveBoostEndTime)}</span>
            </div>
          )}
        </div>
      )}

      {/* Permanent bonuses summary */}
      {(state.permanentClickBonus > 0 || state.permanentPassiveBonus > 0) && (
        <div style={styles.permsCard}>
          <div style={styles.sectionLabel}>Постоянные бонусы</div>
          {state.permanentClickBonus > 0 && (
            <div style={styles.permRow}>
              <span style={styles.permLabel}>👊 Бонус кликов</span>
              <span style={styles.permVal}>+{Math.round(state.permanentClickBonus * 100)}% ({permClickCount}x)</span>
            </div>
          )}
          {state.permanentPassiveBonus > 0 && (
            <div style={styles.permRow}>
              <span style={styles.permLabel}>📈 Бонус автодохода</span>
              <span style={styles.permVal}>+{Math.round(state.permanentPassiveBonus * 100)}% ({permPassiveCount}x)</span>
            </div>
          )}
        </div>
      )}

      <div style={styles.sectionLabel}>Магазин</div>

      {SHOP_ITEMS.map(item => {
        const owned = item.type === 'skin' && state.ownedSkins.includes(item.id)
        const active = item.type === 'skin' && state.activeSkin === item.id
        const affordable = canAfford(item)
        const label = getBuyLabel(item)

        return (
          <div
            key={item.id}
            style={{
              ...styles.itemCard,
              borderColor: active ? '#FFD700' : owned ? '#2a4a20' : affordable ? '#1a2a4a' : '#1a1a2e',
              background: active ? '#1e1a08' : owned ? '#0a1a0a' : '#1a1a2e',
            }}
          >
            <span style={styles.itemIcon}>{item.icon}</span>
            <div style={styles.itemInfo}>
              <div style={styles.itemLabel}>{item.label}</div>
              <div style={styles.itemDesc}>{item.desc}</div>
            </div>
            <button
              style={{
                ...styles.buyBtn,
                opacity: affordable ? 1 : 0.35,
                background: active ? 'linear-gradient(135deg, #3a2a00, #6a5000)'
                  : owned ? 'linear-gradient(135deg, #0a2a0a, #1a4a1a)'
                  : 'linear-gradient(135deg, #0a1a3a, #1a2a6a)',
                borderColor: active ? '#aa8800' : owned ? '#2a7a2a' : '#2a3a8a',
                cursor: affordable ? 'pointer' : 'not-allowed',
              }}
              onClick={() => affordable && handleBuy(item)}
              disabled={!affordable}
            >
              {active ? '✓ Активно' : label}
            </button>
          </div>
        )
      })}

      {/* Boost timer note */}
      <div style={styles.note}>
        Бусты суммируются: если купить ещё раз, время добавится к текущему
      </div>

      {rerollOptions && (
        <RerollModal
          options={rerollOptions}
          onPick={handlePickGenetics}
          onClose={() => setRerollOptions(null)}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    padding: '10px 14px',
    overflowY: 'auto',
    flex: 1,
  },
  sectionLabel: {
    color: '#555',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    flexShrink: 0,
  },
  activeBoostsCard: {
    background: '#0f1a0f',
    border: '1px solid #1a3a1a',
    borderRadius: 10,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flexShrink: 0,
  },
  activeBoostRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#6fcf6f',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  boostTimer: {
    color: '#FFD700',
    fontVariantNumeric: 'tabular-nums',
    fontSize: '0.82rem',
    fontWeight: 800,
  },
  permsCard: {
    background: '#0f0f20',
    border: '1px solid #1a1a4a',
    borderRadius: 10,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flexShrink: 0,
  },
  permRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permLabel: {
    color: '#888',
    fontSize: '0.78rem',
  },
  permVal: {
    color: '#7df9ff',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#1a1a2e',
    border: '1px solid #1a1a2e',
    borderRadius: 11,
    padding: '9px 12px',
    transition: 'background 0.2s, border-color 0.2s',
    flexShrink: 0,
  },
  itemIcon: {
    fontSize: '1.5rem',
    lineHeight: 1,
    flexShrink: 0,
    width: 30,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemLabel: {
    color: '#eee',
    fontSize: '0.83rem',
    fontWeight: 700,
    marginBottom: 2,
  },
  itemDesc: {
    color: '#777',
    fontSize: '0.68rem',
  },
  buyBtn: {
    flexShrink: 0,
    padding: '6px 10px',
    border: '1px solid',
    borderRadius: 8,
    color: '#eee',
    fontWeight: 800,
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    WebkitTapHighlightColor: 'transparent',
    whiteSpace: 'nowrap',
  },
  note: {
    color: '#444',
    fontSize: '0.65rem',
    textAlign: 'center',
    padding: '4px 8px',
    flexShrink: 0,
  },
}

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  box: {
    background: '#1a1a2e',
    border: '1px solid #2a2a5e',
    borderRadius: 16,
    padding: '20px 16px',
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  title: {
    color: '#FFD700',
    fontSize: '1.1rem',
    fontWeight: 800,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: '0.78rem',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionBtn: {
    background: '#0f0f1a',
    border: '1px solid #2a2a5e',
    borderRadius: 12,
    padding: '12px 14px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    WebkitTapHighlightColor: 'transparent',
    transition: 'border-color 0.15s',
  },
  optionLabel: {
    color: '#eee',
    fontSize: '0.88rem',
    fontWeight: 700,
    textAlign: 'left',
  },
  optionStats: {
    display: 'flex',
    gap: 12,
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#666',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '0.83rem',
    fontWeight: 600,
    marginTop: 4,
    WebkitTapHighlightColor: 'transparent',
  },
}
