import { Hono } from "hono";
import { codeMatches, endSession, requireSession, startSession } from "../auth/session.js";
import { cleanName, createPerson, getPerson, renamePerson } from "../services/people.js";
import type { AppEnv } from "../types.js";

export const sessionRoutes = new Hono<AppEnv>();

// Sign in: the team access code plus the name colleagues will see.
sessionRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { db, accessCode } = c.get("deps");
  if (!codeMatches(body.code, accessCode)) return c.json({ error: "That access code isn't right." }, 403);
  const name = cleanName(body.name);
  if (!name) return c.json({ error: "Enter the name your colleagues know you by." }, 400);
  const person = await createPerson(db, name);
  await startSession(c, person.id);
  return c.json(person, 201);
});

sessionRoutes.get("/", requireSession, async (c) => {
  const person = await getPerson(c.get("deps").db, c.get("personId"));
  if (!person) { endSession(c); return c.json({ error: "Sign in to continue." }, 401); }
  return c.json(person);
});

sessionRoutes.patch("/", requireSession, async (c) => {
  const name = cleanName((await c.req.json().catch(() => ({}))).name);
  if (!name) return c.json({ error: "Enter a name." }, 400);
  await renamePerson(c.get("deps").db, c.get("personId"), name);
  return c.json({ id: c.get("personId"), name });
});

sessionRoutes.delete("/", (c) => { endSession(c); return c.body(null, 204); });
