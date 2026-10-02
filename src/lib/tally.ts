import type { Activity, Reaction, ReactionValue, Vote, VoteValue } from "../../shared/activity.js";

export type VoteTally = Record<VoteValue, number>;

export interface Indexed {
  votesByTarget: Map<string, Vote[]>;
  reactionsByTarget: Map<string, Reaction[]>;
  names: Map<string, string>;
}

/** Group activity by target once per poll, so each card's lookups are cheap. */
export function indexActivity(a: Activity): Indexed {
  const votesByTarget = new Map<string, Vote[]>();
  for (const v of a.votes) (votesByTarget.get(v.target) ?? votesByTarget.set(v.target, []).get(v.target)!).push(v);
  const reactionsByTarget = new Map<string, Reaction[]>();
  for (const r of a.reactions) (reactionsByTarget.get(r.target) ?? reactionsByTarget.set(r.target, []).get(r.target)!).push(r);
  return { votesByTarget, reactionsByTarget, names: new Map(a.people.map((p) => [p.id, p.name])) };
}

export function voteTally(ix: Indexed, target: string): VoteTally {
  const t: VoteTally = { keep: 0, unsure: 0, drop: 0 };
  for (const v of ix.votesByTarget.get(target) ?? []) if (v.value) t[v.value]++;
  return t;
}

export function myVote(ix: Indexed, target: string, me: string): Vote | undefined {
  return ix.votesByTarget.get(target)?.find((v) => v.personId === me);
}

export interface NamedNote {
  personId: string;
  name: string;
  value: VoteValue | ReactionValue | null;
  note: string | null;
}

/** Other people's notes on a vote target, with names. */
export function otherVoteNotes(ix: Indexed, target: string, me: string): NamedNote[] {
  return (ix.votesByTarget.get(target) ?? [])
    .filter((v) => v.personId !== me && v.note)
    .map((v) => ({ personId: v.personId, name: ix.names.get(v.personId) || "A colleague", value: v.value, note: v.note }));
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
