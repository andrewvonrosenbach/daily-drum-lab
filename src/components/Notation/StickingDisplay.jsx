export default function StickingDisplay({ pattern }) {
  if (!pattern) return null
  const parts = pattern.split(/\s+/)

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center py-2">
      {parts.map((part, i) => {
        const isRight = part.startsWith('R') || part === 'R'
        const isLeft = part.startsWith('L') || part === 'L'
        const isGrace = part === part.toLowerCase() && part.length === 1

        return (
          <span
            key={i}
            className={`text-2xl font-bold font-mono tracking-wide ${
              isRight ? 'text-blue-400' : isLeft ? 'text-green-400' : 'text-gray-400'
            } ${isGrace ? 'text-sm opacity-70' : ''}`}
          >
            {part}
          </span>
        )
      })}
    </div>
  )
}
