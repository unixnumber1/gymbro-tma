// ============================================================
// CHARACTER SVG — AAA процедурный персонаж
// Каждая мышечная группа — отдельная функция рисования.
// Никаких внешних ассетов. Только процедурный SVG.
// ============================================================

import { memo, useMemo } from 'react'
import { CharacterParams } from '../../config/characterConfig'
import { getCharacterParams } from '../../systems/morphSystem'

// ── ViewBox & центр ──────────────────────────────────────────
const VB_W = 200
const VB_H = 310
const CX = 100      // центр X
const HEAD_Y = 40   // Y центра головы

// ── Вспомогательные ──────────────────────────────────────────
function r2(n: number): number { return Math.round(n * 100) / 100 }

// ── Path-генераторы ───────────────────────────────────────────

// ТРАПЕЦИЯ — мышца между шеей и плечами
// Создаёт "нет шеи" эффект у сильных персонажей
function trapPath(p: CharacterParams, neckBotY: number): string {
  if (p.trapRise < 1) return ''
  const peakY = neckBotY - p.trapRise
  const lx = CX - p.trapSpread
  const rx = CX + p.trapSpread
  // Левая трапеция
  const leftD = [
    `M ${r2(CX - p.neckW / 2)} ${r2(neckBotY)}`,
    `C ${r2(CX - p.neckW * 0.8)} ${r2(peakY + p.trapRise * 0.3)}`,
    `  ${r2(lx + 8)} ${r2(peakY + 2)}`,
    `  ${r2(lx)} ${r2(peakY + p.trapRise * 0.6)}`,
    `L ${r2(lx - 8)} ${r2(neckBotY + 10)}`,
    `Z`,
  ].join(' ')
  // Правая трапеция (зеркало)
  const rightD = [
    `M ${r2(CX + p.neckW / 2)} ${r2(neckBotY)}`,
    `C ${r2(CX + p.neckW * 0.8)} ${r2(peakY + p.trapRise * 0.3)}`,
    `  ${r2(rx - 8)} ${r2(peakY + 2)}`,
    `  ${r2(rx)} ${r2(peakY + p.trapRise * 0.6)}`,
    `L ${r2(rx + 8)} ${r2(neckBotY + 10)}`,
    `Z`,
  ].join(' ')
  return leftD + ' ' + rightD
}

// ТОРС — V-образный с органической кривой
function torsoPath(p: CharacterParams, topY: number): string {
  const botY = topY + p.torsoH
  const ctrlY = topY + p.torsoH * 0.5
  return [
    `M ${r2(CX - p.chestW)} ${r2(topY)}`,
    `C ${r2(CX - p.chestW + 2)} ${r2(ctrlY - 5)}`,
    `  ${r2(CX - p.waistW - 3)} ${r2(ctrlY + 5)}`,
    `  ${r2(CX - p.waistW)} ${r2(botY)}`,
    `L ${r2(CX + p.waistW)} ${r2(botY)}`,
    `C ${r2(CX + p.waistW + 3)} ${r2(ctrlY + 5)}`,
    `  ${r2(CX + p.chestW - 2)} ${r2(ctrlY - 5)}`,
    `  ${r2(CX + p.chestW)} ${r2(topY)}`,
    `Z`,
  ].join(' ')
}

// ТЕНЬ ТОРСА — правая сторона темнее (имитация объёма)
function torsoShadowPath(p: CharacterParams, topY: number): string {
  const botY = topY + p.torsoH
  const ctrlY = topY + p.torsoH * 0.5
  const shadowW = p.chestW * 0.45
  return [
    `M ${r2(CX + p.chestW * 0.55)} ${r2(topY)}`,
    `C ${r2(CX + p.chestW * 0.6)} ${r2(ctrlY - 5)}`,
    `  ${r2(CX + p.waistW + 3)} ${r2(ctrlY + 5)}`,
    `  ${r2(CX + p.waistW)} ${r2(botY)}`,
    `L ${r2(CX + p.waistW - shadowW * 0.2)} ${r2(botY)}`,
    `C ${r2(CX + p.waistW)} ${r2(ctrlY + 5)}`,
    `  ${r2(CX + p.chestW * 0.55 - 5)} ${r2(ctrlY - 5)}`,
    `  ${r2(CX + p.chestW * 0.55)} ${r2(topY)}`,
    `Z`,
  ].join(' ')
}

