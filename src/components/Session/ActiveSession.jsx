import { useState, useEffect } from 'react'
import SessionBlock from './SessionBlock.jsx'
import SelfReport from '../common/SelfReport.jsx'
import Timer from '../common/Timer.jsx'
import Metronome from '../Metronome/Metronome.jsx'

const PHASES = ['warmup', 'primary', 'primary-report', 'secondary', 'secondary-report', 'done']

function WarmUpBlock({ warmUp, metronome, timerRunning, onTimerComplete }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs text-blue-400 uppercase tracking-widest font-semibold">Warm-up</div>
        <h2 className="text-xl font-bold mt-0.5">{warmUp.exercise?.name}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{warmUp.exercise?.description}</p>
      </div>
      <Metronome metronome={metronome} />
      <div className="bg-gray-800 border-l-4 border-blue-500 rounded-r-xl px-4 py-3">
        <p className="text-sm text-gray-300">Settle in. This is familiar territory — focus on relaxed technique.</p>
      </div>
      <Timer durationMins={warmUp.durationMins} running={timerRunning} onComplete={onTimerComplete} />
    </div>
  )
}

export default function ActiveSession({ session, metronome, onComplete, onSkip }) {
  const [phase, setPhase] = useState('warmup')
  const [warmUpIndex, setWarmUpIndex] = useState(0)
  const [primaryResult, setPrimaryResult] = useState(null)
  const [secondaryResult, setSecondaryResult] = useState(null)
  const [timerRunning, setTimerRunning] = useState(true)

  const warmUps = session.warmUp || []
  const hasSecondary = !!session.secondaryFocus

  useEffect(() => {
    const primaryStartTempo = session.primaryFocus?.tempoBlocks?.[0]?.tempo ?? session.primaryFocus?.tempo
    const tempoForPhase = {
      warmup: warmUps[warmUpIndex]?.tempo,
      primary: primaryStartTempo,
      secondary: session.secondaryFocus?.tempo,
    }
    const t = tempoForPhase[phase]
    if (t) {
      metronome.stop()
      metronome.setTempo(t)
      metronome.start()
    } else {
      metronome.stop()
    }
  }, [phase, warmUpIndex])

  function advanceWarmUp() {
    if (warmUpIndex < warmUps.length - 1) {
      setWarmUpIndex(i => i + 1)
      setTimerRunning(false)
      setTimeout(() => setTimerRunning(true), 100)
    } else {
      setPhase('primary')
      setTimerRunning(false)
      setTimeout(() => setTimerRunning(true), 100)
    }
  }

  function handleTimerComplete() {
    setTimerRunning(false)
    if (phase === 'warmup') advanceWarmUp()
    else if (phase === 'primary') setPhase('primary-report')
    else if (phase === 'secondary') setPhase('secondary-report')
  }

  function handleSkip() {
    setTimerRunning(false)
    if (phase === 'warmup') advanceWarmUp()
    else if (phase === 'primary') setPhase('primary-report')
    else if (phase === 'secondary') setPhase('secondary-report')
    else if (phase === 'primary-report') {
      if (hasSecondary) { setPhase('secondary'); setTimeout(() => setTimerRunning(true), 100) }
      else setPhase('done')
    }
    else if (phase === 'secondary-report') setPhase('done')
  }

  function handlePrimaryReport(result) {
    setPrimaryResult(result)
    if (hasSecondary) {
      setPhase('secondary')
      setTimeout(() => setTimerRunning(true), 100)
    } else {
      setPhase('done')
    }
  }

  function handleSecondaryReport(result) {
    setSecondaryResult(result)
    setPhase('done')
  }

  useEffect(() => {
    if (phase === 'done') {
      onComplete({ primaryResult, secondaryResult })
    }
  }, [phase])

  const totalMins = session.totalDuration
  const elapsedMins = getElapsedMins(phase, warmUpIndex, warmUps, session)
  const progressPct = Math.min(100, (elapsedMins / totalMins) * 100)

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Top bar */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-400 capitalize">
            {phase === 'warmup' ? 'Warm-up' :
             phase === 'primary' || phase === 'primary-report' ? 'Primary Focus' :
             phase === 'secondary' || phase === 'secondary-report' ? 'Secondary Focus' : ''}
          </div>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip →
          </button>
        </div>
        {/* Overall progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-12 text-right">{elapsedMins}/{totalMins}m</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        {phase === 'warmup' && warmUps.length > 0 && (
          <WarmUpBlock
            warmUp={warmUps[warmUpIndex]}
            metronome={metronome}
            timerRunning={timerRunning}
            onTimerComplete={handleTimerComplete}
          />
        )}

        {phase === 'primary' && (
          <SessionBlock
            block={session.primaryFocus}
            label="Primary Focus · 18 min"
            metronome={metronome}
            timerRunning={timerRunning}
            onTimerComplete={handleTimerComplete}
          />
        )}

        {phase === 'primary-report' && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <div className="text-xs text-amber-400 uppercase tracking-widest mb-1">Primary Focus Complete</div>
              <h2 className="text-xl font-bold">{session.primaryFocus.exercise.name}</h2>
              <div className="text-gray-400 text-sm mt-1">{session.primaryFocus.tempo} BPM</div>
            </div>
            <SelfReport onReport={handlePrimaryReport} reported={primaryResult} />
          </div>
        )}

        {phase === 'secondary' && session.secondaryFocus && (
          <SessionBlock
            block={session.secondaryFocus}
            label="Secondary Focus · 7 min"
            metronome={metronome}
            timerRunning={timerRunning}
            onTimerComplete={handleTimerComplete}
          />
        )}

        {phase === 'secondary-report' && session.secondaryFocus && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <div className="text-xs text-green-400 uppercase tracking-widest mb-1">Secondary Focus Complete</div>
              <h2 className="text-xl font-bold">{session.secondaryFocus.exercise.name}</h2>
              <div className="text-gray-400 text-sm mt-1">{session.secondaryFocus.tempo} BPM</div>
            </div>
            <SelfReport onReport={handleSecondaryReport} reported={secondaryResult} />
          </div>
        )}
      </div>
    </div>
  )
}

function getElapsedMins(phase, warmUpIndex, warmUps, session) {
  const warmUpTotal = warmUps.reduce((sum, w) => sum + (w.durationMins || 0), 0)
  const primaryMins = session.primaryFocus?.durationMins || 18
  if (phase === 'warmup') return warmUpIndex > 0 ? Math.floor(warmUpTotal * warmUpIndex / warmUps.length) : 0
  if (phase === 'primary') return warmUpTotal
  if (phase === 'primary-report') return warmUpTotal + primaryMins
  if (phase === 'secondary') return warmUpTotal + primaryMins
  if (phase === 'secondary-report') return warmUpTotal + primaryMins + (session.secondaryFocus?.durationMins || 7)
  return session.totalDuration
}
