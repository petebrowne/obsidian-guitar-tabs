import { createRoot } from "react-dom/client";
import { parseTabTrack } from "../src/parsing";
import { TabTrackView } from "../src/ui";

import "./obsidian-theme.css";
import "../styles.css";
import "./preview.css";

function App() {
  return (
    <div className="preview-container">
      <TabTrackView
        track={parseTabTrack(
          `
- 0 2 2 2 0
- 0 2 1 2 0
- 0 2 0 2 0
- 4 6 4 6 0
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
