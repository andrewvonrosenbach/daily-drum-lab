import { useState } from 'react'
import { EXERCISES_BY_DOMAIN, EXERCISES_BY_ID, DOMAIN_LABELS } from '../../data/index.js'

export default function StatsView({ progress, history, cycle, onBack, onCycleChange, onProgressAdjust }) {
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [swapSlot, setSwapSlot] = useState(null) // 'primary' | 'secondary'

  const totalSessions = history.length
  const totalMins = history.reduce((sum, s) => sum + (s.totalDuration || 0), 0)
  const masteredCount = Object.values(progress).filter(p => p?.mastered).length

  const domainStats = Object.entries(EXERCISES_BY_DOMAIN).map(([domain, exercises]) => {
    const mastered = exercises.filter(e => progress[e.id]?.mastered).length
    const started = exercises.filter(e => progress[e.id]?.tempoHistory?.length > 0).length
    return { domain, label: DOMAIN_LABELS[domain], total: exercises.length, mastered, started }
  })

  const recentSessions = [...history].reverse().slice(0, 20)

  const primaryEx = cycle?.primaryExerciseId ? EXERCISES_BY_ID[cycle.primaryExerciseId] : null
  const secondaryEx = cycle?.secondaryExerciseId ? EXERCISES_BY_ID[cycle.secondaryExerciseId] : null
  const primaryProg = cycle?.primaryExerciseId ? (progress[cycle.primaryExerciseId] ?? null) : null
  const primaryTempo = primaryProg?.currentTempo ?? primaryEx?.tempo_floor ?? 60
  const secondaryProg = cycle?.secondaryExerciseId ? (progress[cycle.secondaryExerciseId] ?? null) : null
  const secondaryTempo = secondaryProg?.currentTempo ?? secondaryEx?.tempo_floor ?? 60

  function getExerciseStatus(exId) {
    const p = progress[exId]
    if (p?.mastered) return 'mastered'
    if (p?.tempoHistory?.length > 0) return 'active'
    return 'available'
  }

  function setExercise(slot, exerciseId) {
    if (!cycle) return
    const field = slot === 'primary' ? 'primaryExerciseId' : 'secondaryExerciseId'
    const updated = { ...cycle, [field]: exerciseId }
    if (slot === 'primary') updated.sessionCount = 0
    onCycleChange(updated)
    setSwapSlot(null)
    setActiveNodeId(null)
  }

  function adjustTempo(exerciseId, delta) {
    const ex = EXERCISES_BY_ID[exerciseId]
    if (!ex) return
    const current = progress[exerciseId]?.currentTempo ?? ex.tempo_floor
    const next = Math.max(ex.tempo_floor, Math.min(ex.tempo_ceiling, current + delta))
    onProgressAdjust(exerciseId, next)
  }

  function navigatePrimary(direction) {
    if (!primaryEx) return
    const domain = EXERCISES_BY_DOMAIN[primaryEx.domain] ?? []
    const idx = domain.findIndex(e => e.id === primaryEx.id)
    const next = idx + direction
    if (next >= 0 && next < domain.length) setExercise('primary', domain[next].id)
  }

  const primaryDomain = primaryEx ? (EXERCISES_BY_DOMAIN[primaryEx.domain] ?? []) : []
  const primaryDomainIdx = primaryEx ? primaryDomain.findIndex(e => e.id === primaryEx.id) : -1

  if (swapSlot) {
    return (
      <ExercisePicker
        slot={swapSlot}
        progress={progress}
        currentPrimary={cycle?.primaryExerciseId}
        currentSecondary={cycle?.secondaryExerciseId}
        onSelect={id => setExercise(swapSlot, id)}
        onCancel={() => setSwapSlot(null)}
        getStatus={getExerciseStatus}
      />
    )
  }

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

        {/* Your Plan */}
        <div className="bg-gray-800 rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Your Plan</h2>

          {!cycle ? (
            <p className="text-gray-500 text-sm text-center py-2">Start a session to activate a plan.</p>
          ) : (
            <>
              {primaryEx && (
                <div className="bg-gray-700/60 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold">Primary Focus</div>
                      <div className="text-base font-bold mt-0.5 leading-tight">{primaryEx.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{DOMAIN_LABELS[primaryEx.domain]}</div>
                    </div>
                    <button
                      onClick={() => setSwapSlot('primary')}
                      className="shrink-0 text-xs px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-gray-300 font-medium"
                    >
                      Swap
                    </button>
                  </div>

                  {/* BPM strip */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{primaryEx.tempo_floor}</span>
                        <span className="text-amber-400 font-semibold">{primaryTempo} BPM</span>
                        <span>{primaryEx.tempo_ceiling}</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${Math.max(2, ((primaryTempo - primaryEx.tempo_floor) / (primaryEx.tempo_ceiling - primaryEx.tempo_floor)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => adjustTempo(primaryEx.id, -5)}
                        className="w-8 h-8 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 rounded-lg text-base font-bold flex items-center justify-center"
                      >−</button>
                      <button
                        onClick={() => adjustTempo(primaryEx.id, 5)}
                        className="w-8 h-8 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 rounded-lg text-base font-bold flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  {/* Prev / Next navigation */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigatePrimary(-1)}
                      disabled={primaryDomainIdx <= 0}
                      className="flex-1 py-1.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-gray-300"
                    >
                      ← Prev exercise
                    </button>
                    <button
                      onClick={() => navigatePrimary(1)}
                      disabled={primaryDomainIdx < 0 || primaryDomainIdx >= primaryDomain.length - 1}
                      className="flex-1 py-1.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-gray-300"
                    >
                      Next exercise →
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Session {cycle.sessionCount}/{cycle.sessionTarget} · {primaryProg?.cleanStreakAtCurrentTempo ?? 0}/3 clean at {primaryTempo} BPM
                  </div>
                </div>
              )}

              {secondaryEx && (
                <div className="bg-gray-700/60 rounded-xl p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-green-400 uppercase tracking-widest font-semibold">Secondary Focus</div>
                    <div className="text-base font-bold mt-0.5 leading-tight">{secondaryEx.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{DOMAIN_LABELS[secondaryEx.domain]} · {secondaryTempo} BPM</div>
                  </div>
                  <button
                    onClick={() => setSwapSlot('secondary')}
                    className="shrink-0 text-xs px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-gray-300 font-medium"
                  >
                    Swap
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Exercise Pathways */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider">Exercise Pathways</h2>
          <div className="flex flex-col gap-5">
            {Object.entries(EXERCISES_BY_DOMAIN).map(([domain, exercises]) => (
              <PathwayRow
                key={domain}
                label={DOMAIN_LABELS[domain]}
                exercises={exercises}
                progress={progress}
                activePrimary={cycle?.primaryExerciseId}
                activeSecondary={cycle?.secondaryExerciseId}
                activeNodeId={activeNodeId}
                onNodeTap={id => setActiveNodeId(activeNodeId === id ? null : id)}
                onSetPrimary={id => setExercise('primary', id)}
                onSetSecondary={id => setExercise('secondary', id)}
                getStatus={getExerciseStatus}
              />
            ))}
          </div>
        </div>

        {/* Domain Mastery */}
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

        {/* Recent Sessions */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-3 uppercase tracking-wider">Recent Sessions</h2>
          <div className="flex flex-col gap-2">
            {recentSessions.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No sessions yet.</p>
            )}
            {recentSessions.map((session, i) => {
              const sessEx = EXERCISES_BY_ID[session.primaryFocus?.exerciseId]
              const result = session.primaryFocus?.result
              const dateStr = session.date
                ? new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : ''
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{sessEx?.name ?? 'Unknown'}</div>
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

function PathwayRow({ label, exercises, progress, activePrimary, activeSecondary, activeNodeId, onNodeTap, onSetPrimary, onSetSecondary, getStatus }) {
  const activeInDomain = exercises.some(e => e.id === activeNodeId)

  return (
    <div>
      <div className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">{label}</div>
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex items-start" style={{ minWidth: 'max-content' }}>
          {exercises.map((ex, i) => {
            const status = getStatus(ex.id)
            const isPrimary = ex.id === activePrimary
            const isSecondary = ex.id === activeSecondary
            const tempo = progress[ex.id]?.currentTempo

            return (
              <div key={ex.id} className="flex items-start">
                <button
                  onClick={() => onNodeTap(ex.id)}
                  className="flex flex-col items-center w-16 group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2
                    ${isPrimary
                      ? 'bg-amber-500 border-amber-300 text-black shadow-lg shadow-amber-500/30'
                      : isSecondary
                      ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/20'
                      : status === 'mastered'
                      ? 'bg-green-700 border-green-600 text-white'
                      : status === 'active'
                      ? 'bg-gray-700 border-amber-500/60 text-amber-400'
                      : 'bg-gray-700 border-gray-600 text-gray-400 group-hover:border-gray-400'
                    }`}
                  >
                    {status === 'mastered' ? '✓' : tempo ? tempo : '○'}
                  </div>
                  <div
                    className={`text-center mt-1 leading-tight px-0.5 w-16 text-xs
                      ${isPrimary ? 'text-amber-400 font-semibold'
                        : isSecondary ? 'text-green-400 font-semibold'
                        : 'text-gray-500'}`}
                    title={ex.name}
                  >
                    {abbrev(ex.name)}
                  </div>
                </button>

                {i < exercises.length - 1 && (
                  <div className="w-3 h-0.5 mt-5 shrink-0 bg-gray-600" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action panel for tapped node */}
      {activeInDomain && (() => {
        const ex = EXERCISES_BY_ID[activeNodeId]
        const exProg = progress[activeNodeId]
        if (!ex) return null
        return (
          <div className="mt-2 bg-gray-700/80 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{ex.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{ex.description}</div>
                {exProg?.currentTempo && (
                  <div className="text-xs text-amber-400 mt-1">
                    {exProg.currentTempo} BPM · {exProg.cleanStreakAtCurrentTempo ?? 0}/3 clean streak
                    {exProg.mastered && ' · ✓ Mastered'}
                  </div>
                )}
              </div>
              <button onClick={() => onNodeTap(activeNodeId)} className="text-gray-500 hover:text-gray-300 text-lg leading-none shrink-0">×</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSetPrimary(activeNodeId)}
                className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 rounded-lg text-xs font-semibold"
              >
                Set as Primary
              </button>
              <button
                onClick={() => onSetSecondary(activeNodeId)}
                className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 rounded-lg text-xs font-semibold"
              >
                Set as Secondary
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function ExercisePicker({ slot, progress, currentPrimary, currentSecondary, onSelect, onCancel, getStatus }) {
  const [filter, setFilter] = useState('')
  const lc = filter.toLowerCase()

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors text-xl">←</button>
        <h1 className="text-xl font-bold">Choose {slot === 'primary' ? 'Primary' : 'Secondary'}</h1>
      </div>

      <div className="px-4 mb-3">
        <input
          type="text"
          placeholder="Filter exercises..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-4">
        {Object.entries(EXERCISES_BY_DOMAIN).map(([domain, exercises]) => {
          const filtered = exercises.filter(e => !lc || e.name.toLowerCase().includes(lc))
          if (filtered.length === 0) return null
          return (
            <div key={domain}>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 px-1">{DOMAIN_LABELS[domain]}</div>
              <div className="flex flex-col gap-1">
                {filtered.map(ex => {
                  const status = getStatus(ex.id)
                  const isCurrent = ex.id === (slot === 'primary' ? currentPrimary : currentSecondary)
                  const exProg = progress[ex.id]
                  return (
                    <button
                      key={ex.id}
                      onClick={() => onSelect(ex.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left w-full ${
                        isCurrent
                          ? 'bg-amber-500/20 border border-amber-500/40'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${
                        status === 'mastered' ? 'bg-green-700 text-white' :
                        status === 'active' ? 'bg-gray-700 text-amber-400 border border-amber-500/50' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {status === 'mastered' ? '✓' : status === 'active' ? '●' : '○'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{ex.name}</div>
                        {exProg?.currentTempo ? (
                          <div className="text-xs text-amber-400">{exProg.currentTempo} BPM · {exProg.cleanStreakAtCurrentTempo ?? 0}/3 clean</div>
                        ) : null}
                      </div>
                      {isCurrent && <span className="text-xs text-amber-400 font-medium shrink-0">Current</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function abbrev(name) {
  // Shorten to fit ~64px node label
  const words = name.split(' ')
  if (words.length === 1) return name.slice(0, 8)
  if (words.length === 2) return words.map(w => w.slice(0, 6)).join(' ')
  // 3+ words: first two abbreviated
  return words.slice(0, 2).map(w => w.slice(0, 5)).join(' ')
}

function StatCard({ value, label }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}
