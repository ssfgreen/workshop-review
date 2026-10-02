import type { Activity, Reaction, ReactionValue } from "../../shared/activity.js";

export interface Indexed {
  reactionsByTarget: Map<string, Reaction[]>;
  names: Map<string, string>;
}

/** Group activity by target once per poll, so each card's lookups are cheap. */
export function indexActivity(a: Activity): Indexed {
  const reactionsByTarget = new Map<string, Reaction[]>();
  for (const r of a.reactions) (reactionsByTarget.get(r.target) ?? reactionsByTarget.set(r.target, []).get(r.target)!).push(r);
  return { reactionsByTarget, names: new Map(a.people.map((p) => [p.id, p.name])) };
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
