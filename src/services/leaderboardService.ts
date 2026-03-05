import { createClient, RealtimeChannel } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssxprygtwpcnxrljlomd.supabase.co'
const SUPABASE_KEY = 'sb_publishable_OVMkKZcD9Ef9jjMaoABU7w_lEiS99EN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export interface LeaderboardEntry {
  telegram_id: string
  username: string | null
  first_name: string
  total_coins: number
  prestige_count: number
  updated_at: string
}

// ── Пользователь ──────────────────────────────────────────

function getGuestId(): string {
  const KEY = 'gymbro_guest_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(KEY, id)
  }
  return id
}

export interface TGUser {
  id: string
  first_name: string
  username: string | null
  isGuest: boolean
}

export function getTelegramUser(): TGUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  if (user?.id) {
    return {
      id: String(user.id),
      first_name: user.first_name ?? 'Игрок',
      username: user.username ?? null,
      isGuest: false,
    }
  }
  return {
    id: getGuestId(),
    first_name: 'Гость',
    username: null,
    isGuest: true,
  }
}

// ── API ───────────────────────────────────────────────────

export async function upsertScore(totalCoins: number, prestigeCount: number, diamonds = 0): Promise<void> {
  const user = getTelegramUser()
  await supabase.from('leaderboard').upsert(
    {
      telegram_id: user.id,
      username: user.username,
      first_name: user.first_name,
      total_coins: Math.floor(totalCoins),
      prestige_count: prestigeCount,
      diamonds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'telegram_id' },
  )
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('telegram_id, username, first_name, total_coins, prestige_count, updated_at')
    .order('total_coins', { ascending: false })
    .limit(100)
  if (error) return []
  return data ?? []
}

// ── Realtime ──────────────────────────────────────────────

export function subscribeLeaderboard(
  onUpdate: (rows: LeaderboardEntry[]) => void,
): RealtimeChannel {
  const channel = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leaderboard' },
      async () => {
        // При любом изменении — перечитываем топ-100
        const rows = await fetchLeaderboard()
        onUpdate(rows)
      },
    )
    .subscribe()
  return channel
}
