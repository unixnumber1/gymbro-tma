import { BASE_CLICK_INCOME, PRESTIGE_POINT_MULTIPLIER } from '../config/gameConfig'
import { getAppearanceClickMult } from '../systems/appearanceSystem'
import { getPumpMultiplier } from '../systems/pumpSystem'
import { GeneticsStats } from '../systems/geneticsSystem'

// clickIncome = base × appearance(stage) × prestige × pump × genetics × goals
export function calcClickIncome(
  appearanceStage: number,
  prestigePoints: number,
  pumpActive: boolean,
  genetics: GeneticsStats | null,
  goalsMult: number,   // e.g. 1.3 for 3 completed goals
): number {
  const appearanceMult = getAppearanceClickMult(appearanceStage)
  const prestigeMult   = 1 + prestigePoints * PRESTIGE_POINT_MULTIPLIER
  const pumpMult       = getPumpMultiplier(pumpActive)
  const geneticsMult   = genetics ? genetics.clickMult : 1.0

  return BASE_CLICK_INCOME * appearanceMult * prestigeMult * pumpMult * geneticsMult * goalsMult
}
