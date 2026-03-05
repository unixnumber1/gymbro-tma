import { GameState } from '../../core/GameState'
import { getGeneticsLabel } from '../../systems/geneticsSystem'
import {
  STAGE_NAMES, getStageTier, TIER_NAMES,
  getAppearanceClickMult, getAppearancePassiveMult, getAppearanceCostFactor,
} from '../../systems/appearanceSystem'
import { formatNumber } from '../formatNumber'
import { PRESTIGE_POINT_MULTIPLIER, GOALS_BONUS_PER_GOAL } from '../../config/gameConfig'
import { getPumpMultiplier } from '../../systems/pumpSystem'

interface Props {
  state: GameState
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}ч ${m}м`
  if (m > 0) return `${m}м ${s}с`
  return `${s}с`
}

interface MultRow {
  icon: string
  label: string
  value: string
  highlight?: boolean
}

export function StatsTab({ state }: Props) {
  const g = state.genetics
  const now = Date.now()
  const boostActive = !!(state.activeBoost && now < state.activeBoost.endTime)
  const boostSecsLeft = boostActive
    ? Math.max(0, Math.ceil((state.activeBoost!.endTime - now) / 1000))
    : 0

  // ── Вычисляем все множители ────────────────────────────
  const prestigeMult   = 1 + state.prestigePoints * PRESTIGE_POINT_MULTIPLIER
  const genClickMult   = g ? g.clickMult : 1
  const genPassiveMult = g ? g.passiveMult : 1
  const genDiscount    = g ? g.upgradeDiscount : 1
  const appClickMult   = getAppearanceClickMult(state.appearanceStage)
  const appPassiveMult = getAppearancePassiveMult(state.appearanceStage)
  const appCostFactor  = getAppearanceCostFactor(state.appearanceStage)
  const appDiscount    = Math.round((1 - appCostFactor) * 100)
  const goalsMult      = 1 + state.completedGoals.length * GOALS_BONUS_PER_GOAL
  const goalsBonus     = Math.round(state.completedGoals.length * GOALS_BONUS_PER_GOAL * 100)
  const pumpMult       = getPumpMultiplier(state.pumpActive)
  const shopClickActive  = state.shopClickBoostEndTime > now
  const shopPassiveActive = state.shopPassiveBoostEndTime > now
  const shopClickSecsLeft  = shopClickActive ? Math.max(0, Math.ceil((state.shopClickBoostEndTime - now) / 1000)) : 0
  const shopPassiveSecsLeft = shopPassiveActive ? Math.max(0, Math.ceil((state.shopPassiveBoostEndTime - now) / 1000)) : 0
  const permClickPct   = Math.round(state.permanentClickBonus * 100)
  const permPassivePct = Math.round(state.permanentPassiveBonus * 100)

  const totalClickMult = (
    1 * prestigeMult * genClickMult * appClickMult * goalsMult * pumpMult
    * (boostActive ? 2 : 1) * (shopClickActive ? 2 : 1) * (1 + state.permanentClickBonus)
  ).toFixed(2)
  const totalPassiveMult = (
    1 * prestigeMult * genPassiveMult * appPassiveMult * goalsMult
    * (shopPassiveActive ? 2 : 1) * (1 + state.permanentPassiveBonus)
  ).toFixed(2)

  const multipliers: MultRow[] = [
    {
      icon: '⭐',
      label: `Престиж (${state.prestigePoints} очков)`,
      value: `×${prestigeMult.toFixed(2)}`,
      highlight: prestigeMult > 1,
    },
    {
      icon: '🧬',
      label: 'Генетика — клик',
      value: `×${genClickMult.toFixed(1)}`,
      highlight: genClickMult !== 1,
    },
    {
      icon: '🧬',
      label: 'Генетика — пассив',
      value: `×${genPassiveMult.toFixed(1)}`,
      highlight: genPassiveMult !== 1,
    },
    {
      icon: '💰',
      label: 'Генетика — скидка',
      value: `×${genDiscount.toFixed(1)}`,
      highlight: genDiscount !== 1,
    },
    {
      icon: '👊',
      label: 'Внешка — клик (аксессуары)',
      value: `×${appClickMult.toFixed(2)}`,
      highlight: appClickMult > 1,
    },
    {
      icon: '🎽',
      label: 'Внешка — пассив (причёска)',
      value: `×${appPassiveMult.toFixed(2)}`,
      highlight: appPassiveMult > 1,
    },
    {
      icon: '💸',
      label: 'Внешка — скидка (одежда)',
      value: `-${appDiscount}%`,
      highlight: appDiscount > 0,
    },
    {
      icon: '🎯',
      label: `Цели (${state.completedGoals.length} выполнено)`,
      value: `+${goalsBonus}%`,
      highlight: goalsBonus > 0,
    },
    ...(state.pumpActive ? [{
      icon: '🔥',
      label: 'Pump Mode',
      value: `×${pumpMult.toFixed(1)}`,
      highlight: true,
    }] : []),
    ...(shopClickActive ? [{
      icon: '⚡',
      label: `Буст кликов x2 (магазин, ${shopClickSecsLeft}с)`,
      value: '×2.0',
      highlight: true,
    }] : []),
    ...(shopPassiveActive ? [{
      icon: '🤖',
      label: `Буст пассива x2 (магазин, ${shopPassiveSecsLeft}с)`,
      value: '×2.0',
      highlight: true,
    }] : []),
    ...(permClickPct > 0 ? [{
      icon: '👊',
      label: 'Пост. бонус кликов (магазин)',
      value: `+${permClickPct}%`,
      highlight: true,
    }] : []),
    ...(permPassivePct > 0 ? [{
      icon: '📈',
      label: 'Пост. бонус пассива (магазин)',
      value: `+${permPassivePct}%`,
      highlight: true,
    }] : []),
    ...(boostActive ? [{
      icon: '⚡',
      label: `Буст ×2 (${boostSecsLeft}с)`,
      value: '×2.0',
      highlight: true,
    }] : []),
    {
      icon: '👆',
      label: 'Итоговый множитель клика',
      value: `×${totalClickMult}`,
      highlight: true,
    },
    {
      icon: '🕐',
      label: 'Итоговый множитель пассива',
      value: `×${totalPassiveMult}`,
      highlight: true,
    },
  ]

  const tier = getStageTier(state.appearanceStage)

  const statsRows: [string, string][] = [
    ['Монет сейчас', formatNumber(state.coins)],
    ['Алмазов', `💎 ${state.diamonds}`],
    ['Всего заработано', formatNumber(state.totalCoinsEarned)],
    ['За клик', formatNumber(state.currentClickIncome)],
    ['GB/сек (авто)', formatNumber(state.coinsPerSecond)],
    ['Всего кликов', formatNumber(state.totalClicks)],
    ['Стадия тела', `${state.appearanceStage + 1}/30 (${STAGE_NAMES[state.appearanceStage]})`],
    ['Тир', TIER_NAMES[tier]],
    ['Генетика', g ? getGeneticsLabel(g) : '—'],
    ['Очки престижа', String(state.prestigePoints)],
    ['Всего престижей', String(state.totalPrestiges)],
    ['Время в игре', formatTime(state.totalPlayTime)],
  ]

  return (
    <div style={styles.container}>

      {/* Pump статус */}
      <div style={styles.pumpCard}>
        <div style={{ color: state.pumpActive ? '#ff8800' : '#555', fontWeight: 700, fontSize: '0.82rem' }}>
          {state.pumpActive ? '🔥 PUMP активен!' : '⚡ Pump Mode'}
        </div>
        <div style={styles.pumpMeterVis}>
          <div style={{
            height: '100%',
            width: `${state.pumpMeter * 100}%`,
            background: state.pumpActive
              ? 'linear-gradient(90deg, #ff4400, #ff8800)'
              : 'linear-gradient(90deg, #0066ff, #00aaff)',
            borderRadius: 4,
            transition: 'width 0.1s linear',
          }} />
        </div>
      </div>

      {/* Активные множители */}
      <div style={styles.sectionTitle}>Активные множители</div>
      <div style={styles.multCard}>
        {multipliers.map((m, i) => (
          <div key={i} style={{
            ...styles.multRow,
            borderBottom: i < multipliers.length - 1 ? '1px solid #111228' : 'none',
          }}>
            <span style={styles.multIcon}>{m.icon}</span>
            <span style={styles.multLabel}>{m.label}</span>
            <span style={{
              ...styles.multValue,
              color: m.highlight ? '#FFD700' : '#555',
              fontWeight: m.label.startsWith('Итоговый') ? 800 : 600,
            }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Общая статистика */}
      <div style={styles.sectionTitle}>Статистика</div>
      <div style={styles.table}>
        {statsRows.map(([label, value]) => (
          <div key={label} style={styles.row}>
            <span style={styles.label}>{label}</span>
            <span style={styles.value}>{value}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '10px 14px',
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sectionTitle: {
    color: '#555',
    fontSize: '0.67rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 4,
  },
  pumpCard: {
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 11,
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    flexShrink: 0,
  },
  pumpMeterVis: {
    height: 7,
    background: '#0a0a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  multCard: {
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 11,
    overflow: 'hidden',
    flexShrink: 0,
  },
  multRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 12px',
  },
  multIcon: {
    fontSize: '0.9rem',
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  multLabel: {
    flex: 1,
    color: '#888',
    fontSize: '0.76rem',
  },
  multValue: {
    fontVariantNumeric: 'tabular-nums',
    fontSize: '0.82rem',
    flexShrink: 0,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 11,
    overflow: 'hidden',
    marginBottom: 8,
    flexShrink: 0,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '7px 14px',
    borderBottom: '1px solid #111228',
  },
  label: {
    color: '#888',
    fontSize: '0.78rem',
  },
  value: {
    color: '#eee',
    fontWeight: 600,
    fontSize: '0.78rem',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    maxWidth: '55%',
  },
}
