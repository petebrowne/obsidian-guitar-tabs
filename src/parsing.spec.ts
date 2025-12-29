import { describe, expect, it } from "vitest";
import {
  DROP_D_TUNING,
  STANDARD_TUNING,
  UKELELE_TUNING,
} from "./music/constants";
import { getPitch } from "./music/pitch";
import { DurationValue } from "./music/types";
import { parseEvent, parseTuning } from "./parsing";

describe("parseTuning", () => {
  it("parses explicit tuning", () => {
    expect(parseTuning("tuning: E2 A2 D3 G3 B3 E4")).toEqual(STANDARD_TUNING);
  });

  it("parses explicit tuning without octaves", () => {
    expect(parseTuning("tuning: E A D G B E")).toEqual(STANDARD_TUNING);
  });

  it("parses other tunings", () => {
    expect(parseTuning("D A D F# B E")).toEqual([
      getPitch("D2"),
      getPitch("A2"),
      getPitch("D3"),
      getPitch("F#3"),
      getPitch("B3"),
      getPitch("E4"),
    ]);
  });

  it("parses Drop D shortcut", () => {
    expect(parseTuning("tuning: Drop D")).toEqual(DROP_D_TUNING);
  });

  it("parses UKELELE shortcut", () => {
    expect(parseTuning("tuning: uke")).toEqual(UKELELE_TUNING);
  });
});

describe("parseEvent", () => {
  it("parses basic notes", () => {
    expect(parseEvent("0 2 2 1 0 0")).toEqual({
      id: expect.any(String),
      duration: DurationValue.QUARTER,
      dotted: undefined,
      notes: [
        { stringIndex: 0, fret: 0, pitch: getPitch("E2") },
        { stringIndex: 1, fret: 2, pitch: getPitch("B2") },
        { stringIndex: 2, fret: 2, pitch: getPitch("E3") },
        { stringIndex: 3, fret: 1, pitch: getPitch("G#3") },
        { stringIndex: 4, fret: 0, pitch: getPitch("B3") },
        { stringIndex: 5, fret: 0, pitch: getPitch("E4") },
      ],
    });
  });

  it("parses muted and skipped strings", () => {
    expect(parseEvent("- 3 x 5 4 3")).toEqual({
      id: expect.any(String),
      duration: DurationValue.QUARTER,
      dotted: undefined,
      notes: [
        { stringIndex: 1, fret: 3, pitch: getPitch("C3") },
        { stringIndex: 2, muted: true },
        { stringIndex: 3, fret: 5, pitch: getPitch("C4") },
        { stringIndex: 4, fret: 4, pitch: getPitch("D#4") },
        { stringIndex: 5, fret: 3, pitch: getPitch("G4") },
      ],
    });
  });

  it("parses incomplete events", () => {
    expect(parseEvent("- - 2")).toEqual({
      id: expect.any(String),
      duration: DurationValue.QUARTER,
      dotted: undefined,
      notes: [{ stringIndex: 2, fret: 2, pitch: getPitch("E3") }],
    });
  });

  it("parses event durations", () => {
    expect(parseEvent("- 2 / 8")).toEqual({
      id: expect.any(String),
      duration: DurationValue.EIGHTH,
      dotted: undefined,
      notes: [{ stringIndex: 1, fret: 2, pitch: getPitch("B2") }],
    });
  });
});
