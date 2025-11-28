import { createRoot } from "react-dom/client";
import { parseTabTrack } from "../src/parsing";
import { ChordTrackView, TabTrackView } from "../src/ui";

import "./obsidian-theme.css";
import "../styles.css";
import "./preview.css";

function App() {
  return (
    <div className="preview-container">
      <ChordTrackView
        track={parseTabTrack(
          `
- 0 2 2 2 0
- 0 2 1 2 0
- 0 2 0 2 0
- 4 6 4 6 4
- - 0 2 3 2
- - 0 1 3 2
0 2 2 1 0 0
0 2 2 1 3 0
`.trim(),
        )}
      />
      <ChordTrackView
        track={parseTabTrack(
          `tuning: uke
3 5 6 5
5 4 3 3
2 0 1 0
`.trim(),
        )}
      />
      <TabTrackView
        track={parseTabTrack(
          `
- - 7
- - - 5
- - - - 5
- - - - - 7
- - 6 - - 7
- - - - 5
- - - 5
- - - - - 7
- - 5 - - 8
- - - - 5
- - - 5
- - - - - 8
- - 4 - - 2
- - - - 3
- - - 2
- - - - - 2
`.trim(),
        )}
      />
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
