import type { Activity, ReactionValue } from "../../shared/activity.js";
import type { Db } from "../db/client.js";
import { reactions } from "../db/schema.js";
import { listPeople } from "./people.js";
import { listSuggestions } from "./suggestions.js";

/** Everything people have added, read once and in parallel for the client's single poll. */
export async function getActivity(db: Db): Promise<Activity> {
  const [r, suggestions, people] = await Promise.all([db.select().from(reactions), listSuggestions(db), listPeople(db)]);
  return {
    reactions: r.map((x) => ({ personId: x.personId, target: x.target, value: x.value as ReactionValue | null, note: x.note })),
    suggestions,
    people,
  };
}
