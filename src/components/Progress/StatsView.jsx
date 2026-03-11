import { EXERCISES_BY_DOMAIN, DOMAIN_LABELS, EXERCISES_BY_ID } from '../../data/index.js'

export default function StatsView({ progress, history, onBack }) {
  const totalSessions = history.length
  const totalMins = history.reduce((sum, s) => sum + (s.totalDuration || 0), 0)
  const masteredCount = Object.values(progress).filter(p => p?.mastered).length

  const domainStats = Object.entries(EXERCISES_BY_DOMAIN).map(([domain, exercises]) => {
    const mastered = exercises.filter(e => progress[e.id]?.mastered).length
    const started = exercises.filter(e => progress[e.id]?.tempoHistory?.length > 0).length
    return { domain, label: DOMAIN_LABELS[domain], total: exercises.length, mastered, started }
  })

  const recentSessions = [...history].reverse().slice(0, 20)

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-xl">←</button>
        <h1 className="text-xl font-bold">Progress</h1>
      </div>

      <div className="px-6 flex-1 pb-8 flex flex-col gap-5 overflow-y-auto">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={totalSessions} label="Sessions" />
          <StatCard value={`${Math.round(totalMins / 60)}h`} label="Practice time" />
          <StatCard value={masteredCount} label="Mastered" />
        </div>

        {/* Domain breakdown */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider">Domain Mastery</h2>
          <div className="flex flex-col gap-3">
            {domainStats.map(({ domain, label, total, mastered, started }) => {
              const pct = total > 0 ? (mastered / total) * 100 : 0
              const startedPct = total > 0 ? (started / total) * 100 : 0
              return (
                <div key={domain}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-gray-500">{mastered}/{total}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gray-600 rounded-full absolute" style={{ width: `${startedPct}%` }} />
                    <div className="h-full bg-amber-400 rounded-full absolute" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block" /> Mastered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-600 rounded-full inline-block" /> In progress</span>
          </div>
        </div>

        {/* Exercise progress list */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-3 uppercase tracking-wider">Exercise Progress</h2>
          <div className="flex flex-col gap-2">
            {Object.entries(progress).filter(([, p]) => p?.tempoHistory?.length > 0).map(([id, p]) => {
              const ex = EXERCISES_BY_ID[id]
              if (!ex) return null
              const pct = ((p.currentTempo - ex.tempo_floor) / (ex.tempo_ceiling - ex.tempo_floor)) * 100
              return (
                <div key={id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{ex.name}</div>
                    <div className="h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.mastered ? 'bg-green-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-amber-400">{p.currentTempo} BPM</div>
                    {p.mastered && <div className="text-xs text-green-400">✓ Mastered</div>}
                  </div>
                </div>
              )
            })}
            {Object.keys(progress).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">Complete a session to see progress.</p>
            )}
          </div>
        </div>

        {/* Session history */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-3 uppercase tracking-wider">Recent Sessions</h2>
          <div className="flex flex-col gap-2">
            {recentSessions.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No sessions yet.</p>
            )}
            {recentSessions.map((session, i) => {
              const primaryEx = EXERCISES_BY_ID[session.primaryFocus?.exerciseId]
              const result = session.primaryFocus?.result
              const dateStr = session.date ? new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{primaryEx?.name ?? 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{dateStr} · {session.totalDuration}m</div>
                  </div>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    result === 'clean' ? 'bg-green-900/50 text-green-400' :
                    result === 'okay' ? 'bg-yellow-900/50 text-yellow-400' :
                    result === 'struggled' ? 'bg-red-900/30 text-red-400' : 'bg-gray-700 text-gray-500'
                  }`}>
                    {result ?? 'done'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
