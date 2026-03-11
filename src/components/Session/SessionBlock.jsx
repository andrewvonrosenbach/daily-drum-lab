import NotationDisplay from '../Notation/NotationDisplay.jsx'
import Timer from '../common/Timer.jsx'
import Metronome from '../Metronome/Metronome.jsx'

export default function SessionBlock({ block, label, metronome, timerRunning, onTimerComplete }) {
  const { exercise, tempo, teacherNote, durationMins, tempoBlocks } = block

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
            <div key={i} className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500 truncate">{tb.label}</div>
              <div className="text-sm font-bold text-amber-400">{tb.tempo}</div>
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
        <Timer durationMins={durationMins} running={timerRunning} onComplete={onTimerComplete} />
      </div>
    </div>
  )
}
