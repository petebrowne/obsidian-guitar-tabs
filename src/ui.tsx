/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is fine */

import { chunk, range } from "es-toolkit/compat";
import { ChordDiagram } from "./chord-diagram";
import { Muted, type TabMeasure, type TabTrack } from "./types";
import { isStandardTuning, ordinalize } from "./utils";

interface TabTrackViewViewProps {
  track: TabTrack;
}

export function TabTrackView({ track }: TabTrackViewViewProps) {
  console.log(track);
  return (
    <div className="gt-tab-track">
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

interface ChordTrackViewProps {
  track: TabTrack;
}

export function ChordTrackView({ track }: ChordTrackViewProps) {
  const beats = track.measures.flatMap((measure) =>
    measure.beats.map((beat) => beat).filter((beat) => beat.chord != null),
  );
  return (
    <div className="gt-chord-track">
      <TabInfoView track={track} />
      <div className="gt-diagrams">
        {beats.map((beat, i) =>
          beat.chord ? (
            <ChordDiagram
              key={`${beat.chord.symbol}-${i}`}
              chord={beat.chord}
              strings={beat.notes}
              tuning={track.tuning}
            />
          ) : null,
        )}
      </div>
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
    <dl className="gt-info">
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
    <div className="gt-staff">
      <div className="gt-staff-bar" aria-hidden="true" role="presentation">
        {range(1, stringCount - 1).map((line) => (
          <div
            key={line}
            className="gt-staff-line"
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
    <div className="gt-measure">
      {measure.beats.map((beat, index) => (
        <div
          key={index}
          className="gt-beat"
          data-duration={beat.duration}
          data-dotted={beat.dotted ? "true" : undefined}
        >
          {range(0, stringCount).map((string) => {
            const note = beat.notes[string + 1];
            return (
              <div key={string} className="gt-string">
                {note ? (note === Muted ? "×" : note.fret) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
