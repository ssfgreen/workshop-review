import { useState } from "preact/hooks";
import { codeKey } from "../../shared/keys.js";
import type { Room } from "../../shared/catalog.js";
import { useReview } from "../hooks/useReview.js";
import type { PlacedCode } from "../lib/catalog.js";
import { shortSection } from "../lib/labels.js";
import { myVote } from "../lib/tally.js";
import { EvidenceItem } from "./Evidence.js";
import { ReactBar } from "./ReactBar.js";
import { StoryLine } from "./StoryLine.js";
import { VoteRow } from "./VoteRow.js";
import "./CodeCard.css";

/** A code with its evidence, user stories, vote and reactions. With a room chosen, that room's evidence leads. */
export function CodeCard({ code: c, room = "all" }: { code: PlacedCode; room?: Room | "all" }) {
  const { ix, me } = useReview();
  const [showRest, setShowRest] = useState(false);
  const filtered = room !== "all";
  const first = filtered ? c.evidence.filter((e) => e.room === room) : c.evidence.slice(0, 2);
  const rest = filtered ? c.evidence.filter((e) => e.room !== room) : c.evidence.slice(2);
  const roomPeople = [...new Set(first.map((e) => e.who))].sort();
  const also = c.sections.filter((s) => s !== c.sectionKey).map(shortSection);
  const voted = myVote(ix, c.id, me)?.value;

  return (
    <article class={`card${voted ? ` voted-${voted}` : ""}`} id={`code-${c.id}`}>
      <div class="card-top">
        <div class="title-block">
          <h4 class="code-title">{c.title}</h4>
          <span class="mono">{c.id}</span>
        </div>
        <ReactBar target={codeKey(c.id)} what="code" />
      </div>
      <p class="gist">{c.gist}</p>
      <div class="meta">
        {filtered && <span class="chip room">{room}: {first.length} of {c.evidence.length} pieces, from {roomPeople.join(", ")}</span>}
        <span class="chip">{c.participants.length} participant{c.participants.length === 1 ? "" : "s"}: {c.participants.join(", ")}</span>
        <span class="chip plain">{c.rooms.join(", ")}</span>
        {also.length > 0 && <span class="chip plain">Also came up in {also.join(", ")}</span>}
      </div>
      <details class="def"><summary>Full definition</summary><p>{c.definition}</p></details>
      <div class="evidence">
        {first.map((e) => <EvidenceItem key={e.ref} e={e} codeId={c.id} />)}
        {showRest && rest.map((e) => <EvidenceItem key={e.ref} e={e} codeId={c.id} />)}
        {rest.length > 0 && !showRest && (
          <button class="link-button more" type="button" onClick={() => setShowRest(true)}>
            {filtered ? `Show ${rest.length} from other rooms` : `Show ${rest.length} more piece${rest.length > 1 ? "s" : ""} of evidence`}
          </button>
        )}
      </div>
      {c.stories.length > 0 && (
        <details class="def">
          <summary>User stories for the tool ({c.stories.length})</summary>
          <ul class="story-list">{c.stories.map((s, i) => <StoryLine key={i} story={s} code={c} index={i} />)}</ul>
        </details>
      )}
      <VoteRow target={c.id} />
    </article>
  );
}
