import { Hono } from "hono";
import { REACTION_VALUES } from "../../shared/activity.js";
import { isReactionTarget, isStoryKey } from "../../shared/keys.js";
import { getCatalogIds } from "../services/catalog.js";
import { cleanRankingPatch, setRanking } from "../services/rankings.js";
import { cleanNote, setReaction } from "../services/responses.js";
import { addSuggestion, cleanSuggestion, removeSuggestion, suggestionExists } from "../services/suggestions.js";
import type { AppEnv } from "../types.js";

export const writeRoutes = new Hono<AppEnv>();

const valueOf = <T extends string>(v: unknown, allowed: T[]): T | null | undefined =>
  v === null || v === undefined ? null : allowed.includes(v as T) ? (v as T) : undefined;

// A thumbs up/down and optional comment on a code, piece of evidence, story, epic or suggested code.
writeRoutes.put("/reactions/:target", async (c) => {
  const target = c.req.param("target");
  const { db } = c.get("deps");
  const body = await c.req.json().catch(() => ({}));
  const value = valueOf(body.value, REACTION_VALUES);
  if (!isReactionTarget(target) || value === undefined) return c.json({ error: "Unknown item or reaction." }, 400);
  const [kind, id] = target.split(":");
  const exists = kind === "suggestion" ? await suggestionExists(db, id)
    : kind === "epic" ? (await getCatalogIds(db)).epicIds.has(id)
    : (await getCatalogIds(db)).codeIds.has(id);
  if (!exists) return c.json({ error: "That item no longer exists." }, 404);
  await setReaction(db, c.get("personId"), target, value, cleanNote(body.note));
  return c.body(null, 204);
});

// My priority, kind of work and size for a user story: a patch of the scales to set (null clears one).
writeRoutes.put("/rankings/:target", async (c) => {
  const target = c.req.param("target");
  const { db } = c.get("deps");
  if (!isStoryKey(target)) return c.json({ error: "Only user stories can be ranked." }, 400);
  const patch = cleanRankingPatch(await c.req.json().catch(() => ({})));
  if (typeof patch === "string") return c.json({ error: `Unknown value for ${patch}.` }, 400);
  if (!(await getCatalogIds(db)).codeIds.has(target.split(":")[1])) return c.json({ error: "That story no longer exists." }, 404);
  await setRanking(db, c.get("personId"), target, patch);
  return c.body(null, 204);
});

writeRoutes.post("/suggestions", async (c) => {
  const { db } = c.get("deps");
  const cleaned = cleanSuggestion(await c.req.json().catch(() => ({})), (await getCatalogIds(db)).sectionKeys);
  if (typeof cleaned === "string") return c.json({ error: cleaned }, 400);
  return c.json(await addSuggestion(db, c.get("personId"), cleaned), 201);
});

writeRoutes.delete("/suggestions/:id", async (c) => {
  const removed = await removeSuggestion(c.get("deps").db, c.get("personId"), c.req.param("id"));
  return removed ? c.body(null, 204) : c.json({ error: "Only the person who suggested a code can remove it." }, 403);
});
