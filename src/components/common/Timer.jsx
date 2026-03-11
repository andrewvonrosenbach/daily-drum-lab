import { useState, useEffect, useRef } from 'react'

export default function Timer({ durationMins, onComplete, running }) {
  const totalSeconds = durationMins * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setSecondsLeft(totalSeconds)
  }, [durationMins])

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          onComplete?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const progress = 1 - secondsLeft / totalSeconds

  return (
    <div className="flex items-center gap-3">
      <div className="text-xl font-mono font-bold text-white">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
