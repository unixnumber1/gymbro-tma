// ============================================================
// MORPH SYSTEM
// Интерполирует CharacterParams между SKINNY и MASSIVE.
// Добавляет вычисляемые эффекты (вены, glow, aura) по порогам.
// Результат кэшируется по stage — не пересчитывается каждый рендер.
// ============================================================

import {
  CharacterParams,
  PARAMS_SKINNY,
  PARAMS_MASSIVE,
  TIER_COLORS,
} from '../config/characterConfig'
import { STAGE_COUNT } from './appearanceSystem'

// ── Lerp ──────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

// Easing для более выразительного роста на поздних стадиях
// Медленный старт, ускорение в мидгейме, плато в эндгейме
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// ── Интерполяция всех числовых полей ──────────────────────────
function lerpParams(
  a: CharacterParams,
  b: CharacterParams,
  t: number,
): CharacterParams {
  const et = easeInOut(t)
  return {
    headR:       lerp(a.headR,       b.headR,       et),
    neckW:       lerp(a.neckW,       b.neckW,       et),
    neckH:       lerp(a.neckH,       b.neckH,       et),
    trapRise:    lerp(a.trapRise,    b.trapRise,    et),
    trapSpread:  lerp(a.trapSpread,  b.trapSpread,  et),
    shoulderX:   lerp(a.shoulderX,   b.shoulderX,   et),
    deltW:       lerp(a.deltW,       b.deltW,       et),
    deltH:       lerp(a.deltH,       b.deltH,       et),
    chestW:      lerp(a.chestW,      b.chestW,      et),
    waistW:      lerp(a.waistW,      b.waistW,      et),
    torsoH:      lerp(a.torsoH,      b.torsoH,      et),
    pecBulge:    lerp(a.pecBulge,    b.pecBulge,    et),
    pecSepDepth: lerp(a.pecSepDepth, b.pecSepDepth, et),
    bicepW:      lerp(a.bicepW,      b.bicepW,      et),
    bicepPeak:   lerp(a.bicepPeak,   b.bicepPeak,   et),
    forearmW:    lerp(a.forearmW,    b.forearmW,    et),
    armLen:      lerp(a.armLen,      b.armLen,      et),
    elbowAt:     lerp(a.elbowAt,     b.elbowAt,     et),
    hipW:        lerp(a.hipW,        b.hipW,        et),
    quadW:       lerp(a.quadW,       b.quadW,       et),
    calfBulge:   lerp(a.calfBulge,   b.calfBulge,   et),
    legLen:      lerp(a.legLen,      b.legLen,      et),
    shadowDepth: lerp(a.shadowDepth, b.shadowDepth, et),
    // computed separately — не интерполируем
    veinOpacity: 0, absOpacity: 0,
    glowIntensity: 0, auraIntensity: 0,
    // colors: snap at tier boundaries — не интерполируем
    skinBase: a.skinBase, skinShadow: a.skinShadow, skinHighlight: a.skinHighlight,
    shirtBase: a.shirtBase, shirtShadow: a.shirtShadow,
    pantsBase: a.pantsBase, pantsShadow: a.pantsShadow,
    glowColor: a.glowColor, veinColor: a.veinColor,
  }
}

// ── Вычисляемые эффекты (пороги на стадиях) ───────────────────
function computeEffects(params: CharacterParams, stage: number): CharacterParams {
  // Вены: появляются с stage 11, усиливаются
  const veinOpacity = stage >= 11
    ? Math.min(1, (stage - 11) / 14)
    : 0

  // Пресс: виден на stage 8-22 (потом скрыт мышечной массой)
  const absOpacity = stage >= 8 && stage <= 22
    ? Math.min(1, (stage - 8) / 5) * (1 - Math.max(0, (stage - 18) / 5))
    : 0

  // Glow: появляется с stage 17
  const glowIntensity = stage >= 17
    ? Math.min(1, (stage - 17) / 8)
    : 0

  // Аура: только на stage 24+
  const auraIntensity = stage >= 24
    ? Math.min(1, (stage - 24) / 5)
    : 0

  // Цвета тира (snap)
  const tier = Math.min(Math.floor(stage / 5), 5)
  const colors = TIER_COLORS[tier]

  return {
    ...params,
    veinOpacity,
    absOpacity,
    glowIntensity,
    auraIntensity,
    skinBase: colors.skinBase,
    skinShadow: colors.skinShadow,
    skinHighlight: colors.skinHighlight,
    shirtBase: colors.shirtBase,
    shirtShadow: colors.shirtShadow,
    pantsBase: colors.pantsBase,
    pantsShadow: colors.pantsShadow,
    glowColor: colors.glowColor,
    veinColor: colors.veinColor,
  }
}

// ── Кэш ───────────────────────────────────────────────────────
const paramCache = new Map<number, CharacterParams>()

export function getCharacterParams(stage: number): CharacterParams {
  const s = Math.max(0, Math.min(STAGE_COUNT - 1, Math.floor(stage)))
  if (paramCache.has(s)) return paramCache.get(s)!

  const t = s / (STAGE_COUNT - 1)
  const base = lerpParams(PARAMS_SKINNY, PARAMS_MASSIVE, t)
  const result = computeEffects(base, s)
  paramCache.set(s, result)
  return result
}
