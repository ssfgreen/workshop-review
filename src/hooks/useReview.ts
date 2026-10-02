import { useMemo } from "preact/hooks";
import type { Activity } from "../../shared/activity.js";
import { useActivity, useCatalog, useSession } from "../api/queries.js";
import { placeCodes } from "../lib/catalog.js";
import { indexActivity } from "../lib/tally.js";

const EMPTY: Activity = { votes: [], reactions: [], suggestions: [], people: [] };

/**
 * The data every screen reads: the catalogue, people's activity (indexed once per poll) and the
 * signed-in person. The App only renders screens once session and catalogue have loaded.
 */
export function useReview() {
  const session = useSession();
  const catalog = useCatalog();
  const activity = useActivity();
  const data = activity.data ?? EMPTY;
  const ix = useMemo(() => indexActivity(data), [data]);
  const codes = useMemo(() => (catalog.data ? placeCodes(catalog.data) : []), [catalog.data]);
  return { me: session.data!.id, catalog: catalog.data!, codes, activity: data, ix, activityError: activity.error };
}
