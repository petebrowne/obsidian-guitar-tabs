export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
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

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}
