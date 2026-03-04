import { BASE_CLICK_INCOME, PRESTIGE_POINT_MULTIPLIER } from '../config/gameConfig'
import { getAppearanceMultiplier } from '../systems/appearanceSystem'
import { getPumpMultiplier } from '../systems/pumpSystem'
import { GeneticsType, getGeneticsConfig } from '../systems/geneticsSystem'

// clickIncome = base × 1.15^stage × (1 + prestige×0.02) × pumpMult × geneticsMult
export function calcClickIncome(
  appearanceStage: number,
  prestigePoints: number,
  pumpActive: boolean,
  genetics: GeneticsType | null,
): number {
  const appearanceMult = getAppearanceMultiplier(appearanceStage)
  const prestigeMult   = 1 + prestigePoints * PRESTIGE_POINT_MULTIPLIER
  const pumpMult       = getPumpMultiplier(pumpActive)
  const geneticsMult   = genetics ? getGeneticsConfig(genetics).clickMult : 1.0

  return BASE_CLICK_INCOME * appearanceMult * prestigeMult * pumpMult * geneticsMult
}
