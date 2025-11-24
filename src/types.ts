import type { Chord as ChordType, NoteType } from "tonal";

export type Note = NoteType;
export type Chord = ChordType.Chord;

export type Tuning = Note[];

export interface TabTrack {
  tuning: Tuning;
  capo?: number;
  measures: TabMeasure[];
}

export type TimeSignature = [number, number];

export interface TabMeasure {
  timeSignature: TimeSignature;
  beats: TabBeat[];
}

export type TabBeatNotes = Record<number, TabNote | typeof Muted | null>;

export interface TabBeat {
  duration: TabBeatDuration;
  dotted?: boolean;
  chord?: Chord;
  notes: TabBeatNotes;
}

export const Muted = Symbol("Muted");

export type TabBeatDuration =
  | "whole"
  | "half"
  | "quarter"
  | "eighth"
  | "sixteenth"
  | "thirty-second"
  | "sixty-fourth";

export interface TabNote {
  fret: number;
  note: Note;
  techniques?: TabNoteTechnique[];
}

export type TabNoteTechnique =
  | "hammer-on"
  | "pull-off"
  | "slide-to"
  | "slide-from"
  | "bend"
  | "bend-release"
  | "vibrato"
  | "staccato"
  | "dead-note"
  | "natural-harmonic"
  | "artificial-harmonic"
  | "tapped"
  | "palm-muted";
