export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
}

/**
 * Iterates over an array and yields the current item and its index.
 */
export function* enumerate<T>(array: T[]) {
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    if (item) {
      yield [item, index] as const;
    }
  }
}

/**
 * Used in for loops to get the current and next item in each iteration.
 */
export function* withWindow<T>(array: T[]) {
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    if (item) {
      yield [array[index - 1], item, array[index + 1], index] as const;
    }
  }
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
