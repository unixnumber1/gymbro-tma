// Обёртка над Telegram WebApp API
// Все вызовы безопасны — fallback если не в Telegram

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        themeParams: Record<string, string>
        colorScheme: 'light' | 'dark'
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
      }
    }
  }
}

function getWebApp() {
  return window.Telegram?.WebApp ?? null
}

export const TelegramSDK = {
  init() {
    const wa = getWebApp()
    wa?.ready()
    wa?.expand()
  },

  hapticLight() {
    getWebApp()?.HapticFeedback.impactOccurred('light')
  },

  hapticMedium() {
    getWebApp()?.HapticFeedback.impactOccurred('medium')
  },

  hapticSuccess() {
    getWebApp()?.HapticFeedback.notificationOccurred('success')
  },

  isDark(): boolean {
    return (getWebApp()?.colorScheme ?? 'dark') === 'dark'
  },

  isAvailable(): boolean {
    return getWebApp() !== null
  },
}
