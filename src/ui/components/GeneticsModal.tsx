import { useState } from 'react'
import { GeneticsType, GENETICS_CONFIGS, rollGenetics } from '../../systems/geneticsSystem'

interface Props {
  onSelect: (type: GeneticsType) => void
}

// Первый запуск — персонажу "выпадает" генетика
export function GeneticsModal({ onSelect }: Props) {
  const [revealed, setRevealed] = useState<GeneticsType | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)

  function handleReveal() {
    setIsRevealing(true)
    // Имитация "розыгрыша" — мелькание типов перед финальным результатом
    let count = 0
    const types: GeneticsType[] = ['hardgainer', 'normal', 'freak']
    const interval = setInterval(() => {
      setRevealed(types[count % 3])
      count++
      if (count >= 12) {
        clearInterval(interval)
        const result = rollGenetics()
        setRevealed(result)
        setIsRevealing(false)
      }
    }, 80)
  }

  const cfg = revealed ? GENETICS_CONFIGS[revealed] : null

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>🧬 Анализ ДНК</div>
        <div style={styles.subtitle}>
          Твоя генетика определяет стиль прокачки
        </div>

        {/* Карточки типов */}
        <div style={styles.cards}>
          {(Object.values(GENETICS_CONFIGS) as typeof GENETICS_CONFIGS[GeneticsType][]).map(g => (
            <div
              key={g.type}
              style={{
                ...styles.card,
                borderColor: revealed === g.type ? '#FFD700' : '#1a1a2e',
                background: revealed === g.type ? '#1e1a08' : '#1a1a2e',
                transform: revealed === g.type ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <div style={styles.cardEmoji}>{g.emoji}</div>
              <div style={styles.cardLabel}>{g.label}</div>
              <div style={styles.cardDesc}>{g.description}</div>
              <div style={styles.cardStats}>
                <span style={{ color: g.clickMult >= 1 ? '#6fcf6f' : '#e88' }}>
                  Клик ×{g.clickMult.toFixed(2)}
                </span>
                <span style={{ color: g.stageCostMult <= 1 ? '#6fcf6f' : '#e88' }}>
                  Цена ×{g.stageCostMult.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка розыгрыша */}
        {!revealed && !isRevealing && (
          <button style={styles.rollBtn} onClick={handleReveal}>
            🎲 Узнать свою генетику
          </button>
        )}

        {isRevealing && (
          <div style={styles.revealing}>Анализируем ДНК...</div>
        )}

        {/* Подтверждение */}
        {revealed && !isRevealing && cfg && (
          <div style={styles.result}>
            <div style={styles.resultText}>
              Ты — <b style={{ color: '#FFD700' }}>{cfg.emoji} {cfg.label}</b>
            </div>
            <button style={styles.confirmBtn} onClick={() => onSelect(revealed)}>
              Начать качаться!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 16,
  },
  modal: {
    background: '#0f0f1a',
    border: '1px solid #0f3460',
    borderRadius: 20,
    padding: '24px 20px',
    width: '100%',
    maxWidth: 400,
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
  cards: {
    display: 'flex',
    gap: 8,
  },
  card: {
    flex: 1,
    border: '2px solid #1a1a2e',
    borderRadius: 12,
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  cardEmoji: {
    fontSize: '1.6rem',
    lineHeight: 1,
  },
  cardLabel: {
    color: '#eee',
    fontWeight: 700,
    fontSize: '0.75rem',
    textAlign: 'center',
  },
  cardDesc: {
    color: '#888',
    fontSize: '0.65rem',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  cardStats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    fontSize: '0.7rem',
    marginTop: 4,
  },
  rollBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #0f3460, #1a1a6e)',
    border: '1px solid #2255aa',
    borderRadius: 12,
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  revealing: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '0.9rem',
    padding: '8px 0',
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  resultText: {
    fontSize: '1rem',
    color: '#eee',
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2d6a00, #4a9900)',
    border: '1px solid #6fcf6f',
    borderRadius: 12,
    color: '#fff',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
  },
}
