// ── Genetics System v2 — случайные параметры при каждом престиже ──────────

export interface GeneticsStats {
  clickMult: number       // 0.5 – 2.0 × к монетам за клик
  passiveMult: number     // 0.5 – 2.0 × к пассивному доходу
  upgradeDiscount: number // 0.5 – 2.0 (2.0 = вдвое дешевле апгрейды)
}

function randStat(): number {
  // Равномерно в диапазоне 0.5–2.0, шаг 0.1
  return Math.round((0.5 + Math.random() * 1.5) * 10) / 10
}

export function rollGenetics(): GeneticsStats {
  return {
    clickMult: randStat(),
    passiveMult: randStat(),
    upgradeDiscount: randStat(),
  }
}

export function getGeneticsLabel(g: GeneticsStats): string {
  const { clickMult, passiveMult, upgradeDiscount } = g
  if (clickMult >= 1.7 && passiveMult >= 1.7) return '🔥 Мутант'
  if (clickMult >= 1.7) return '💪 Боец природы'
  if (passiveMult >= 1.7) return '🧬 Пассивный геном'
  if (upgradeDiscount >= 1.7) return '💰 Умный инвестор'
  if (clickMult <= 0.7 && passiveMult <= 0.7) return '😢 Хардгейнер'
  return '⚖️ Сбалансированный'
}

// upgradeDiscount > 1 → апгрейды дешевле, < 1 → дороже
// cost × (1 / upgradeDiscount), min 0.25
export function getUpgradeCostFactor(g: GeneticsStats): number {
  return Math.max(0.25, 1 / g.upgradeDiscount)
}
