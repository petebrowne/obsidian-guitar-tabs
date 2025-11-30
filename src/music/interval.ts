const intervals = [
  "1",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "#5",
  "6",
  "b7",
  "7",
  "8",
  "b9",
  "9",
  "#9",
  "10",
  "11",
  "#11",
  "12",
  "b13",
  "13",
  "#13",
  "14",
];

const uncommonIntervals: Record<string, number> = {
  bb7: 9,
};

export function getInterval(semitones: number): string {
  const interval = intervals[semitones % intervals.length];
  if (interval == null) {
    throw new Error(`Invalid semitones: ${semitones}`);
  }
  return interval;
}

export function getSemitones(interval: string): number {
  let index: number | undefined = intervals.indexOf(interval);
  if (index === -1) {
    index = uncommonIntervals[interval];
  }
  if (index == null) {
    throw new Error(`Invalid interval: "${interval}"`);
  }
  return index;
}
