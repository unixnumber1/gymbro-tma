import { BASE_CLICK_INCOME, PRESTIGE_POINT_MULTIPLIER } from '../config/gameConfig'
import { getAppearanceClickMult } from '../systems/appearanceSystem'
import { getPumpMultiplier } from '../systems/pumpSystem'
import { GeneticsStats } from '../systems/geneticsSystem'

// clickIncome = base × appearance × prestige × pump × genetics × goals × shopBoost × permBonus
export function calcClickIncome(
  appearanceStage: number,
  prestigePoints: number,
  pumpActive: boolean,
  genetics: GeneticsStats | null,
  goalsMult: number,
  shopClickBoostActive = false,
  permanentClickBonus = 0,
): number {
  const appearanceMult = getAppearanceClickMult(appearanceStage)
  const prestigeMult   = 1 + prestigePoints * PRESTIGE_POINT_MULTIPLIER
  const pumpMult       = getPumpMultiplier(pumpActive)
  const geneticsMult   = genetics ? genetics.clickMult : 1.0
  const shopBoostMult  = shopClickBoostActive ? 2 : 1
  const permBonus      = 1 + permanentClickBonus

  return BASE_CLICK_INCOME * appearanceMult * prestigeMult * pumpMult * geneticsMult * goalsMult * shopBoostMult * permBonus
}
