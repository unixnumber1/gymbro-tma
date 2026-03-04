// ============================================================
// GAME CONFIG — все магические числа здесь
// ============================================================

export const TICK_INTERVAL_MS = 100        // 10 тиков/сек
export const SAVE_DEBOUNCE_MS = 3000
export const SAVE_KEY = 'gymbro_save_v2'
export const SAVE_VERSION = 2

export const MAX_OFFLINE_SECONDS = 3 * 60 * 60  // 3 часа

// ── КЛИК ──────────────────────────────────────────────────
export const BASE_CLICK_INCOME = 1

// ── АВТОКЛИКЕРЫ ───────────────────────────────────────────
export const AUTO_CLICKERS_CONFIG = [
  { id: 'creatine', name: 'Банка креатина',     emoji: '🥄', basePrice: 15,    incomePerSecond: 0.1  },
  { id: 'shaker',   name: 'Шейкер протеина',    emoji: '🥤', basePrice: 100,   incomePerSecond: 0.5  },
  { id: 'gym_pass', name: 'Абонемент в зал',    emoji: '🏋️', basePrice: 500,   incomePerSecond: 2.0  },
  { id: 'ampoule',  name: 'Таинственная ампула', emoji: '💉', basePrice: 3000,  incomePerSecond: 8.0  },
  { id: 'lab',      name: 'Лаборатория массы',   emoji: '🧬', basePrice: 20000, incomePerSecond: 25.0 },
] as const

export const PRICE_GROWTH_FACTOR = 1.15

// ── ПРЕСТИЖ ───────────────────────────────────────────────
export const PRESTIGE_MIN_COINS_EARNED = 500_000
export const PRESTIGE_DIVISOR = 5_000_000
export const PRESTIGE_POINT_MULTIPLIER = 0.02
