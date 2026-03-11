import { ALL_EXERCISES, EXERCISES_BY_DOMAIN, EXERCISES_BY_ID } from '../data/index.js'
import { getExerciseProgress } from './tempo-progression.js'

const CYCLE_LENGTH_MIN = 5
const CYCLE_LENGTH_MAX = 10
const CHECKIN_INTERVAL = 5

export function selectNewCycle(progress, history, settings) {
  const enabledDomains = settings.enabledDomains || Object.keys(EXERCISES_BY_DOMAIN)

  // Find domain balance — prefer domains with least mastered exercises (relative to total)
  const domainScores = enabledDomains.map(domain => {
    const exercises = EXERCISES_BY_DOMAIN[domain] || []
    const mastered = exercises.filter(e => progress[e.id]?.mastered).length
    const ratio = exercises.length > 0 ? mastered / exercises.length : 1
    return { domain, ratio, total: exercises.length }
  })

  domainScores.sort((a, b) => a.ratio - b.ratio)

  // Primary: weakest domain, next unmastered exercise in sequence
  let primary = null
  for (const { domain } of domainScores) {
    const exercises = EXERCISES_BY_DOMAIN[domain] || []
    const candidate = exercises.find(e => {
      if (progress[e.id]?.mastered) return false
      // Check prerequisites met
      return e.prerequisites.every(preId => progress[preId]?.mastered || false)
    })
    if (candidate) {
      const prog = getExerciseProgress(progress, candidate.id)
      primary = { exerciseId: candidate.id, tempo: prog.currentTempo }
      break
    }
  }

  if (!primary) {
    // All exercises mastered or prereqs not met — pick least-recently practiced
    const started = Object.entries(progress)
      .filter(([, p]) => p && !p.mastered && p.tempoHistory.length > 0)
      .map(([id]) => id)
    if (started.length > 0) {
      const id = started[0]
      primary = { exerciseId: id, tempo: getExerciseProgress(progress, id).currentTempo }
    }
  }

  if (!primary) return null

  // Secondary: different domain, preferring untouched in 2+ weeks or partially progressed
  const primaryDomain = EXERCISES_BY_ID[primary.exerciseId]?.domain
  const otherDomains = domainScores.filter(d => d.domain !== primaryDomain)
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000

  let secondary = null
  for (const { domain } of otherDomains) {
    const exercises = EXERCISES_BY_DOMAIN[domain] || []
    const candidate = exercises.find(e => {
      if (e.id === primary.exerciseId) return false
      if (progress[e.id]?.mastered) return false
      return e.prerequisites.every(preId => progress[preId]?.mastered || !preId)
    })
    if (candidate) {
      const prog = getExerciseProgress(progress, candidate.id)
      secondary = { exerciseId: candidate.id, tempo: prog.currentTempo }
      break
    }
  }

  const sessionTarget = CYCLE_LENGTH_MIN + Math.floor(Math.random() * (CYCLE_LENGTH_MAX - CYCLE_LENGTH_MIN + 1))

  return {
    id: crypto.randomUUID(),
    primaryExerciseId: primary.exerciseId,
    secondaryExerciseId: secondary?.exerciseId || null,
    sessionCount: 0,
    sessionTarget,
    startDate: new Date().toISOString(),
    status: 'active',
    checkInsDone: 0,
  }
}

export function shouldTriggerCheckIn(cycle) {
  if (!cycle) return false
  const nextCheckIn = (cycle.checkInsDone + 1) * CHECKIN_INTERVAL
  return cycle.sessionCount > 0 && cycle.sessionCount >= nextCheckIn
}

export function advanceCycle(cycle) {
  return {
    ...cycle,
    sessionCount: cycle.sessionCount + 1,
  }
}

export function completeCycle(cycle) {
  return { ...cycle, status: 'completed' }
}

export function extendCycle(cycle) {
  return {
    ...cycle,
    sessionTarget: cycle.sessionTarget + 3,
    checkInsDone: cycle.checkInsDone + 1,
  }
}

export function acknowledgeCycleCheckIn(cycle) {
  return { ...cycle, checkInsDone: cycle.checkInsDone + 1 }
}
