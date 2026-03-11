export default function BeatIndicator({ currentBeat, totalBeats, tempo, isPlaying }) {
  const quarterPositions = [0, totalBeats / 4, totalBeats / 2, (totalBeats * 3) / 4]

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 4 }).map((_, i) => {
        const beatPos = quarterPositions[i]
        const isActive = isPlaying && currentBeat >= beatPos && currentBeat < (quarterPositions[i + 1] ?? totalBeats)
        return (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-75 ${
              isActive ? 'bg-amber-400 scale-125' : 'bg-gray-600'
            }`}
          />
        )
      })}
    </div>
  )
}
