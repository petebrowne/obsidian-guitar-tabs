import { range } from "es-toolkit/compat";
import type { Chord, Tuning } from "./music/types";
import { getBarre, getFrettedNoteRange } from "./music/utils";

interface ChordDiagramProps {
  chord: Chord;
  tuning: Tuning;
}

const CANVAS_WIDTH = 120;
const CANVAS_HEIGHT = 100;
const BOARD_HEIGHT = 70;
const START_BOARD_Y = 18;
const STRING_SPACING = 14;
const FRETS = 5;
const FRET_SPACING = BOARD_HEIGHT / FRETS;

export function ChordDiagram({ chord, tuning }: ChordDiagramProps) {
  const stringCount = tuning.length;
  const stringDivisions = stringCount - 1;
  const boardWidth = stringDivisions * STRING_SPACING;
  const startBoardX = (CANVAS_WIDTH - boardWidth) / 2;
  const [lowestFret, highestFret] = getFrettedNoteRange(chord.notes);
  const position =
    lowestFret != null && highestFret != null && highestFret > FRETS
      ? lowestFret
      : undefined;
  const barre = getBarre(chord.notes);
  return (
    <figure className="gt-chord-diagram">
      <figcaption>{chord.name}</figcaption>
      <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} width="100%">
        <title>{chord.name}</title>
        {position != null && (
          <text
            fontSize="10px"
            x={startBoardX + boardWidth + 6}
            y={START_BOARD_Y + FRET_SPACING * 0.5}
            alignmentBaseline="middle"
            fill="var(--text-normal)"
          >
            {position}fr
          </text>
        )}
        <Board
          x={startBoardX}
          y={START_BOARD_Y}
          width={boardWidth}
          height={BOARD_HEIGHT}
          strings={stringCount}
          frets={FRETS}
          nut={position == null}
        />
        {chord.notes.map((note) => {
          if (note.muted) {
            return (
              <MutedNote
                key={note.stringIndex}
                cx={startBoardX + note.stringIndex * STRING_SPACING}
                cy={START_BOARD_Y + -0.65 * FRET_SPACING}
              />
            );
          }
          if (note.fret === 0) {
            return (
              <FretNote
                key={note.stringIndex}
                cx={startBoardX + note.stringIndex * STRING_SPACING}
                cy={START_BOARD_Y + -0.65 * FRET_SPACING}
                open
              />
            );
          }
          const fretNumber = adjustFretNumber(note.fret, position);
          if (fretNumber > FRETS) return null;

          return (
            <FretNote
              key={note.stringIndex}
              cx={startBoardX + note.stringIndex * STRING_SPACING}
              cy={START_BOARD_Y + (fretNumber - 0.5) * FRET_SPACING}
            />
          );
        })}
        {barre != null && (
          <BarreIndicator
            x1={startBoardX + barre.start * STRING_SPACING}
            x2={startBoardX + barre.end * STRING_SPACING}
            y={
              START_BOARD_Y +
              (adjustFretNumber(barre.fret, position) - 0.5) * FRET_SPACING
            }
          />
        )}
      </svg>
    </figure>
  );
}

interface BoardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  strings: number;
  frets: number;
  nut?: boolean;
}

function Board({ x, y, width, height, strings, frets, nut }: BoardProps) {
  const stringDivisions = strings - 1;
  return (
    <g>
      {range(1, FRETS).map((fret) => (
        <line
          key={fret}
          x1={x}
          y1={y + (fret * height) / frets}
          x2={x + width}
          y2={y + (fret * height) / frets}
          stroke="var(--text-faint)"
          strokeWidth="1"
        />
      ))}
      {range(1, stringDivisions).map((string) => (
        <line
          key={string}
          x1={x + (string * width) / stringDivisions}
          y1={y}
          x2={x + (string * width) / stringDivisions}
          y2={y + height}
          stroke="var(--text-normal)"
          strokeWidth="1"
        />
      ))}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        stroke="var(--text-normal)"
        strokeWidth="1"
      />
      {nut && (
        <line
          key="nut-marker"
          x1={x - 0.5}
          y1={y - 1}
          x2={x + width + 0.5}
          y2={y - 1}
          strokeWidth="2"
          stroke="var(--text-normal)"
        />
      )}
    </g>
  );
}

interface FretNoteProps {
  cx: number;
  cy: number;
  open?: boolean;
}

function FretNote({ cx, cy, open }: FretNoteProps) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r="3.5"
      fill={open ? "transparent" : "var(--text-normal)"}
      stroke="var(--text-normal)"
      strokeWidth="1"
    />
  );
}

interface MutedNoteProps {
  cx: number;
  cy: number;
}

function MutedNote({ cx, cy }: MutedNoteProps) {
  return (
    <g stroke="var(--text-normal)" strokeWidth="1">
      <line x1={cx - 3} y1={cy - 3} x2={cx + 3} y2={cy + 3} />
      <line x1={cx + 3} y1={cy - 3} x2={cx - 3} y2={cy + 3} />
    </g>
  );
}

interface BarreIndicatorProps {
  x1: number;
  x2: number;
  y: number;
}

function BarreIndicator({ x1, x2, y }: BarreIndicatorProps) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      strokeWidth="8"
      stroke="var(--text-normal)"
      strokeLinecap="round"
    />
  );
}

function adjustFretNumber(fret: number, position: number | undefined) {
  if (position == null) return fret;
  return fret - position + 1;
}
