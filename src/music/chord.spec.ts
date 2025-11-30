import { describe, expect, it } from "vitest";
import { parseBeat } from "../parsing";
import { getChord } from "./chord";

describe("getChord", () => {
  it.each([
    ["0 2 2 1 0 0", "E"],
    ["- 0 2 2 2 0", "A"],
    ["- 0 2 2 1 0", "Am"],
    ["- 5 5 7 7 5", "Dadd11"],
    ["3 3 2 0 1 0", "C"],
    ["2 x 0 2 3 2", "D"],
    ["- 0 2 2 0 0", "Asus2"],
  ])("returns the correct chord for %s", (notes, name) => {
    expect(getChord(parseBeat(notes).notes)?.name).toEqual(name);
  });
});
