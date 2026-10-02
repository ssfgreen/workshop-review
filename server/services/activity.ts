import type { Activity, ReactionValue, VoteValue } from "../../shared/activity.js";
import type { Db } from "../db/client.js";
import { reactions, votes } from "../db/schema.js";
import { listPeople } from "./people.js";
import { listSuggestions } from "./suggestions.js";

/** Everything people have added, read once and in parallel for the client's single poll. */
export async function getActivity(db: Db): Promise<Activity> {
  const [v, r, suggestions, people] = await Promise.all([
    db.select().from(votes),
    db.select().from(reactions),
    listSuggestions(db),
    listPeople(db),
  ]);
  return {
    votes: v.map((x) => ({ personId: x.personId, target: x.target, value: x.value as VoteValue | null, note: x.note })),
    reactions: r.map((x) => ({ personId: x.personId, target: x.target, value: x.value as ReactionValue | null, note: x.note })),
    suggestions,
    people,
  };
}
