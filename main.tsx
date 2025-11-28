import { Plugin } from "obsidian";
import { createRoot } from "react-dom/client";
import { parseTabTrack } from "./src/parsing";
import { ChordTrackView, TabTrackView } from "./src/ui";

export default class TabsPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("gt-chords", (source, el) => {
      const track = parseTabTrack(source);
      const root = createRoot(el);
      root.render(<ChordTrackView track={track} />);
    });
    this.registerMarkdownCodeBlockProcessor("gt-tab", (source, el) => {
      const track = parseTabTrack(source);
      const root = createRoot(el);
      root.render(<TabTrackView track={track} />);
    });
  }
}
