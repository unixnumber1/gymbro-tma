import { useState, useCallback, useRef } from 'react'
import { CharacterSVG } from './CharacterSVG'

interface Props {
  stage: number
  pumpActive: boolean
  progressFraction: number
  onTap: (x: number, y: number) => void
}

export function Character({ stage, pumpActive, progressFraction, onTap }: Props) {
  const [isPressed, setIsPressed] = useState(false)
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

  const barColor = pumpActive
    ? 'linear-gradient(to top, #ff4400, #ff8800)'
    : 'linear-gradient(to top, #FFD700, #ffe066)'

  const fillHeight = `${Math.max(0, Math.min(1, progressFraction)) * 100}%`

  return (
    <div style={styles.wrapper}>
      <button
        style={styles.button}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label="Тапни чтобы качаться"
      >
        <div
          style={{
            ...styles.breathWrapper,
            animationDuration: pumpActive ? '1.2s' : '3.5s',
          }}
        >
          <div style={styles.shoulderBobWrapper}>
            <CharacterSVG
              stage={stage}
              pumpActive={pumpActive}
              isPressed={isPressed}
            />
          </div>
        </div>
      </button>

      {/* Вертикальная шкала прокачки справа */}
      <div style={styles.barTrack}>
        <div
          style={{
            ...styles.barFill,
            height: fillHeight,
            background: barColor,
            boxShadow: pumpActive
              ? '0 0 10px rgba(255,68,0,0.7)'
              : '0 0 6px rgba(255,215,0,0.35)',
          }}
        />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    gap: 10,
  },
  button: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
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
  barTrack: {
    width: 14,
    height: 160,
    background: '#1a1a2e',
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
    transition: 'height 0.25s linear, background 0.3s ease',
  },
}