// ГРУДНАЯ МЫШЦА (одна сторона) — выпуклая форма
// side: -1 = левая, +1 = правая
function pecPath(p: CharacterParams, topY: number, side: number): string {
  if (p.pecBulge < 0.5) return ''
  const pecH = p.torsoH * 0.42
  const pecTop = topY + 2
  const pecBot = topY + pecH
  const innerX = CX + side * p.pecSepDepth
  const outerX = CX + side * p.chestW * 0.95
  const midX = CX + side * p.chestW * 0.5
  const bulgeX = outerX - side * 5
  return [
    `M ${r2(innerX)} ${r2(pecTop)}`,
    `C ${r2(midX)} ${r2(pecTop - p.pecBulge * 0.3)}`,
    `  ${r2(bulgeX)} ${r2(pecTop + pecH * 0.1)}`,
    `  ${r2(outerX)} ${r2(pecTop + pecH * 0.3)}`,
    `C ${r2(outerX + side * 3)} ${r2(pecBot - 5)}`,
    `  ${r2(midX + side * 4)} ${r2(pecBot + 4)}`,
    `  ${r2(innerX)} ${r2(pecBot)}`,
    `Z`,
  ].join(' ')
}

// ДЕЛЬТОВИДНАЯ МЫШЦА — округлый плечевой кэп
// side: -1 = левая, +1 = правая
function deltoidPath(p: CharacterParams, shoulderY: number, side: number): string {
  const dCX = CX + side * p.shoulderX
  const dTop = shoulderY - 2
  const dBot = shoulderY + p.deltH * 1.3
  const outerX = dCX + side * p.deltW
  const innerX = dCX - side * p.deltW * 0.4
  return [
    `M ${r2(innerX)} ${r2(dTop)}`,
    `C ${r2(dCX)} ${r2(dTop - 4)}`,
    `  ${r2(outerX + side * 4)} ${r2(dTop + p.deltH * 0.2)}`,
    `  ${r2(outerX)} ${r2(dTop + p.deltH * 0.6)}`,
    `C ${r2(outerX - side * 2)} ${r2(dBot - 5)}`,
    `  ${r2(dCX + side * 3)} ${r2(dBot)}`,
    `  ${r2(dCX - side * 4)} ${r2(dBot)}`,
    `C ${r2(innerX - side * 3)} ${r2(dBot)}`,
    `  ${r2(innerX)} ${r2(dTop + p.deltH * 0.5)}`,
    `  ${r2(innerX)} ${r2(dTop)}`,
    `Z`,
  ].join(' ')
}

