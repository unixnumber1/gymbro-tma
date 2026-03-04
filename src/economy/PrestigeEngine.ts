import { PRESTIGE_DIVISOR, PRESTIGE_MIN_COINS_EARNED } from '../config/gameConfig'

export function calcPrestigePointsGain(totalCoinsEarned: number): number {
  return Math.floor(Math.sqrt(totalCoinsEarned / PRESTIGE_DIVISOR))
}

export function canPrestige(totalCoinsEarned: number): boolean {
  return totalCoinsEarned >= PRESTIGE_MIN_COINS_EARNED
}
