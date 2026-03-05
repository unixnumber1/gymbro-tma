import { useReducer, useEffect, useState, useCallback, useRef } from 'react'
import { gameReducer } from '../economy/reducer'
import { loadSave, scheduleSave, saveImmediate } from '../core/SaveManager'
import { startGameLoop, calcOfflineCoins } from '../core/GameEngine'
import { TelegramSDK } from '../telegram/TelegramSDK'
import { GeneticsType } from '../systems/geneticsSystem'
import { getStageCost, STAGE_COUNT } from '../systems/appearanceSystem'
import { getGeneticsConfig } from '../systems/geneticsSystem'
import { getPumpCooldownFraction } from '../systems/pumpSystem'
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

  // ── Автосейв ────────────────────────────────────────────
  useEffect(() => { scheduleSave(state) }, [state])

  // ── Детект смены стадии → StageUp modal ─────────────────
  useEffect(() => {
    if (state.appearanceStage > prevStageRef.current) {
      setStageUpEvent(state.appearanceStage)
      TelegramSDK.hapticSuccess()
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

  // ── Тап по персонажу ────────────────────────────────────
  const handleTap = useCallback((x: number, y: number) => {
    dispatch({ type: 'CLICK' })
    TelegramSDK.hapticLight()
    addFloat(`+${formatNumber(stateRef.current.currentClickIncome)} GBC`, x, y - 30)
  }, [addFloat])

  // ── Генетика ─────────────────────────────────────────────
  const handleSelectGenetics = useCallback((type: GeneticsType) => {
    dispatch({ type: 'SET_GENETICS', genetics: type })
  }, [])

  // ── Прогресс до следующей стадии ────────────────────────
  const nextStage = state.appearanceStage + 1
  const isMaxed = nextStage >= STAGE_COUNT
  const costMult = state.genetics ? getGeneticsConfig(state.genetics).stageCostMult : 1
  const nextStageCost = isMaxed ? 1 : getStageCost(nextStage, costMult)
  const progressFraction = isMaxed ? 1 : Math.min(1, state.coins / nextStageCost)

  // Pump кулдаун
  const cooldownFraction = getPumpCooldownFraction(state.pumpCooldownEndTime)

  return (
    <div
      style={{
        ...styles.root,
        animation: shaking ? 'screenShake 0.4s ease' : 'none',
      }}
    >
      {/* Оверлей красноватого тона при pump */}
      {state.pumpActive && <div style={styles.pumpOverlay} />}

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
        {activeTab === 'stats'      && <StatsTab      state={state} />}
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Модал генетики (первый запуск) */}
      {state.genetics === null && (
        <GeneticsModal onSelect={handleSelectGenetics} />
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
  characterZone: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 240px',
    gap: 4,
    borderBottom: '1px solid #1a1a2e',
    transition: 'background 0.5s ease',
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#0f0f1a',
  },
}
