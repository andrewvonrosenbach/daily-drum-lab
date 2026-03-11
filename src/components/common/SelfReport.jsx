const OPTIONS = [
  { value: 'clean', label: 'Clean', color: 'bg-green-600 hover:bg-green-500', icon: '✓' },
  { value: 'okay', label: 'Okay', color: 'bg-yellow-600 hover:bg-yellow-500', icon: '~' },
  { value: 'struggled', label: 'Struggled', color: 'bg-red-700 hover:bg-red-600', icon: '✗' },
]

export default function SelfReport({ onReport, reported, prompt = 'How did that feel?' }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-300 text-sm font-medium">{prompt}</p>
      <div className="flex gap-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onReport(opt.value)}
            className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${opt.color} text-white ${
              reported === opt.value ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <span className="mr-1">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
