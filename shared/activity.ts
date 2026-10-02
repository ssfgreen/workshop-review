// What people add: thumbs up / down and comments on anything, suggested codes, and display names.

export type ReactionValue = "up" | "down";

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
  reactions: Reaction[];
  suggestions: Suggestion[];
  people: Person[];
}

export interface Session {
  id: string;
  name: string;
}

export const REACTION_VALUES: ReactionValue[] = ["up", "down"];
export const NOTE_MAX = 400;
export const NAME_MAX = 60;
