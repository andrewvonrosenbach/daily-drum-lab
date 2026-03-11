import rudiments from './exercises/rudiments.json'
import timekeeping from './exercises/timekeeping.json'
import independence from './exercises/independence.json'
import dynamics from './exercises/dynamics.json'
import vocabulary from './exercises/vocabulary.json'
import speed from './exercises/speed.json'

export const ALL_EXERCISES = [
  ...rudiments,
  ...timekeeping,
  ...independence,
  ...dynamics,
  ...vocabulary,
  ...speed,
]

export const EXERCISES_BY_ID = Object.fromEntries(ALL_EXERCISES.map(e => [e.id, e]))

export const EXERCISES_BY_DOMAIN = {
  rudiments,
  timekeeping,
  independence,
  dynamics,
  vocabulary,
  speed,
}

export const DOMAIN_LABELS = {
  rudiments: 'Rudiments',
  timekeeping: 'Timekeeping & Groove',
  independence: 'Limb Independence',
  dynamics: 'Dynamics & Touch',
  vocabulary: 'Vocabulary & Application',
  speed: 'Speed & Endurance',
}
