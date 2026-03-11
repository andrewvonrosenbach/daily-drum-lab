const KEY_PREFIX = 'drum_lab_'

function getKey(k) { return KEY_PREFIX + k }

export function loadProgress() {
  try {
    const raw = localStorage.getItem(getKey('progress'))
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveProgress(progress) {
  localStorage.setItem(getKey('progress'), JSON.stringify(progress))
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(getKey('history'))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveHistory(history) {
  localStorage.setItem(getKey('history'), JSON.stringify(history))
}

export function loadCurrentCycle() {
  try {
    const raw = localStorage.getItem(getKey('current_cycle'))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveCurrentCycle(cycle) {
  localStorage.setItem(getKey('current_cycle'), JSON.stringify(cycle))
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(getKey('settings'))
    return raw ? JSON.parse(raw) : getDefaultSettings()
  } catch { return getDefaultSettings() }
}

export function saveSettings(settings) {
  localStorage.setItem(getKey('settings'), JSON.stringify(settings))
}

export function getDefaultSettings() {
  return {
    sessionDuration: 30,
    metronomeSound: 'click',
    enabledDomains: ['rudiments', 'timekeeping', 'independence', 'dynamics', 'vocabulary', 'speed'],
  }
}

export function clearAllData() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(KEY_PREFIX))
  keys.forEach(k => localStorage.removeItem(k))
}
