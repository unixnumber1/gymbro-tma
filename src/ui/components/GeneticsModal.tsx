import { useEffect, useState } from 'react'
import { GeneticsStats, rollGenetics, getGeneticsLabel } from '../../systems/geneticsSystem'

interface Props {
  onConfirm: (g: GeneticsStats) => void
}

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = ((value - 0.5) / 1.5) * 100
  const color = value >= 1.3 ? '#6fcf6f' : value <= 0.8 ? '#e88' : '#FFD700'
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ color: '#aaa', fontSize: '0.78rem' }}>{label}</span>
        <span style={{ color, fontWeight: 700, fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums' }}>
          ×{value.toFixed(1)}
        </span>
      </div>
      <div style={{ height: 6, background: '#1a1a2e', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.06s linear, background 0.06s linear',
        }} />
      </div>
    </div>
  )
}

export function GeneticsModal({ onConfirm }: Props) {
  const [display, setDisplay] = useState<GeneticsStats>({ clickMult: 1.0, passiveMult: 1.0, upgradeDiscount: 1.0 })
  const [rolled, setRolled] = useState<GeneticsStats | null>(null)
  const [spinning, setSpinning] = useState(true)

  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      setDisplay(rollGenetics())
      count++
      if (count >= 15) {
        clearInterval(interval)
        const result = rollGenetics()
        setDisplay(result)
        setRolled(result)
        setSpinning(false)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>🧬 Анализ ДНК</div>
        <div style={styles.subtitle}>Твоя генетика определяет стиль прокачки</div>

        <div style={styles.statsBox}>
          <StatBar label="Монеты за клик" value={display.clickMult} />
          <StatBar label="Пассивный доход" value={display.passiveMult} />
          <StatBar label="Скидка на апгрейды" value={display.upgradeDiscount} />
        </div>

        {spinning && <div style={styles.spinning}>Анализируем ДНК...</div>}

        {rolled && !spinning && (
          <>
            <div style={styles.result}>
              Генетика: <b style={{ color: '#FFD700' }}>{getGeneticsLabel(rolled)}</b>
            </div>
            <button style={styles.confirmBtn} onClick={() => onConfirm(rolled)}>
              Начать качаться!
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: '#0f0f1a',
    border: '1px solid #0f3460',
    borderRadius: 20,
    padding: '24px 20px',
    width: '100%',
    maxWidth: 380,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#FFD700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  statsBox: {
    background: '#0a0a18',
    borderRadius: 12,
    padding: '14px 16px',
  },
  spinning: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '0.9rem',
    animation: 'breathe 0.8s ease-in-out infinite',
  },
  result: {
    textAlign: 'center',
    color: '#eee',
    fontSize: '0.95rem',
  },
  confirmBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #2d6a00, #4a9900)',
    border: '1px solid #6fcf6f',
    borderRadius: 12,
    color: '#fff',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
}
