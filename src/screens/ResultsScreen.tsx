import { codeKey, suggestionKey } from "../../shared/keys.js";
import { useReview } from "../hooks/useReview.js";
import { sectionName } from "../lib/labels.js";
import { reactionSummary } from "../lib/tally.js";
import "./screens.css";

/** Every code and suggested code with its thumbs up, thumbs down and comments, by question and group. */
export function ResultsScreen() {
  const { catalog, activity, ix, me } = useReview();
  const raters = new Set(activity.reactions.filter((r) => r.value && (r.target.startsWith("code:") || r.target.startsWith("suggestion:"))).map((r) => r.personId)).size;

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
    </main>
  );
}
