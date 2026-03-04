// ── Genetics System ────────────────────────────────────────

export type GeneticsType = 'hardgainer' | 'normal' | 'freak'

export interface GeneticsConfig {
  type: GeneticsType
  label: string
  emoji: string
  description: string
  // Множители (1.0 = без изменений)
  stageCostMult: number        // стоимость стадий внешки
  autoClickerCostMult: number  // стоимость автокликеров
  clickMult: number            // доход с ручного клика
  autoIncMult: number          // пассивный доход
}

export const GENETICS_CONFIGS: Record<GeneticsType, GeneticsConfig> = {
  hardgainer: {
    type: 'hardgainer',
    label: 'Хардгейнер',
    emoji: '🧬',
    description: 'Апгрейды дешевле, но ручной клик слабее. Идеал для пассивной игры.',
    stageCostMult: 0.75,
    autoClickerCostMult: 0.75,
    clickMult: 0.85,
    autoIncMult: 1.0,
  },
  normal: {
    type: 'normal',
    label: 'Нормальный',
    emoji: '⚖️',
    description: 'Сбалансированный профиль. Никаких бонусов и штрафов.',
    stageCostMult: 1.0,
    autoClickerCostMult: 1.0,
    clickMult: 1.0,
    autoIncMult: 1.0,
  },
  freak: {
    type: 'freak',
    label: 'Фрик природы',
    emoji: '💀',
    description: 'Всё дороже, но ручной клик убийственный. Для активных игроков.',
    stageCostMult: 1.30,
    autoClickerCostMult: 1.30,
    clickMult: 1.50,
    autoIncMult: 0.90,
  },
}

export function getGeneticsConfig(type: GeneticsType): GeneticsConfig {
  return GENETICS_CONFIGS[type]
}

// Случайный тип при первом запуске
// Веса: hardgainer 30%, normal 40%, freak 30%
export function rollGenetics(): GeneticsType {
  const r = Math.random()
  if (r < 0.30) return 'hardgainer'
  if (r < 0.70) return 'normal'
  return 'freak'
}
