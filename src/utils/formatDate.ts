export const formatSince = (fromDate: Date) => {
  const now: Date = new Date()
  const diff = now.getTime() - fromDate.getTime()
  const s = Math.round(diff / 1000)
  const m = Math.round(diff / (1000 * 60))
  const h = Math.round(diff / (1000 * 60 * 60))
  const d = Math.round(diff / (1000 * 60 * 60 * 24))
  const y = Math.round(diff / (1000 * 60 * 60 * 24 * 365))

  if (s < 60) {
    return `${s}秒前`
  }

  if (m < 60) {
    return `${m}分前`
  }

  if (h < 24) {
    return `${h}時間前`
  }

  if (d < 365) {
    return `${d}日前`
  }

  return `${y} 年前`
}
