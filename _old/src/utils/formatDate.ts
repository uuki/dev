export const formatSince = (fromDate: Date) => {
  const now: Date = new Date()
  const diff = now.getTime() - fromDate.getTime()
  const sec = Math.round(diff / 1000)
  const min = Math.round(diff / (1000 * 60))
  const hrs = Math.round(diff / (1000 * 60 * 60))
  const day = Math.round(diff / (1000 * 60 * 60 * 24))
  const wek = Math.round(diff / (1000 * 60 * 60 * 24 * 7))
  const mon = Math.round(diff / (1000 * 60 * 60 * 24 * 30))
  const yrs = Math.round(diff / (1000 * 60 * 60 * 24 * 365))

  if (sec < 60) {
    return `${sec}秒前`
  }

  if (min < 60) {
    return `${min}分前`
  }

  if (hrs < 24) {
    return `${hrs}時間前`
  }

  if (day < 7) {
    return `${day}日前`
  }

  if (wek < 4) {
    return `${wek}週間前`
  }

  if (mon < 12) {
    return `${mon}ヶ月前`
  }

  return `${yrs} 年前`
}
