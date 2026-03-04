import { GameState, createInitialState } from './GameState'
import { SAVE_KEY, SAVE_VERSION, SAVE_DEBOUNCE_MS } from '../config/gameConfig'

let saveTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleSave(state: GameState) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveImmediate(state), SAVE_DEBOUNCE_MS)
}

export function saveImmediate(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSaveTime: Date.now() }))
  } catch { /* приватный режим или квота */ }
}

export function loadSave(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<GameState>
    if (parsed.version !== SAVE_VERSION) return createInitialState()
    return { ...createInitialState(), ...parsed }
  } catch {
    return createInitialState()
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY)
}
