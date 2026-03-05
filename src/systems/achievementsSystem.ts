import { GameState } from '../core/GameState'

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface AchievementLevel {
  label: string
  threshold: number
  diamonds: number
  tier: AchievementTier
}

export interface AchievementDef {
  id: string
  category: string
  categoryIcon: string
  icon: string
  name: string
  levels: AchievementLevel[]
  getValue: (state: GameState) => number
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze:   '#cd7f32',
  silver:   '#c0c0c0',
  gold:     '#FFD700',
  platinum: '#e5e4e2',
  diamond:  '#7df9ff',
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'clicks',
    category: 'Качалка',
    categoryIcon: '💪',
    icon: '👊',
    name: 'Кликер',
    levels: [
      { label: '100 кликов',   threshold: 100,         diamonds: 1,  tier: 'bronze' },
      { label: '1К кликов',    threshold: 1_000,       diamonds: 2,  tier: 'silver' },
      { label: '10К кликов',   threshold: 10_000,      diamonds: 5,  tier: 'gold' },
      { label: '100К кликов',  threshold: 100_000,     diamonds: 10, tier: 'platinum' },
      { label: '1М кликов',    threshold: 1_000_000,   diamonds: 25, tier: 'diamond' },
    ],
    getValue: (s) => s.totalClicks,
  },
  {
    id: 'passive',
    category: 'Бизнес',
    categoryIcon: '💼',
    icon: '🤖',
    name: 'Инвестор',
    levels: [
      { label: '1 GBC/сек',    threshold: 1,       diamonds: 1,  tier: 'bronze' },
      { label: '10 GBC/сек',   threshold: 10,      diamonds: 2,  tier: 'silver' },
      { label: '100 GBC/сек',  threshold: 100,     diamonds: 5,  tier: 'gold' },
      { label: '1К GBC/сек',   threshold: 1_000,   diamonds: 10, tier: 'platinum' },
      { label: '10К GBC/сек',  threshold: 10_000,  diamonds: 25, tier: 'diamond' },
    ],
    getValue: (s) => s.coinsPerSecond,
  },
  {
    id: 'wealth',
    category: 'Богатство',
    categoryIcon: '💰',
    icon: '💵',
    name: 'Миллионер',
    levels: [
      { label: '1К GBC',    threshold: 1_000,              diamonds: 1,  tier: 'bronze' },
      { label: '100К GBC',  threshold: 100_000,            diamonds: 3,  tier: 'silver' },
      { label: '10М GBC',   threshold: 10_000_000,         diamonds: 10, tier: 'gold' },
      { label: '1Б GBC',    threshold: 1_000_000_000,      diamonds: 25, tier: 'platinum' },
      { label: '1Т GBC',    threshold: 1_000_000_000_000,  diamonds: 50, tier: 'diamond' },
    ],
    getValue: (s) => s.totalCoinsEarned,
  },
  {
    id: 'prestige',
    category: 'Престиж',
    categoryIcon: '⭐',
    icon: '🌟',
    name: 'Легенда',
    levels: [
      { label: '1 престиж',    threshold: 1,   diamonds: 2,  tier: 'bronze' },
      { label: '5 престижей',  threshold: 5,   diamonds: 5,  tier: 'silver' },
      { label: '10 престижей', threshold: 10,  diamonds: 10, tier: 'gold' },
      { label: '25 престижей', threshold: 25,  diamonds: 25, tier: 'platinum' },
      { label: '50 престижей', threshold: 50,  diamonds: 50, tier: 'diamond' },
    ],
    getValue: (s) => s.totalPrestiges,
  },
  {
    id: 'appearance',
    category: 'Коллекционер',
    categoryIcon: '👗',
    icon: '🏆',
    name: 'Стилист',
    levels: [
      { label: '1 стадия',      threshold: 1,   diamonds: 1,  tier: 'bronze' },
      { label: '5 стадий',      threshold: 5,   diamonds: 3,  tier: 'silver' },
      { label: '10 стадий',     threshold: 10,  diamonds: 10, tier: 'gold' },
      { label: 'Все 30 стадий', threshold: 29,  diamonds: 25, tier: 'platinum' },
    ],
    getValue: (s) => s.appearanceStage,
  },
]

export function getCompletedLevel(achievement: AchievementDef, state: GameState): number {
  const val = achievement.getValue(state)
  let level = 0
  for (const lvl of achievement.levels) {
    if (val >= lvl.threshold) level++
    else break
  }
  return level
}

export function checkAchievements(
  state: GameState,
  prevCompleted: Record<string, number>,
): Array<{ id: string; level: number; diamonds: number }> {
  const gained: Array<{ id: string; level: number; diamonds: number }> = []
  for (const ach of ACHIEVEMENTS) {
    const currentLevel = getCompletedLevel(ach, state)
    const prevLevel = prevCompleted[ach.id] ?? 0
    if (currentLevel > prevLevel) {
      let diamonds = 0
      for (let i = prevLevel; i < currentLevel; i++) {
        diamonds += ach.levels[i].diamonds
      }
      gained.push({ id: ach.id, level: currentLevel, diamonds })
    }
  }
  return gained
}
