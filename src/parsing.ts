import {
  DROP_D_TUNING,
  STANDARD_TIME_SIGNATURE,
  STANDARD_TUNING,
  UKELELE_TUNING,
} from "./constants";
import { getPitch } from "./music/pitch";
import {
  type Beat,
  Duration,
  type Measure,
  type Note,
  type TimeSignature,
  type Track,
  type Tuning,
} from "./music/types";
import { generateId, isNonNullable } from "./utils";

interface TrackOptions {
  tuning: Tuning;
  capo: number | undefined;
  duration: Duration;
  timeSignature: TimeSignature;
}

export function parseTab(input: string): Track {
  const trackOptions: TrackOptions = {
    tuning: STANDARD_TUNING,
    capo: undefined,
    duration: Duration.QUARTER,
    timeSignature: STANDARD_TIME_SIGNATURE,
  };
  const measures: Measure[] = [];
  let measure: Measure = {
    id: generateId("measure"),
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
        id: generateId("measure"),
        timeSignature: trackOptions.timeSignature,
        beats: [],
      };
      measures.push(measure);
      continue;
    }
    measure.beats.push(parseBeat(line, trackOptions));
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

export function parseTuning(input: string): Tuning {
  const tuningInput = input.toUpperCase().replace("TUNING: ", "");
  if (tuningInput.replace(/[^\w]/g, "") === "DROPD") {
    return DROP_D_TUNING;
  }
  if (tuningInput === "UKELELE" || tuningInput === "UKE") {
    return UKELELE_TUNING;
  }

  const noteNames = tuningInput.split(/\s+/);
  return noteNames.map((name, i) => {
    const octave = getBestOctave(i, noteNames.length);
    return getPitch(name, octave);
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

function parseDuration(input: string): Duration {
  const duration = input.toUpperCase().replace("DURATION: ", "").trim();
  if (duration.endsWith("64")) return 64;
  if (duration.endsWith("32")) return 32;
  if (duration.endsWith("16")) return 16;
  if (duration.endsWith("8")) return 8;
  if (duration.endsWith("4")) return 4;
  if (duration.endsWith("2")) return 2;
  if (duration.endsWith("1")) return 1;
  throw new Error(`Unknown duration: ${duration}`);
}

export function parseBeat(
  input: string,
  {
    tuning = STANDARD_TUNING,
    capo = 0,
    duration = Duration.QUARTER,
  }: Partial<TrackOptions> = {},
): Beat {
  const [noteInputs, durationInput] = input.split("/");
  if (noteInputs == null) {
    throw new Error(`Invalid beat input: "${input}"`);
  }
  const parsedDuration = parseBeatDuration(durationInput);
  const notes: Note[] = noteInputs
    .split(/\s+/)
    .map((value, index) => parseNote(index, value, { tuning, capo }))
    .filter(isNonNullable);
  return {
    id: generateId("beat"),
    duration: parsedDuration?.duration ?? duration,
    dotted: parsedDuration?.dotted,
    notes,
  };
}

interface ParsedTabBeatDuration {
  duration: Duration;
  dotted?: boolean;
}

function parseBeatDuration(
  input: string | null | undefined,
): ParsedTabBeatDuration | undefined {
  if (input == null) return undefined;

  const [duration, dotted] = input.split(".");
  if (duration == null) return undefined;

  try {
    return {
      duration: parseDuration(duration),
      dotted: dotted !== undefined ? true : undefined,
    };
  } catch (_error) {
    return undefined;
  }
}

function parseNote(
  stringIndex: number,
  input: string,
  { tuning = STANDARD_TUNING, capo = 0 }: Partial<TrackOptions> = {},
): Note | null {
  const stringPitch = tuning[stringIndex];
  if (["", "-"].includes(input) || stringPitch == null) return null;

  if (["x", "X"].includes(input)) return { stringIndex, muted: true };

  const fret = parseInt(input, 10);
  if (Number.isNaN(fret)) return null;

  const pitch = getPitch(stringPitch.midi + fret + capo);
  return { stringIndex, fret, pitch };
}
