import { EXERCISES_BY_ID, DOMAIN_LABELS } from '../../data/index.js'

export default function SessionHome({ cycle, progress, history, onStartSession, onViewStats, onViewSettings }) {
  const totalSessions = history.length
  const streak = calculateStreak(history)
  const masteredCount = Object.values(progress).filter(p => p?.mastered).length

  const primaryEx = cycle?.primaryExerciseId ? EXERCISES_BY_ID[cycle.primaryExerciseId] : null
  const primaryProg = cycle?.primaryExerciseId ? progress[cycle.primaryExerciseId] : null
  const lastSession = history.length > 0 ? history[history.length - 1] : null
  const lastResult = lastSession?.primaryFocus?.result

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Drum Lab</h1>
            <p className="text-gray-400 text-sm mt-1">Practice like a pro. One thing at a time.</p>
          </div>
          {streak > 0 && (
            <div className="text-right">
              <div className="text-xl">🔥</div>
              <div className="text-xs text-gray-400">{streak} day{streak !== 1 ? 's' : ''}</div>
            </div>
          )}
        </div>
      </div>

      {/* Current focus card */}
      <div className="px-6 mb-6">
        <div className="bg-gray-800 rounded-2xl p-5">
          {primaryEx ? (
            <>
              <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-1">
                Current Focus · Day {(cycle.sessionCount || 0) + 1} of {cycle.sessionTarget || 10}
              </div>
              <h2 className="text-xl font-bold mb-1">{primaryEx.name}</h2>
              <div className="text-sm text-gray-400 mb-3">
                {DOMAIN_LABELS[primaryEx.domain]}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Current tempo</div>
                  <div className="text-3xl font-bold text-amber-400">
                    {primaryProg?.currentTempo ?? primaryEx.tempo_floor}
                    <span className="text-base font-normal text-gray-400 ml-1">BPM</span>
                  </div>
                </div>
                {lastResult && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Last session</div>
                    <div className={`text-sm font-semibold capitalize ${
                      lastResult === 'clean' ? 'text-green-400' :
                      lastResult === 'okay' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {lastResult}
                    </div>
                  </div>
                )}
              </div>

              {/* Cycle progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Cycle progress</span>
                  <span>{primaryProg?.cleanStreakAtCurrentTempo ?? 0}/3 clean at this tempo</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((cycle.sessionCount || 0) / (cycle.sessionTarget || 10)) * 100)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🥁</div>
              <div className="text-gray-300 font-medium">Ready to begin?</div>
              <div className="text-gray-500 text-sm mt-1">Your first session will set your starting point.</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Sessions" value={totalSessions} />
          <StatPill label="Mastered" value={masteredCount} />
          <StatPill label="Streak" value={`${streak}d`} />
        </div>
      </div>

      {/* Start button */}
      <div className="px-6 mt-auto pb-8">
        <button
          onClick={onStartSession}
          className="w-full py-5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold text-lg rounded-2xl transition-colors shadow-lg shadow-amber-500/20"
        >
          Start Today's Session
        </button>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={onViewStats}
            className="py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors"
          >
            Progress
          </button>
          <button
            onClick={onViewSettings}
            className="py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function calculateStreak(history) {
  if (!history.length) return 0
  const dates = [...new Set(history.map(s => s.date?.slice(0, 10)))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let expected = today
  for (const date of dates) {
    if (date === expected) {
      streak++
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = d.toISOString().slice(0, 10)
    } else {
      break
    }
  }
  return streak
}
