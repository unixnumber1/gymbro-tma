// ============================================================
// CHARACTER CONFIG
// Все анатомические параметры персонажа.
// SKINNY = stage 0, MASSIVE = stage 29.
// Промежуточные значения вычисляет morphSystem.
// ============================================================

export interface CharacterParams {
  // ── Голова ────────────────────────────────────────────────
  headR: number          // радиус головы

  // ── Шея ───────────────────────────────────────────────────
  neckW: number          // ширина шеи
  neckH: number          // высота шеи

  // ── Трапеция ──────────────────────────────────────────────
  trapRise: number       // насколько трапеция поднимается над плечом
  trapSpread: number     // полуширина основания трапеции

  // ── Дельтовидные (плечи) ──────────────────────────────────
  shoulderX: number      // смещение центра плеча от центра тела
  deltW: number          // горизонтальный радиус дельтовидной
  deltH: number          // вертикальный размер дельтовидной

  // ── Торс ──────────────────────────────────────────────────
  chestW: number         // полуширина торса на уровне груди
  waistW: number         // полуширина торса на уровне талии
  torsoH: number         // высота торса

  // ── Грудные мышцы ─────────────────────────────────────────
  pecBulge: number       // насколько грудь выпирает (для тени)
  pecSepDepth: number    // глубина разделительной линии

  // ── Руки ──────────────────────────────────────────────────
  bicepW: number         // полуширина бицепса
  bicepPeak: number      // дополнительный пик бицепса (наружу)
  forearmW: number       // полуширина предплечья
  armLen: number         // полная длина руки (плечо + предплечье)
  elbowAt: number        // где локоть (доля от armLen, 0-1)

  // ── Нижняя часть тела ─────────────────────────────────────
  hipW: number           // полуширина бёдер
  quadW: number          // полуширина квадрицепса (бедра)
  calfBulge: number      // выпирание икры
  legLen: number         // длина ноги

  // ── Визуальные эффекты ────────────────────────────────────
  shadowDepth: number    // интенсивность теней (0-1)
  veinOpacity: number    // видимость вен (0-1)
  absOpacity: number     // видимость пресса (0-1)
  glowIntensity: number  // интенсивность свечения (0-1)
  auraIntensity: number  // интенсивность ауры (0-1)

  // ── Цвета ─────────────────────────────────────────────────
  skinBase: string       // базовый цвет кожи
  skinShadow: string     // тень на коже
  skinHighlight: string  // блик на коже
  shirtBase: string      // базовый цвет майки
  shirtShadow: string    // тень майки
  pantsBase: string      // цвет штанов
  pantsShadow: string    // тень штанов
  glowColor: string      // цвет свечения
  veinColor: string      // цвет вен
}

// ── Базовые формы ─────────────────────────────────────────────

export const PARAMS_SKINNY: CharacterParams = {
  headR: 21,
  neckW: 10,    neckH: 17,
  trapRise: 0,  trapSpread: 6,
  shoulderX: 23, deltW: 10,   deltH: 8,
  chestW: 20,   waistW: 17,  torsoH: 86,
  pecBulge: 0,  pecSepDepth: 0,
  bicepW: 6.5,  bicepPeak: 0.5, forearmW: 5.5,
  armLen: 98,   elbowAt: 0.45,
  hipW: 15,
  quadW: 9,     calfBulge: 3,  legLen: 88,
  shadowDepth: 0.05, veinOpacity: 0, absOpacity: 0,
  glowIntensity: 0,  auraIntensity: 0,
  skinBase: '#f0c8a0', skinShadow: '#c89060', skinHighlight: '#fff0d8',
  shirtBase: '#4a6fa5', shirtShadow: '#2a4f85',
  pantsBase: '#2c3e50', pantsShadow: '#1a2e40',
  glowColor: 'transparent', veinColor: 'rgba(120,50,10,0.6)',
}

export const PARAMS_MASSIVE: CharacterParams = {
  headR: 24,
  neckW: 29,    neckH: 12,
  trapRise: 20, trapSpread: 26,
  shoulderX: 70, deltW: 25,  deltH: 21,
  chestW: 66,   waistW: 44, torsoH: 94,
  pecBulge: 10, pecSepDepth: 2.5,
  bicepW: 21,   bicepPeak: 9, forearmW: 15,
  armLen: 106,  elbowAt: 0.46,
  hipW: 37,
  quadW: 21,    calfBulge: 11, legLen: 93,
  shadowDepth: 0.22, veinOpacity: 0, absOpacity: 0,  // computed via stage
  glowIntensity: 0,  auraIntensity: 0,               // computed via stage
  skinBase: '#cc3800', skinShadow: '#8a1800', skinHighlight: '#ee6040',
  shirtBase: '#b02020', shirtShadow: '#700010',
  pantsBase: '#0a0a0a', pantsShadow: '#050505',
  glowColor: '#ff2200', veinColor: 'rgba(200,40,0,0.75)',
}

// ── Цвета тиров (по 5 стадий) ─────────────────────────────────
// Снапятся при переходе тира, не интерполируются непрерывно
interface TierColors {
  skinBase: string; skinShadow: string; skinHighlight: string
  shirtBase: string; shirtShadow: string
  pantsBase: string; pantsShadow: string
  glowColor: string; veinColor: string
}

export const TIER_COLORS: TierColors[] = [
  { // 0: Дрищ (0-4)
    skinBase: '#f0c8a0', skinShadow: '#c89060', skinHighlight: '#fff4e0',
    shirtBase: '#4a6fa5', shirtShadow: '#2a4f85',
    pantsBase: '#2c3e50', pantsShadow: '#1a2e40',
    glowColor: 'transparent', veinColor: 'rgba(120,50,10,0.6)',
  },
  { // 1: Новичок (5-9)
    skinBase: '#eab882', skinShadow: '#bb8042', skinHighlight: '#ffddaa',
    shirtBase: '#27ae60', shirtShadow: '#1a7a40',
    pantsBase: '#243040', pantsShadow: '#121820',
    glowColor: 'transparent', veinColor: 'rgba(110,45,10,0.65)',
  },
  { // 2: Середнячок (10-14)
    skinBase: '#d4945c', skinShadow: '#a06030', skinHighlight: '#eeaa70',
    shirtBase: '#c0392b', shirtShadow: '#801020',
    pantsBase: '#1a1a2e', pantsShadow: '#0d0d1a',
    glowColor: '#ff4422', veinColor: 'rgba(100,30,5,0.7)',
  },
  { // 3: Атлет (15-19)
    skinBase: '#bf7030', skinShadow: '#883010', skinHighlight: '#dd9050',
    shirtBase: '#6a1aaa', shirtShadow: '#3a0070',
    pantsBase: '#0f0f1e', pantsShadow: '#08080f',
    glowColor: '#aa22ff', veinColor: 'rgba(180,30,0,0.75)',
  },
  { // 4: Элита (20-24)
    skinBase: '#aa5018', skinShadow: '#702000', skinHighlight: '#cc7030',
    shirtBase: '#d47000', shirtShadow: '#904000',
    pantsBase: '#080808', pantsShadow: '#040404',
    glowColor: '#ff7700', veinColor: 'rgba(220,30,0,0.8)',
  },
  { // 5: Монстр (25-29)
    skinBase: '#cc3800', skinShadow: '#8a1800', skinHighlight: '#ee6040',
    shirtBase: '#b02020', shirtShadow: '#700010',
    pantsBase: '#030303', pantsShadow: '#010101',
    glowColor: '#ff2200', veinColor: 'rgba(255,20,0,0.85)',
  },
]
