import {
  STAFF_WIDTH, STAFF_HEIGHT, STAFF_LEFT, STAFF_RIGHT,
  renderStaffLines, parseVoice, getTotalSlots, getNoteX,
  INSTRUMENT_Y
} from './notation-utils.js'
import StickingDisplay from './StickingDisplay.jsx'

export default function NotationDisplay({ notation, exercise }) {
  if (!notation) return null

  if (notation.type === 'sticking') {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="text-xs text-gray-400 mb-2 text-center uppercase tracking-widest">
          {notation.subdivision} · {notation.time_signature}
        </div>
        <StickingDisplay pattern={notation.pattern} />
        <SVGStaff notation={notation} />
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="text-xs text-gray-400 mb-2 text-center uppercase tracking-widest">
        {notation.subdivision} · {notation.time_signature}
      </div>
      <SVGStaff notation={notation} />
    </div>
  )
}

function SVGStaff({ notation }) {
  const totalSlots = getTotalSlots(notation)
  const lines = renderStaffLines()

  const allNotes = []
  for (const voice of (notation.voices || [])) {
    const parsed = parseVoice(voice, totalSlots)
    allNotes.push(...parsed)
  }

  const stickingNotes = (notation.voices || []).flatMap(voice =>
    voice.sticking
      ? voice.pattern.map((v, i) => v === 1 && voice.sticking[i] ? {
          x: getNoteX(i, totalSlots),
          label: voice.sticking[i],
        } : null).filter(Boolean)
      : []
  )

  // Beat subdivison markers
  const beatMarkers = []
  const beatsPerBar = parseInt(notation.time_signature?.split('/')[0] || 4)
  const slotsPerBeat = totalSlots / beatsPerBar
  for (let b = 0; b < beatsPerBar; b++) {
    beatMarkers.push({
      x: getNoteX(b * slotsPerBeat, totalSlots),
      label: b + 1,
    })
  }

  return (
    <svg
      viewBox={`0 0 ${STAFF_WIDTH} ${STAFF_HEIGHT}`}
      className="w-full"
      style={{ maxHeight: 120 }}
    >
      {/* Time signature */}
      <text x={8} y={38} fill="#9ca3af" fontSize={16} fontFamily="serif">{notation.time_signature?.split('/')[0]}</text>
      <text x={8} y={58} fill="#9ca3af" fontSize={16} fontFamily="serif">{notation.time_signature?.split('/')[1]}</text>

      {/* Staff lines */}
      {lines.map((line, i) => (
        <line
          key={i}
          x1={STAFF_LEFT - 4}
          y1={line.y}
          x2={STAFF_RIGHT}
          y2={line.y}
          stroke="#4b5563"
          strokeWidth={1}
        />
      ))}

      {/* Bar line at end */}
      <line x1={STAFF_RIGHT} y1={20} x2={STAFF_RIGHT} y2={80} stroke="#6b7280" strokeWidth={2} />
      <line x1={STAFF_LEFT - 4} y1={20} x2={STAFF_LEFT - 4} y2={80} stroke="#6b7280" strokeWidth={2} />

      {/* Beat position markers */}
      {beatMarkers.map((bm, i) => (
        <g key={i}>
          <line x1={bm.x} y1={18} x2={bm.x} y2={82} stroke="#374151" strokeWidth={1} strokeDasharray="2,4" />
          <text x={bm.x} y={100} textAnchor="middle" fill="#4b5563" fontSize={9}>{bm.label}</text>
        </g>
      ))}

      {/* Notes */}
      {allNotes.map((note, i) => (
        <NoteShape key={i} note={note} />
      ))}

      {/* Sticking labels above staff */}
      {stickingNotes.map((sn, i) => {
        const isRight = sn.label === 'R' || sn.label?.startsWith('R')
        const isLeft = sn.label === 'L' || sn.label?.startsWith('L')
        return (
          <text
            key={i}
            x={sn.x}
            y={10}
            textAnchor="middle"
            fill={isRight ? '#60a5fa' : isLeft ? '#4ade80' : '#9ca3af'}
            fontSize={8}
            fontWeight="bold"
            fontFamily="monospace"
          >
            {sn.label}
          </text>
        )
      })}
    </svg>
  )
}

function NoteShape({ note }) {
  const { x, y, notehead, accent, ghost, instrument } = note
  const r = 5

  if (notehead === 'x') {
    return (
      <g>
        {accent && <text x={x} y={y - 10} textAnchor="middle" fill="#fbbf24" fontSize={10}>^</text>}
        <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} stroke="#e5e7eb" strokeWidth={1.5} />
        <line x1={x + r} y1={y - r} x2={x - r} y2={y + r} stroke="#e5e7eb" strokeWidth={1.5} />
        {/* Stem */}
        {instrument !== 'hihat_foot' && (
          <line x1={x} y1={y} x2={x} y2={y - 20} stroke="#e5e7eb" strokeWidth={1.2} />
        )}
      </g>
    )
  }

  if (ghost) {
    return (
      <g>
        <text x={x - 7} y={y + 4} fill="#6b7280" fontSize={12}>(</text>
        <ellipse cx={x} cy={y} rx={r} ry={r - 1.5} fill="#9ca3af" />
        <text x={x + 3} y={y + 4} fill="#6b7280" fontSize={12}>)</text>
        <line x1={x} y1={y - r} x2={x} y2={y - 20} stroke="#9ca3af" strokeWidth={1.2} />
      </g>
    )
  }

  return (
    <g>
      {accent && <text x={x} y={y - 10} textAnchor="middle" fill="#fbbf24" fontSize={10}>^</text>}
      <ellipse cx={x} cy={y} rx={r} ry={r - 1.5} fill="#e5e7eb" transform={`rotate(-15,${x},${y})`} />
      {/* Stem up for top instruments, down for kick */}
      {instrument === 'kick' || instrument === 'hihat_foot'
        ? <line x1={x} y1={y + r} x2={x} y2={y + 20} stroke="#e5e7eb" strokeWidth={1.2} />
        : <line x1={x} y1={y - r} x2={x} y2={y - 20} stroke="#e5e7eb" strokeWidth={1.2} />
      }
    </g>
  )
}
