import { useEffect, useState } from 'react'
import { STAGE_NAMES, TIER_NAMES, getStageTier, getBodyParams } from '../../systems/appearanceSystem'

interface Props {
  stage: number   // новая стадия
  onClose: () => void
}

const MILESTONE_STAGES = [9, 19, 29]  // особые стадии с burst-эффектом

export function StageUpModal({ stage, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Появляемся с анимацией
    const t = setTimeout(() => setVisible(true), 20)
    // Автозакрытие через 2.5 сек
    const close = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 2500)
    return () => { clearTimeout(t); clearTimeout(close) }
  }, [onClose])

  const tier = getStageTier(stage)
  const params = getBodyParams(stage)
  const isMilestone = MILESTONE_STAGES.includes(stage)
  const mult = Math.pow(1.15, stage).toFixed(2)

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
      onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
    >
      {/* Milestone burst */}
      {isMilestone && (
        <div style={styles.burst}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.burstRay,
                transform: `rotate(${i * 45}deg)`,
                background: params.glowColor !== 'transparent' ? params.glowColor : '#FFD700',
              }}
            />
          ))}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.badge}>ТРАНСФОРМАЦИЯ!</div>
        <div style={styles.stageNum}>Стадия {stage + 1} / 30</div>
        <div style={styles.tierBadge}>
          <span style={{ color: params.shirtColor }}>{TIER_NAMES[tier]}</span>
        </div>
        <div
          style={{
            ...styles.name,
            animation: 'stageUpBounce 0.6s ease',
          }}
        >
          {STAGE_NAMES[stage]}
        </div>
        <div style={styles.bonus}>
          ×{mult} к ручному клику
        </div>
        {isMilestone && (
          <div style={styles.milestone}>🏆 Milestone! Новый тир разблокирован!</div>
        )}
        <div style={styles.hint}>тап чтобы закрыть</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  burst: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  burstRay: {
    position: 'absolute',
    width: 4,
    height: 200,
    borderRadius: 2,
    opacity: 0.15,
    transformOrigin: 'center center',
  },
  card: {
    background: 'linear-gradient(135deg, #0f1e3a, #1a0f2e)',
    border: '2px solid #FFD700',
    borderRadius: 20,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    maxWidth: 280,
    width: '90%',
    boxShadow: '0 0 40px rgba(255,215,0,0.3)',
  },
  badge: {
    background: '#FFD700',
    color: '#000',
    fontWeight: 800,
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    padding: '3px 10px',
    borderRadius: 6,
  },
  stageNum: {
    color: '#888',
    fontSize: '0.8rem',
  },
  tierBadge: {
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  name: {
    color: '#fff',
    fontSize: '1.4rem',
    fontWeight: 800,
    textAlign: 'center',
  },
  bonus: {
    color: '#FFD700',
    fontSize: '1rem',
    fontWeight: 700,
  },
  milestone: {
    color: '#FFD700',
    fontSize: '0.8rem',
    textAlign: 'center',
    background: 'rgba(255,215,0,0.1)',
    padding: '6px 12px',
    borderRadius: 8,
  },
  hint: {
    color: '#444',
    fontSize: '0.7rem',
    marginTop: 4,
  },
}
