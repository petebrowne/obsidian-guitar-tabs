import { describe, expect, it } from "vitest";
import { getPitch } from "./pitch";

describe("getPitch", () => {
  it.each([
    [48, "C"],
    [60, "C"],
    [61, "C#"],
    [62, "D"],
    [63, "D#"],
    [64, "E"],
    [65, "F"],
    [66, "F#"],
    [67, "G"],
    [68, "G#"],
  ])("should return the correct pitch for %s", (midi, name) => {
    expect(getPitch(midi).name).toBe(name);
  });

  it.each([
    ["C", 60],
    ["C2", 36],
    ["C4", 60],
    ["C#4", 61],
    ["D4", 62],
    ["D#4", 63],
    ["E4", 64],
    ["F4", 65],
    ["F#4", 66],
    ["G4", 67],
    ["G#4", 68],
    ["Bb3", 58],
    ["Db5", 73],
  ])("should return the correct midi for %s", (name, midi) => {
    expect(getPitch(name).midi).toBe(midi);
  });
});
