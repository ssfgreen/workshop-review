import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Suggestion } from "../../shared/activity.js";
import type { Db } from "../db/client.js";
import { suggestions, votes } from "../db/schema.js";

export interface NewSuggestion {
  section: string;
  group: string;
  title: string;
  description: string;
  evidence: string;
}

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validate a suggestion body; returns an error message or the cleaned fields. */
export function cleanSuggestion(body: Record<string, unknown>, sectionKeys: Set<string>): NewSuggestion | string {
  const s: NewSuggestion = {
    section: clip(body.section, 60), group: clip(body.group, 120), title: clip(body.title, 120),
    description: clip(body.description, 800), evidence: clip(body.evidence, 800),
  };
  if (!sectionKeys.has(s.section)) return "Unknown question.";
  if (!s.title || !s.description) return "Add a name and a short description.";
  return s;
}

export async function addSuggestion(db: Db, authorId: string, s: NewSuggestion): Promise<Suggestion> {
  const row = { id: randomUUID().replace(/-/g, "").slice(0, 16), authorId, createdAt: new Date().toISOString(),
    sectionKey: s.section, groupTitle: s.group, title: s.title, description: s.description, evidence: s.evidence };
  await db.insert(suggestions).values(row);
  return toSuggestion(row);
}

/** Remove a suggestion the person wrote, and the votes cast on it. Returns false if it was not theirs. */
export async function removeSuggestion(db: Db, authorId: string, id: string): Promise<boolean> {
  const deleted = await db.delete(suggestions).where(and(eq(suggestions.id, id), eq(suggestions.authorId, authorId))).returning({ id: suggestions.id });
  if (!deleted.length) return false;
  await db.delete(votes).where(eq(votes.target, `s:${id}`));
  return true;
}

export async function listSuggestions(db: Db): Promise<Suggestion[]> {
  return (await db.select().from(suggestions)).map(toSuggestion);
}

function toSuggestion(r: typeof suggestions.$inferSelect): Suggestion {
  return { id: r.id, section: r.sectionKey, group: r.groupTitle, title: r.title, description: r.description,
    evidence: r.evidence, authorId: r.authorId, created: r.createdAt };
}
