import { useContentRect } from "../hooks/useContentRect";
import type { Track } from "../music/types";
import { layoutTrack } from "./layout";
import { TabStaff } from "./tab-staff";

interface TabTrackProps {
  track: Track;
}

export function TabTrack({ track }: TabTrackProps) {
  const [ref, contentRect] = useContentRect();
  const laidOutTrack = layoutTrack(track, {
    layoutWidth: contentRect.width,
  });
  return (
    <div ref={ref} className="gt-tab-track">
      {laidOutTrack.staffs.map((staff) => (
        <TabStaff key={staff.id} staff={staff} />
      ))}
    </div>
  );
}
