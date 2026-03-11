import { useRef, useState, useCallback, useEffect } from 'react'

const LOOKAHEAD_MS = 25.0
const SCHEDULE_AHEAD_S = 0.1

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempoState] = useState(120)
  const [subdivision, setSubdivision] = useState('quarter') // quarter | 8th | 16th | triplet
  const [currentBeat, setCurrentBeat] = useState(-1)

  const audioCtxRef = useRef(null)
  const nextNoteTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const timerRef = useRef(null)
  const tempoRef = useRef(tempo)
  const subdivisionRef = useRef(subdivision)
  const isPlayingRef = useRef(false)

  tempoRef.current = tempo
  subdivisionRef.current = subdivision

  function getAudioContext() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  function getSubdivisionCount() {
    switch (subdivisionRef.current) {
      case '8th': return 8
      case '16th': return 16
      case 'triplet': return 12
      default: return 4 // quarter
    }
  }

  function scheduleClick(time, beatIndex, totalBeats) {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    // Downbeat gets higher pitch + louder
    const isDownbeat = beatIndex === 0
    const isQuarterBeat = beatIndex % (totalBeats / 4) === 0

    osc.frequency.value = isDownbeat ? 1200 : isQuarterBeat ? 900 : 660
    gain.gain.setValueAtTime(isDownbeat ? 0.8 : isQuarterBeat ? 0.5 : 0.3, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)

    osc.start(time)
    osc.stop(time + 0.04)
  }

  function scheduler() {
    if (!isPlayingRef.current) return
    const ctx = getAudioContext()
    const totalBeats = getSubdivisionCount()
    const secondsPerBeat = (60.0 / tempoRef.current) / (totalBeats / 4)

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_S) {
      scheduleClick(nextNoteTimeRef.current, currentBeatRef.current, totalBeats)
      setCurrentBeat(currentBeatRef.current)
      currentBeatRef.current = (currentBeatRef.current + 1) % totalBeats
      nextNoteTimeRef.current += secondsPerBeat
    }

    timerRef.current = setTimeout(scheduler, LOOKAHEAD_MS)
  }

  const start = useCallback(() => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    currentBeatRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05
    isPlayingRef.current = true
    setIsPlaying(true)
    scheduler()
  }, [])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    setCurrentBeat(-1)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) stop()
    else start()
  }, [start, stop])

  const setTempo = useCallback((newTempo) => {
    const clamped = Math.max(30, Math.min(250, newTempo))
    setTempoState(clamped)
    tempoRef.current = clamped
  }, [])

  const setTempoAndRestart = useCallback((newTempo) => {
    setTempo(newTempo)
    if (isPlayingRef.current) {
      stop()
      setTimeout(start, 50)
    }
  }, [setTempo, stop, start])

  useEffect(() => {
    return () => {
      stop()
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  return {
    isPlaying,
    tempo,
    setTempo,
    setTempoAndRestart,
    subdivision,
    setSubdivision: (s) => { setSubdivision(s); subdivisionRef.current = s },
    currentBeat,
    toggle,
    start,
    stop,
    totalBeats: getSubdivisionCount(),
  }
}
