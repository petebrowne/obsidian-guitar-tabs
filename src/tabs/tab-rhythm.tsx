import { Fragment } from "react/jsx-runtime";
import { type LaidOutMeasure, RhythmBeamType } from "./layout";

interface TabRhythmProps {
  measure: LaidOutMeasure;
  staffHeight: number;
}

const STEM_MARGIN = 7;
const STEM_HEIGHT = 20;
const BEAM_HEIGHT = 3;
const BEAM_SPACING = 2;
const DOT_RADIUS = 2;
const DOT_X_OFFSET = 7;

export function TabRhythm({ measure, staffHeight }: TabRhythmProps) {
  const stemY1 = staffHeight + STEM_MARGIN;
  const stemY2 = stemY1 + STEM_HEIGHT;
  return (
    <g className="gt-tab-rhythm">
      {measure.events.map((event) => (
        <Fragment key={event.id}>
          <rect
            className="gt-tab-rhythm-stem"
            x={event.x}
            y={stemY1}
            width={1}
            height={STEM_HEIGHT}
            style={{
              fill: "var(--gt-tab-fill, black)",
            }}
          />
          {event.duration.dotted && (
            <circle
              className="gt-tab-rhythm-dot"
              cx={event.x + DOT_X_OFFSET}
              cy={stemY2 - getBeamYOffset(event.beams.length + 1) + 1}
              r={DOT_RADIUS}
              style={{
                fill: "var(--gt-tab-fill, black)",
              }}
            />
          )}
          {event.beams.map((beam, index) => (
            <rect
              key={index}
              className="gt-tab-rhythm-beam"
              x={
                beam.type === RhythmBeamType.PARTIAL_LEFT
                  ? event.x - event.width / 2
                  : event.x
              }
              y={stemY2 - getBeamYOffset(beam.level)}
              width={
                beam.type === RhythmBeamType.CONNECTED
                  ? event.width
                  : event.width / 2
              }
              height={BEAM_HEIGHT}
              style={{
                fill: "var(--gt-tab-fill, black)",
              }}
            />
          ))}
        </Fragment>
      ))}
    </g>
  );
}

function getBeamYOffset(level: number): number {
  return BEAM_HEIGHT * level + BEAM_SPACING * (level - 1);
}
