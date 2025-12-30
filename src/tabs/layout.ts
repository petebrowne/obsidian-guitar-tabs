import { range, sum } from "es-toolkit/compat";
import {
  type Duration,
  DurationValue,
  type Event,
  type Measure,
  type Note,
  type Track,
} from "../music/types";
import { durationToUnits, groupEventsByBeat } from "../music/utils";
import { generateId, isNonNullable, withWindow } from "../utils";

interface LayoutTrackOptions {
  staffLineHeight?: number;
  measurePadding?: number;
  layoutWidth?: number;
  beatDuration?: Duration;
}

export function layoutTrack(
  { measures, ...track }: Track,
  {
    staffLineHeight = 14,
    measurePadding = 20,
    beatDuration = { value: DurationValue.QUARTER },
    layoutWidth = 800,
  }: LayoutTrackOptions = {},
): LaidOutTrack {
  const staffLineCount = track.tuning.length;
  const staffLines = range(0, staffLineCount).map((y) => ({
    y: y * staffLineHeight,
  }));
  const staffHeight = (staffLineCount - 1) * staffLineHeight + 1;

  // 1. Initial width measurements
  const laidOutMeasures: LaidOutMeasure[] = measures.map(
    ({ events, ...measure }) => {
      let measureX = measurePadding;
      const laidOutEvents: LaidOutEvent[] = [];
      const groupedEvents = groupEventsByBeat(events, beatDuration);
      for (const { notes, ...event } of layoutBeams(groupedEvents)) {
        const eventWidth = getDurationWidth(event.duration);
        laidOutEvents.push({
          ...event,
          notes: notes.map((note) => ({
            note,
            y: (staffLineCount - note.stringIndex - 1) * staffLineHeight,
          })),
          x: measureX,
          width: eventWidth,
        });
        measureX += eventWidth;
      }
      return {
        ...measure,
        x: 0,
        width: measureX,
        events: laidOutEvents,
        lastOnStaff: false,
      };
    },
  );

  // 2. Layout staffs to determine number of measures per staff
  let currentStaff: LaidOutStaff = {
    id: generateId("staff"),
    measures: [],
    lines: staffLines,
    height: staffHeight,
  };
  const staffs: LaidOutStaff[] = [currentStaff];
  let currentStaffWidth = 0;
  for (const [prevMeasure, measure, nextMeasure] of withWindow(
    laidOutMeasures,
  )) {
    if (currentStaffWidth + measure.width > layoutWidth) {
      if (prevMeasure) {
        prevMeasure.lastOnStaff = true;
      }
      currentStaff = {
        id: generateId("staff"),
        measures: [],
        lines: staffLines,
        height: staffHeight,
      };
      staffs.push(currentStaff);
      currentStaffWidth = 0;
    }
    currentStaff.measures.push(measure);
    currentStaffWidth += measure.width;
    if (nextMeasure == null) {
      measure.lastOnStaff = true;
    }
  }

  // 3. Finalize x positions and widths to fit within layout width
  for (const staff of staffs) {
    const staffWidth = sum(staff.measures.map((measure) => measure.width));
    const scale = layoutWidth / staffWidth;
    if (staff.measures.length === 1 && scale > 2) {
      continue;
    }

    let x = 0;
    for (const measure of staff.measures) {
      measure.x = x;
      x += measurePadding * scale;
      for (const event of measure.events) {
        event.x = x;
        const eventWidth = getDurationWidth(event.duration) * scale;
        x += eventWidth;
        event.width = eventWidth;
      }
      measure.width = x - measure.x;
    }
  }
  return { ...track, staffs };
}

// MARK: Layout Utils
// ----------------------------------------------------------------------------

interface DurationWidthOptions {
  minUnits?: number;
  minWidth?: number;
  exponent?: number;
}

function getDurationWidth(
  duration: Duration,
  {
    minUnits = 1 / 32,
    minWidth = 20,
    exponent = 0.3,
  }: DurationWidthOptions = {},
): number {
  const units = durationToUnits(duration);

  // Normalize relative to smallest unit
  const relative = units / minUnits;

  // Apply perceptual scaling
  const scaled = relative ** exponent;

  // Apply growth scale
  const result = minWidth * scaled;
  return Math.round(Math.max(result, minWidth));
}

function layoutBeams(groupedEvents: Event[][]): EventWithBeams[] {
  return groupedEvents.flatMap((group) =>
    group.map((event, index) => {
      const currentBeamLevel = beamLevelCount(event.duration);

      const prevEvent = group[index - 1];
      const prevBeamLevel =
        prevEvent == null ? 0 : beamLevelCount(prevEvent.duration);

      const nextEvent = group[index + 1];
      const nextBeamLevel =
        nextEvent == null ? 0 : beamLevelCount(nextEvent.duration);

      const beams = range(1, currentBeamLevel + 1)
        .map((level) => {
          if (level <= nextBeamLevel) {
            return { level, type: RhythmBeamType.CONNECTED };
          }
          if (level <= prevBeamLevel) {
            return null;
          }
          if (prevBeamLevel > 0) {
            return { level, type: RhythmBeamType.PARTIAL_LEFT };
          }
          if (nextBeamLevel > 0) {
            return { level, type: RhythmBeamType.PARTIAL_RIGHT };
          }
          return { level, type: RhythmBeamType.FLAG };
        })
        .filter(isNonNullable);
      return { ...event, beams };
    }),
  );
}

interface EventWithBeams extends Event {
  beams: LaidOutRhythmBeam[];
}

function beamLevelCount(duration: Duration): number {
  if (duration.value < DurationValue.EIGHTH) return 0;

  // 8th -> 1, 16th -> 2, 32nd -> 3
  return Math.log2(duration.value / 4);
}

// MARK: Layout Types
// ----------------------------------------------------------------------------

export type LaidOutTrack = Omit<Track, "measures"> & {
  staffs: LaidOutStaff[];
};

export interface LaidOutStaff {
  id: string;
  measures: LaidOutMeasure[];
  lines: LaidOutStaffLine[];
  height: number;
}

export interface LaidOutStaffLine {
  y: number;
}

export type LaidOutMeasure = Omit<Measure, "events"> & {
  events: LaidOutEvent[];
  x: number;
  width: number;
  lastOnStaff: boolean;
};

export const RhythmBeamType = {
  CONNECTED: "CONNECTED",
  PARTIAL_LEFT: "PARTIAL_LEFT",
  PARTIAL_RIGHT: "PARTIAL_RIGHT",
  FLAG: "FLAG",
} as const;
export type RhythmBeamType =
  (typeof RhythmBeamType)[keyof typeof RhythmBeamType];

export interface LaidOutRhythmBeam {
  level: number;
  type: RhythmBeamType;
}

export interface LaidOutEvent extends Omit<Event, "notes"> {
  notes: LaidOutNote[];
  beams: LaidOutRhythmBeam[];
  x: number;
  width: number;
}

export interface LaidOutNote {
  note: Note;
  y: number;
}
