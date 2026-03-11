import { useState, useCallback } from 'react'
import SessionHome from './components/Session/SessionHome.jsx'
import ActiveSession from './components/Session/ActiveSession.jsx'
import SessionComplete from './components/Session/SessionComplete.jsx'
import CheckIn from './components/Session/CheckIn.jsx'
import StatsView from './components/Progress/StatsView.jsx'
import SettingsView from './components/Settings/SettingsView.jsx'
import { useMetronome } from './components/Metronome/useMetronome.js'
import { generateSession } from './engine/session-generator.js'
import { recordResult } from './engine/tempo-progression.js'
import {
  selectNewCycle,
  advanceCycle,
  completeCycle,
  extendCycle,
  acknowledgeCycleCheckIn,
  shouldTriggerCheckIn,
} from './engine/cycle-engine.js'
import {
  loadProgress, saveProgress,
  loadHistory, saveHistory,
  loadCurrentCycle, saveCurrentCycle,
  loadSettings, saveSettings,
  clearAllData,
} from './storage/local-storage.js'

const VIEWS = { home: 'home', session: 'session', complete: 'complete', stats: 'stats', settings: 'settings' }

export default function App() {
  const [view, setView] = useState(VIEWS.home)
  const [progress, setProgress] = useState(loadProgress)
  const [history, setHistory] = useState(loadHistory)
  const [cycle, setCycle] = useState(loadCurrentCycle)
  const [settings, setSettings] = useState(loadSettings)
  const [activeSession, setActiveSession] = useState(null)
  const [showCheckIn, setShowCheckIn] = useState(false)

  const metronome = useMetronome()

  function handleStartSession() {
    if (shouldTriggerCheckIn(cycle)) {
      setShowCheckIn(true)
      return
    }
    startSession()
  }

  function startSession() {
    let activeCycle = cycle
    if (!activeCycle || activeCycle.status !== 'active') {
      activeCycle = selectNewCycle(progress, history, settings)
      setCycle(activeCycle)
      saveCurrentCycle(activeCycle)
    }
    const session = generateSession(activeCycle, progress, history, settings)
    if (!session) return
    setActiveSession(session)
    setView(VIEWS.session)
  }

  function handleSessionComplete({ primaryResult, secondaryResult }) {
    if (!activeSession) return
    metronome.stop()

    const completedSession = {
      ...activeSession,
      completed: true,
      primaryFocus: activeSession.primaryFocus
        ? { ...activeSession.primaryFocus, result: primaryResult }
        : null,
      secondaryFocus: activeSession.secondaryFocus
        ? { ...activeSession.secondaryFocus, result: secondaryResult }
        : null,
    }
    setActiveSession(completedSession)

    let newProgress = { ...progress }
    if (primaryResult && completedSession.primaryFocus) {
      newProgress = recordResult(newProgress, completedSession.primaryFocus.exerciseId, completedSession.primaryFocus.tempo, primaryResult)
    }
    if (secondaryResult && completedSession.secondaryFocus) {
      newProgress = recordResult(newProgress, completedSession.secondaryFocus.exerciseId, completedSession.secondaryFocus.tempo, secondaryResult)
    }
    setProgress(newProgress)
    saveProgress(newProgress)

    let updatedCycle = cycle ? advanceCycle(cycle) : null
    if (updatedCycle && updatedCycle.sessionCount >= updatedCycle.sessionTarget) {
      updatedCycle = completeCycle(updatedCycle)
    }
    setCycle(updatedCycle)
    saveCurrentCycle(updatedCycle)

    setView(VIEWS.complete)
  }

  function handleDone(notes) {
    if (!activeSession) { setView(VIEWS.home); return }
    const finalSession = { ...activeSession, notes }
    const newHistory = [...history, finalSession]
    setHistory(newHistory)
    saveHistory(newHistory)
    setActiveSession(null)
    setView(VIEWS.home)
  }

  function handleSaveSettings(newSettings) {
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  function handleResetProgress() {
    clearAllData()
    setProgress({})
    setHistory([])
    setCycle(null)
    setSettings(loadSettings())
    setView(VIEWS.home)
  }

  function handleCheckInKeepGoing() {
    setShowCheckIn(false)
    if (cycle) {
      const updated = acknowledgeCycleCheckIn(cycle)
      setCycle(updated)
      saveCurrentCycle(updated)
    }
    startSession()
  }

  function handleCheckInMoreTime() {
    setShowCheckIn(false)
    if (cycle) {
      const updated = extendCycle(cycle)
      setCycle(updated)
      saveCurrentCycle(updated)
    }
    startSession()
  }

  function handleCheckInSwitch() {
    setShowCheckIn(false)
    const newCycle = selectNewCycle(progress, history, settings)
    setCycle(newCycle)
    saveCurrentCycle(newCycle)
    const session = generateSession(newCycle, progress, history, settings)
    if (!session) return
    setActiveSession(session)
    setView(VIEWS.session)
  }

  return (
    <div className="max-w-md mx-auto relative">
      {view === VIEWS.home && (
        <SessionHome
          cycle={cycle}
          progress={progress}
          history={history}
          onStartSession={handleStartSession}
          onViewStats={() => setView(VIEWS.stats)}
          onViewSettings={() => setView(VIEWS.settings)}
        />
      )}

      {view === VIEWS.session && activeSession && (
        <ActiveSession
          session={activeSession}
          metronome={metronome}
          onComplete={handleSessionComplete}
          onSkip={() => {}}
        />
      )}

      {view === VIEWS.complete && activeSession && (
        <SessionComplete
          session={activeSession}
          progress={progress}
          onDone={handleDone}
        />
      )}

      {view === VIEWS.stats && (
        <StatsView
          progress={progress}
          history={history}
          onBack={() => setView(VIEWS.home)}
        />
      )}

      {view === VIEWS.settings && (
        <SettingsView
          settings={settings}
          onSave={handleSaveSettings}
          onBack={() => setView(VIEWS.home)}
          onResetProgress={handleResetProgress}
        />
      )}

      {showCheckIn && cycle && (
        <CheckIn
          cycle={cycle}
          progress={progress}
          onKeepGoing={handleCheckInKeepGoing}
          onMoreTime={handleCheckInMoreTime}
          onSwitch={handleCheckInSwitch}
        />
      )}
    </div>
  )
}
