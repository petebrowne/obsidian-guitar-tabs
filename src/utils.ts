import { orderBy } from "es-toolkit/compat";
import { Chord as TonalChord } from "tonal";
import { STANDARD_TUNING } from "./constants";
import { type Chord, Muted, type TabBeatNotes, type Tuning } from "./types";

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
  if (sorted[0]?.symbol === "D4/F") {
    console.log(chords.map((chord) => TonalChord.get(chord)));
  }
  return sorted[0];
}

export function toChordName(chord: Chord): string {
  return chord.symbol.replace("M", "").replace(/\/\w[b#]?$/, "");
}
