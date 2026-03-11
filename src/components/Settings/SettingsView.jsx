import { DOMAIN_LABELS } from '../../data/index.js'
import { useState } from 'react'

const DURATION_OPTIONS = [15, 20, 30, 45, 60]

export default function SettingsView({ settings, onSave, onBack, onResetProgress }) {
  const [local, setLocal] = useState({ ...settings })
  const [confirmReset, setConfirmReset] = useState(false)

  function toggleDomain(domain) {
    const current = local.enabledDomains || []
    const updated = current.includes(domain)
      ? current.filter(d => d !== domain)
      : [...current, domain]
    if (updated.length === 0) return // must have at least one
    setLocal(s => ({ ...s, enabledDomains: updated }))
  }

  function handleSave() {
    onSave(local)
    onBack()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="px-6 pt-10 pb-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-xl">←</button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="px-6 flex-1 flex flex-col gap-5 pb-8 overflow-y-auto">
        {/* Session duration */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-3 uppercase tracking-wider">Session Duration</h2>
          <div className="flex gap-2 flex-wrap">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setLocal(s => ({ ...s, sessionDuration: d }))}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                  local.sessionDuration === d
                    ? 'bg-amber-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Enabled domains */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-1 uppercase tracking-wider">Practice Domains</h2>
          <p className="text-xs text-gray-500 mb-3">Disable domains you want to skip. At least one must be enabled.</p>
          <div className="flex flex-col gap-2">
            {Object.entries(DOMAIN_LABELS).map(([key, label]) => {
              const enabled = (local.enabledDomains || []).includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleDomain(key)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    enabled ? 'bg-gray-700' : 'bg-gray-800 opacity-50'
                  }`}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    enabled ? 'bg-amber-500 border-amber-500' : 'border-gray-600'
                  }`}>
                    {enabled && <span className="text-black text-xs font-bold">✓</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Reset */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="font-semibold text-sm text-gray-300 mb-3 uppercase tracking-wider">Data</h2>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-3 bg-gray-700 hover:bg-red-900/50 text-red-400 font-medium rounded-xl transition-colors text-sm"
            >
              Reset All Progress
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-red-400">This will delete all progress, history, and cycles. Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onResetProgress(); setConfirmReset(false) }}
                  className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
