import { Hono } from "hono";
import { getActivity } from "../services/activity.js";
import { getCatalog } from "../services/catalog.js";
import type { AppEnv } from "../types.js";

export const readRoutes = new Hono<AppEnv>();

// The catalogue only changes when the seed runs, so browsers may reuse it for a few minutes.
readRoutes.get("/catalog", async (c) => {
  c.header("Cache-Control", "private, max-age=300");
  return c.json(await getCatalog(c.get("deps").db));
});

// People's input changes all the time: revalidate on each poll rather than disable caching.
readRoutes.get("/activity", async (c) => {
  c.header("Cache-Control", "private, no-cache");
  return c.json(await getActivity(c.get("deps").db));
});
