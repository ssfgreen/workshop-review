import { RANK_DIMENSIONS, RANK_OPTIONS, type Activity, type RankDimension, type Ranking, type Reaction, type ReactionValue } from "../../shared/activity.js";

export interface Indexed {
  reactionsByTarget: Map<string, Reaction[]>;
  rankingsByTarget: Map<string, Ranking[]>;
  names: Map<string, string>;
}

/** Group activity by target once per poll, so each card's lookups are cheap. */
export function indexActivity(a: Activity): Indexed {
  const reactionsByTarget = new Map<string, Reaction[]>();
  for (const r of a.reactions) (reactionsByTarget.get(r.target) ?? reactionsByTarget.set(r.target, []).get(r.target)!).push(r);
  const rankingsByTarget = new Map<string, Ranking[]>();
  for (const r of a.rankings ?? []) (rankingsByTarget.get(r.target) ?? rankingsByTarget.set(r.target, []).get(r.target)!).push(r);
  return { reactionsByTarget, rankingsByTarget, names: new Map(a.people.map((p) => [p.id, p.name])) };
}

export interface RankingSummary {
  /** How many people chose each value, per scale, in option order. */
  counts: Record<RankDimension, Record<string, number>>;
  /** My own choice per scale, or null. */
  mine: Record<RankDimension, string | null>;
  /** People who have chosen anything on this story. */
  raters: number;
}

export function rankingSummary(ix: Indexed, target: string, me: string): RankingSummary {
  const list = ix.rankingsByTarget.get(target) ?? [];
  const my = list.find((r) => r.personId === me);
  const counts = {} as RankingSummary["counts"];
  const mine = {} as RankingSummary["mine"];
  for (const dim of RANK_DIMENSIONS) {
    counts[dim] = Object.fromEntries(RANK_OPTIONS[dim].map((v) => [v, list.filter((r) => r[dim] === v).length]));
    mine[dim] = my?.[dim] ?? null;
  }
  return { counts, mine, raters: list.length };
}

export interface NamedNote {
  personId: string;
  name: string;
  value: ReactionValue | null;
  note: string | null;
}

export interface ReactionSummary {
  up: number;
  down: number;
  comments: number;
  mine?: Reaction;
  others: NamedNote[];
}

export function reactionSummary(ix: Indexed, target: string, me: string): ReactionSummary {
  const list = ix.reactionsByTarget.get(target) ?? [];
  return {
    up: list.filter((r) => r.value === "up").length,
    down: list.filter((r) => r.value === "down").length,
    comments: list.filter((r) => r.note).length,
    mine: list.find((r) => r.personId === me),
    others: list.filter((r) => r.personId !== me)
      .map((r) => ({ personId: r.personId, name: ix.names.get(r.personId) || "A colleague", value: r.value, note: r.note })),
  };
}

/** My thumb on a target, if I have given one (a comment alone does not count as a rating). */
export function myThumb(ix: Indexed, target: string, me: string): ReactionValue | null {
  return ix.reactionsByTarget.get(target)?.find((r) => r.personId === me)?.value ?? null;
}
