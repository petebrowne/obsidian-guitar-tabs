import { Note } from "tonal";
import type { TimeSignature, Tuning } from "./types";

export const STANDARD_TUNING: Tuning = [
  Note.get("E2"),
  Note.get("A2"),
  Note.get("D3"),
  Note.get("G3"),
  Note.get("B3"),
  Note.get("E4"),
];
export const DROP_D_TUNING: Tuning = [
  Note.get("D2"),
  Note.get("A2"),
  Note.get("D3"),
  Note.get("G3"),
  Note.get("B3"),
  Note.get("E4"),
];
export const UKELELE_TUNING: Tuning = [
  Note.get("G4"),
  Note.get("C4"),
  Note.get("E4"),
  Note.get("A4"),
];
export const STANDARD_TIME_SIGNATURE: TimeSignature = [4, 4];
