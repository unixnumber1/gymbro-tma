import { useReducer, useEffect, useState, useCallback, useRef } from 'react'
import { gameReducer } from '../economy/reducer'
import { loadSave, scheduleSave, saveImmediate } from '../core/SaveManager'
import { startGameLoop, calcOfflineCoins } from '../core/GameEngine'
import { TelegramSDK } from '../telegram/TelegramSDK'
import { GeneticsStats } from '../systems/geneticsSystem'
import { getStageCost, STAGE_COUNT } from '../systems/appearanceSystem'
import { getPumpCooldownFraction } from '../systems/pumpSystem'
import { GOALS } from '../systems/goalsSystem'
import { upsertScore } from '../services/leaderboardService'
import { formatNumber } from './formatNumber'

import { BalanceBar } from './components/BalanceBar'
import { Character } from './components/Character'
import { FloatingText, useFloatingTexts } from './components/FloatingText'
import { TabBar, TabId } from './components/TabBar'
import { PumpMeter } from './components/PumpMeter'
import { UpgradesTab } from './components/UpgradesTab'
import { AppearanceTab } from './components/AppearanceTab'
import { PrestigeTab } from './components/PrestigeTab'
import { StatsTab } from './components/StatsTab'
import { GoalsTab } from './components/GoalsTab'
import { LeaderboardTab } from './components/LeaderboardTab'
import { GeneticsModal } from './components/GeneticsModal'
import { StageUpModal } from './components/StageUpModal'

// ── Глобальные CSS-анимации ────────────────────────────────
const GLOBAL_CSS = `
  @keyframes auraPulse {
    0%   { opacity: 0.12; transform: scale(0.97); }
    100% { opacity: 0.28; transform: scale(1.03); }
  }
  @keyframes pumpPulse {
    0%   { opacity: 0.04; }
    100% { opacity: 0.12; }
  }
  @keyframes screenShake {
    0%   { transform: translate(0, 0); }
    15%  { transform: translate(-3px, 1px); }
    30%  { transform: translate(3px, -2px); }
    45%  { transform: translate(-2px, 2px); }
    60%  { transform: translate(2px, -1px); }
    75%  { transform: translate(-1px, 1px); }
    100% { transform: translate(0, 0); }
  }
  @keyframes breathe {
    0%, 100% { transform: scaleY(1)     translateY(0px); }
    50%       { transform: scaleY(1.018) translateY(-1px); }
  }
  @keyframes shoulderBob {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-1.8px); }
  }
  @keyframes stageUpBounce {
    0%   { transform: scale(1); }
    25%  { transform: scale(1.14); }
    55%  { transform: scale(0.95); }
    75%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @keyframes boostSlideIn {
    0%   { transform: translateY(-60px); opacity: 0; }
    100% { transform: translateY(0);     opacity: 1; }
  }
`

