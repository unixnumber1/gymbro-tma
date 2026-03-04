import { AUTO_CLICKERS_CONFIG, PRICE_GROWTH_FACTOR } from '../config/gameConfig'
import { AutoClicker } from '../core/GameState'

// price(n) = basePrice × 1.15^owned × costMult
export function calcAutoClickerPrice(id: string, owned: number, costMult: number = 1): number {
  const cfg = AUTO_CLICKERS_CONFIG.find(c => c.id === id)!
  return Math.ceil(cfg.basePrice * Math.pow(PRICE_GROWTH_FACTOR, owned) * costMult)
}

// Суммарный пассивный доход в секунду
export function calcTotalCoinsPerSecond(autoClickers: AutoClicker[], incMult: number = 1): number {
  return autoClickers.reduce((total, ac) => {
    const cfg = AUTO_CLICKERS_CONFIG.find(c => c.id === ac.id)
    if (!cfg) return total
    return total + cfg.incomePerSecond * ac.owned * incMult
  }, 0)
}
