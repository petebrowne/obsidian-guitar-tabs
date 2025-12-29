import type { LaidOutNote } from "./layout";

const NOTE_HEIGHT = 14;

interface TabNoteProps {
  note: LaidOutNote;
}

export function TabNote({ note }: TabNoteProps) {
  const content = note.note.muted ? "×" : note.note.fret;
  const noteWidth = 10 * String(content).length;
  return (
    <g
      className="gt-tab-note"
      transform={`translate(${-noteWidth / 2}, ${note.y - NOTE_HEIGHT / 2})`}
    >
      <rect
        x={0}
        y={0}
        width={noteWidth}
        height={NOTE_HEIGHT}
        style={{
          fill: "var(--gt-tab-background, white)",
        }}
      />
      <text
        x={noteWidth / 2}
        y={NOTE_HEIGHT / 2 + 1}
        style={{
          textAnchor: "middle",
          dominantBaseline: "middle",
          fontSize: "var(--gt-tab-font-size, 12px)",
          fontFamily: "var(--gt-tab-font-family, sans-serif)",
          fontWeight: "var(--gt-tab-font-weight, bold)",
          fill: "var(--gt-tab-fill, black)",
        }}
      >
        {content}
      </text>
    </g>
  );
}
