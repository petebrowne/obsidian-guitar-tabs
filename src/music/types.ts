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

export type TimeSignature = [number, number];

export interface Measure {
  id: string;
  timeSignature: TimeSignature;
  beats: Beat[];
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

export const Duration = {
  WHOLE: 1,
  HALF: 2,
  QUARTER: 4,
  EIGHTH: 8,
  SIXTEENTH: 16,
  THIRTY_SECOND: 32,
  SIXTY_FOURTH: 64,
};
export type Duration = (typeof Duration)[keyof typeof Duration];

export interface Beat {
  id: string;
  duration: Duration;
  dotted?: boolean;
  notes: Note[];
}
