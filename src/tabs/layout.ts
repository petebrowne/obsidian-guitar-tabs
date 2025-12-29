import { range } from "es-toolkit/compat";
import {
  type Duration,
  DurationValue,
  type Event,
  type Measure,
  type Note,
  type Track,
} from "../music/types";
import { durationToUnits, groupEventsByBeat } from "../music/utils";
import { generateId, isNonNullable } from "../utils";

interface LayoutTrackOptions {
  optimalQuarterNoteWidth?: number;
  staffLineHeight?: number;
  layoutWidth?: number;
  beatDuration?: Duration;
}

export function layoutTrack(
  { measures, ...track }: Track,
  {
    optimalQuarterNoteWidth = 44,
    staffLineHeight = 14,
    beatDuration = { value: DurationValue.QUARTER },
    layoutWidth = 800,
  }: LayoutTrackOptions = {},
): LaidOutTrack {
  const staffLineCount = track.tuning.length;
  const staffLines = range(0, staffLineCount).map((y) => ({
    y: y * staffLineHeight,
  }));
  const staffHeight = (staffLineCount - 1) * staffLineHeight + 1;

  let currentX = 0;
  const laidOutMeasures: LaidOutMeasure[] = measures.map(
    ({ events, ...measure }) => {
      const measureX = currentX;
      currentX += optimalQuarterNoteWidth / 2;
      const laidOutEvents: LaidOutEvent[] = [];
      const groupedEvents = groupEventsByBeat(events, beatDuration);
      for (const { notes, ...event } of layoutBeams(groupedEvents)) {
        const eventWidth = getDurationWidth(
          event.duration,
          optimalQuarterNoteWidth,
        );
        laidOutEvents.push({
          ...event,
          notes: notes.map((note) => ({
            note,
            y: (staffLineCount - note.stringIndex - 1) * staffLineHeight,
          })),
          x: currentX,
          width: eventWidth,
        });
        currentX += eventWidth;
      }
      return {
        ...measure,
        x: measureX,
        width: currentX - measureX,
        events: laidOutEvents,
      };
    },
  );
  return {
    ...track,
    staffs: [
      {
        id: generateId("staff"),
        measures: laidOutMeasures,
        lines: staffLines,
        height: staffHeight,
      },
    ],
  };
}

// MARK: Layout Utils
// ----------------------------------------------------------------------------

function getDurationWidth(
  duration: Duration,
  optimalQuarterNoteWidth: number,
): number {
  return (durationToUnits(duration) / 0.25) * optimalQuarterNoteWidth;
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
