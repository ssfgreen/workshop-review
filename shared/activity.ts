// What people add: votes on codes, reactions on anything, suggested codes, and display names.

export type VoteValue = "keep" | "unsure" | "drop";
export type ReactionValue = "up" | "down";

export interface Vote {
  personId: string;
  /** A code id, or `s:<suggestion id>` for a suggested code. */
  target: string;
  value: VoteValue | null;
  note: string | null;
}

export interface Reaction {
  personId: string;
  /** See shared/keys.ts. */
  target: string;
  value: ReactionValue | null;
  note: string | null;
}

export interface Suggestion {
  id: string;
  section: string;
  group: string;
  title: string;
  description: string;
  evidence: string;
  authorId: string;
  created: string;
}

export interface Person {
  id: string;
  name: string;
}

export interface Activity {
  votes: Vote[];
  reactions: Reaction[];
  suggestions: Suggestion[];
  people: Person[];
}

export interface Session {
  id: string;
  name: string;
}

export const VOTE_VALUES: VoteValue[] = ["keep", "unsure", "drop"];
export const REACTION_VALUES: ReactionValue[] = ["up", "down"];
export const NOTE_MAX = 400;
export const NAME_MAX = 60;
