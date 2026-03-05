import { AUTO_CLICKERS_CONFIG, PRICE_GROWTH_FACTOR } from '../config/gameConfig'
import { AutoClicker } from '../core/GameState'
import { GeneticsStats, getUpgradeCostFactor } from '../systems/geneticsSystem'
import { getAppearancePassiveMult, getAppearanceCostFactor } from '../systems/appearanceSystem'

// Цена следующего уровня апгрейда
export function calcAutoClickerPrice(
  id: string,
  owned: number,
  genetics: GeneticsStats | null,
  appearanceStage: number,
): number {
  const cfg = AUTO_CLICKERS_CONFIG.find(c => c.id === id)!
  const geneticsCost   = genetics ? getUpgradeCostFactor(genetics) : 1
  const appearanceCost = getAppearanceCostFactor(appearanceStage)
  return Math.ceil(cfg.basePrice * Math.pow(PRICE_GROWTH_FACTOR, owned) * geneticsCost * appearanceCost)
}

// Суммарный пассивный доход в секунду
export function calcTotalCoinsPerSecond(
  autoClickers: AutoClicker[],
  genetics: GeneticsStats | null,
  appearanceStage: number,
  goalsMult: number,   // e.g. 1.2 for 2 completed goals
): number {
  const passiveMult    = genetics ? genetics.passiveMult : 1.0
  const appearanceMult = getAppearancePassiveMult(appearanceStage)
  return autoClickers.reduce((total, ac) => {
    const cfg = AUTO_CLICKERS_CONFIG.find(c => c.id === ac.id)
    if (!cfg) return total
    return total + cfg.incomePerSecond * ac.owned * passiveMult * appearanceMult * goalsMult
  }, 0)
}
