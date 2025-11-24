/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is fine */

import { chunk, range } from "es-toolkit/compat";
import { Muted, type TabMeasure, type TabTrack } from "./types";
import { isStandardTuning, ordinalize } from "./utils";

interface TabTrackViewViewProps {
  track: TabTrack;
}

export function TabTrackView({ track }: TabTrackViewViewProps) {
  return (
    <div className="guitar-tabs-track">
      <TabInfoView track={track} />
      {chunk(track.measures, 2).map((measures, index) => (
        <TabStaffView
          key={index}
          measures={measures}
          stringCount={track.tuning.length}
        />
      ))}
    </div>
  );
}

interface TabInfoViewProps {
  track: TabTrack;
}

function TabInfoView({ track }: TabInfoViewProps) {
  const standardTuning = isStandardTuning(track.tuning);
  if (standardTuning && !track.capo) return null;

  return (
    <dl className="guitar-tabs-info">
      {!standardTuning && (
        <div>
          <dt>Tuning:</dt>
          <dd>{track.tuning.map((note) => note.pc).join(" ")}</dd>
        </div>
      )}
      {!!track.capo && (
        <div>
          <dt>Capo:</dt>
          <dd>{ordinalize(track.capo)}</dd>
        </div>
      )}
    </dl>
  );
}

interface StaffViewProps {
  measures: TabMeasure[];
  stringCount: number;
}

function TabStaffView({ measures, stringCount = 6 }: StaffViewProps) {
  const lineSpacing = 100 / (stringCount - 1);
  return (
    <div className="guitar-tabs-staff">
      <div
        className="guitar-tabs-staff-bar"
        aria-hidden="true"
        role="presentation"
      >
        {range(1, stringCount - 1).map((line) => (
          <div
            key={line}
            className="guitar-tabs-staff-line"
            style={{ top: `${lineSpacing * line}%` }}
          />
        ))}
      </div>
      {measures.map((measure, index) => (
        <TabMeasureView
          key={index}
          measure={measure}
          stringCount={stringCount}
        />
      ))}
    </div>
  );
}

interface TabMeasureViewProps {
  measure: TabMeasure;
  stringCount: number;
}

function TabMeasureView({ measure, stringCount }: TabMeasureViewProps) {
  return (
    <div className="guitar-tabs-measure">
      {measure.beats.map((beat, index) => (
        <div key={index} className="guitar-tabs-beat">
          {beat.chord ? (
            <div className="guitar-tabs-chord">{beat.chord.symbol}</div>
          ) : null}
          {range(0, stringCount).map((string) => {
            const note = beat.notes[string + 1];
            return (
              <div key={string} className="guitar-tabs-string">
                {note ? (note === Muted ? "×" : note.fret) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
