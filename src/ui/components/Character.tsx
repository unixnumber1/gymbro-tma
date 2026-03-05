import { useState, useCallback, useRef } from 'react'
import { CharacterSVG } from './CharacterSVG'
import { ProgressRing } from './ProgressRing'

interface Props {
  stage: number
  pumpActive: boolean
  progressFraction: number
  onTap: (x: number, y: number) => void
}

export function Character({ stage, pumpActive, progressFraction, onTap }: Props) {
  const [isPressed, setIsPressed] = useState(false)
  // Предотвращаем зависание isPressed если pointer ушёл за пределы кнопки
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    onTap(e.clientX, e.clientY)
    setIsPressed(true)
    if (pressTimer.current) clearTimeout(pressTimer.current)
    pressTimer.current = setTimeout(() => setIsPressed(false), 120)
  }, [onTap])

  const handlePointerUp = useCallback(() => {
    setIsPressed(false)
  }, [])

  return (
    <div style={styles.wrapper}>
      {/* Прогресс-кольцо */}
      <div style={styles.ringWrapper}>
        <ProgressRing
          fraction={progressFraction}
          size={196}
          strokeWidth={4}
          pumpActive={pumpActive}
        />

        {/* Кнопка-персонаж */}
        <button
          style={{
            ...styles.button,
            background: pumpActive
              ? 'radial-gradient(circle at 40% 35%, #3a1000 0%, #1a0500 70%)'
              : 'radial-gradient(circle at 40% 35%, #1a2e50 0%, #0a1020 70%)',
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          aria-label="Тапни чтобы качаться"
        >
          {/* Idle breathing wrapper — трансформирует всё тело */}
          <div
            style={{
              ...styles.breathWrapper,
              animationDuration: pumpActive ? '1.2s' : '3.5s',
            }}
          >
            {/* Плечи двигаются чуть быстрее дыхания — эффект micro-movement */}
            <div style={styles.shoulderBobWrapper}>
              <CharacterSVG
                stage={stage}
                pumpActive={pumpActive}
                isPressed={isPressed}
              />
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    userSelect: 'none',
  },
  ringWrapper: {
    position: 'relative',
    width: 196,
    height: 196,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    position: 'absolute',
    inset: 10,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    transition: 'background 0.4s ease',
  },
  breathWrapper: {
    animation: 'breathe 3.5s ease-in-out infinite',
    transformOrigin: '50% 55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoulderBobWrapper: {
    animation: 'shoulderBob 3.5s ease-in-out infinite',
    transformOrigin: '50% 30%',
  },
}
