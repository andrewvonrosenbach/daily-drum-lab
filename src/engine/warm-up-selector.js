import { ALL_EXERCISES, EXERCISES_BY_ID } from '../data/index.js'

export function selectWarmUps(progress, history, count = 2) {
  // Get mastered exercises that are tagged warm-up-eligible
  const masteredIds = Object.entries(progress)
    .filter(([, p]) => p.mastered)
    .map(([id]) => id)

  const eligible = masteredIds.filter(id => {
    const ex = EXERCISES_BY_ID[id]
    return ex && ex.tags.includes('warm-up-eligible')
  })

  if (eligible.length === 0) {
    // Fall back to exercises the user has started but not mastered
    const started = Object.keys(progress).filter(id => {
      const p = progress[id]
      return p && p.tempoHistory.length > 0 && !p.mastered
    })
    eligible.push(...started)
  }

  if (eligible.length === 0) {
    // Absolute fallback — grab first warm-up-eligible exercise from library
    const fallback = ALL_EXERCISES.find(e => e.tags.includes('warm-up-eligible'))
    if (fallback) eligible.push(fallback.id)
  }

  // Weight by recency: exercises not seen recently get higher weight
  const lastSeenMap = buildLastSeenMap(history)
  const now = Date.now()

  const weighted = eligible.map(id => {
    const lastSeen = lastSeenMap[id] || 0
    const daysSince = (now - lastSeen) / (1000 * 60 * 60 * 24)
    return { id, weight: 1 + daysSince }
  })

  return weightedSample(weighted, Math.min(count, eligible.length))
    .map(id => {
      const ex = EXERCISES_BY_ID[id]
      const prog = progress[id]
      const tempo = prog ? Math.max(ex.tempo_floor, prog.currentTempo - 10) : ex.tempo_floor
      return { exerciseId: id, tempo }
    })
}

function buildLastSeenMap(history) {
  const map = {}
  for (const session of history) {
    const check = (block) => {
      if (!block) return
      const id = block.exerciseId
      const ts = new Date(session.date).getTime()
      if (!map[id] || ts > map[id]) map[id] = ts
    }
    if (session.warmUp) session.warmUp.forEach(check)
    check(session.primaryFocus)
    check(session.secondaryFocus)
  }
  return map
}

function weightedSample(items, n) {
  const result = []
  const pool = [...items]
  for (let i = 0; i < n && pool.length > 0; i++) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0)
    let rand = Math.random() * total
    const idx = pool.findIndex(item => {
      rand -= item.weight
      return rand <= 0
    })
    const chosen = pool.splice(idx === -1 ? 0 : idx, 1)[0]
    result.push(chosen.id)
  }
  return result
}
