export interface Pitch {
  midi: number;
  name: string;
}

export interface Chord {
  id: string;
  name: string;
  type: string;
  notes: Note[];
}

export type Tuning = Pitch[];

export interface Track {
  tuning: Tuning;
  capo?: number;
  measures: Measure[];
}

export interface TimeSignature {
  beats: number;
  beatValue: DurationValue;
}

export interface Measure {
  id: string;
  timeSignature: TimeSignature;
  events: Event[];
}

export interface MutedString {
  stringIndex: number;
  muted: true;
}

export interface FrettedNote {
  stringIndex: number;
  fret: number;
  pitch: Pitch;
  muted?: false;
}

export type Note = MutedString | FrettedNote;

export const DurationValue = {
  WHOLE: 1,
  HALF: 2,
  QUARTER: 4,
  EIGHTH: 8,
  SIXTEENTH: 16,
  THIRTY_SECOND: 32,
  SIXTY_FOURTH: 64,
};
export type DurationValue = (typeof DurationValue)[keyof typeof DurationValue];

export interface Tuplet {
  count: number;
  inTimeOf: number;
}

export interface Duration {
  value: DurationValue;
  dotted?: boolean;
  tuplet?: Tuplet;
}

export interface Event {
  id: string;
  duration: Duration;
  notes: Note[];
}
