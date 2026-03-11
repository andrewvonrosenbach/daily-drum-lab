import { EXERCISES_BY_ID } from '../data/index.js'
import { getExerciseProgress, getTeacherNoteLevel } from './tempo-progression.js'
import { selectWarmUps } from './warm-up-selector.js'
import { selectNewCycle } from './cycle-engine.js'

export function generateSession(cycle, progress, history, settings) {
  const sessionDuration = settings.sessionDuration || 30

  // Proportional timing based on session length
  const warmUpMins = Math.round(sessionDuration * (5 / 30))
  const primaryMins = Math.round(sessionDuration * (18 / 30))
  const secondaryMins = sessionDuration - warmUpMins - primaryMins

  let activeCycle = cycle
  if (!activeCycle || activeCycle.status !== 'active') {
    activeCycle = selectNewCycle(progress, history, settings)
  }

  if (!activeCycle) return null

  const primaryId = activeCycle.primaryExerciseId
  const secondaryId = activeCycle.secondaryExerciseId
  const primaryEx = EXERCISES_BY_ID[primaryId]
  const secondaryEx = secondaryId ? EXERCISES_BY_ID[secondaryId] : null

  const primaryProg = getExerciseProgress(progress, primaryId)
  const secondaryProg = secondaryId ? getExerciseProgress(progress, secondaryId) : null

  const warmUps = selectWarmUps(progress, history, warmUpMins >= 5 ? 2 : 1)

  const primaryTempo = primaryProg.currentTempo
  const primaryLevel = getTeacherNoteLevel(primaryTempo, primaryEx)

  const secondaryTempo = secondaryProg ? secondaryProg.currentTempo : null
  const secondaryLevel = secondaryEx ? getTeacherNoteLevel(secondaryTempo, secondaryEx) : null

  return {
    id: crypto.randomUUID(),
    cycleId: activeCycle.id,
    date: new Date().toISOString(),
    totalDuration: sessionDuration,
    warmUp: warmUps.map(w => ({
      ...w,
      exercise: EXERCISES_BY_ID[w.exerciseId],
      durationMins: Math.floor(warmUpMins / warmUps.length),
    })),
    primaryFocus: {
      exerciseId: primaryId,
      exercise: primaryEx,
      tempo: primaryTempo,
      tempoBlocks: buildTempoBlocks(primaryTempo, primaryEx, primaryMins),
      teacherNote: primaryEx.teacher_notes[primaryLevel],
      durationMins: primaryMins,
      result: null,
    },
    secondaryFocus: secondaryEx ? {
      exerciseId: secondaryId,
      exercise: secondaryEx,
      tempo: secondaryTempo,
      teacherNote: secondaryEx.teacher_notes[secondaryLevel],
      durationMins: secondaryMins,
      result: null,
    } : null,
    notes: '',
    completed: false,
  }
}

function buildTempoBlocks(targetTempo, exercise, totalMins) {
  const warmTempo = Math.max(exercise.tempo_floor, targetTempo - 10)
  const pushTempo = Math.min(exercise.tempo_ceiling, targetTempo + 5)

  return [
    { label: 'Warm into it', tempo: warmTempo, durationMins: Math.round(totalMins * (3 / 18)), description: 'Settle in. Focus on technique, not speed.' },
    { label: 'Target tempo', tempo: targetTempo, durationMins: Math.round(totalMins * (8 / 18)), description: 'This is your work tempo. Quality over everything.' },
    { label: 'Push', tempo: pushTempo, durationMins: Math.round(totalMins * (4 / 18)), description: 'Challenge tempo. If tension creeps in, stop.' },
    { label: 'Lock it in', tempo: targetTempo, durationMins: Math.round(totalMins * (3 / 18)), description: 'Back to target. Relax. Focus on feel.' },
  ]
}
