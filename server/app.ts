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

/** Names of required settings that are missing (names only, never values). */
export function missingSettings(env = process.env): string[] {
  return ["ACCESS_CODE", "SESSION_SECRET", "DATABASE_URL"].filter((k) => !env[k]);
}

/** Build the app from environment variables (deployment and local dev). */
export async function createAppFromEnv() {
  const missing = missingSettings();
  if (missing.length) throw new Error(`Missing setting${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`);
  return createApp({
    db: await getDb(), accessCode: process.env.ACCESS_CODE!, sessionSecret: process.env.SESSION_SECRET!,
    secureCookies: process.env.NODE_ENV === "production" || !!process.env.VERCEL,
  });
}
