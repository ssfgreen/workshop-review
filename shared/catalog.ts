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

export interface Catalog {
  generated: string;
  sections: Section[];
  epics: Epic[];
  component_definitions: Partial<Record<Component, string>>;
}