export default function App() {
  // ── Стили ──────────────────────────────────────────────
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = GLOBAL_CSS
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  // ── State ──────────────────────────────────────────────
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => {
      const saved = loadSave()
      const offlineCoins = calcOfflineCoins(saved)
      if (offlineCoins > 1) {
        return { ...saved, coins: saved.coins + offlineCoins, totalCoinsEarned: saved.totalCoinsEarned + offlineCoins }
      }
      return saved
    },
  )

  const [activeTab, setActiveTab] = useState<TabId>('upgrades')
  const { items: floatItems, addFloat } = useFloatingTexts()

  // StageUp modal
  const [stageUpEvent, setStageUpEvent] = useState<number | null>(null)
  const prevStageRef = useRef(state.appearanceStage)

  // Screen shake при pump активации
  const [shaking, setShaking] = useState(false)
  const prevPumpRef = useRef(state.pumpActive)

  // Boost banner
  const [boostBanner, setBoostBanner] = useState(false)
  const prevBoostRef = useRef(state.activeBoost)

  // ── Telegram ────────────────────────────────────────────
  useEffect(() => { TelegramSDK.init() }, [])

  // ── Игровой цикл ────────────────────────────────────────
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    startGameLoop(() => dispatch({ type: 'TICK' }))
    const handleUnload = () => saveImmediate(stateRef.current)
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  // ── Автосейв при каждом изменении ───────────────────────
  useEffect(() => { scheduleSave(state) }, [state])

  // ── Автосейв каждые 10 секунд ────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => saveImmediate(stateRef.current), 10_000)
    return () => clearInterval(interval)
  }, [])

  // ── Синхронизация лидерборда ─────────────────────────────
  useEffect(() => {
    // Отправляем при старте
    upsertScore(stateRef.current.totalCoinsEarned, stateRef.current.totalPrestiges)
    // И каждые 30 секунд
    const interval = setInterval(() => {
      upsertScore(stateRef.current.totalCoinsEarned, stateRef.current.totalPrestiges)
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  // ── При престиже — немедленный сейв + лидерборд ─────────
  const prevPrestigesRef = useRef(state.totalPrestiges)
  useEffect(() => {
    if (state.totalPrestiges > prevPrestigesRef.current) {
      saveImmediate(stateRef.current)
      upsertScore(state.totalCoinsEarned, state.totalPrestiges)
    }
    prevPrestigesRef.current = state.totalPrestiges
  }, [state.totalPrestiges, state.totalCoinsEarned])

  // ── Детект смены стадии → StageUp modal + немедленный сейв ─
  useEffect(() => {
    if (state.appearanceStage > prevStageRef.current) {
      setStageUpEvent(state.appearanceStage)
      TelegramSDK.hapticSuccess()
      saveImmediate(stateRef.current)
    }
    prevStageRef.current = state.appearanceStage
  }, [state.appearanceStage])

  // ── Детект включения pump → screen shake ─────────────────
  useEffect(() => {
    if (state.pumpActive && !prevPumpRef.current) {
      setShaking(true)
      TelegramSDK.hapticMedium()
      setTimeout(() => setShaking(false), 400)
    }
    prevPumpRef.current = state.pumpActive
  }, [state.pumpActive])

  // ── Детект нового буста → баннер ────────────────────────
  useEffect(() => {
    const hadBoost = prevBoostRef.current !== null
    const hasBoost = state.activeBoost !== null
    if (hasBoost && !hadBoost) {
      setBoostBanner(true)
      TelegramSDK.hapticSuccess()
      setTimeout(() => setBoostBanner(false), 4000)
    }
    prevBoostRef.current = state.activeBoost
  }, [state.activeBoost])

  // ── Тап по персонажу ────────────────────────────────────
  const handleTap = useCallback((x: number, y: number) => {
    dispatch({ type: 'CLICK' })
    TelegramSDK.hapticLight()
    const boostMult = stateRef.current.activeBoost && Date.now() < stateRef.current.activeBoost.endTime ? 2 : 1
    const earned = stateRef.current.currentClickIncome * boostMult
    addFloat(`+${formatNumber(earned)} GBC`, x, y - 30)
  }, [addFloat])

  // ── Генетика (первый запуск) ─────────────────────────────
  const handleSelectGenetics = useCallback((g: GeneticsStats) => {
    dispatch({ type: 'SET_GENETICS', genetics: g })
  }, [])

  // ── Прогресс до следующей стадии ────────────────────────
  const nextStage = state.appearanceStage + 1
  const isMaxed = nextStage >= STAGE_COUNT
  const nextStageCost = isMaxed ? 1 : getStageCost(nextStage, 1)
  const progressFraction = isMaxed ? 1 : Math.min(1, state.coins / nextStageCost)

  // Pump кулдаун
  const cooldownFraction = getPumpCooldownFraction(state.pumpCooldownEndTime)

  // Оставшееся время буста
  const boostSecsLeft = state.activeBoost
    ? Math.max(0, Math.ceil((state.activeBoost.endTime - Date.now()) / 1000))
    : 0

  return (
    <div
      style={{
        ...styles.root,
        animation: shaking ? 'screenShake 0.4s ease' : 'none',
      }}
    >
      {/* Оверлей красноватого тона при pump */}
      {state.pumpActive && <div style={styles.pumpOverlay} />}

      {/* Boost баннер */}
      {(boostBanner || boostSecsLeft > 0) && (
        <div style={{
          ...styles.boostBanner,
          animation: boostBanner ? 'boostSlideIn 0.3s ease' : 'none',
        }}>
          🔥 Буст ×2 к клику! {boostSecsLeft > 0 ? `${boostSecsLeft}с` : ''}
        </div>
      )}

      <BalanceBar state={state} />

      {/* Зона персонажа */}
      <div style={styles.characterZone}>
        <FloatingText items={floatItems} />
        <Character
          stage={state.appearanceStage}
          pumpActive={state.pumpActive}
          progressFraction={progressFraction}
          onTap={handleTap}
        />
        <PumpMeter
          pumpMeter={state.pumpMeter}
          pumpActive={state.pumpActive}
          cooldownFraction={cooldownFraction}
        />
      </div>

      {/* Вкладки */}
      <div style={styles.tabContent}>
        {activeTab === 'upgrades'   && <UpgradesTab   state={state} dispatch={dispatch} />}
        {activeTab === 'appearance' && <AppearanceTab state={state} dispatch={dispatch} />}
        {activeTab === 'prestige'   && <PrestigeTab   state={state} dispatch={dispatch} />}
        {activeTab === 'goals'       && <GoalsTab       state={state} />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'stats'       && <StatsTab       state={state} />}
      </div>

      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        completedGoals={state.completedGoals.length}
        totalGoals={GOALS.length}
      />

      {/* Модал генетики (первый запуск) */}
      {state.genetics === null && (
        <GeneticsModal onConfirm={handleSelectGenetics} />
      )}

      {/* Модал смены стадии */}
      {stageUpEvent !== null && (
        <StageUpModal
          stage={stageUpEvent}
          onClose={() => setStageUpEvent(null)}
        />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#0f0f0f',
    color: '#eee',
    overflow: 'hidden',
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
  },
  pumpOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,40,0,0.04)',
    pointerEvents: 'none',
    zIndex: 1,
    animation: 'pumpPulse 0.5s ease-in-out infinite alternate',
  },
  boostBanner: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    background: 'linear-gradient(135deg, #7a2000, #cc4400)',
    border: '1px solid #ff6600',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '10px 16px',
    zIndex: 50,
    pointerEvents: 'none',
  },
  characterZone: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 240px',
    gap: 4,
    borderBottom: '1px solid #1a1a2e',
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#0f0f1a',
  },
}
