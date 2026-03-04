import { AUTO_CLICKERS_CONFIG, BASE_CLICK_INCOME, SAVE_VERSION } from '../config/gameConfig'
import { GeneticsType } from '../systems/geneticsSystem'

export interface AutoClicker {
  id: string
  owned: number
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
  pumpMeter: number           // 0.0 → 1.0
  pumpActive: boolean
  pumpEndTime: number         // ms timestamp
  pumpCooldownEndTime: number // ms timestamp
  pendingClicks: number       // кликов с последнего тика

  // Генетика
  genetics: GeneticsType | null  // null = ещё не выбрана

  // Престиж
  prestigePoints: number
  totalPrestiges: number

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
    totalClicks: 0,
    totalPlayTime: 0,
    lastSaveTime: Date.now(),
  }
}
