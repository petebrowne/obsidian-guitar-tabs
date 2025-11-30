import type { Pitch } from "./types";

const NOTE_NAMES = [
  // sharps
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
  // flats
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

export function getPitch(input: number | string, octave: number = 4): Pitch {
  let noteName: string | undefined;
  let midi: number | undefined;
  if (typeof input === "number") {
    noteName = getNoteNameFromMidi(input);
    midi = input;
  } else {
    midi = getNoteMidiFromName(input, octave);
    if (midi != null) {
      noteName = getNoteNameFromMidi(midi);
    }
  }
  if (noteName == null || midi == null) {
    throw new Error(`Invalid pitch input: ${input}`);
  }
  return {
    midi,
    name: noteName,
  };
}

function getNoteNameFromMidi(midi: number): string | undefined {
  const noteIndex = midi % 12;
  return NOTE_NAMES[noteIndex];
}

const NOTE_NAME_REGEXP = /^([A-G][b#]?)(\d+)?$/i;

function getNoteMidiFromName(
  name: string,
  octave: number = 4,
): number | undefined {
  const match = name.match(NOTE_NAME_REGEXP);
  if (!match) return undefined;

  const [_, noteName, octaveString] = match;
  if (noteName == null) return undefined;

  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) return undefined;

  if (octaveString != null) {
    octave = parseInt(octaveString, 10);
  }
  return (noteIndex % 12) + (octave + 1) * 12;
}