// РУКА — бицепс + предплечье с органическими кривыми
// side: -1 = левая, +1 = правая
function armPath(p: CharacterParams, shoulderY: number, side: number): string {
  const armCX = CX + side * (p.shoulderX + p.deltW * 0.1)
  const topY = shoulderY + p.deltH * 0.9
  const elbowY = topY + p.armLen * p.elbowAt
  const wristY = topY + p.armLen

  // Внешняя сторона (пик бицепса)
  const outerX = armCX + side * p.bicepW
  const peakX = armCX + side * (p.bicepW + p.bicepPeak)
  const peakY = topY + p.armLen * 0.35

  // Предплечье чуть тоньше
  const fOuter = armCX + side * p.forearmW
  const fInner = armCX - side * p.forearmW * 0.85

  return [
    // Верх руки — внутренняя сторона
    `M ${r2(armCX - side * p.bicepW * 0.5)} ${r2(topY)}`,
    `C ${r2(armCX - side * p.bicepW * 0.9)} ${r2(topY + 15)}`,
    `  ${r2(armCX - side * p.bicepW * 0.8)} ${r2(elbowY - 10)}`,
    `  ${r2(armCX - side * p.forearmW * 0.9)} ${r2(elbowY + 4)}`,
    // Предплечье — внутренняя
    `C ${r2(fInner)} ${r2(elbowY + 20)}`,
    `  ${r2(fInner)} ${r2(wristY - 12)}`,
    `  ${r2(armCX - side * p.forearmW * 0.4)} ${r2(wristY)}`,
    // Низ запястья
    `L ${r2(armCX + side * p.forearmW * 0.4)} ${r2(wristY)}`,
    // Предплечье — внешняя
    `C ${r2(fOuter)} ${r2(wristY - 12)}`,
    `  ${r2(fOuter)} ${r2(elbowY + 20)}`,
    `  ${r2(armCX + side * p.forearmW * 0.9)} ${r2(elbowY + 4)}`,
    // Верх руки — внешняя (пик бицепса)
    `C ${r2(peakX)} ${r2(elbowY - 8)}`,
    `  ${r2(peakX)} ${r2(peakY + 8)}`,
    `  ${r2(peakX)} ${r2(peakY)}`,
    `C ${r2(outerX + side * 3)} ${r2(topY + 20)}`,
    `  ${r2(outerX)} ${r2(topY + 8)}`,
    `  ${r2(armCX + side * p.bicepW * 0.5)} ${r2(topY)}`,
    `Z`,
  ].join(' ')
}

// ТЕНЬ БИЦЕПСА — небольшой тёмный штрих на внутренней стороне
function bicepShadowPath(p: CharacterParams, shoulderY: number, side: number): string {
  if (p.shadowDepth < 0.08) return ''
  const armCX = CX + side * (p.shoulderX + p.deltW * 0.1)
  const topY = shoulderY + p.deltH * 0.9
  const elbowY = topY + p.armLen * p.elbowAt
  const innerX = armCX - side * p.bicepW * 0.6
  return [
    `M ${r2(innerX + side * 2)} ${r2(topY + 15)}`,
    `C ${r2(innerX)} ${r2(topY + 30)}`,
    `  ${r2(innerX - side * 2)} ${r2(elbowY - 20)}`,
    `  ${r2(innerX)} ${r2(elbowY - 5)}`,
    `C ${r2(innerX + side * 5)} ${r2(elbowY + 5)}`,
    `  ${r2(innerX + side * 6)} ${r2(topY + 35)}`,
    `  ${r2(innerX + side * 4)} ${r2(topY + 20)}`,
    `Z`,
  ].join(' ')
}

// БЕДРО — квадрицепс, широкий и мощный
// side: -1 = левое, +1 = правое
function quadPath(p: CharacterParams, hipBotY: number, side: number): string {
  const qCX = CX + side * (p.hipW * 0.55)
  const qTopY = hipBotY
  const qBotY = hipBotY + p.legLen * 0.52
  const outerX = qCX + side * p.quadW
  const innerX = qCX - side * p.quadW * 0.7
  const kneeOuterX = qCX + side * p.quadW * 0.6
  const kneeInnerX = qCX - side * p.quadW * 0.45
  return [
    `M ${r2(innerX)} ${r2(qTopY)}`,
    `L ${r2(outerX)} ${r2(qTopY)}`,
    `C ${r2(outerX + side * 3)} ${r2(qTopY + p.legLen * 0.2)}`,
    `  ${r2(kneeOuterX + side * 2)} ${r2(qBotY - 8)}`,
    `  ${r2(kneeOuterX)} ${r2(qBotY)}`,
    `L ${r2(kneeInnerX)} ${r2(qBotY)}`,
    `C ${r2(kneeInnerX - side * 2)} ${r2(qBotY - 8)}`,
    `  ${r2(innerX - side * 2)} ${r2(qTopY + p.legLen * 0.2)}`,
    `  ${r2(innerX)} ${r2(qTopY)}`,
    `Z`,
  ].join(' ')
}

