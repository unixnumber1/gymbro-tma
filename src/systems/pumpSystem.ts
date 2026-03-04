// ── Pump System ────────────────────────────────────────────

export const PUMP_DURATION_MS = 5000        // 5 сек активного режима
export const PUMP_COOLDOWN_MS = 10000       // 10 сек перезарядки
export const PUMP_MULTIPLIER = 3.0          // ×3 к ручному клику
export const PUMP_GAIN_PER_CPS = 0.031      // рост шкалы за 1 CPS за 1 секунду
export const PUMP_DECAY_PER_TICK = 0.010    // спад за 100ms тик при простое
export const PUMP_MAX_CPS = 12              // кап CPS (защита от макросов)

export function getPumpMultiplier(pumpActive: boolean): number {
  return pumpActive ? PUMP_MULTIPLIER : 1.0
}

export function isPumpOnCooldown(cooldownEndTime: number): boolean {
  return Date.now() < cooldownEndTime
}

export function getPumpCooldownFraction(cooldownEndTime: number): number {
  const remaining = cooldownEndTime - Date.now()
  if (remaining <= 0) return 0
  return remaining / PUMP_COOLDOWN_MS
}
