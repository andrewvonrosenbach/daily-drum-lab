import { EXERCISES_BY_ID } from '../../data/index.js'

export default function CheckIn({ cycle, progress, onKeepGoing, onMoreTime, onSwitch }) {
  const primaryEx = EXERCISES_BY_ID[cycle?.primaryExerciseId]
  const primaryProg = progress[cycle?.primaryExerciseId]

  const startTempo = primaryProg?.tempoHistory?.[0]?.tempo ?? primaryEx?.tempo_floor
  const currentTempo = primaryProg?.currentTempo ?? primaryEx?.tempo_floor

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold mb-1">
          Check-in · Session {cycle.sessionCount}
        </div>
        <h2 className="text-xl font-bold mb-4">How's it going?</h2>

        {primaryEx && (
          <div className="bg-gray-700 rounded-xl p-4 mb-5">
            <div className="font-semibold mb-1">{primaryEx.name}</div>
            <div className="text-sm text-gray-400">
              Started at {startTempo} BPM → now at {currentTempo} BPM
            </div>
            {primaryProg?.cleanStreakAtCurrentTempo > 0 && (
              <div className="text-xs text-green-400 mt-1">
                {primaryProg.cleanStreakAtCurrentTempo}/3 clean streak at current tempo
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onKeepGoing}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
          >
            Keep Pushing
          </button>
          <button
            onClick={onMoreTime}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
          >
            Need More Time Here
          </button>
          <button
            onClick={onSwitch}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
          >
            Switch to Something New
          </button>
        </div>
      </div>
    </div>
  )
}
