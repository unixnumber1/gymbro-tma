import { GameState, AutoClicker, createInitialState } from './GameState'
import { SAVE_KEY, SAVE_VERSION, SAVE_DEBOUNCE_MS } from '../config/gameConfig'

// ── Save ──────────────────────────────────────────────────

export function saveImmediate(state: GameState) {
  try {
    const data = { ...state, lastSaveTime: Date.now(), version: SAVE_VERSION }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    console.log(
      `[Save] ✅ Saved: coins=${Math.floor(state.coins)}, totalEarned=${Math.floor(state.totalCoinsEarned)}, ` +
      `stage=${state.appearanceStage}, prestiges=${state.totalPrestiges}, goals=${state.completedGoals.length}`,
    )
  } catch (e) {
    console.error('[Save] ❌ Failed to save:', e)
  }
}

// Дебаунс — НЕ сбрасывается повторными вызовами с тем же tickCounter
let saveTimer: ReturnType<typeof setTimeout> | null = null
let lastScheduledAt = 0

export function scheduleSave(state: GameState) {
  const now = Date.now()
  // Игнорируем вызовы чаще чем раз в 500мс (тики 100мс забивали таймер)
  if (now - lastScheduledAt < 500) return
  lastScheduledAt = now
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveImmediate(state), SAVE_DEBOUNCE_MS)
}

// ── Load ──────────────────────────────────────────────────

export function loadSave(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) {
      console.log('[Save] 🆕 No save found, starting fresh')
      return createInitialState()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(raw) as any
    console.log(
      `[Save] 📂 Loading save: version=${parsed.version}, coins=${Math.floor(parsed.coins ?? 0)}, ` +
      `totalEarned=${Math.floor(parsed.totalCoinsEarned ?? 0)}, ` +
      `stage=${parsed.appearanceStage ?? 0}, prestiges=${parsed.totalPrestiges ?? 0}`,
    )

    const initial = createInitialState()

    // Мержим autoClickers: у новых айтемов (которых не было в старом сейве) — 0
    const savedAC: AutoClicker[] = Array.isArray(parsed.autoClickers) ? parsed.autoClickers : []
    const mergedAC = initial.autoClickers.map(def => {
      const found = savedAC.find(a => a.id === def.id)
      return found ?? def
    })

    const loaded: GameState = {
      ...initial,
      ...parsed,
      // Всегда перезаписываем служебные поля
      version: SAVE_VERSION,
      autoClickers: mergedAC,
      completedGoals: Array.isArray(parsed.completedGoals) ? parsed.completedGoals : [],
      genetics: (parsed.genetics && typeof parsed.genetics === 'object') ? parsed.genetics : null,
      activeBoost: (parsed.activeBoost && typeof parsed.activeBoost === 'object') ? parsed.activeBoost : null,
      // Новые поля с дефолтами для старых сейвов
      diamonds: typeof parsed.diamonds === 'number' ? parsed.diamonds : 0,
      completedAchievements: (parsed.completedAchievements && typeof parsed.completedAchievements === 'object' && !Array.isArray(parsed.completedAchievements)) ? parsed.completedAchievements : {},
      shopClickBoostEndTime: typeof parsed.shopClickBoostEndTime === 'number' ? parsed.shopClickBoostEndTime : 0,
      shopPassiveBoostEndTime: typeof parsed.shopPassiveBoostEndTime === 'number' ? parsed.shopPassiveBoostEndTime : 0,
      permanentClickBonus: typeof parsed.permanentClickBonus === 'number' ? parsed.permanentClickBonus : 0,
      permanentPassiveBonus: typeof parsed.permanentPassiveBonus === 'number' ? parsed.permanentPassiveBonus : 0,
      ownedSkins: Array.isArray(parsed.ownedSkins) ? parsed.ownedSkins : [],
      activeSkin: typeof parsed.activeSkin === 'string' ? parsed.activeSkin : null,
    }

    console.log('[Save] ✅ State restored successfully')
    return loaded
  } catch (e) {
    console.error('[Save] ❌ Failed to load save, starting fresh:', e)
    return createInitialState()
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY)
  console.log('[Save] 🗑️ Save cleared')
}
