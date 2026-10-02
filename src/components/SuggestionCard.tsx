import type { Suggestion } from "../../shared/activity.js";
import { suggestionTarget } from "../../shared/keys.js";
import { useRemoveSuggestion } from "../api/queries.js";
import { useReview } from "../hooks/useReview.js";
import { VoteRow } from "./VoteRow.js";
import "./Suggestions.css";

export function SuggestionCard({ s }: { s: Suggestion }) {
  const { me, ix } = useReview();
  const remove = useRemoveSuggestion();
  return (
    <article class="card suggested">
      <div class="title-block">
        <span class="badge">Suggested by a colleague</span>
        <h4 class="code-title">{s.title}</h4>
      </div>
      {s.description && <p class="gist">{s.description}</p>}
      <div class="meta">
        {s.group && <span class="chip plain">Group: {s.group}</span>}
        <span class="chip plain">Suggested by {s.authorId === me ? "you" : ix.names.get(s.authorId) || "a colleague"}</span>
      </div>
      {s.evidence && <div class="suggest-evidence"><span class="eyebrow">Where it came from</span><p>{s.evidence}</p></div>}
      <VoteRow target={suggestionTarget(s.id)} />
      {s.authorId === me && (
        <button class="link-button danger" type="button" disabled={remove.isPending} onClick={() => remove.mutate(s.id)}>
          Remove my suggestion
        </button>
      )}
      {remove.error && <p class="muted-note status-warn">{remove.error.message}</p>}
    </article>
  );
}
