import { ChordDiagram } from "./chord-diagram";
import { collectChords } from "./music/chord";
import type { Track } from "./music/types";
import { isStandardTuning } from "./music/utils";
import { TabTrack } from "./tabs/tab-track";
import { ordinalize } from "./utils";

interface TabTrackViewViewProps {
  track: Track;
}

export function TabTrackView({ track }: TabTrackViewViewProps) {
  const chords = collectChords(track);
  return (
    <div className="gt-tab-track-view">
      <TabInfoView track={track} />
      {chords.length > 0 && (
        <div className="gt-diagrams">
          {chords.map((chord) => (
            <ChordDiagram key={chord.id} chord={chord} tuning={track.tuning} />
          ))}
        </div>
      )}
      <TabTrack track={track} />
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
