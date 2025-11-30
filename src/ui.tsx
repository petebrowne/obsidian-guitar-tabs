import { chunk, range } from "es-toolkit/compat";
import { ChordDiagram } from "./chord-diagram";
import { collectChords } from "./music/chord";
import type { Measure, Track } from "./music/types";
import { isStandardTuning } from "./music/utils";
import { ordinalize } from "./utils";

interface TabTrackViewViewProps {
  track: Track;
}

export function TabTrackView({ track }: TabTrackViewViewProps) {
  return (
    <div className="gt-tab-track">
      <TabInfoView track={track} />
      {/* <TabViewer track={track} /> */}
      {chunk(track.measures, 2).map((measures, index) => (
        <TabStaffView
          key={`${measures[0]?.id}-${measures[1]?.id}`}
          measures={measures}
          stringCount={track.tuning.length}
        />
      ))}
    </div>
  );
}

interface ChordTrackViewProps {
  track: Track;
}

export function ChordTrackView({ track }: ChordTrackViewProps) {
  const chords = collectChords(track);
  return (
    <div className="gt-chord-track">
      <TabInfoView track={track} />
      <div className="gt-diagrams">
        {chords.map((chord) => (
          <ChordDiagram key={chord.id} chord={chord} tuning={track.tuning} />
        ))}
      </div>
    </div>
  );
}

interface TabInfoViewProps {
  track: Track;
}

function TabInfoView({ track }: TabInfoViewProps) {
  const standardTuning = isStandardTuning(track.tuning);
  if (standardTuning && !track.capo) return null;

  return (
    <dl className="gt-info">
      {!standardTuning && (
        <div>
          <dt>Tuning:</dt>
          <dd>{track.tuning.map((note) => note.name).join(" ")}</dd>
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
  measures: Measure[];
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
      {measures.map((measure) => (
        <TabMeasureView
          key={measure.id}
          measure={measure}
          stringCount={stringCount}
        />
      ))}
    </div>
  );
}

interface TabMeasureViewProps {
  measure: Measure;
  stringCount: number;
}

function TabMeasureView({ measure, stringCount }: TabMeasureViewProps) {
  return (
    <div className="gt-measure">
      {measure.beats.map((beat) => (
        <div
          key={beat.id}
          className="gt-beat"
          data-duration={beat.duration}
          data-dotted={beat.dotted ? "true" : undefined}
        >
          {range(0, stringCount).map((stringIndex) => {
            const note = beat.notes.find(
              (note) => note.stringIndex === stringIndex,
            );
            return (
              <div key={stringIndex} className="gt-string">
                {note ? (note.muted ? "×" : note.fret) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
