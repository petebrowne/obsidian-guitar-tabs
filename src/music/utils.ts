import type { Note, Tuning } from "src/music/types";
import { STANDARD_TUNING } from "./constants";

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
