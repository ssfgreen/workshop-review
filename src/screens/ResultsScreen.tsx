import { RANK_DIMENSIONS, RANK_OPTIONS } from "../../shared/activity.js";
import { codeKey, storyKey, suggestionKey } from "../../shared/keys.js";
import { useReview } from "../hooks/useReview.js";
import { RANK_LABEL, sectionName } from "../lib/labels.js";
import { rankingSummary, reactionSummary } from "../lib/tally.js";
import "./screens.css";

/** Every code and suggested code with its thumbs up, thumbs down and comments, by question and group; then every ranked user story. */
export function ResultsScreen() {
  const { catalog, activity, ix, me, codes } = useReview();
  const raters = new Set(activity.reactions.filter((r) => r.value && (r.target.startsWith("code:") || r.target.startsWith("suggestion:"))).map((r) => r.personId)).size;
  const storyRaters = new Set(activity.rankings.map((r) => r.personId)).size;
  const rankedStories = codes.flatMap((c) => c.stories.map((s, i) => ({ c, s, i, r: rankingSummary(ix, storyKey(c.id, i), me) })))
    .filter((x) => x.r.raters > 0)
    .sort((a, b) => b.r.counts.priority.high - a.r.counts.priority.high || b.r.raters - a.r.raters);
  // "2 · 1 · 0" in option order, so a column reads the same way down.
  const tally = (counts: Record<string, number>, dim: (typeof RANK_DIMENSIONS)[number]) =>
    RANK_OPTIONS[dim].map((v) => counts[v]).join(" · ");

  const row = (label: string, target: string, sub: string) => {
    const r = reactionSummary(ix, target, me), n = r.up + r.down;
    return (
      <tr key={target}>
        <td><div>{label}</div><div class="mono">{sub}</div></td>
        <td class="num k">{r.up}</td>
        <td class="num d">{r.down}</td>
        <td><div class="bar-mini" title={`${r.up} up, ${r.down} down`}>
          <span class="k" style={{ width: `${n ? (r.up / n) * 100 : 0}%` }} />
          <span class="d" style={{ width: `${n ? (r.down / n) * 100 : 0}%` }} />
        </div></td>
        <td class="num">{r.comments}</td>
      </tr>
    );
  };

  return (
    <main class="wrap">
      <section class="section-head">
        <h2>Results</h2>
        <p class="prompt">{raters} {raters === 1 ? "person has" : "people have"} rated codes so far. Each code and suggested code shows its thumbs up and down, the split between them, and how many comments it has.</p>
      </section>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Up</th><th>Down</th><th>Split</th><th>Comments</th></tr></thead>
          <tbody>
            {catalog.sections.flatMap((sec) => [
              <tr class="sec" key={sec.key}><td colSpan={5}>{sectionName(sec.key, catalog.sections)}</td></tr>,
              ...sec.groups.flatMap((g) => g.codes.map((c) => row(c.title, codeKey(c.id), g.title))),
              ...activity.suggestions.filter((s) => s.section === sec.key).map((s) => row(s.title, suggestionKey(s.id), `Suggested · ${s.group}`)),
            ])}
          </tbody>
        </table>
      </div>
      <section class="section-head">
        <h2>User story rankings</h2>
        <p class="prompt">{storyRaters} {storyRaters === 1 ? "person has" : "people have"} ranked stories so far. Each column counts choices in the order {RANK_DIMENSIONS.map((d) => `${RANK_LABEL[d].title}: ${RANK_OPTIONS[d].map((v) => RANK_LABEL[d].values[v]).join(" · ")}`).join("; ")}. Stories with the most High priorities come first.</p>
      </section>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Story</th>{RANK_DIMENSIONS.map((d) => <th key={d}>{RANK_LABEL[d].title}</th>)}<th>Raters</th></tr></thead>
          <tbody>
            {rankedStories.length === 0 && <tr><td colSpan={5} class="muted-note">No story has been ranked yet.</td></tr>}
            {rankedStories.map(({ c, s, i, r }) => (
              <tr key={`${c.id}:${i}`}>
                <td><div>As a {s.as}, I want {s.want}.</div><div class="mono">{c.title}</div></td>
                {RANK_DIMENSIONS.map((d) => <td key={d} class="num">{tally(r.counts[d], d)}</td>)}
                <td class="num">{r.raters}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
