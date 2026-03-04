import { GameState, createInitialState } from '../core/GameState'
import { GeneticsType, getGeneticsConfig } from '../systems/geneticsSystem'
import { getStageCost, STAGE_COUNT } from '../systems/appearanceSystem'
import { calcClickIncome } from './ClickEngine'
import { calcAutoClickerPrice, calcTotalCoinsPerSecond } from './AutoClickEngine'
import { calcPrestigePointsGain } from './PrestigeEngine'
import {
  PUMP_DURATION_MS,
  PUMP_COOLDOWN_MS,
  PUMP_GAIN_PER_CPS,
  PUMP_DECAY_PER_TICK,
  PUMP_MAX_CPS,
} from '../systems/pumpSystem'
import { TICK_INTERVAL_MS } from '../config/gameConfig'

// ── Action types ──────────────────────────────────────────

export type GameAction =
  | { type: 'CLICK' }
  | { type: 'TICK' }
  | { type: 'BUY_AUTO_CLICKER'; id: string }
  | { type: 'BUY_APPEARANCE' }
  | { type: 'PRESTIGE' }
  | { type: 'ADD_OFFLINE_COINS'; coins: number }
  | { type: 'SET_GENETICS'; genetics: GeneticsType }
  | { type: 'LOAD_SAVE'; state: GameState }

// ── Helpers ───────────────────────────────────────────────

function recalcDerived(state: GameState): GameState {
  const geneticsCfg = state.genetics ? getGeneticsConfig(state.genetics) : null
  return {
    ...state,
    currentClickIncome: calcClickIncome(
      state.appearanceStage,
      state.prestigePoints,
      state.pumpActive,
      state.genetics,
    ),
    coinsPerSecond: calcTotalCoinsPerSecond(
      state.autoClickers,
      geneticsCfg?.autoIncMult ?? 1,
    ),
  }
}

// ── Reducer ───────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'CLICK': {
      const earned = state.currentClickIncome
      return {
        ...state,
        coins: state.coins + earned,
        totalCoinsEarned: state.totalCoinsEarned + earned,
        totalClicks: state.totalClicks + 1,
        pendingClicks: state.pendingClicks + 1,
      }
    }

    case 'TICK': {
      const tickSec = TICK_INTERVAL_MS / 1000
      const now = Date.now()

      // ── Авто-доход ────────────────────────────────────────
      const autoEarned = state.coinsPerSecond * tickSec

      // ── Pump logic ────────────────────────────────────────
      let { pumpMeter, pumpActive, pumpEndTime, pumpCooldownEndTime, pendingClicks } = state
      let pumpChanged = false

      if (pumpActive) {
        if (now >= pumpEndTime) {
          // Pump закончился
          pumpActive = false
          pumpMeter = 0
          pumpCooldownEndTime = now + PUMP_COOLDOWN_MS
          pumpChanged = true
        }
        // Пока pump активен — счётчик не трогаем
      } else if (now >= pumpCooldownEndTime) {
        // Обычный режим: обновляем шкалу
        const estimatedCps = Math.min(pendingClicks * (1000 / TICK_INTERVAL_MS), PUMP_MAX_CPS)
        const gain = estimatedCps * PUMP_GAIN_PER_CPS * tickSec
        const decay = pendingClicks === 0 && pumpMeter > 0 ? PUMP_DECAY_PER_TICK : 0
        pumpMeter = Math.max(0, Math.min(1, pumpMeter + gain - decay))

        if (pumpMeter >= 1.0) {
          pumpActive = true
          pumpMeter = 1.0
          pumpEndTime = now + PUMP_DURATION_MS
          pumpChanged = true
        }
      }

      const next: GameState = {
        ...state,
        coins: state.coins + autoEarned,
        totalCoinsEarned: state.totalCoinsEarned + autoEarned,
        totalPlayTime: state.totalPlayTime + tickSec,
        pumpMeter,
        pumpActive,
        pumpEndTime,
        pumpCooldownEndTime,
        pendingClicks: 0,
      }

      // Пересчитываем currentClickIncome только когда pump включился/выключился
      return pumpChanged ? recalcDerived(next) : next
    }

    case 'BUY_AUTO_CLICKER': {
      const ac = state.autoClickers.find(a => a.id === action.id)
      if (!ac) return state
      const costMult = state.genetics ? getGeneticsConfig(state.genetics).autoClickerCostMult : 1
      const price = calcAutoClickerPrice(action.id, ac.owned, costMult)
      if (state.coins < price) return state

      return recalcDerived({
        ...state,
        coins: state.coins - price,
        autoClickers: state.autoClickers.map(a =>
          a.id === action.id ? { ...a, owned: a.owned + 1 } : a,
        ),
      })
    }

    case 'BUY_APPEARANCE': {
      const nextStage = state.appearanceStage + 1
      if (nextStage >= STAGE_COUNT) return state
      const costMult = state.genetics ? getGeneticsConfig(state.genetics).stageCostMult : 1
      const price = getStageCost(nextStage, costMult)
      if (state.coins < price) return state

      return recalcDerived({
        ...state,
        coins: state.coins - price,
        appearanceStage: nextStage,
      })
    }

    case 'PRESTIGE': {
      const gained = calcPrestigePointsGain(state.totalCoinsEarned)
      const fresh = createInitialState()
      return recalcDerived({
        ...fresh,
        genetics: state.genetics,
        prestigePoints: state.prestigePoints + gained,
        totalPrestiges: state.totalPrestiges + 1,
        totalClicks: state.totalClicks,
        totalPlayTime: state.totalPlayTime,
      })
    }

    case 'SET_GENETICS': {
      return recalcDerived({ ...state, genetics: action.genetics })
    }

    case 'ADD_OFFLINE_COINS': {
      return {
        ...state,
        coins: state.coins + action.coins,
        totalCoinsEarned: state.totalCoinsEarned + action.coins,
      }
    }

    case 'LOAD_SAVE': {
      return recalcDerived(action.state)
    }

    default:
      return state
  }
}
