import { useState, useEffect } from 'react'
import NotationDisplay from '../Notation/NotationDisplay.jsx'
import Timer from '../common/Timer.jsx'
import Metronome from '../Metronome/Metronome.jsx'

export default function SessionBlock({ block, label, metronome, timerRunning, onTimerComplete }) {
  const { exercise, tempo, teacherNote, durationMins } = block
  const [tempoBlocks, setTempoBlocks] = useState(block.tempoBlocks || null)
  const [blockIndex, setBlockIndex] = useState(0)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')

  const currentBlock = tempoBlocks?.[blockIndex]

  // Sync metronome when block index changes or timer resumes
  useEffect(() => {
    if (tempoBlocks && currentBlock && timerRunning) {
      metronome.setTempo(currentBlock.tempo)
    }
  }, [blockIndex, timerRunning])

  function handleBlockTimerComplete() {
    if (tempoBlocks && blockIndex < tempoBlocks.length - 1) {
      setBlockIndex(i => i + 1)
    } else {
      onTimerComplete()
    }
  }

  function startEdit(i) {
    setEditingIndex(i)
    setEditValue(String(tempoBlocks[i].tempo))
  }

  function commitEdit(i) {
    const val = parseInt(editValue, 10)
    if (!isNaN(val) && val >= 30 && val <= 250) {
      const updated = tempoBlocks.map((tb, idx) =>
        idx === i ? { ...tb, tempo: val } : tb
      )
      setTempoBlocks(updated)
      if (i === blockIndex) {
        metronome.setTempo(val)
      }
    }
    setEditingIndex(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs text-amber-400 uppercase tracking-widest font-semibold">{label}</div>
          <h2 className="text-xl font-bold mt-0.5">{exercise.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{exercise.description}</p>
        </div>
      </div>

      <NotationDisplay notation={exercise.notation} exercise={exercise} />

      {tempoBlocks && (
        <div className="grid grid-cols-4 gap-1.5">
          {tempoBlocks.map((tb, i) => (
            <div
              key={i}
              className={`bg-gray-800 rounded-lg p-2 text-center transition-all ${
                i === blockIndex ? 'ring-2 ring-amber-400' : ''
              } ${i < blockIndex ? 'opacity-40' : ''}`}
            >
              <div className="text-xs text-gray-500 truncate">{tb.label}</div>
              {editingIndex === i ? (
                <input
                  autoFocus
                  type="number"
                  value={editValue}
                  min={30}
                  max={250}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(i)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit(i)
                    if (e.key === 'Escape') setEditingIndex(null)
                  }}
                  className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none"
                />
              ) : (
                <div
                  className="text-sm font-bold text-amber-400 cursor-pointer hover:text-amber-300 active:text-amber-200"
                  onClick={() => startEdit(i)}
                  title="Tap to edit BPM"
                >
                  {tb.tempo}
                </div>
              )}
              <div className="text-xs text-gray-500">{tb.durationMins}m</div>
            </div>
          ))}
        </div>
      )}

      {!tempoBlocks && (
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-0.5">Target tempo</div>
          <div className="text-3xl font-bold text-amber-400">{tempo} <span className="text-base text-gray-400 font-normal">BPM</span></div>
        </div>
      )}

      <Metronome metronome={metronome} />

      {teacherNote && (
        <div className="bg-gray-800 border-l-4 border-amber-500 rounded-r-xl px-4 py-3">
          <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">Teacher note</div>
          <p className="text-sm text-gray-300 leading-relaxed">"{teacherNote}"</p>
        </div>
      )}

      <div>
        {tempoBlocks && currentBlock ? (
          <>
            <div className="text-xs text-gray-400 mb-1 px-1">{currentBlock.description}</div>
            <Timer
              key={blockIndex}
              durationMins={currentBlock.durationMins}
              running={timerRunning}
              onComplete={handleBlockTimerComplete}
            />
          </>
        ) : (
          <Timer durationMins={durationMins} running={timerRunning} onComplete={onTimerComplete} />
        )}
      </div>
    </div>
  )
}
