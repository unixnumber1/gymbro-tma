import { GameState } from '../../core/GameState'
import { GameAction } from '../../economy/reducer'
import {
  STAGE_COUNT, STAGE_NAMES, TIER_NAMES, getStageTier, getStageCost,
  getAppearanceClickMult, getAppearancePassiveMult, getAppearanceCostFactor,
} from '../../systems/appearanceSystem'
import { formatNumber } from '../formatNumber'

interface Props {
  state: GameState
  dispatch: (action: GameAction) => void
}

const TIER_COLORS = ['#4a6fa5', '#27ae60', '#e74c3c', '#9b59b6', '#f39c12', '#c0392b']

export function AppearanceTab({ state, dispatch }: Props) {
  const nextStage = state.appearanceStage + 1
  const isMaxed = nextStage >= STAGE_COUNT
  const nextCost = isMaxed ? 0 : getStageCost(nextStage, 1)
  const canAfford = !isMaxed && state.coins >= nextCost
  const currentTier = getStageTier(state.appearanceStage)

  const clickMult  = getAppearanceClickMult(state.appearanceStage).toFixed(2)
  const passiveMult = getAppearancePassiveMult(state.appearanceStage).toFixed(2)
  const discount = Math.round((1 - getAppearanceCostFactor(state.appearanceStage)) * 100)

  const nextClickMult  = isMaxed ? '—' : getAppearanceClickMult(nextStage).toFixed(2)
  const nextPassiveMult = isMaxed ? '—' : getAppearancePassiveMult(nextStage).toFixed(2)
  const nextDiscount = isMaxed ? 0 : Math.round((1 - getAppearanceCostFactor(nextStage)) * 100)

  return (
    <div style={styles.container}>
      {/* Текущая стадия */}
      <div style={{ ...styles.currentCard, borderColor: TIER_COLORS[currentTier] + '88' }}>
        <div style={styles.currentLeft}>
          <div style={{ color: TIER_COLORS[currentTier], fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {TIER_NAMES[currentTier]}
          </div>
          <div style={styles.currentName}>{STAGE_NAMES[state.appearanceStage]}</div>
          <div style={styles.currentSub}>Стадия {state.appearanceStage + 1} / {STAGE_COUNT}</div>
        </div>
        <div style={styles.bonusList}>
          <div style={styles.bonusRow}>
            <span style={styles.bonusIcon}>👊</span>
            <span style={styles.bonusLabel}>Клик</span>
            <span style={styles.bonusVal}>×{clickMult}</span>
          </div>
          <div style={styles.bonusRow}>
            <span style={styles.bonusIcon}>🧬</span>
            <span style={styles.bonusLabel}>Пассив</span>
            <span style={styles.bonusVal}>×{passiveMult}</span>
          </div>
          <div style={styles.bonusRow}>
            <span style={styles.bonusIcon}>💰</span>
            <span style={styles.bonusLabel}>Скидка</span>
            <span style={styles.bonusVal}>{discount}%</span>
          </div>
        </div>
      </div>

      {/* Кнопка прокачки */}
      {!isMaxed && (
        <button
          style={{
            ...styles.upgradeBtn,
            opacity: canAfford ? 1 : 0.5,
            cursor: canAfford ? 'pointer' : 'not-allowed',
            borderColor: canAfford ? TIER_COLORS[getStageTier(nextStage)] : '#333',
          }}
          onClick={() => canAfford && dispatch({ type: 'BUY_APPEARANCE' })}
          disabled={!canAfford}
        >
          <div style={styles.upgradeBtnLeft}>
            <div style={styles.upgradeBtnTitle}>↑ {STAGE_NAMES[nextStage]}</div>
            <div style={styles.upgradeBtnSub}>
              👊×{nextClickMult} · 🧬×{nextPassiveMult} · 💰{nextDiscount}%
            </div>
          </div>
          <div style={{ color: canAfford ? '#FFD700' : '#666', fontWeight: 800, fontSize: '0.95rem' }}>
            {formatNumber(nextCost)}
            <span style={{ fontSize: '0.7rem', color: '#888' }}> GBC</span>
          </div>
        </button>
      )}

      {isMaxed && (
        <div style={styles.maxed}>🏆 Максимальная стадия достигнута!</div>
      )}

      {/* Список всех стадий */}
      <div style={styles.stageListTitle}>Все стадии</div>
      <div style={styles.stageList}>
        {Array.from({ length: STAGE_COUNT }).map((_, i) => {
          const isOwned = i <= state.appearanceStage
          const isCurrent = i === state.appearanceStage
          const tier = getStageTier(i)
          const cost = getStageCost(i, 1)
          return (
            <div
              key={i}
              style={{
                ...styles.stageRow,
                borderLeft: `3px solid ${isOwned ? TIER_COLORS[tier] : '#222'}`,
                background: isCurrent ? '#1a1a2e' : 'transparent',
                opacity: i > state.appearanceStage + 3 ? 0.4 : 1,
              }}
            >
              <div style={styles.stageRowNum}>{i + 1}</div>
              <div style={styles.stageRowInfo}>
                <span style={{ color: isOwned ? '#ccc' : '#666', fontSize: '0.8rem' }}>
                  {STAGE_NAMES[i]}
                </span>
                {i % 5 === 0 && i > 0 && (
                  <span style={{ color: TIER_COLORS[tier], fontSize: '0.62rem', marginLeft: 6 }}>
                    [{TIER_NAMES[tier]}]
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: isOwned ? '#6fcf6f' : '#555', flexShrink: 0 }}>
                {isOwned ? '✓' : i === 0 ? '—' : formatNumber(cost)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '12px 16px',
    overflowY: 'auto',
    flex: 1,
  },
  currentCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: 14,
    padding: '14px 16px',
    gap: 12,
  },
  currentLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  currentName: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  currentSub: {
    color: '#666',
    fontSize: '0.72rem',
  },
  bonusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flexShrink: 0,
  },
  bonusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  bonusIcon: { fontSize: '0.8rem' },
  bonusLabel: { color: '#888', fontSize: '0.68rem', width: 38 },
  bonusVal: { color: '#FFD700', fontWeight: 700, fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums' },
  upgradeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#12121e',
    border: '1px solid #333',
    borderRadius: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'opacity 0.2s, border-color 0.2s',
    WebkitTapHighlightColor: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  upgradeBtnLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  upgradeBtnTitle: {
    color: '#eee',
    fontWeight: 700,
    fontSize: '0.88rem',
  },
  upgradeBtnSub: {
    color: '#888',
    fontSize: '0.7rem',
  },
  maxed: {
    textAlign: 'center',
    color: '#FFD700',
    fontWeight: 700,
    padding: '12px 0',
  },
  stageListTitle: {
    color: '#555',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 4,
  },
  stageList: {
    display: 'flex',
    flexDirection: 'column',
  },
  stageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '5px 10px',
    transition: 'background 0.2s',
  },
  stageRowNum: {
    color: '#555',
    fontSize: '0.68rem',
    width: 20,
    flexShrink: 0,
    textAlign: 'right',
  },
  stageRowInfo: {
    flex: 1,
    minWidth: 0,
  },
}
