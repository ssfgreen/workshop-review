import { VOTE_VALUES } from "../../shared/activity.js";
import { suggestionTarget } from "../../shared/keys.js";
import { useReview } from "../hooks/useReview.js";
import { sectionName } from "../lib/labels.js";
import { voteTally } from "../lib/tally.js";
import "./screens.css";

/** Every code and suggestion with its Keep / Unsure / Drop counts, by question and group. */
export function ResultsScreen() {
  const { catalog, activity, ix } = useReview();
  const voters = new Set(activity.votes.filter((v) => v.value).map((v) => v.personId)).size;

  const row = (label: string, target: string, sub: string) => {
    const t = voteTally(ix, target), n = t.keep + t.unsure + t.drop;
    const notes = (ix.votesByTarget.get(target) ?? []).filter((v) => v.note).length;
    return (
      <tr key={target}>
        <td><div>{label}</div><div class="mono">{sub}</div></td>
        <td class="num k">{t.keep}</td><td class="num u">{t.unsure}</td><td class="num d">{t.drop}</td>
        <td><div class="bar-mini" title={`${t.keep} keep, ${t.unsure} unsure, ${t.drop} drop`}>
          {VOTE_VALUES.map((v) => <span key={v} class={v[0]} style={{ width: `${n ? (t[v] / n) * 100 : 0}%` }} />)}
        </div></td>
        <td class="num">{notes}</td>
      </tr>
    );
  };

  return (
    <main class="wrap">
      <section class="section-head">
        <h2>Results</h2>
        <p class="prompt">{voters} {voters === 1 ? "person has" : "people have"} voted so far. Codes are listed by question and group, with a bar showing Keep, Unsure and Drop.</p>
      </section>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Keep</th><th>Unsure</th><th>Drop</th><th>Split</th><th>Notes</th></tr></thead>
          <tbody>
            {catalog.sections.flatMap((sec) => [
              <tr class="sec" key={sec.key}><td colSpan={6}>{sectionName(sec.key, catalog.sections)}</td></tr>,
              ...sec.groups.flatMap((g) => g.codes.map((c) => row(c.title, c.id, g.title))),
              ...activity.suggestions.filter((s) => s.section === sec.key).map((s) => row(s.title, suggestionTarget(s.id), `Suggested · ${s.group}`)),
            ])}
          </tbody>
        </table>
      </div>
    </main>
  );
}
