// Votes and reactions share one shape: a person's value and note on a target, one row each.
// Writes are deltas (one target at a time); a row with neither value nor note is deleted.
import { and, eq } from "drizzle-orm";
import { NOTE_MAX } from "../../shared/activity.js";
import type { Db } from "../db/client.js";
import { reactions, votes } from "../db/schema.js";

type Table = typeof votes | typeof reactions;

export function cleanNote(note: unknown): string | null {
  if (typeof note !== "string") return null;
  const n = note.trim().slice(0, NOTE_MAX);
  return n || null;
}

async function upsert(db: Db, table: Table, personId: string, target: string, value: string | null, note: string | null) {
  const where = and(eq(table.personId, personId), eq(table.target, target));
  if (value === null && note === null) {
    await db.delete(table).where(where);
    return;
  }
  const updatedAt = new Date().toISOString();
  await db.insert(table).values({ personId, target, value, note, updatedAt })
    .onConflictDoUpdate({ target: [table.personId, table.target], set: { value, note, updatedAt } });
}

export const setVote = (db: Db, personId: string, target: string, value: string | null, note: string | null) =>
  upsert(db, votes, personId, target, value, note);

export const setReaction = (db: Db, personId: string, target: string, value: string | null, note: string | null) =>
  upsert(db, reactions, personId, target, value, note);
