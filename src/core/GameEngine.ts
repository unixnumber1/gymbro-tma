import { TICK_INTERVAL_MS, MAX_OFFLINE_SECONDS } from '../config/gameConfig'
import { GameState } from './GameState'

export type TickDispatch = (coinsEarned: number, elapsedSeconds: number) => void

let intervalId: ReturnType<typeof setInterval> | null = null

export function startGameLoop(dispatch: TickDispatch) {
  if (intervalId) return
  const elapsedPerTick = TICK_INTERVAL_MS / 1000  // секунды за тик
  intervalId = setInterval(() => {
    dispatch(0, elapsedPerTick)  // coins считаются в reducer из coinsPerSecond
  }, TICK_INTERVAL_MS)
}

export function stopGameLoop() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Офлайн-прогресс: считаем, сколько монет накопилось пока игра была закрыта
export function calcOfflineCoins(state: GameState): number {
  const now = Date.now()
  const offlineMs = now - state.lastSaveTime
  const offlineSec = Math.min(offlineMs / 1000, MAX_OFFLINE_SECONDS)
  return offlineSec * state.coinsPerSecond
}
