// SVG layout constants
export const STAFF_WIDTH = 560
export const STAFF_HEIGHT = 120
export const STAFF_LEFT = 40
export const STAFF_RIGHT = STAFF_WIDTH - 20
export const NOTE_AREA_WIDTH = STAFF_RIGHT - STAFF_LEFT

// Vertical positions (y) for each instrument on a 5-line staff
// Lines at y=20,35,50,65,80; spaces at y=27.5,42.5,57.5,72.5
export const INSTRUMENT_Y = {
  ride: 12,        // above staff
  hihat: 20,       // top line (x notehead)
  tom1: 27,        // first space
  snare: 35,       // second line (middle)
  tom2: 42,        // second space
  tom3: 50,        // third line
  kick: 65,        // fourth space
  hihat_foot: 88,  // below staff
}

export const STAFF_LINES_Y = [20, 35, 50, 65, 80]

export function getNoteX(index, total) {
  return STAFF_LEFT + (index / total) * NOTE_AREA_WIDTH + NOTE_AREA_WIDTH / total / 2
}

export function renderStaffLines() {
  return STAFF_LINES_Y.map(y => ({ y }))
}

export function parseVoice(voice, totalSlots) {
  const notes = []
  for (let i = 0; i < voice.pattern.length; i++) {
    if (voice.pattern[i] !== 1) continue
    notes.push({
      x: getNoteX(i, totalSlots),
      y: INSTRUMENT_Y[voice.instrument] ?? 50,
      notehead: voice.notehead || 'standard',
      accent: voice.accents?.includes(i),
      ghost: voice.ghosts?.includes(i),
      sticking: voice.sticking?.[i],
      instrument: voice.instrument,
    })
  }
  return notes
}

export function getTotalSlots(notation) {
  if (!notation?.voices?.length) return 16
  return Math.max(...notation.voices.map(v => v.pattern?.length || 16))
}