// ИКРА
// side: -1 = левая, +1 = правая
function calfPath(p: CharacterParams, kneeY: number, side: number): string {
  const cCX = CX + side * (p.hipW * 0.55)
  const topY = kneeY
  const botY = kneeY + p.legLen * 0.48
  const calfW = p.quadW * 0.5
  const peakX = cCX + side * (calfW + p.calfBulge)
  const peakY = topY + p.legLen * 0.18
  return [
    `M ${r2(cCX - side * calfW * 0.8)} ${r2(topY)}`,
    `L ${r2(cCX + side * calfW * 0.8)} ${r2(topY)}`,
    `C ${r2(peakX)} ${r2(topY + 10)}`,
    `  ${r2(peakX + side * 2)} ${r2(peakY + 12)}`,
    `  ${r2(cCX + side * calfW * 0.6)} ${r2(topY + p.legLen * 0.35)}`,
    `L ${r2(cCX + side * calfW * 0.4)} ${r2(botY)}`,
    `L ${r2(cCX - side * calfW * 0.4)} ${r2(botY)}`,
    `L ${r2(cCX - side * calfW * 0.6)} ${r2(topY + p.legLen * 0.35)}`,
    `C ${r2(cCX - side * (calfW + p.calfBulge * 0.3))} ${r2(peakY + 12)}`,
    `  ${r2(cCX - side * (calfW + p.calfBulge * 0.2))} ${r2(topY + 10)}`,
    `  ${r2(cCX - side * calfW * 0.8)} ${r2(topY)}`,
    `Z`,
  ].join(' ')
}

// ВЕНА на руке — органическая кривая
function veinPath(
  p: CharacterParams,
  shoulderY: number,
  side: number,
  variant: number,
): string {
  const armCX = CX + side * (p.shoulderX + p.deltW * 0.1)
  const topY = shoulderY + p.deltH * 0.9
  const elbowY = topY + p.armLen * p.elbowAt
  const offset = side * (p.bicepW * 0.4 + variant * p.bicepW * 0.25)
  const waveX = side * (3 + variant * 4)
  return [
    `M ${r2(armCX + offset)} ${r2(topY + 18)}`,
    `C ${r2(armCX + offset + waveX)} ${r2(topY + 35)}`,
    `  ${r2(armCX + offset - waveX)} ${r2(elbowY - 25)}`,
    `  ${r2(armCX + offset + waveX * 0.5)} ${r2(elbowY - 5)}`,
  ].join(' ')
}

// ── Компонент ─────────────────────────────────────────────────

interface Props {
  stage: number
  pumpActive: boolean
  isPressed: boolean
}

