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

// ---- Rankings: how a person rates a user story on three scales ----

export const RANK_OPTIONS = {
  /** How important the story is. */
  priority: ["high", "medium", "low"],
  /** What it mainly needs before it could exist. */
  work: ["research", "software", "ai"],
  /** How big a job it is. */
  size: ["large", "medium", "small"],
} as const;
export type RankDimension = keyof typeof RANK_OPTIONS;
export type RankValue<D extends RankDimension> = (typeof RANK_OPTIONS)[D][number];
export const RANK_DIMENSIONS = Object.keys(RANK_OPTIONS) as RankDimension[];

/** One person's rankings of one story (a story key, see shared/keys.ts); a scale not yet chosen is null. */
export interface Ranking {
  personId: string;
  target: string;
  priority: RankValue<"priority"> | null;
  work: RankValue<"work"> | null;
  size: RankValue<"size"> | null;
}

export type RankingPatch = Partial<Pick<Ranking, RankDimension>>;

export interface Activity {
  reactions: Reaction[];
  rankings: Ranking[];
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
