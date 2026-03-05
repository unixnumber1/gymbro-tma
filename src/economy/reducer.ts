import { GameState, createInitialState } from '../core/GameState'
import { GeneticsStats, rollGenetics } from '../systems/geneticsSystem'
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
import {
  TICK_INTERVAL_MS,
  GOALS_BONUS_PER_GOAL,
  EVENT_MIN_INTERVAL_MS,
  EVENT_EXTRA_RANGE_MS,
  BOOST_DURATION_MS,
} from '../config/gameConfig'
import { GOALS } from '../systems/goalsSystem'

// ── Action types ──────────────────────────────────────────

export type GameAction =
  | { type: 'CLICK' }
  | { type: 'TICK' }
  | { type: 'BUY_AUTO_CLICKER'; id: string }
  | { type: 'BUY_APPEARANCE' }
  | { type: 'PRESTIGE' }
  | { type: 'ADD_OFFLINE_COINS'; coins: number }
  | { type: 'SET_GENETICS'; genetics: GeneticsStats }
  | { type: 'LOAD_SAVE'; state: GameState }

// ── Helpers ───────────────────────────────────────────────

function goalsMult(state: GameState): number {
  return 1 + state.completedGoals.length * GOALS_BONUS_PER_GOAL
}

function recalcDerived(state: GameState): GameState {
  const gm = goalsMult(state)
  return {
    ...state,
    currentClickIncome: calcClickIncome(
      state.appearanceStage,
      state.prestigePoints,
      state.pumpActive,
      state.genetics,
      gm,
    ),
    coinsPerSecond: calcTotalCoinsPerSecond(
      state.autoClickers,
      state.genetics,
      state.appearanceStage,
      gm,
      state.prestigePoints,
    ),
  }
}

function checkGoals(state: GameState): GameState {
  const newGoals = GOALS
    .filter(g => !state.completedGoals.includes(g.id) && g.check(state))
    .map(g => g.id)
  if (newGoals.length === 0) return state
  return recalcDerived({ ...state, completedGoals: [...state.completedGoals, ...newGoals] })
}

// ── Reducer ───────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'CLICK': {
      // Буст ×2 к клику применяется здесь
      const boostMult = (state.activeBoost && Date.now() < state.activeBoost.endTime) ? 2 : 1
      const earned = state.currentClickIncome * boostMult
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
      let needsRecalc = false

      if (pumpActive) {
        if (now >= pumpEndTime) {
          pumpActive = false
          pumpMeter = 0
          pumpCooldownEndTime = now + PUMP_COOLDOWN_MS
          needsRecalc = true
        }
      } else if (now >= pumpCooldownEndTime) {
        const estimatedCps = Math.min(pendingClicks * (1000 / TICK_INTERVAL_MS), PUMP_MAX_CPS)
        const gain = estimatedCps * PUMP_GAIN_PER_CPS * tickSec
        const decay = pendingClicks === 0 && pumpMeter > 0 ? PUMP_DECAY_PER_TICK : 0
        pumpMeter = Math.max(0, Math.min(1, pumpMeter + gain - decay))
        if (pumpMeter >= 1.0) {
          pumpActive = true
          pumpMeter = 1.0
          pumpEndTime = now + PUMP_DURATION_MS
          needsRecalc = true
        }
      }

      // ── Случайные события ─────────────────────────────────
      let { activeBoost, nextEventTime } = state
      if (now >= nextEventTime && !activeBoost) {
        activeBoost = { type: 'x2click', endTime: now + BOOST_DURATION_MS }
        nextEventTime = now + EVENT_MIN_INTERVAL_MS + Math.random() * EVENT_EXTRA_RANGE_MS
        needsRecalc = true
      }
      // Буст истёк
      if (activeBoost && now >= activeBoost.endTime) {
        activeBoost = null
        needsRecalc = true
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
        activeBoost,
        nextEventTime,
      }

      const withGoals = checkGoals(next)
      const goalsChanged = withGoals.completedGoals.length !== state.completedGoals.length

      if (needsRecalc || goalsChanged) return recalcDerived(withGoals)
      return withGoals
    }

    case 'BUY_AUTO_CLICKER': {
      const ac = state.autoClickers.find(a => a.id === action.id)
      if (!ac) return state
      const price = calcAutoClickerPrice(action.id, ac.owned, state.genetics, state.appearanceStage)
      if (state.coins < price) return state

      return checkGoals(recalcDerived({
        ...state,
        coins: state.coins - price,
        autoClickers: state.autoClickers.map(a =>
          a.id === action.id ? { ...a, owned: a.owned + 1 } : a,
        ),
      }))
    }

    case 'BUY_APPEARANCE': {
      const nextStage = state.appearanceStage + 1
      if (nextStage >= STAGE_COUNT) return state
      const price = getStageCost(nextStage, 1)  // appearance discount handled inside getStageCost via appearanceCostFactor
      if (state.coins < price) return state

      return checkGoals(recalcDerived({
        ...state,
        coins: state.coins - price,
        appearanceStage: nextStage,
      }))
    }

    case 'PRESTIGE': {
      const gained = calcPrestigePointsGain(state.totalCoinsEarned)
      const newGenetics = rollGenetics()
      const fresh = createInitialState()
      return recalcDerived({
        ...fresh,
        genetics: newGenetics,
        prestigePoints: state.prestigePoints + gained,
        totalPrestiges: state.totalPrestiges + 1,
        totalClicks: state.totalClicks,
        totalPlayTime: state.totalPlayTime,
        completedGoals: state.completedGoals,
        nextEventTime: state.nextEventTime,
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