export const CharacterSVG = memo(function CharacterSVG({
  stage,
  pumpActive,
  isPressed,
}: Props) {
  // Параметры пересчитываются только при смене stage (кэш в morphSystem)
  const p = useMemo(() => getCharacterParams(stage), [stage])

  // ── Компоновка вертикали ──────────────────────────────────
  const headBotY   = HEAD_Y + p.headR
  const neckTopY   = headBotY - 4
  const neckBotY   = neckTopY + p.neckH
  const shoulderY  = neckBotY - 2
  const torsoTopY  = shoulderY
  const torsoBotY  = torsoTopY + p.torsoH
  const hipTopY    = torsoBotY
  const hipBotY    = hipTopY + 18
  const kneeY      = hipBotY + p.legLen * 0.52
  const footY      = hipBotY + p.legLen
  const groundY    = footY + 8

  // ── Glow / цвет ──────────────────────────────────────────
  const glowCol = pumpActive ? '#ff3300' : p.glowColor
  const glowStr = pumpActive
    ? `drop-shadow(0 0 12px ${glowCol}) drop-shadow(0 0 28px ${glowCol})`
    : p.glowIntensity > 0
    ? `drop-shadow(0 0 ${r2(9 * p.glowIntensity)}px ${glowCol})`
    : 'none'

  // ── Scale при нажатии / pump ──────────────────────────────
  const scale = isPressed ? 0.90 : pumpActive ? 1.05 : 1.0
  const scaleTransition = isPressed ? '0.06s' : '0.18s'

  // ── IDs для градиентов (уникальны по stage чтобы не путались) ─
  const uid = `s${stage}`

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="164"
      height="254"
      style={{
        transform: `scale(${scale})`,
        transition: `transform ${scaleTransition} ease`,
        filter: glowStr,
        overflow: 'visible',
      }}
    >
      {/* ── DEFS: градиенты и фильтры ─────────────────────── */}
      <defs>
        {/* Кожа — радиальный градиент (светлее в центре) */}
        <radialGradient id={`skin-${uid}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor={p.skinHighlight} stopOpacity={0.8} />
          <stop offset="50%"  stopColor={p.skinBase} />
          <stop offset="100%" stopColor={p.skinShadow} />
        </radialGradient>

        {/* Майка — линейный градиент (сверху светлее) */}
        <linearGradient id={`shirt-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={p.shirtShadow} />
          <stop offset="40%"  stopColor={p.shirtBase} />
          <stop offset="70%"  stopColor={p.shirtBase} />
          <stop offset="100%" stopColor={p.shirtShadow} />
        </linearGradient>

        {/* Дельты — радиальный (световой акцент сверху) */}
        <radialGradient id={`delt-${uid}`} cx="35%" cy="25%" r="65%">
          <stop offset="0%"   stopColor={p.shirtBase} stopOpacity={0.9} />
          <stop offset="100%" stopColor={p.shirtShadow} />
        </radialGradient>

        {/* Тень торса */}
        <linearGradient id={`torso-shadow-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>

        {/* Штаны */}
        <linearGradient id={`pants-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={p.pantsShadow} />
          <stop offset="35%"  stopColor={p.pantsBase} />
          <stop offset="65%"  stopColor={p.pantsBase} />
          <stop offset="100%" stopColor={p.pantsShadow} />
        </linearGradient>

        {/* Pump glow filter */}
        {pumpActive && (
          <filter id={`pump-filter-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix type="matrix" values="1 0 0 0 0.3  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" in="blur" result="red" />
            <feMerge>
              <feMergeNode in="red" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* ── АУРА (stage 24+) ─────────────────────────────── */}
      {p.auraIntensity > 0 && (
        <ellipse
          cx={CX} cy={VB_H * 0.52}
          rx={r2(92 * p.auraIntensity + 30)} ry={r2(145 * p.auraIntensity + 50)}
          fill="none"
          stroke={glowCol}
          strokeWidth={r2(12 * p.auraIntensity)}
          opacity={r2(0.20 * p.auraIntensity)}
          style={{ animation: 'auraPulse 2.2s ease-in-out infinite' }}
        />
      )}

      {/* ── ТЕНЬ ЗЕМЛИ ───────────────────────────────────── */}
      <ellipse
        cx={CX} cy={groundY}
        rx={r2(p.hipW * 1.2)} ry={5}
        fill="#000" opacity={0.18}
      />

      {/* ── НОГИ (рисуем до торса — за ним) ─────────────── */}
      {/* Бёдра */}
      <path d={quadPath(p, hipBotY, -1)} fill={`url(#pants-${uid})`} />
      <path d={quadPath(p, hipBotY,  1)} fill={`url(#pants-${uid})`} />
      {/* Тень квадрицепсов */}
      {p.shadowDepth > 0.04 && (
        <>
          <path
            d={quadPath(p, hipBotY, -1)}
            fill="none" stroke={p.pantsShadow}
            strokeWidth={r2(p.quadW * 0.3)}
            strokeDasharray={`${r2(p.legLen * 0.3)} 100`}
            opacity={r2(p.shadowDepth * 0.8)}
            clipPath={`url(#quad-l-${uid})`}
          />
        </>
      )}
      {/* Икры */}
      <path d={calfPath(p, kneeY, -1)} fill={`url(#pants-${uid})`} />
      <path d={calfPath(p, kneeY,  1)} fill={`url(#pants-${uid})`} />
      {/* Кроссовки */}
      <rect
        x={r2(CX - p.hipW * 0.55 - p.quadW * 0.55)}
        y={r2(footY)}
        width={r2(p.quadW * 0.9)} height={8} rx={3}
        fill="#1a1a1a"
      />
      <rect
        x={r2(CX + p.hipW * 0.55 - p.quadW * 0.35)}
        y={r2(footY)}
        width={r2(p.quadW * 0.9)} height={8} rx={3}
        fill="#1a1a1a"
      />

      {/* ── ХИПС / ПОЯС ─────────────────────────────────── */}
      <rect
        x={r2(CX - p.hipW)} y={r2(hipTopY)}
        width={r2(p.hipW * 2)} height={r2(hipBotY - hipTopY + 2)}
        rx={5}
        fill={`url(#pants-${uid})`}
      />

      {/* ── ЛЕВАЯ РУКА (за торсом) ───────────────────────── */}
      <path d={armPath(p, shoulderY, -1)} fill={`url(#skin-${uid})`} />
      <path
        d={bicepShadowPath(p, shoulderY, -1)}
        fill={p.skinShadow}
        opacity={r2(p.shadowDepth * 1.1)}
      />

      {/* ── ТОРС ────────────────────────────────────────── */}
      {/* Основной торс */}
      <path d={torsoPath(p, torsoTopY)} fill={`url(#shirt-${uid})`} />

      {/* Тень правой стороны торса */}
      <path
        d={torsoShadowPath(p, torsoTopY)}
        fill={p.shirtShadow}
        opacity={r2(p.shadowDepth * 0.9)}
      />

      {/* Грудные мышцы */}
      {p.pecBulge > 0.5 && (
        <>
          <path
            d={pecPath(p, torsoTopY, -1)}
            fill={p.shirtBase}
            opacity={0.4}
          />
          <path
            d={pecPath(p, torsoTopY,  1)}
            fill={p.shirtShadow}
            opacity={r2(p.shadowDepth * 1.8)}
          />
          {/* Разделительная линия грудных */}
          {p.pecSepDepth > 0.5 && (
            <line
              x1={CX} y1={r2(torsoTopY + 6)}
              x2={CX} y2={r2(torsoTopY + p.torsoH * 0.48)}
              stroke={p.shirtShadow}
              strokeWidth={r2(p.pecSepDepth)}
              strokeLinecap="round"
              opacity={r2(Math.min(1, p.shadowDepth * 3))}
            />
          )}
        </>
      )}

      {/* Пресс (stage 8-22) */}
      {p.absOpacity > 0.05 && (
        <g opacity={r2(p.absOpacity * 0.7)}>
          {[0, 1, 2].map(row => (
            <g key={row}>
              <ellipse
                cx={r2(CX - p.waistW * 0.28)}
                cy={r2(torsoTopY + p.torsoH * (0.52 + row * 0.155))}
                rx={r2(p.waistW * 0.22)} ry={r2(4)}
                fill={p.shirtShadow}
              />
              <ellipse
                cx={r2(CX + p.waistW * 0.28)}
                cy={r2(torsoTopY + p.torsoH * (0.52 + row * 0.155))}
                rx={r2(p.waistW * 0.22)} ry={r2(4)}
                fill={p.shirtShadow}
              />
            </g>
          ))}
        </g>
      )}

      {/* ── ПРАВАЯ РУКА (перед торсом) ───────────────────── */}
      <path d={armPath(p, shoulderY,  1)} fill={`url(#skin-${uid})`} />
      <path
        d={bicepShadowPath(p, shoulderY,  1)}
        fill={p.skinShadow}
        opacity={r2(p.shadowDepth * 1.1)}
      />

      {/* ── ДЕЛЬТОВИДНЫЕ ───────────────────────────────────── */}
      <path d={deltoidPath(p, shoulderY, -1)} fill={`url(#delt-${uid})`} />
      <path d={deltoidPath(p, shoulderY,  1)} fill={`url(#delt-${uid})`} />

      {/* ── ТРАПЕЦИЯ ─────────────────────────────────────── */}
      {p.trapRise > 0.5 && (
        <path
          d={trapPath(p, neckBotY)}
          fill={`url(#skin-${uid})`}
          opacity={0.92}
        />
      )}

      {/* ── ШЕЯ ──────────────────────────────────────────── */}
      <rect
        x={r2(CX - p.neckW / 2)} y={r2(neckTopY)}
        width={r2(p.neckW)} height={r2(p.neckH + 3)}
        rx={r2(p.neckW * 0.35)}
        fill={`url(#skin-${uid})`}
      />
      {/* Тень шеи */}
      {p.shadowDepth > 0.06 && (
        <rect
          x={r2(CX + p.neckW * 0.15)} y={r2(neckTopY + 2)}
          width={r2(p.neckW * 0.3)} height={r2(p.neckH)}
          rx={r2(p.neckW * 0.15)}
          fill={p.skinShadow}
          opacity={r2(p.shadowDepth * 0.9)}
        />
      )}

      {/* ── ГОЛОВА ───────────────────────────────────────── */}
      <circle cx={CX} cy={HEAD_Y} r={r2(p.headR)} fill={`url(#skin-${uid})`} />

      {/* Тень на правой стороне головы */}
      <ellipse
        cx={r2(CX + p.headR * 0.42)} cy={HEAD_Y}
        rx={r2(p.headR * 0.35)} ry={r2(p.headR * 0.9)}
        fill={p.skinShadow}
        opacity={r2(p.shadowDepth * 0.8)}
      />

      {/* Волосы */}
      <ellipse
        cx={CX} cy={r2(HEAD_Y - p.headR * 0.55)}
        rx={r2(p.headR * 0.92)} ry={r2(p.headR * 0.52)}
        fill="#1e1008"
      />

      {/* Ухо (правое) */}
      <ellipse
        cx={r2(CX + p.headR - 2)} cy={HEAD_Y}
        rx={3} ry={5}
        fill={p.skinBase}
      />

      {/* ── ЛИЦО ─────────────────────────────────────────── */}
      {/* Белки глаз */}
      <ellipse cx={r2(CX - 6.5)} cy={r2(HEAD_Y - 1)} rx={4} ry={3}   fill="#f8f8f8" />
      <ellipse cx={r2(CX + 6.5)} cy={r2(HEAD_Y - 1)} rx={4} ry={3}   fill="#f8f8f8" />
      {/* Радужка */}
      {(() => {
        const eyeR = stage >= 20 ? `rgba(255,${Math.max(0,160 - stage * 5)},0,0.95)` : '#1a1a2a'
        return (
          <>
            <circle cx={r2(CX - 6.5)} cy={r2(HEAD_Y - 1)} r={2.2} fill={eyeR} />
            <circle cx={r2(CX + 6.5)} cy={r2(HEAD_Y - 1)} r={2.2} fill={eyeR} />
          </>
        )
      })()}
      {/* Блики в глазах */}
      <circle cx={r2(CX - 5.8)} cy={r2(HEAD_Y - 2)} r={0.8} fill="rgba(255,255,255,0.9)" />
      <circle cx={r2(CX + 7.2)} cy={r2(HEAD_Y - 2)} r={0.8} fill="rgba(255,255,255,0.9)" />

      {/* Брови — становятся злее с ростом stage */}
      {(() => {
        const frownDepth = Math.min(stage * 0.18, 4)
        return (
          <>
            <path
              d={`M ${r2(CX - 11)} ${r2(HEAD_Y - 8)} Q ${r2(CX - 5)} ${r2(HEAD_Y - 9 - frownDepth)} ${r2(CX - 2)} ${r2(HEAD_Y - 6)}`}
              stroke="#1e1008" strokeWidth={r2(1.6 + frownDepth * 0.15)} fill="none" strokeLinecap="round"
            />
            <path
              d={`M ${r2(CX + 11)} ${r2(HEAD_Y - 8)} Q ${r2(CX + 5)} ${r2(HEAD_Y - 9 - frownDepth)} ${r2(CX + 2)} ${r2(HEAD_Y - 6)}`}
              stroke="#1e1008" strokeWidth={r2(1.6 + frownDepth * 0.15)} fill="none" strokeLinecap="round"
            />
          </>
        )
      })()}

      {/* Нос */}
      <path
        d={`M ${r2(CX - 2)} ${r2(HEAD_Y + 4)} L ${r2(CX)} ${r2(HEAD_Y + 7)} L ${r2(CX + 2)} ${r2(HEAD_Y + 4)}`}
        stroke={p.skinShadow} strokeWidth={1.2} fill="none" strokeLinecap="round"
      />

      {/* Рот: улыбка→нейтраль→оскал */}
      {stage < 10 ? (
        <path
          d={`M ${r2(CX - 5)} ${r2(HEAD_Y + 10)} Q ${CX} ${r2(HEAD_Y + 14)} ${r2(CX + 5)} ${r2(HEAD_Y + 10)}`}
          stroke="#1e1008" strokeWidth={1.4} fill="none" strokeLinecap="round"
        />
      ) : stage < 22 ? (
        <line
          x1={r2(CX - 4.5)} y1={r2(HEAD_Y + 11)}
          x2={r2(CX + 4.5)} y2={r2(HEAD_Y + 11)}
          stroke="#1e1008" strokeWidth={1.6} strokeLinecap="round"
        />
      ) : (
        /* Оскал у монстра */
        <path
          d={`M ${r2(CX - 5)} ${r2(HEAD_Y + 12)} Q ${CX} ${r2(HEAD_Y + 9)} ${r2(CX + 5)} ${r2(HEAD_Y + 12)}`}
          stroke="#1e1008" strokeWidth={1.6} fill="none" strokeLinecap="round"
        />
      )}

      {/* ── ВЕНЫ (stage 11+) ──────────────────────────────── */}
      {p.veinOpacity > 0 && (
        <g opacity={r2(p.veinOpacity)} strokeLinecap="round" fill="none">
          {/* Вены левой руки */}
          <path d={veinPath(p, shoulderY, -1, 0)} stroke={p.veinColor} strokeWidth={r2(1.5)} />
          <path d={veinPath(p, shoulderY, -1, 1)} stroke={p.veinColor} strokeWidth={r2(1.0)} />
          {/* Вены правой руки */}
          <path d={veinPath(p, shoulderY,  1, 0)} stroke={p.veinColor} strokeWidth={r2(1.5)} />
          <path d={veinPath(p, shoulderY,  1, 1)} stroke={p.veinColor} strokeWidth={r2(1.0)} />
          {/* Вены на предплечье */}
          {p.veinOpacity > 0.4 && (
            <>
              <path
                d={veinPath(p, shoulderY + p.armLen * p.elbowAt + 5, -1, 0)}
                stroke={p.veinColor} strokeWidth={r2(1.2)}
              />
              <path
                d={veinPath(p, shoulderY + p.armLen * p.elbowAt + 5,  1, 0)}
                stroke={p.veinColor} strokeWidth={r2(1.2)}
              />
            </>
          )}
        </g>
      )}

      {/* ── PUMP GLOW OVERLAY ─────────────────────────────── */}
      {pumpActive && (
        <ellipse
          cx={CX} cy={r2(VB_H * 0.5)}
          rx={r2(p.chestW + 30)} ry={r2(p.torsoH * 0.85 + 40)}
          fill="#ff3300"
          opacity={0.05}
          style={{ animation: 'pumpPulse 0.45s ease-in-out infinite alternate' }}
        />
      )}
    </svg>
  )
})
