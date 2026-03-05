export type TabId = 'upgrades' | 'appearance' | 'prestige' | 'achievements' | 'shop' | 'leaderboard' | 'stats'

interface Tab {
  id: TabId
  label: string
  emoji: string
}

const TABS: Tab[] = [
  { id: 'upgrades',      label: 'Апгрейд', emoji: '⬆️' },
  { id: 'appearance',   label: 'Внешка',   emoji: '💅' },
  { id: 'prestige',     label: 'Престиж',  emoji: '⭐' },
  { id: 'achievements', label: 'Ачивки',   emoji: '🏆' },
  { id: 'shop',         label: 'Магазин',  emoji: '💎' },
  { id: 'leaderboard',  label: 'Топ',      emoji: '👑' },
  { id: 'stats',        label: 'Стата',    emoji: '📊' },
]

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
}

export function TabBar({ active, onChange }: Props) {
  return (
    <nav style={styles.nav}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          style={{
            ...styles.tab,
            color: active === tab.id ? '#FFD700' : '#666',
            borderTop: active === tab.id ? '2px solid #FFD700' : '2px solid transparent',
          }}
          onClick={() => onChange(tab.id)}
        >
          <span style={styles.tabEmoji}>{tab.emoji}</span>
          <span style={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    borderTop: '1px solid #1a1a2e',
    background: '#0f0f1e',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '6px 1px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    position: 'relative',
    transition: 'color 0.15s, border-color 0.15s',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
  },
  tabEmoji: {
    fontSize: '1.0rem',
    lineHeight: 1,
  },
  tabLabel: {
    fontSize: '0.52rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
}
