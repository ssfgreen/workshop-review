import { Hono } from "hono";
import { requireSession } from "./auth/session.js";
import { getDb } from "./db/client.js";
import { readRoutes } from "./routes/read.js";
import { sessionRoutes } from "./routes/session.js";
import { writeRoutes } from "./routes/write.js";
import type { AppDeps, AppEnv } from "./types.js";

/** The whole API. Dependencies are passed in so tests can use a throwaway database. */
export function createApp(deps: AppDeps) {
  const app = new Hono<AppEnv>().basePath("/api");
  app.use("*", async (c, next) => { c.set("deps", deps); await next(); });
  app.get("/health", (c) => c.json({ ok: true }));
  app.route("/session", sessionRoutes);
  app.use("/catalog", requireSession);
  app.use("/activity", requireSession);
  app.use("/votes/*", requireSession);
  app.use("/reactions/*", requireSession);
  app.use("/suggestions/*", requireSession);
  app.use("/suggestions", requireSession);
  app.route("/", readRoutes);
  app.route("/", writeRoutes);
  app.notFound((c) => c.json({ error: "Not found." }, 404));
  app.onError((err, c) => { console.error(err); return c.json({ error: "Something went wrong on the server." }, 500); });
  return app;
}

/** Build the app from environment variables (deployment and local dev). */
export function createAppFromEnv() {
  const accessCode = process.env.ACCESS_CODE, sessionSecret = process.env.SESSION_SECRET;
  if (!accessCode || !sessionSecret) throw new Error("ACCESS_CODE and SESSION_SECRET must be set.");
  return createApp({ db: getDb(), accessCode, sessionSecret, secureCookies: process.env.NODE_ENV === "production" || !!process.env.VERCEL });
}
