import { sum } from "es-toolkit/compat";
import type { LaidOutStaff } from "./layout";
import { TabMeasure } from "./tab-measure";

interface TabStaffProps {
  staff: LaidOutStaff;
}

export function TabStaff({ staff }: TabStaffProps) {
  const totalWidth = sum(staff.measures.map((measure) => measure.width));
  const totalHeight = staff.height + 23;
  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      width={totalWidth}
      height={totalHeight}
      className="gt-tab-staff"
      overflow="visible"
    >
      <title>Staff {staff.id}</title>
      <g className="gt-tab-staff-lines">
        {staff.lines.map((line) => (
          <rect
            className="gt-tab-staff-line"
            key={line.y}
            x={0}
            y={line.y}
            width={totalWidth}
            height={1}
            style={{
              fill: "var(--gt-tab-staff-line-fill, black)",
            }}
          />
        ))}
      </g>
      {staff.measures.map((measure) => (
        <TabMeasure
          key={measure.id}
          measure={measure}
          staffHeight={staff.height}
        />
      ))}
    </svg>
  );
}
