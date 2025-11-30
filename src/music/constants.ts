import { getPitch } from "./pitch";
import type { TimeSignature, Tuning } from "./types";

export const STANDARD_TUNING: Tuning = [
  getPitch("E2"),
  getPitch("A2"),
  getPitch("D3"),
  getPitch("G3"),
  getPitch("B3"),
  getPitch("E4"),
];
export const DROP_D_TUNING: Tuning = [
  getPitch("D2"),
  getPitch("A2"),
  getPitch("D3"),
  getPitch("G3"),
  getPitch("B3"),
  getPitch("E4"),
];
export const UKELELE_TUNING: Tuning = [
  getPitch("G4"),
  getPitch("C4"),
  getPitch("E4"),
  getPitch("A4"),
];
export const STANDARD_TIME_SIGNATURE: TimeSignature = [4, 4];
