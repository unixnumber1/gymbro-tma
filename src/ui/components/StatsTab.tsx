import { GameState } from '../../core/GameState'
import { GENETICS_CONFIGS } from '../../systems/geneticsSystem'
import { STAGE_NAMES, getStageTier, TIER_NAMES } from '../../systems/appearanceSystem'
import { formatNumber } from '../formatNumber'
import { PRESTIGE_POINT_MULTIPLIER } from '../../config/gameConfig'

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

export function StatsTab({ state }: Props) {
  const genetics = state.genetics ? GENETICS_CONFIGS[state.genetics] : null
  const tier = getStageTier(state.appearanceStage)
  const prestigeMult = (1 + state.prestigePoints * PRESTIGE_POINT_MULTIPLIER).toFixed(2)

  const rows: [string, string][] = [
    ['Монет сейчас', formatNumber(state.coins)],
    ['Всего заработано', formatNumber(state.totalCoinsEarned)],
    ['За клик', formatNumber(state.currentClickIncome)],
    ['GB/сек (авто)', formatNumber(state.coinsPerSecond)],
    ['Всего кликов', formatNumber(state.totalClicks)],
    ['Стадия тела', `${state.appearanceStage + 1}/30 (${STAGE_NAMES[state.appearanceStage]})`],
    ['Тир', TIER_NAMES[tier]],
    ['Мультипликатор клика', `×${Math.pow(1.15, state.appearanceStage).toFixed(2)}`],
    ['Генетика', genetics ? `${genetics.emoji} ${genetics.label}` : '—'],
    ['Очки престижа', String(state.prestigePoints)],
    ['Престиж-бонус', `×${prestigeMult}`],
    ['Всего престижей', String(state.totalPrestiges)],
    ['Время в игре', formatTime(state.totalPlayTime)],
  ]

  return (
    <div style={styles.container}>
      <div style={styles.title}>Статистика</div>

      {/* Pump статус */}
      <div style={styles.pumpCard}>
        <div style={{ color: state.pumpActive ? '#ff8800' : '#555', fontWeight: 700, fontSize: '0.85rem' }}>
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
        <div style={{ color: '#555', fontSize: '0.7rem' }}>
          Быстро тапай чтобы заполнить шкалу памп-режима
        </div>
      </div>

      <div style={styles.table}>
        {rows.map(([label, value]) => (
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
    padding: '12px 16px',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  title: {
    color: '#666',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  pumpCard: {
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  pumpMeterVis: {
    height: 8,
    background: '#0a0a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '9px 14px',
    borderBottom: '1px solid #111228',
  },
  label: {
    color: '#888',
    fontSize: '0.82rem',
  },
  value: {
    color: '#eee',
    fontWeight: 600,
    fontSize: '0.82rem',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    maxWidth: '55%',
  },
}
