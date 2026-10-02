// A person's thumbs up / down and comment on a target, one row each. Writes are deltas (one target
// at a time); a row with neither a thumb nor a comment is deleted.
import { and, eq } from "drizzle-orm";
import { NOTE_MAX } from "../../shared/activity.js";
import type { Db } from "../db/client.js";
import { reactions } from "../db/schema.js";

export function cleanNote(note: unknown): string | null {
  if (typeof note !== "string") return null;
  const n = note.trim().slice(0, NOTE_MAX);
  return n || null;
}

export async function setReaction(db: Db, personId: string, target: string, value: string | null, note: string | null) {
  const where = and(eq(reactions.personId, personId), eq(reactions.target, target));
  if (value === null && note === null) {
    await db.delete(reactions).where(where);
    return;
  }
  const updatedAt = new Date().toISOString();
  await db.insert(reactions).values({ personId, target, value, note, updatedAt })
    .onConflictDoUpdate({ target: [reactions.personId, reactions.target], set: { value, note, updatedAt } });
}
