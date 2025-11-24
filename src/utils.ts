import { STANDARD_TUNING } from "./constants";
import type { Tuning } from "./types";

export function isStandardTuning(tuning: Tuning): boolean {
  return (
    tuning.map((note) => note.name).join(" ") ===
    STANDARD_TUNING.map((note) => note.name).join(" ")
  );
}

export function ordinalize(number: number): string {
  const pr = new Intl.PluralRules("en", { type: "ordinal" });
  const ordinalMap = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th",
  };
  const suffix = pr.select(number);
  return `${number}${ordinalMap[suffix as keyof typeof ordinalMap]}`;
}
