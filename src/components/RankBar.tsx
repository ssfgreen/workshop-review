import { RANK_DIMENSIONS, RANK_OPTIONS, type RankDimension } from "../../shared/activity.js";
import { useRank } from "../api/queries.js";
import { useReview } from "../hooks/useReview.js";
import { RANK_LABEL } from "../lib/labels.js";
import { rankingSummary } from "../lib/tally.js";
import "./RankBar.css";

/**
 * Rank a user story on three scales: priority, what it mainly needs, and size. One choice per
 * scale per person; click again to clear. Each option shows how many colleagues chose it.
 */
export function RankBar({ target }: { target: string }) {
  const { ix, me } = useReview();
  const rank = useRank();
  const s = rankingSummary(ix, target, me);
  const pick = (dim: RankDimension, v: string) => rank.mutate({ target, patch: { [dim]: s.mine[dim] === v ? null : v } });

  return (
    <div class="rank" aria-label="Rank this story">
      {RANK_DIMENSIONS.map((dim) => (
        <span class="rank-dim" role="group" aria-label={RANK_LABEL[dim].ask} key={dim}>
          <span class="rank-lbl" title={RANK_LABEL[dim].ask}>{RANK_LABEL[dim].title}</span>
          {RANK_OPTIONS[dim].map((v) => {
            const n = s.counts[dim][v];
            return (
              <button key={v} class={`rk ${dim}-${v}`} type="button" aria-pressed={s.mine[dim] === v}
                title={n === 1 ? "1 person" : `${n} people`} onClick={() => pick(dim, v)}>
                {RANK_LABEL[dim].values[v]}<span class="c">{n || ""}</span>
              </button>
            );
          })}
        </span>
      ))}
    </div>
  );
}
