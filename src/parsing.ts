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
  type TabBeatDuration,
  type TabBeatNotes,
  type TabMeasure,
  type TabNote,
  type TabTrack,
  type TimeSignature,
  type Tuning,
} from "./types";
import { getChord } from "./utils";

interface TrackOptions {
  tuning: Tuning;
  capo: number | undefined;
  duration: TabBeatDuration;
  timeSignature: TimeSignature;
}

export function parseTabTrack(input: string): TabTrack {
  const trackOptions: TrackOptions = {
    tuning: STANDARD_TUNING,
    capo: undefined,
    duration: "quarter",
    timeSignature: STANDARD_TIME_SIGNATURE,
  };
  const measures: TabMeasure[] = [];
  let measure: TabMeasure = {
    timeSignature: STANDARD_TIME_SIGNATURE,
    beats: [],
  };
  measures.push(measure);
  for (const inputLine of input.split("\n")) {
    const line = inputLine.trim();
    if (isTuningLine(line)) {
      trackOptions.tuning = parseTuning(line);
      continue;
    }
    if (isCapoLine(line)) {
      trackOptions.capo = parseCapo(line);
      continue;
    }
    if (isDurationLine(line)) {
      trackOptions.duration = parseDuration(line);
      continue;
    }
    if (line === "") {
      measure = {
        timeSignature: trackOptions.timeSignature,
        beats: [],
      };
      measures.push(measure);
      continue;
    }
    measure.beats.push(parseTabBeat(line, trackOptions));
  }
  return {
    tuning: trackOptions.tuning,
    capo: trackOptions.capo,
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

function isDurationLine(input: string): boolean {
  return input.toUpperCase().startsWith("DURATION: ");
}

function parseDuration(input: string): TabBeatDuration {
  const duration = input.toUpperCase().replace("DURATION: ", "").trim();
  if (duration.endsWith("64")) return "sixty-fourth";
  if (duration.endsWith("32")) return "thirty-second";
  if (duration.endsWith("16")) return "sixteenth";
  if (duration.endsWith("8")) return "eighth";
  if (duration.endsWith("4")) return "quarter";
  if (duration.endsWith("2")) return "half";
  if (duration.endsWith("1")) return "whole";
  throw new Error(`Unknown duration: ${duration}`);
}

function parseTabBeat(
  input: string,
  { tuning, capo = 0, duration }: TrackOptions,
): TabBeat {
  const stringCount = tuning.length;
  const [noteInputs, durationInput] = input.split("/");
  if (noteInputs == null) {
    throw new Error(`Invalid beat input: ${input}`);
  }
  const parsedDuration = parseTabBeatDuration(durationInput);
  const notes = Object.fromEntries(
    noteInputs
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
    duration: parsedDuration?.duration ?? duration,
    dotted: parsedDuration?.dotted,
    chord,
    notes,
  };
}

interface ParsedTabBeatDuration {
  duration: TabBeatDuration;
  dotted?: boolean;
}

function parseTabBeatDuration(
  input: string | null | undefined,
): ParsedTabBeatDuration | undefined {
  if (input == null) return undefined;

  const [duration, dotted] = input.split(".");
  if (duration == null) return undefined;

  try {
    return {
      duration: parseDuration(duration),
      dotted: dotted !== undefined,
    };
  } catch (_error) {
    return undefined;
  }
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
