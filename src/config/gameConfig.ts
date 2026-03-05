// ============================================================
// GAME CONFIG — все магические числа здесь
// ============================================================

export const TICK_INTERVAL_MS = 100        // 10 тиков/сек
export const SAVE_DEBOUNCE_MS = 3000
export const SAVE_KEY = 'gymbro_save_v2'
export const SAVE_VERSION = 3              // bump → сброс старых сейвов

export const MAX_OFFLINE_SECONDS = 3 * 60 * 60  // 3 часа

// ── КЛИК ──────────────────────────────────────────────────
export const BASE_CLICK_INCOME = 1

// ── АВТОКЛИКЕРЫ (15 штук) ─────────────────────────────────
export const AUTO_CLICKERS_CONFIG = [
  { id: 'creatine',    name: 'Банка креатина',        emoji: '🥄', basePrice: 15,             incomePerSecond: 0.1     },
  { id: 'shaker',      name: 'Шейкер протеина',        emoji: '🥤', basePrice: 100,            incomePerSecond: 0.5     },
  { id: 'gym_pass',    name: 'Абонемент в зал',        emoji: '🏋️', basePrice: 500,            incomePerSecond: 2.0     },
  { id: 'ampoule',     name: 'Таинственная ампула',    emoji: '💉', basePrice: 3000,           incomePerSecond: 8.0     },
  { id: 'lab',         name: 'Лаборатория массы',      emoji: '🧬', basePrice: 20000,          incomePerSecond: 25.0    },
  { id: 'trainer',     name: 'Персональный тренер',    emoji: '🥊', basePrice: 150000,         incomePerSecond: 75      },
  { id: 'private_gym', name: 'Частный зал',            emoji: '🏟️', basePrice: 1200000,        incomePerSecond: 200     },
  { id: 'ai_coach',    name: 'ИИ-тренер',              emoji: '🤖', basePrice: 10000000,       incomePerSecond: 600     },
  { id: 'protocol',    name: 'Секретный протокол',      emoji: '💊', basePrice: 85000000,       incomePerSecond: 1800    },
  { id: 'gene_upg',    name: 'Генетический апгрейд',   emoji: '🧪', basePrice: 750000000,      incomePerSecond: 5500    },
  { id: 'gym_network', name: 'Сеть залов',              emoji: '🌐', basePrice: 6500000000,     incomePerSecond: 17000   },
  { id: 'space_gym',   name: 'Космическая тренировка',  emoji: '🚀', basePrice: 60000000000,    incomePerSecond: 52000   },
  { id: 'neuro',       name: 'Нейро-стероиды',          emoji: '⚡', basePrice: 550000000000,   incomePerSecond: 160000  },
  { id: 'galaxy_gym',  name: 'Галактический зал',        emoji: '🌌', basePrice: 5000000000000,  incomePerSecond: 500000  },
  { id: 'quantum',     name: 'Квантовое тело',           emoji: '🌟', basePrice: 45000000000000, incomePerSecond: 1500000 },
] as const

export const PRICE_GROWTH_FACTOR = 1.15

// ── ПРЕСТИЖ ───────────────────────────────────────────────
export const PRESTIGE_MIN_COINS_EARNED = 500_000
export const PRESTIGE_DIVISOR = 5_000_000
export const PRESTIGE_POINT_MULTIPLIER = 0.02

// ── ЦЕЛИ ──────────────────────────────────────────────────
export const GOALS_BONUS_PER_GOAL = 0.10  // +10% ко всему доходу за каждую цель

// ── СОБЫТИЯ ───────────────────────────────────────────────
export const EVENT_MIN_INTERVAL_MS = 120_000   // минимум 2 мин между событиями
export const EVENT_EXTRA_RANGE_MS  = 180_000   // +0-3 мин случайно
export const BOOST_DURATION_MS     = 30_000    // буст ×2 на 30 сек
