import BeatIndicator from './BeatIndicator.jsx'

const SUBDIVISION_OPTIONS = [
  { value: 'quarter', label: '♩' },
  { value: '8th', label: '♪' },
  { value: '16th', label: '𝅘𝅥𝅯' },
  { value: 'triplet', label: '3' },
]

export default function Metronome({ metronome }) {
  const { isPlaying, tempo, setTempo, subdivision, setSubdivision, currentBeat, toggle, totalBeats } = metronome

  function handleTempoInput(e) {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) setTempo(val)
  }

  function handleTempoWheel(e) {
    e.preventDefault()
    setTempo(tempo + (e.deltaY < 0 ? 1 : -1))
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BeatIndicator
            currentBeat={currentBeat}
            totalBeats={totalBeats}
            isPlaying={isPlaying}
            tempo={tempo}
          />
          <div
            className="flex items-center gap-1 cursor-ns-resize select-none"
            onWheel={handleTempoWheel}
          >
            <input
              type="number"
              value={tempo}
              onChange={handleTempoInput}
              min={30}
              max={250}
              className="w-16 bg-transparent text-2xl font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
            />
            <span className="text-gray-400 text-sm">BPM</span>
          </div>
        </div>

        <button
          onClick={toggle}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-600 text-black'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isPlaying ? '■ Stop' : '▶ Play'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs">Subdivision:</span>
        {SUBDIVISION_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSubdivision(opt.value)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              subdivision === opt.value
                ? 'bg-amber-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <input
        type="range"
        min={30}
        max={250}
        value={tempo}
        onChange={e => setTempo(parseInt(e.target.value, 10))}
        className="w-full accent-amber-400"
      />
    </div>
  )
}
