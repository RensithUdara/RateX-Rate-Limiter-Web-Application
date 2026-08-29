const rangeConfig = {
  '30m': { minutes: 30, points: 12, labelStep: 5 },
  '1h': { minutes: 60, points: 12, labelStep: 5 },
  '6h': { minutes: 360, points: 12, labelStep: 30 },
  '24h': { minutes: 1440, points: 12, labelStep: 120 },
}

export function buildChartData(timeline, activeRange, stats) {
  const config = rangeConfig[activeRange] || rangeConfig['30m']
  const cutoff = Date.now() - config.minutes * 60 * 1000
  const filtered = timeline
    .filter((point) => new Date(point.bucket).getTime() >= cutoff)
    .map((point) => ({
      t: formatBucket(point.bucket, activeRange),
      allowed: point.allowed,
      rejected: point.rejected,
    }))

  if (filtered.length > 0) {
    return filtered
  }

  return buildFallbackData(config, stats)
}

function buildFallbackData(config, stats) {
  const maxAllowed = Math.max(1, stats.allowed || stats.requests || 1)
  const maxRejected = Math.max(0, stats.rejected || 0)

  return Array.from({ length: config.points }, (_, index) => {
    const wave = index < 2 ? 0 : index < 5 ? 1 : index < 7 ? 0 : index < 10 ? 1 : 0
    return {
      t: `${index * config.labelStep}m`,
      allowed: Math.round(wave * maxAllowed),
      rejected: Math.round((wave ? 0.18 : 0) * maxRejected),
    }
  })
}

function formatBucket(value, activeRange) {
  const date = new Date(value)
  if (activeRange === '24h') {
    return date.toLocaleTimeString([], { hour: '2-digit' })
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
