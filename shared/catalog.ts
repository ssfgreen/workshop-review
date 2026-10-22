// The read-only catalogue: what the research repo exports and the seed script loads.
// Shared by server (assembling it from the database) and client (rendering it).

export type Room = "Room 1" | "Room 2" | "Room 3" | "Whole group";
export const ROOMS: Room[] = ["Room 1", "Room 2", "Room 3", "Whole group"];

export type StoryKind = "feature" | "setting" | "guardrail";
export type Component = "data" | "skill" | "tool" | "deployment";

export interface Column {
  column_key: string;
  column_label: string;
}

export interface Evidence {
  ref: string;
  kind: "turn" | "note" | "chat";
  room: Room;
  who: string;
  section: string;
  text: string;
  example: boolean;
  /** Character offsets of the quoted part within a transcript turn. */
  span?: [number, number] | null;
  /** The previous visible turn in the same room, for context. */
  prev?: { who: string; text: string };
  /** Sticky notes: the board column and whether a facilitator typed it. */
  column?: string;
  scribed?: boolean;
}

export interface Story {
  as: string;
  want: string;
  so_that: string;
  kind: StoryKind;
  components: Component[];
  epics: string[];
}

export interface Code {
  id: string;
  title: string;
  gist: string;
  definition: string;
  participants: string[];
  rooms: Room[];
  sections: string[];
  evidence: Evidence[];
  stories: Story[];
}

export interface Group {
  title: string;
  codes: Code[];
}

export interface Section {
  key: string;
  label: string;
  question: string;
  prompt: string;
  columns: Column[];
  groups: Group[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
}

/** One group of a thematic structure: a reading aid over the codes, not part of the codebook. */
export interface StructureGroup {
  /** e.g. "A4"; unique across all structures. */
  id: string;
  title: string;
  /** The gloss on the heading, e.g. "the privacy line". */
  annotation: string;
  /** Buildability tier for the build structure (e.g. "T2 + T3"); empty elsewhere. */
  tier: string;
  /** What to do with the group for the kind-of-claim structure (e.g. "measure in a trial"); empty elsewhere. */
  action: string;
  /** Literatures, build notes or commentary for the group. */
  note: string;
  codes: string[];
  /** A sub-heading some codes sit under within the group (e.g. "Losses"), by code id. */
  sublabels: Record<string, string>;
  /** A short remark beside a code in the group (e.g. "templates"), by code id. */
  remarks: Record<string, string>;
}

/** An alternative way of grouping every code once, e.g. "A. The teacher's terms". */
export interface Structure {
  /** A single letter, e.g. "A". */
  id: string;
  title: string;
  purpose: string;
  intro: string;
  notes: string;
  groups: StructureGroup[];
}

export interface Catalog {
  generated: string;
  sections: Section[];
  epics: Epic[];
  component_definitions: Partial<Record<Component, string>>;
  structures: Structure[];
}
