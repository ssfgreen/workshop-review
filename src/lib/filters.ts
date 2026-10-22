// Filters live in the URL query so they survive a refresh and can be shared as a link.
import { ROOMS, type Code, type Component, type Room, type StoryKind } from "../../shared/catalog.js";

export interface Filters {
  room: Room | "all";
  /** Only codes I have not yet given a thumb up or down. */
  unrated: boolean;
  /** How the stories page is organised; epics by default. */
  org: "epic" | "question";
  kind: StoryKind | "all";
  comp: Component | "all";
  /** On a structure page: one of its groups (e.g. "A4"), or every group. */
  group: string;
}

const KINDS: StoryKind[] = ["feature", "setting", "guardrail"];
const COMPS: Component[] = ["data", "skill", "tool", "deployment"];
const GROUP_ID = /^[A-Z]\d{1,2}$/;

export function parseFilters(query: Record<string, string | undefined>): Filters {
  const room = query.room as Room;
  return {
    room: ROOMS.includes(room) ? room : "all",
    unrated: query.unrated === "1",
    org: query.org === "question" ? "question" : "epic",
    kind: KINDS.includes(query.kind as StoryKind) ? (query.kind as StoryKind) : "all",
    comp: COMPS.includes(query.comp as Component) ? (query.comp as Component) : "all",
    group: query.g && GROUP_ID.test(query.g) ? query.g : "all",
  };
}

/** The query string for a set of filters, leaving out defaults. */
export function filtersToQuery(f: Filters): string {
  const q = new URLSearchParams();
  if (f.room !== "all") q.set("room", f.room);
  if (f.unrated) q.set("unrated", "1");
  if (f.org !== "epic") q.set("org", f.org);
  if (f.kind !== "all") q.set("kind", f.kind);
  if (f.comp !== "all") q.set("comp", f.comp);
  if (f.group !== "all") q.set("g", f.group);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const inRoom = (code: Code, room: Filters["room"]) => room === "all" || code.rooms.includes(room);
