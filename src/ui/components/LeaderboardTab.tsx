import { useEffect, useState, useRef } from 'react'
import {
  LeaderboardEntry,
  fetchLeaderboard,
  subscribeLeaderboard,
  getTelegramUser,
} from '../../services/leaderboardService'
import { formatNumber } from '../formatNumber'

const myId = getTelegramUser().id

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function LeaderboardTab() {
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<typeof subscribeLeaderboard> | null>(null)

  useEffect(() => {
    // Первичная загрузка
    fetchLeaderboard().then(data => {
      setRows(data)
      setLoading(false)
    })

    // Realtime подписка
    channelRef.current = subscribeLeaderboard(data => {
      setRows(data)
    })

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  const myRank = rows.findIndex(r => r.telegram_id === myId) + 1

  return (
    <div style={styles.container}>
      {/* Заголовок */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>🏆 Топ игроков</span>
        <span style={styles.headerSub}>
          {myRank > 0 ? `Твоё место: #${myRank}` : 'Ты не в топ-100'}
        </span>
      </div>

      {loading && (
        <div style={styles.loading}>Загружаем лидерборд...</div>
      )}

      {!loading && rows.length === 0 && (
        <div style={styles.loading}>Нет данных. Начни играть!</div>
      )}

      <div style={styles.list}>
        {rows.map((row, idx) => {
          const rank = idx + 1
          const isMe = row.telegram_id === myId
          const displayName = row.first_name + (row.username ? ` @${row.username}` : '')
          return (
            <div
              key={row.telegram_id}
              style={{
                ...styles.row,
                background: isMe ? '#1a2e1a' : '#1a1a2e',
                borderColor: isMe ? '#27ae6088' : '#1a1a3e',
              }}
            >
              <div style={styles.rank}>
                {MEDAL[rank] ?? <span style={styles.rankNum}>#{rank}</span>}
              </div>
              <div style={styles.nameCol}>
                <div style={{ ...styles.name, color: isMe ? '#6fcf6f' : '#eee' }}>
                  {displayName}
                  {isMe && <span style={styles.youTag}> ВЫ</span>}
                </div>
                <div style={styles.sub}>
                  {row.prestige_count > 0 && `⭐ ${row.prestige_count} престижей`}
                </div>
              </div>
              <div style={styles.coins}>
                <span style={{ color: isMe ? '#6fcf6f' : '#FFD700', fontWeight: 800 }}>
                  {formatNumber(row.total_coins)}
                </span>
                <span style={styles.gbcLabel}>GBC</span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={styles.footer}>
        Обновляется в реальном времени
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px 6px',
    flexShrink: 0,
  },
  headerTitle: {
    color: '#FFD700',
    fontWeight: 800,
    fontSize: '0.95rem',
  },
  headerSub: {
    color: '#888',
    fontSize: '0.75rem',
  },
  loading: {
    color: '#555',
    textAlign: 'center',
    padding: '24px 16px',
    fontSize: '0.85rem',
  },
  list: {
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '0 12px 8px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid #1a1a3e',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  rank: {
    width: 28,
    textAlign: 'center',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  rankNum: {
    color: '#555',
    fontSize: '0.72rem',
    fontWeight: 700,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '0.83rem',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  youTag: {
    background: '#27ae60',
    color: '#fff',
    fontSize: '0.55rem',
    fontWeight: 800,
    padding: '1px 4px',
    borderRadius: 4,
    marginLeft: 4,
    verticalAlign: 'middle',
  },
  sub: {
    color: '#666',
    fontSize: '0.68rem',
    marginTop: 1,
  },
  coins: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  gbcLabel: {
    color: '#555',
    fontSize: '0.6rem',
  },
  footer: {
    color: '#333',
    fontSize: '0.65rem',
    textAlign: 'center',
    padding: '6px 0 8px',
    flexShrink: 0,
  },
}
