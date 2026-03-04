interface Props {
  pumpMeter: number       // 0–1
  pumpActive: boolean
  cooldownFraction: number // 0–1 оставшийся кулдаун
}

export function PumpMeter({ pumpMeter, pumpActive, cooldownFraction }: Props) {
  const isOnCooldown = cooldownFraction > 0 && !pumpActive

  return (
    <div style={styles.container}>
      <span style={styles.label}>
        {pumpActive ? '🔥 PUMP!' : isOnCooldown ? '⏳ Кулдаун' : '⚡ Памп'}
      </span>

      <div style={styles.track}>
        {/* Полоса прогресса */}
        <div
          style={{
            ...styles.fill,
            width: pumpActive ? '100%' : `${pumpMeter * 100}%`,
            background: pumpActive
              ? 'linear-gradient(90deg, #ff4400, #ff8800)'
              : isOnCooldown
              ? '#333'
              : 'linear-gradient(90deg, #0066ff, #00aaff)',
            boxShadow: pumpActive ? '0 0 12px rgba(255,68,0,0.8)' : 'none',
            animation: pumpActive ? 'pumpPulse 0.4s ease-in-out infinite alternate' : 'none',
          }}
        />
        {/* Кулдаун поверх */}
        {isOnCooldown && (
          <div
            style={{
              ...styles.cooldownOverlay,
              width: `${cooldownFraction * 100}%`,
            }}
          />
        )}
      </div>

      {pumpActive && (
        <span style={styles.activeLabel}>×3 к клику!</span>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 12px',
  },
  label: {
    color: '#aaa',
    fontSize: '0.7rem',
    fontWeight: 700,
    flexShrink: 0,
    width: 70,
  },
  track: {
    position: 'relative',
    flex: 1,
    height: 8,
    background: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.1s linear, background 0.3s ease',
  },
  cooldownOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    background: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    transition: 'width 0.5s linear',
  },
  activeLabel: {
    color: '#ff8800',
    fontSize: '0.7rem',
    fontWeight: 800,
    flexShrink: 0,
    animation: 'pumpPulse 0.4s ease-in-out infinite alternate',
  },
}
