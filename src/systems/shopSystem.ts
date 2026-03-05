export type ShopItemType = 'boost_click' | 'boost_passive' | 'genetics_reroll' | 'perm_click' | 'perm_passive' | 'skin'

export interface ShopItem {
  id: string
  label: string
  desc: string
  icon: string
  cost: number
  type: ShopItemType
  stackable?: boolean
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'boost_click_1h',
    label: 'Буст кликов x2',
    desc: 'Удваивает доход от кликов на 1 час',
    icon: '⚡',
    cost: 10,
    type: 'boost_click',
    stackable: true,
  },
  {
    id: 'boost_passive_1h',
    label: 'Буст автодохода x2',
    desc: 'Удваивает пассивный доход на 1 час',
    icon: '🤖',
    cost: 10,
    type: 'boost_passive',
    stackable: true,
  },
  {
    id: 'genetics_reroll',
    label: 'Реролл генетики',
    desc: 'Получи 3 варианта генетики и выбери лучший',
    icon: '🎲',
    cost: 25,
    type: 'genetics_reroll',
  },
  {
    id: 'perm_click',
    label: '+10% к кликам',
    desc: 'Постоянный бонус к доходу от кликов (можно покупать несколько раз)',
    icon: '👊',
    cost: 50,
    type: 'perm_click',
    stackable: true,
  },
  {
    id: 'perm_passive',
    label: '+10% к автодоходу',
    desc: 'Постоянный бонус к пассивному доходу (можно покупать несколько раз)',
    icon: '📈',
    cost: 50,
    type: 'perm_passive',
    stackable: true,
  },
  {
    id: 'skin_gold',
    label: 'Скин "Золотой Атлет"',
    desc: 'Эксклюзивная золотая тема персонажа',
    icon: '🥇',
    cost: 100,
    type: 'skin',
  },
  {
    id: 'skin_neon',
    label: 'Скин "Неоновый Боец"',
    desc: 'Кибер-неоновая тема персонажа',
    icon: '💜',
    cost: 150,
    type: 'skin',
  },
  {
    id: 'skin_dark',
    label: 'Скин "Тёмный Лорд"',
    desc: 'Мрачная тёмная тема персонажа',
    icon: '🖤',
    cost: 200,
    type: 'skin',
  },
]

export const BOOST_DURATION_SHOP_MS = 60 * 60 * 1000  // 1 hour

export function formatBoostTime(endTime: number): string {
  const secsLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
  const h = Math.floor(secsLeft / 3600)
  const m = Math.floor((secsLeft % 3600) / 60)
  const s = secsLeft % 60
  if (h > 0) return `${h}ч ${m}м`
  if (m > 0) return `${m}м ${s}с`
  return `${s}с`
}
