// Форматирует числа в короткий вид: 1K, 1M, 1B, 1T
export function formatNumber(n: number): string {
  if (!isFinite(n)) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, '') + 'T'
  if (abs >= 1e9)  return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (abs >= 1e6)  return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (abs >= 1e3)  return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return Math.floor(n).toString()
}
