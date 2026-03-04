import { useEffect, useState } from 'react'

interface FloatingItem {
  id: number
  text: string
  x: number
  y: number
}

interface Props {
  items: FloatingItem[]
}

export function FloatingText({ items }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map(item => (
        <AnimatedFloat key={item.id} item={item} />
      ))}
    </div>
  )
}

function AnimatedFloat({ item }: { item: FloatingItem }) {
  const [opacity, setOpacity] = useState(1)
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    // Запускаем анимацию в следующем фрейме
    const raf = requestAnimationFrame(() => {
      setOpacity(0)
      setTranslateY(-60)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        color: '#FFD700',
        fontWeight: 700,
        fontSize: '1.2rem',
        textShadow: '0 0 8px rgba(255,215,0,0.8)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {item.text}
    </div>
  )
}

// Хук для управления списком всплывающих текстов
let floatIdCounter = 0

export function useFloatingTexts() {
  const [items, setItems] = useState<FloatingItem[]>([])

  function addFloat(text: string, x: number, y: number) {
    const id = ++floatIdCounter
    setItems(prev => [...prev, { id, text, x, y }])
    // Удаляем через 900ms
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id))
    }, 900)
  }

  return { items, addFloat }
}
