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
  DIAMONDS_PER_PRESTIGE,
} from '../config/gameConfig'
import { GOALS } from '../systems/goalsSystem'
import { checkAchievements } from '../systems/achievementsSystem'
import { SHOP_ITEMS, BOOST_DURATION_SHOP_MS } from '../systems/shopSystem'

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
  | { type: 'BUY_SHOP_ITEM'; itemId: string }
  | { type: 'BUY_GENETICS_REROLL'; genetics: GeneticsStats }
  | { type: 'ACTIVATE_SKIN'; skinId: string }

// ── Helpers ───────────────────────────────────────────────

function goalsMult(state: GameState): number {
  return 1 + state.completedGoals.length * GOALS_BONUS_PER_GOAL
}

function recalcDerived(state: GameState): GameState {
  const now = Date.now()
  const gm = goalsMult(state)
  return {
    ...state,
    currentClickIncome: calcClickIncome(
      state.appearanceStage,
      state.prestigePoints,
      state.pumpActive,
      state.genetics,
      gm,
      state.shopClickBoostEndTime > now,
      state.permanentClickBonus,
    ),
    coinsPerSecond: calcTotalCoinsPerSecond(
      state.autoClickers,
      state.genetics,
      state.appearanceStage,
      gm,
      state.prestigePoints,
      state.shopPassiveBoostEndTime > now,
      state.permanentPassiveBonus,
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

function checkAndAwardAchievements(state: GameState): GameState {
  const gained = checkAchievements(state, state.completedAchievements)
  if (gained.length === 0) return state
  const totalDiamonds = gained.reduce((sum, a) => sum + a.diamonds, 0)
  const newCompleted = { ...state.completedAchievements }
  for (const a of gained) newCompleted[a.id] = a.level
  return { ...state, diamonds: state.diamonds + totalDiamonds, completedAchievements: newCompleted }
}

// ── Reducer ───────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'CLICK': {
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
      if (activeBoost && now >= activeBoost.endTime) {
        activeBoost = null
        needsRecalc = true
      }

      // ── Магазин — истечение бустов ────────────────────────
      let { shopClickBoostEndTime, shopPassiveBoostEndTime } = state
      if (shopClickBoostEndTime > 0 && now >= shopClickBoostEndTime) {
        shopClickBoostEndTime = 0
        needsRecalc = true
      }
      if (shopPassiveBoostEndTime > 0 && now >= shopPassiveBoostEndTime) {
        shopPassiveBoostEndTime = 0
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
        shopClickBoostEndTime,
        shopPassiveBoostEndTime,
      }

      const withGoals = checkGoals(next)
      const goalsChanged = withGoals.completedGoals.length !== state.completedGoals.length

      const fullyDerived = (needsRecalc || goalsChanged) ? recalcDerived(withGoals) : withGoals
      return checkAndAwardAchievements(fullyDerived)
    }

    case 'BUY_AUTO_CLICKER': {
      const ac = state.autoClickers.find(a => a.id === action.id)
      if (!ac) return state
      const price = calcAutoClickerPrice(action.id, ac.owned, state.genetics, state.appearanceStage)
      if (state.coins < price) return state

      return checkAndAwardAchievements(checkGoals(recalcDerived({
        ...state,
        coins: state.coins - price,
        autoClickers: state.autoClickers.map(a =>
          a.id === action.id ? { ...a, owned: a.owned + 1 } : a,
        ),
      })))
    }

    case 'BUY_APPEARANCE': {
      const nextStage = state.appearanceStage + 1
      if (nextStage >= STAGE_COUNT) return state
      const price = getStageCost(nextStage, 1)
      if (state.coins < price) return state

      return checkAndAwardAchievements(checkGoals(recalcDerived({
        ...state,
        coins: state.coins - price,
        appearanceStage: nextStage,
      })))
    }

    case 'PRESTIGE': {
      const gained = calcPrestigePointsGain(state.totalCoinsEarned)
      const newGenetics = rollGenetics()
      const fresh = createInitialState()
      return checkAndAwardAchievements(recalcDerived({
        ...fresh,
        genetics: newGenetics,
        prestigePoints: state.prestigePoints + gained,
        totalPrestiges: state.totalPrestiges + 1,
        totalClicks: state.totalClicks,
        totalPlayTime: state.totalPlayTime,
        completedGoals: state.completedGoals,
        nextEventTime: state.nextEventTime,
        // Preserve diamonds and shop state across prestige
        diamonds: state.diamonds + DIAMONDS_PER_PRESTIGE,
        completedAchievements: state.completedAchievements,
        permanentClickBonus: state.permanentClickBonus,
        permanentPassiveBonus: state.permanentPassiveBonus,
        ownedSkins: state.ownedSkins,
        activeSkin: state.activeSkin,
        shopClickBoostEndTime: state.shopClickBoostEndTime,
        shopPassiveBoostEndTime: state.shopPassiveBoostEndTime,
      }))
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

    case 'BUY_SHOP_ITEM': {
      const item = SHOP_ITEMS.find(i => i.id === action.itemId)
      if (!item) return state

      // Skin already owned → just activate, no cost
      if (item.type === 'skin' && state.ownedSkins.includes(action.itemId)) {
        return { ...state, activeSkin: action.itemId }
      }

      if (state.diamonds < item.cost) return state

      const now = Date.now()
      let ns = { ...state, diamonds: state.diamonds - item.cost }

      switch (item.type) {
        case 'boost_click': {
          const currentEnd = ns.shopClickBoostEndTime > now ? ns.shopClickBoostEndTime : now
          ns = { ...ns, shopClickBoostEndTime: currentEnd + BOOST_DURATION_SHOP_MS }
          break
        }
        case 'boost_passive': {
          const currentEnd = ns.shopPassiveBoostEndTime > now ? ns.shopPassiveBoostEndTime : now
          ns = { ...ns, shopPassiveBoostEndTime: currentEnd + BOOST_DURATION_SHOP_MS }
          break
        }
        case 'perm_click':
          ns = { ...ns, permanentClickBonus: ns.permanentClickBonus + 0.1 }
          break
        case 'perm_passive':
          ns = { ...ns, permanentPassiveBonus: ns.permanentPassiveBonus + 0.1 }
          break
        case 'skin':
          ns = { ...ns, ownedSkins: [...ns.ownedSkins, action.itemId], activeSkin: action.itemId }
          break
        case 'genetics_reroll':
          // Handled by BUY_GENETICS_REROLL
          return state
      }

      return checkAndAwardAchievements(recalcDerived(ns))
    }

    case 'BUY_GENETICS_REROLL': {
      if (state.diamonds < 25) return state
      return checkAndAwardAchievements(recalcDerived({
        ...state,
        diamonds: state.diamonds - 25,
        genetics: action.genetics,
      }))
    }

    case 'ACTIVATE_SKIN': {
      if (!state.ownedSkins.includes(action.skinId)) return state
      return { ...state, activeSkin: action.skinId }
    }

    default:
      return state
  }
}
