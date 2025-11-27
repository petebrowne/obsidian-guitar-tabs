import { Interval, Note, type NoteType } from "tonal";
import {
  DROP_D_TUNING,
  STANDARD_TIME_SIGNATURE,
  STANDARD_TUNING,
  UKELELE_TUNING,
} from "./constants";
import {
  Muted,
  type TabBeat,
  type TabBeatNotes,
  type TabMeasure,
  type TabNote,
  type TabTrack,
  type Tuning,
} from "./types";
import { getChord } from "./utils";

export function parseTabTrack(input: string): TabTrack {
  let tuning = STANDARD_TUNING;
  let capo: number | undefined;
  const measures: TabMeasure[] = [];
  let measure: TabMeasure = {
    timeSignature: STANDARD_TIME_SIGNATURE,
    beats: [],
  };
  measures.push(measure);
  for (const inputLine of input.split("\n")) {
    const line = inputLine.trim();
    if (isTuningLine(line)) {
      tuning = parseTuning(line);
      continue;
    }
    if (isCapoLine(line)) {
      capo = parseCapo(line);
      continue;
    }
    if (line === "") {
      measure = {
        timeSignature: STANDARD_TIME_SIGNATURE,
        beats: [],
      };
      measures.push(measure);
      continue;
    }
    measure.beats.push(parseTabBeat(line, tuning, capo));
  }
  return {
    tuning,
    capo,
    measures: measures.filter((measure) => measure.beats.length > 0),
  };
}

function isTuningLine(input: string): boolean {
  return input.toUpperCase().startsWith("TUNING: ");
}

function parseTuning(input: string): Tuning {
  const tuningInput = input.toUpperCase().replace("TUNING: ", "");
  if (tuningInput.replace(/[^\w]/g, "") === "DROPD") {
    return DROP_D_TUNING;
  }
  if (tuningInput === "UKELELE" || tuningInput === "UKE") {
    return UKELELE_TUNING;
  }

  const noteNames = tuningInput.split(/\s+/);
  return noteNames.map((name, i) => {
    if (/\d$/.test(name)) return Note.get(name);

    const octave = getBestOctave(i, noteNames.length);
    return Note.get(`${name}${octave}`);
  });
}

const NOTE_OCTAVE_MAPS: Record<number, number[]> = {
  6: [2, 2, 3, 3, 3, 4], // guitar: E2 A2 D3 G3 B3 E4
  4: [4, 4, 4, 4], // uke: G3 C4 E4 A4
};

function getBestOctave(stringIndex: number, stringCount: number): number {
  const octaveMap = NOTE_OCTAVE_MAPS[stringCount];
  if (!octaveMap) return 3;

  return octaveMap[stringIndex] ?? 3;
}

function isCapoLine(input: string): boolean {
  return input.toUpperCase().startsWith("CAPO: ");
}

function parseCapo(input: string): number | undefined {
  const capo = parseInt(input.toUpperCase().replace("CAPO: ", "").trim(), 10);
  return Number.isNaN(capo) ? undefined : capo;
}

function parseTabBeat(input: string, tuning: Tuning, capo = 0): TabBeat {
  const stringCount = tuning.length;
  const notes = Object.fromEntries(
    input
      .split(/\s+/)
      .slice(0, stringCount)
      .map((value, index) => {
        const stringNote = tuning[index];
        if (stringNote == null) {
          throw new Error(`String ${index + 1} not found in tuning`);
        }
        return [index + 1, parseTabNote(value, stringNote, capo)];
      }),
  ) as TabBeatNotes;
  const chord = getChord(notes);
  return {
    duration: "quarter",
    chord,
    notes,
  };
}

function parseTabNote(
  input: string,
  baseNote: NoteType,
  capo = 0,
): TabNote | typeof Muted | null {
  if (["", "-"].includes(input)) return null;
  if (["x", "X"].includes(input)) return Muted;

  const fret = parseInt(input, 10);
  if (Number.isNaN(fret)) return null;

  const note = Note.get(
    Note.transpose(baseNote, Interval.fromSemitones(fret + capo)),
  );
  if (note.empty) return null;

  return { fret, note };
}
