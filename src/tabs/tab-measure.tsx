import type { LaidOutMeasure } from "./layout";
import { TabEvent } from "./tab-event";
import { TabRhythm } from "./tab-rhythm";

interface TabMeasureProps {
  measure: LaidOutMeasure;
  staffHeight: number;
}

export function TabMeasure({ measure, staffHeight }: TabMeasureProps) {
  return (
    <g className="gt-tab-measure">
      <rect
        className="gt-tab-measure-start"
        x={measure.x}
        y={0}
        width={1}
        height={staffHeight}
        fill="var(--gt-tab-fill, black)"
      />
      <TabRhythm measure={measure} staffHeight={staffHeight} />
      {measure.events.map((event) => (
        <TabEvent key={event.id} event={event} />
      ))}
    </g>
  );
}
