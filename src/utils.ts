import { orderBy } from "es-toolkit/compat";
import { Chord as TonalChord } from "tonal";
import { STANDARD_TUNING } from "./constants";
import { type Chord, Muted, type TabBeatNotes, type Tuning } from "./types";

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function isStandardTuning(tuning: Tuning): boolean {
  return (
    tuning.map((note) => note.name).join(" ") ===
    STANDARD_TUNING.map((note) => note.name).join(" ")
  );
}

export function ordinalize(number: number): string {
  const pr = new Intl.PluralRules("en", { type: "ordinal" });
  const ordinalMap = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th",
  };
  const suffix = pr.select(number);
  return `${number}${ordinalMap[suffix as keyof typeof ordinalMap]}`;
}

export function getChord(notes: TabBeatNotes): Chord | undefined {
  const noteNames = Object.values(notes)
    .filter((note) => note !== Muted && note !== null)
    .map((note) => note.note.name);
  if (noteNames.length < 3) return undefined;
  const chords = TonalChord.detect(noteNames);
  const sorted = orderBy(
    chords.map((chord) => TonalChord.get(chord)),
    [
      (chord) =>
        chord.symbol.includes("#5") || chord.aliases.includes("quartal")
          ? 1
          : 0,
      (chord) => chord.symbol.length,
    ],
    ["asc", "asc"],
  );
  return sorted[0];
}

export function toChordName(chord: Chord): string {
  return chord.symbol.replace("M", "").replace(/\/\w[b#]?$/, "");
}

export function getFrettedNoteRange(
  strings: TabBeatNotes,
): [number | undefined, number | undefined] {
  let lowestFret: number | undefined;
  let highestFret: number | undefined;
  for (const fret of Object.values(strings)) {
    if (fret == null || fret === Muted) continue;

    const fretNumber = fret.fret;
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

export function getBarre(strings: TabBeatNotes): Barre | undefined {
  let barre: Barre | undefined;
  for (const [string, fret] of Object.entries(strings)) {
    const stringNumber = parseInt(string, 10);
    if (fret == null || fret === Muted || fret.fret === 0) {
      barre = undefined;
      continue;
    }
    if (barre == null) {
      barre = {
        fret: fret.fret,
        start: stringNumber,
        end: stringNumber,
      };
    } else if (fret.fret < barre.fret) {
      barre = undefined;
    } else {
      barre.end = stringNumber;
    }
  }
  if (barre == null || barre.end - barre.start <= 2) {
    return undefined;
  }
  return barre;
}
