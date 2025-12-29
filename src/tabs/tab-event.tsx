import type { LaidOutEvent } from "./layout";
import { TabNote } from "./tab-note";

interface TabEventProps {
  event: LaidOutEvent;
}

export function TabEvent({ event }: TabEventProps) {
  return (
    <g className="gt-tab-event" transform={`translate(${event.x}, 0)`}>
      {event.notes.map((note) => (
        <TabNote key={note.note.stringIndex} note={note} />
      ))}
    </g>
  );
}
