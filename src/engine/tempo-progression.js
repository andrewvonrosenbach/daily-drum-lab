import { EXERCISES_BY_ID } from '../data/index.js'

export function getExerciseProgress(progress, exerciseId) {
  const exercise = EXERCISES_BY_ID[exerciseId]
  if (!exercise) return null
  return progress[exerciseId] ?? {
    exerciseId,
    currentTempo: exercise.tempo_floor,
    tempoHistory: [],
    cleanStreakAtCurrentTempo: 0,
    mastered: false,
    masteredDate: null,
  }
}

export function recordResult(progress, exerciseId, tempo, result) {
  const exercise = EXERCISES_BY_ID[exerciseId]
  if (!exercise) return progress

  const current = getExerciseProgress(progress, exerciseId)
  const entry = { tempo, result, date: new Date().toISOString() }
  const history = [...current.tempoHistory, entry]

  let cleanStreak = result === 'clean' ? current.cleanStreakAtCurrentTempo + 1 : 0
  let nextTempo = current.currentTempo
  let mastered = current.mastered

  if (result === 'clean' && cleanStreak >= 3) {
    // Advance to next tempo milestone
    nextTempo = Math.min(current.currentTempo + exercise.tempo_step, exercise.tempo_ceiling)
    cleanStreak = 0
    if (current.currentTempo >= exercise.tempo_ceiling) {
      mastered = true
    }
  } else if (result === 'struggled') {
    nextTempo = Math.max(current.currentTempo - exercise.tempo_step, exercise.tempo_floor)
    cleanStreak = 0
  }

  return {
    ...progress,
    [exerciseId]: {
      ...current,
      currentTempo: nextTempo,
      tempoHistory: history,
      cleanStreakAtCurrentTempo: cleanStreak,
      mastered,
      masteredDate: mastered && !current.mastered ? new Date().toISOString() : current.masteredDate,
    }
  }
}

export function getTeacherNoteLevel(tempo, exercise) {
  const range = exercise.tempo_ceiling - exercise.tempo_floor
  const position = (tempo - exercise.tempo_floor) / range
  if (position < 0.33) return 'beginner'
  if (position < 0.66) return 'intermediate'
  return 'advanced'
}
