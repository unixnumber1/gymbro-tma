import { GameState } from '../../core/GameState'
import { GameAction } from '../../economy/reducer'
import { calcPrestigePointsGain, canPrestige } from '../../economy/PrestigeEngine'
import { PRESTIGE_MIN_COINS_EARNED, PRESTIGE_POINT_MULTIPLIER } from '../../config/gameConfig'
import { formatNumber } from '../formatNumber'

interface Props {
  state: GameState
  dispatch: (action: GameAction) => void
}

export function PrestigeTab({ state, dispatch }: Props) {
  const available = canPrestige(state.totalCoinsEarned)
  const gain = calcPrestigePointsGain(state.totalCoinsEarned)
  const newTotal = state.prestigePoints + gain
  const currentMult = (1 + state.prestigePoints * PRESTIGE_POINT_MULTIPLIER).toFixed(2)
  const newMult = (1 + newTotal * PRESTIGE_POINT_MULTIPLIER).toFixed(2)

  return (
    <div style={styles.container}>
      {/* Текущий статус */}
      <div style={styles.infoCard}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Очки престижа</span>
          <span style={styles.infoValue}>⭐ {state.prestigePoints}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Бонус к клику</span>
          <span style={styles.infoValue}>×{currentMult}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Всего престижей</span>
          <span style={styles.infoValue}>{state.totalPrestiges}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Заработано всего</span>
          <span style={styles.infoValue}>{formatNumber(state.totalCoinsEarned)}</span>
        </div>
      </div>

      {/* Формула */}
      <div style={styles.formula}>
        <div style={styles.formulaTitle}>Формула награды</div>
        <div style={styles.formulaCode}>floor( √(заработано / 5,000,000) )</div>
        <div style={styles.formulaNote}>
          Частые ранние престижи выгоднее одного позднего
        </div>
      </div>

      {/* Прогресс к порогу */}
      {!available && (
        <div style={styles.progressCard}>
          <div style={styles.progressLabel}>
            Нужно заработать: <b style={{ color: '#FFD700' }}>{formatNumber(PRESTIGE_MIN_COINS_EARNED)}</b>
          </div>
          <div style={styles.progressBar}>
            <div style={{
              height: '100%',
              width: `${Math.min(1, state.totalCoinsEarned / PRESTIGE_MIN_COINS_EARNED) * 100}%`,
              background: 'linear-gradient(90deg, #0f3460, #2255aa)',
              borderRadius: 4,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={styles.progressSub}>
            {formatNumber(state.totalCoinsEarned)} / {formatNumber(PRESTIGE_MIN_COINS_EARNED)}
          </div>
        </div>
      )}

      {/* Предпросмотр */}
      {available && (
        <div style={styles.previewCard}>
          <div style={styles.previewTitle}>При сбросе получишь:</div>
          <div style={styles.previewRow}>
            <span>Новых очков</span>
            <span style={{ color: '#FFD700', fontWeight: 700 }}>+{gain} ⭐</span>
          </div>
          <div style={styles.previewRow}>
            <span>Бонус к клику</span>
            <span style={{ color: '#6fcf6f', fontWeight: 700 }}>×{newMult}</span>
          </div>
          <div style={{ height: 1, background: '#333', margin: '4px 0' }} />
          <div style={styles.previewRow}>
            <span style={{ color: '#e88' }}>Сбросится</span>
            <span style={{ color: '#e88', fontSize: '0.78rem' }}>монеты · авто · стадия тела</span>
          </div>
          <div style={styles.previewRow}>
            <span style={{ color: '#6fcf6f' }}>Сохранится</span>
            <span style={{ color: '#6fcf6f', fontSize: '0.78rem' }}>генетика · очки · время</span>
          </div>
        </div>
      )}

      <button
        style={{
          ...styles.prestigeBtn,
          opacity: available ? 1 : 0.35,
          cursor: available ? 'pointer' : 'not-allowed',
        }}
        onClick={() => available && dispatch({ type: 'PRESTIGE' })}
        disabled={!available}
      >
        ⭐ Сброс — стать сильнее
      </button>
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
  infoCard: {
    background: '#1a1a2e',
    border: '1px solid #0f3460',
    borderRadius: 12,
    padding: '13px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  infoLabel: { color: '#888', fontSize: '0.83rem' },
  infoValue: { color: '#eee', fontWeight: 700, fontSize: '0.83rem' },
  formula: {
    background: '#101020',
    border: '1px solid #1a1a2e',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  formulaTitle: { color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
  formulaCode: { color: '#adf', fontFamily: 'monospace', fontSize: '0.82rem', background: '#0a0a18', padding: '6px 10px', borderRadius: 6 },
  formulaNote: { color: '#555', fontSize: '0.75rem' },
  progressCard: {
    background: '#1a1a2e',
    border: '1px solid #1a1a3e',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  progressLabel: { color: '#ccc', fontSize: '0.83rem' },
  progressBar: { height: 8, background: '#0a0a1a', borderRadius: 4, overflow: 'hidden' },
  progressSub: { color: '#555', fontSize: '0.75rem' },
  previewCard: {
    background: '#1e1a10',
    border: '1px solid #5a4000',
    borderRadius: 12,
    padding: '13px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
  },
  previewTitle: { color: '#FFD700', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
  previewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc', fontSize: '0.83rem' },
  prestigeBtn: {
    padding: '16px',
    background: 'linear-gradient(135deg, #3a1a00, #6a3000)',
    border: '1px solid #aa6600',
    borderRadius: 12,
    color: '#FFD700',
    fontWeight: 800,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    WebkitTapHighlightColor: 'transparent',
  },
}
