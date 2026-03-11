import { useState } from 'react'
import { EXERCISES_BY_ID } from '../../data/index.js'

export default function SessionComplete({ session, progress, onDone }) {
  const [notes, setNotes] = useState('')

  const primaryEx = EXERCISES_BY_ID[session.primaryFocus?.exerciseId]
  const secondaryEx = session.secondaryFocus ? EXERCISES_BY_ID[session.secondaryFocus.exerciseId] : null
  const primaryResult = session.primaryFocus?.result
  const secondaryResult = session.secondaryFocus?.result

  const primaryProg = progress[session.primaryFocus?.exerciseId]
  const didAdvance = primaryProg && primaryProg.cleanStreakAtCurrentTempo === 0 && primaryResult === 'clean'
  const isNowMastered = primaryProg?.mastered

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="px-6 pt-12 pb-6">
        <div className="text-xs text-green-400 uppercase tracking-widest font-semibold mb-1">Session Complete</div>
        <h1 className="text-2xl font-bold">Nice work.</h1>
        <p className="text-gray-400 text-sm mt-1">
          {session.totalDuration} minutes · {countExercises(session)} exercises
        </p>
      </div>

      <div className="px-6 flex-1 flex flex-col gap-4">
        {/* Primary result card */}
        {primaryEx && (
          <ResultCard
            label="Primary Focus"
            exercise={primaryEx}
            tempo={session.primaryFocus.tempo}
            result={primaryResult}
            progress={primaryProg}
            didAdvance={didAdvance}
            isNowMastered={isNowMastered}
          />
        )}

        {/* Secondary result card */}
        {secondaryEx && session.secondaryFocus && (
          <ResultCard
            label="Secondary Focus"
            exercise={secondaryEx}
            tempo={session.secondaryFocus.tempo}
            result={secondaryResult}
            progress={progress[session.secondaryFocus.exerciseId]}
          />
        )}

        {/* Notes field */}
        <div className="bg-gray-800 rounded-xl p-4">
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Session notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything worth remembering about today's practice..."
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none"
            rows={3}
          />
        </div>
      </div>

      <div className="px-6 pb-10 mt-6">
        <button
          onClick={() => onDone(notes)}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg rounded-2xl transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function ResultCard({ label, exercise, tempo, result, progress, didAdvance, isNowMastered }) {
  const nextTempo = progress?.currentTempo
  const cleanStreak = progress?.cleanStreakAtCurrentTempo ?? 0

  const resultColor = result === 'clean' ? 'text-green-400' : result === 'okay' ? 'text-yellow-400' : result === 'struggled' ? 'text-red-400' : 'text-gray-500'
  const resultIcon = result === 'clean' ? '✓' : result === 'okay' ? '~' : result === 'struggled' ? '✗' : '—'

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-white">{exercise.name}</div>
          <div className="text-sm text-gray-400 mt-0.5">{tempo} BPM</div>
        </div>
        <div className={`text-lg font-bold ${resultColor}`}>{resultIcon} <span className="text-sm capitalize">{result || 'skipped'}</span></div>
      </div>

      {isNowMastered && (
        <div className="mt-2 text-xs bg-yellow-900/50 text-yellow-300 rounded px-2 py-1">
          🏆 Mastered! This exercise enters your warm-up rotation.
        </div>
      )}
      {!isNowMastered && didAdvance && nextTempo && (
        <div className="mt-2 text-xs bg-green-900/50 text-green-300 rounded px-2 py-1">
          → Moving to {nextTempo} BPM next session
        </div>
      )}
      {!isNowMastered && !didAdvance && cleanStreak > 0 && result === 'clean' && (
        <div className="mt-2 text-xs text-gray-500">
          {cleanStreak}/3 clean at this tempo → {3 - cleanStreak} more to advance
        </div>
      )}
      {result === 'struggled' && (
        <div className="mt-2 text-xs bg-red-900/30 text-red-400 rounded px-2 py-1">
          → Staying here next session. Technique before speed.
        </div>
      )}
    </div>
  )
}

function countExercises(session) {
  let count = (session.warmUp?.length || 0) + (session.primaryFocus ? 1 : 0) + (session.secondaryFocus ? 1 : 0)
  return count
}
