import { sortBy, uniq, uniqBy } from "es-toolkit/compat";
import { generateId, isNonNullable } from "../utils";
import { chordMap } from "./chord-map";
import type { Chord, Note, Track } from "./types";

export function getChord(notes: Note[]): Chord | undefined {
  const pitches = uniqBy(
    sortBy(
      notes
        .map((note) => (note.muted ? null : note.pitch))
        .filter(isNonNullable),
      (pitch) => pitch.midi,
    ),
    (pitch) => pitch.midi,
  );
  if (pitches.length < 3) return undefined;

  for (const root of pitches) {
    const semitones = sortBy(
      uniq(
        pitches.map(
          (pitch) => ((pitch.midi % 12) - (root.midi % 12) + 12) % 12,
        ),
      ),
      (semitone) => semitone,
    );
    const semitoneString = semitones.join("-");
    const chordType = chordMap[semitoneString];
    if (chordType == null) continue;

    return {
      id: generateId("chord"),
      name: `${root.name}${chordType}`,
      type: chordType,
      notes,
    };
  }
}

export function collectChords(track: Track): Chord[] {
  const chords: Chord[] = [];
  for (const measure of track.measures) {
    for (const event of measure.events) {
      const chord = getChord(event.notes);
      if (chord != null) {
        chords.push(chord);
      }
    }
  }
  return uniqBy(chords, (chord) => chord.name);
}
