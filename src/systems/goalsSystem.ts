import { GameState } from '../core/GameState'

export interface Goal {
  id: string
  emoji: string
  title: string
  description: string
  bonusDesc: string
  check: (state: GameState) => boolean
}

export const GOALS: Goal[] = [
  {
    id: 'first_gym',
    emoji: '🏋️',
    title: 'Первый зал',
    description: 'Купи абонемент в зал',
    bonusDesc: '+10% ко всему доходу навсегда',
    check: (s) => (s.autoClickers.find(a => a.id === 'gym_pass')?.owned ?? 0) >= 1,
  },
  {
    id: 'cps_1000',
    emoji: '⚡',
    title: 'Пассивный монстр',
    description: 'Достигни 1000 GBC/сек',
    bonusDesc: '+10% ко всему доходу навсегда',
    check: (s) => s.coinsPerSecond >= 1000,
  },
  {
    id: 'first_prestige',
    emoji: '⭐',
    title: 'Первый сброс',
    description: 'Соверши первый престиж',
    bonusDesc: '+10% ко всему доходу навсегда',
    check: (s) => s.totalPrestiges >= 1,
  },
  {
    id: 'prestige_5',
    emoji: '🌟',
    title: 'Ветеран',
    description: 'Соверши 5 престижей',
    bonusDesc: '+10% ко всему доходу навсегда',
    check: (s) => s.totalPrestiges >= 5,
  },
  {
    id: 'clicks_1000',
    emoji: '👊',
    title: 'Тысячник',
    description: 'Сделай 1000 кликов',
    bonusDesc: '+10% ко всему доходу навсегда',
    check: (s) => s.totalClicks >= 1000,
  },
  {
    id: 'stage_15',
    emoji: '💎',
    title: 'Элитный атлет',
    description: 'Достигни стадии тела 15',
    bonusDesc: '+10% ко всему доходу навсегда',
    check: (s) => s.appearanceStage >= 14,
  },
]
