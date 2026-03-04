// ── Appearance System — 30 стадий трансформации ──────────

export const STAGE_COUNT = 30

// Параметры тела персонажа (SVG-единицы, viewBox 200×300)
export interface BodyParams {
  headR: number
  neckW: number
  shoulderSpan: number   // полуширина плеч от центра
  armW: number           // полуширина руки
  armLen: number         // длина руки
  torsoTopW: number      // полуширина торса вверху
  torsoBottomW: number   // полуширина торса внизу
  hipW: number
  legW: number
  glowIntensity: number  // 0–1, начинается с ~stage 17
  veinOpacity: number    // 0–1, начинается с ~stage 12
  auraIntensity: number  // 0–1, начинается с ~stage 21
  skinTone: string
  shirtColor: string
  pantsColor: string
  glowColor: string
}

// Цвета по тирам (по 5 стадий на тир)
const SKIN_TONES  = ['#f0c8a0', '#e8b890', '#d4985c', '#c07840', '#b06020', '#dd4400']
const SHIRT_COLORS = ['#4a6fa5', '#27ae60', '#e74c3c', '#9b59b6', '#f39c12', '#c0392b']
const PANTS_COLORS = ['#2c3e50', '#1a252f', '#1a1a2e', '#0d0d1a', '#080808', '#000000']
const GLOW_COLORS  = ['transparent', 'transparent', '#ff6644', '#bb44ff', '#ff8800', '#ff3300']

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

export function getBodyParams(stage: number): BodyParams {
  const t = stage / (STAGE_COUNT - 1)   // 0.0 → 1.0
  const tier = Math.min(Math.floor(stage / 5), 5)
  return {
    headR:         lerp(21, 27, t * 0.6),
    neckW:         lerp(12, 26, t),
    shoulderSpan:  lerp(28, 76, t),
    armW:          lerp(7, 22, t),
    armLen:        lerp(66, 82, t),
    torsoTopW:     lerp(26, 74, t),
    torsoBottomW:  lerp(20, 44, t),
    hipW:          lerp(18, 40, t),
    legW:          lerp(8, 15, t),
    glowIntensity: t > 0.55 ? (t - 0.55) / 0.45 : 0,
    veinOpacity:   t > 0.38 ? (t - 0.38) / 0.62 : 0,
    auraIntensity: t > 0.69 ? (t - 0.69) / 0.31 : 0,
    skinTone:   SKIN_TONES[tier],
    shirtColor: SHIRT_COLORS[tier],
    pantsColor: PANTS_COLORS[tier],
    glowColor:  GLOW_COLORS[tier],
  }
}

// 30 имён стадий
export const STAGE_NAMES: string[] = [
  'Дрищ 50 кг',          // 0
  'Начинающий',           // 1
  'Новобранец',           // 2
  'Зал-разведчик',        // 3
  'Любитель',             // 4
  'Регуляр',              // 5
  'Тренированный',        // 6
  'Физкультурник',        // 7
  'Качок-любитель',       // 8
  'Завсегдатай зала',     // 9
  'Спортсмен',            // 10
  'Атлет',                // 11
  'Физически развитый',   // 12
  'Кандидат в мастера',   // 13
  'Мастер зала',          // 14
  'Элитный атлет',        // 15
  'Силач',                // 16
  'Гигант',               // 17
  'Полубог зала',         // 18
  'Зальный бог',          // 19
  'Мастер массы',         // 20
  'Легенда',              // 21
  'Монстр силы',          // 22
  'Живая легенда',        // 23
  'Сверхчеловек',         // 24
  'Гиперкачок',           // 25
  'Ультимат',             // 26
  'Запредельный',         // 27
  'Богоподобный',         // 28
  'Абсолютный монстр',    // 29
]

export const TIER_NAMES = ['Дрищ', 'Новичок', 'Середнячок', 'Атлет', 'Элита', 'Монстр']

export function getStageTier(stage: number): number {
  return Math.min(Math.floor(stage / 5), 5)
}

// Стоимость перехода НА эту стадию: 50 × 1.35^stage
const BASE_STAGE_COST = 50
const STAGE_COST_FACTOR = 1.35

export function getStageCost(stage: number, costMult: number = 1): number {
  if (stage === 0) return 0
  return Math.ceil(BASE_STAGE_COST * Math.pow(STAGE_COST_FACTOR, stage) * costMult)
}

// Мультипликатор клика от внешности: 1.15^stage
export function getAppearanceMultiplier(stage: number): number {
  return Math.pow(1.15, stage)
}
