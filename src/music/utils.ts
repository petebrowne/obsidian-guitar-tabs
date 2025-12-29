import { STANDARD_TUNING } from "./constants";
import {
  type Duration,
  DurationValue,
  type Event,
  type Note,
  type Tuning,
} from "./types";

export function isStandardTuning(tuning: Tuning): boolean {
  return (
    tuning.map((note) => note.midi).join("-") ===
    STANDARD_TUNING.map((note) => note.midi).join("-")
  );
}

/** Get the lowest and highest fret numbers from the notes */
export function getFrettedNoteRange(
  notes: Note[],
): [number | undefined, number | undefined] {
  let lowestFret: number | undefined;
  let highestFret: number | undefined;
  for (const note of notes) {
    if (note.muted) continue;

    const fretNumber = note.fret;
    if (fretNumber === 0) continue;

    if (lowestFret == null || fretNumber < lowestFret) {
      lowestFret = fretNumber;
    }
    if (highestFret == null || fretNumber > highestFret) {
      highestFret = fretNumber;
    }
  }
  return [lowestFret, highestFret];
}

export interface Barre {
  fret: number;
  start: number;
  end: number;
}

/** Determine if there is a barre across multiple strings based on the notes */
export function getBarre(notes: Note[]): Barre | undefined {
  let barre: Barre | undefined;
  for (const note of notes) {
    if (note.muted || note.fret === 0) {
      barre = undefined;
      continue;
    }
    if (barre == null) {
      barre = {
        fret: note.fret,
        start: note.stringIndex,
        end: note.stringIndex,
      };
    } else if (note.fret < barre.fret) {
      barre = undefined;
    } else {
      barre.end = note.stringIndex;
    }
  }
  if (barre == null || barre.end - barre.start <= 2) {
    return undefined;
  }
  return barre;
}

export function durationToUnits(duration: Duration | DurationValue): number {
  if (typeof duration === "number") {
    return 1 / duration;
  }
  let base = 1 / duration.value;
  if (duration.dotted) base *= 1.5;
  if (duration.tuplet) base *= duration.tuplet.inTimeOf / duration.tuplet.count;
  return base;
}

export function groupEventsByBeat(
  events: Event[],
  beatDuration: Duration = { value: DurationValue.QUARTER },
): Event[][] {
  const beatUnits = durationToUnits(beatDuration);
  let currentBeat: Event[] = [];
  let prevBeatIndex = 0;
  let totalUnits = 0;
  const beats: Event[][] = [currentBeat];
  for (const event of events) {
    const nextBeatIndex = Math.floor(totalUnits / beatUnits);
    if (nextBeatIndex !== prevBeatIndex) {
      currentBeat = [];
      prevBeatIndex = nextBeatIndex;
      beats.push(currentBeat);
    }
    totalUnits += durationToUnits(event.duration);
    currentBeat.push(event);
  }
  return beats;
}
