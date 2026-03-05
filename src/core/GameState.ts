import { AUTO_CLICKERS_CONFIG, BASE_CLICK_INCOME, SAVE_VERSION, EVENT_MIN_INTERVAL_MS, EVENT_EXTRA_RANGE_MS } from '../config/gameConfig'
import { GeneticsStats } from '../systems/geneticsSystem'

export interface AutoClicker {
  id: string
  owned: number
}

export interface ActiveBoost {
  type: 'x2click'
  endTime: number  // ms timestamp
}

export interface GameState {
  version: number

  // Валюта
  coins: number
  totalCoinsEarned: number
  currentClickIncome: number
  coinsPerSecond: number

  // Автокликеры
  autoClickers: AutoClicker[]

  // Внешность (0–29)
  appearanceStage: number

  // Pump Mode
  pumpMeter: number
  pumpActive: boolean
  pumpEndTime: number
  pumpCooldownEndTime: number
  pendingClicks: number

  // Генетика — случайные параметры, обновляются при каждом престиже
  genetics: GeneticsStats | null

  // Престиж
  prestigePoints: number
  totalPrestiges: number

  // Цели (для income bonus — остаётся)
  completedGoals: string[]

  // Достижения
  completedAchievements: Record<string, number>  // id -> levels completed

  // Алмазы
  diamonds: number

  // Случайный буст
  activeBoost: ActiveBoost | null
  nextEventTime: number  // ms timestamp

  // Магазин — временные бусты
  shopClickBoostEndTime: number    // 0 = неактивен
  shopPassiveBoostEndTime: number  // 0 = неактивен

  // Магазин — постоянные бонусы
  permanentClickBonus: number    // 0.1 за каждую покупку
  permanentPassiveBonus: number

  // Магазин — скины
  ownedSkins: string[]
  activeSkin: string | null

  // Статистика
  totalClicks: number
  totalPlayTime: number

  // Мета
  lastSaveTime: number
}

export function createInitialState(): GameState {
  return {
    version: SAVE_VERSION,
    coins: 0,
    totalCoinsEarned: 0,
    currentClickIncome: BASE_CLICK_INCOME,
    coinsPerSecond: 0,
    autoClickers: AUTO_CLICKERS_CONFIG.map(cfg => ({ id: cfg.id, owned: 0 })),
    appearanceStage: 0,
    pumpMeter: 0,
    pumpActive: false,
    pumpEndTime: 0,
    pumpCooldownEndTime: 0,
    pendingClicks: 0,
    genetics: null,
    prestigePoints: 0,
    totalPrestiges: 0,
    completedGoals: [],
    completedAchievements: {},
    diamonds: 0,
    activeBoost: null,
    nextEventTime: Date.now() + EVENT_MIN_INTERVAL_MS + Math.random() * EVENT_EXTRA_RANGE_MS,
    shopClickBoostEndTime: 0,
    shopPassiveBoostEndTime: 0,
    permanentClickBonus: 0,
    permanentPassiveBonus: 0,
    ownedSkins: [],
    activeSkin: null,
    totalClicks: 0,
    totalPlayTime: 0,
    lastSaveTime: Date.now(),
  }
}
