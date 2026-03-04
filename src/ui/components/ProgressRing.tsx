interface Props {
  fraction: number    // 0.0 → 1.0
  size: number        // px
  strokeWidth: number
  pumpActive: boolean
}

export function ProgressRing({ fraction, size, strokeWidth, pumpActive }: Props) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(1, fraction)))

  const cx = size / 2
  const cy = size / 2

  const color = pumpActive ? '#ff4400' : '#FFD700'

  return (
    <svg
      width={size}
      height={size}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      {/* Фоновое кольцо */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth={strokeWidth}
      />
      {/* Прогресс */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.3s ease' }}
      />
      {/* Блик на 100% */}
      {fraction >= 1 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 2}
          opacity={0.3}
          style={{ animation: 'pumpPulse 0.5s ease-in-out infinite alternate' }}
        />
      )}
    </svg>
  )
}
