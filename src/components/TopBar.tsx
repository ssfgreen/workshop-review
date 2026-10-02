import { useLocation } from "preact-iso";
import { ROOMS, type Room } from "../../shared/catalog.js";
import { useFilters, useLinkWithFilters } from "../hooks/useFilters.js";
import { useReview } from "../hooks/useReview.js";
import { inRoom } from "../lib/filters.js";
import { myVote } from "../lib/tally.js";
import "./TopBar.css";

/** Question tabs with my progress, plus the room and only-unvoted filters (all in the URL). */
export function TopBar() {
  const { catalog, codes, ix, me } = useReview();
  const { path } = useLocation();
  const [f, setF] = useFilters();
  const link = useLinkWithFilters();
  const shown = codes.filter((c) => inRoom(c, f.room));
  const voted = shown.filter((c) => myVote(ix, c.id, me)?.value).length;

  const tab = (href: string, label: string, count?: string) => (
    <a class="pill tab" href={link(href)} aria-current={path === href ? "page" : undefined}>
      {label}{count && <span class="n">{count}</span>}
    </a>
  );

  return (
    <nav class="bar" aria-label="Questions">
      <div class="wrap">
        <div class="tabs">
          {catalog.sections.map((s) => {
            const inSec = shown.filter((c) => c.sectionKey === s.key);
            return tab(`/q/${s.key}`, s.label, `${inSec.filter((c) => myVote(ix, c.id, me)?.value).length}/${inSec.length}`);
          })}
          {tab("/stories", "User stories")}
          {tab("/results", "Results")}
        </div>
        <div class="progress">
          <span>You've voted on {voted} of {shown.length} {f.room === "all" ? "codes" : `codes with ${f.room} evidence`}</span>
          <label for="room-filter">Room{" "}
            <select id="room-filter" value={f.room} onChange={(e) => setF({ room: e.currentTarget.value as Room | "all" })}>
              <option value="all">All rooms</option>
              {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label><input type="checkbox" checked={f.unvoted} onChange={(e) => setF({ unvoted: e.currentTarget.checked })} /> Only codes I haven't voted on</label>
        </div>
      </div>
    </nav>
  );
}
