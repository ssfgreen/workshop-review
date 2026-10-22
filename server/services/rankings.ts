// A person's rankings of a user story. Writes are patches: each call sets the scales it names and
// leaves the others as they were; a row left with nothing chosen is deleted.
import { and, eq } from "drizzle-orm";
import { RANK_DIMENSIONS, RANK_OPTIONS, type Ranking, type RankingPatch } from "../../shared/activity.js";
import type { Db } from "../db/client.js";
import { rankings } from "../db/schema.js";

/** The patch with only known scales and values kept; a string names the first bad field. */
export function cleanRankingPatch(body: unknown): RankingPatch | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const patch: Record<string, string | null> = {};
  for (const dim of RANK_DIMENSIONS) {
    if (!(dim in b)) continue;
    const v = b[dim];
    if (v === null) { patch[dim] = null; continue; }
    if (typeof v !== "string" || !(RANK_OPTIONS[dim] as readonly string[]).includes(v)) return dim;
    patch[dim] = v;
  }
  return patch as RankingPatch;
}

export async function setRanking(db: Db, personId: string, target: string, patch: RankingPatch): Promise<void> {
  const where = and(eq(rankings.personId, personId), eq(rankings.target, target));
  const [current] = await db.select().from(rankings).where(where);
  const next = { priority: current?.priority ?? null, work: current?.work ?? null, size: current?.size ?? null, ...patch };
  if (!next.priority && !next.work && !next.size) {
    if (current) await db.delete(rankings).where(where);
    return;
  }
  const updatedAt = new Date().toISOString();
  await db.insert(rankings).values({ personId, target, ...next, updatedAt })
    .onConflictDoUpdate({ target: [rankings.personId, rankings.target], set: { ...next, updatedAt } });
}

export async function listRankings(db: Db): Promise<Ranking[]> {
  const rows = await db.select().from(rankings);
  return rows.map((r) => ({ personId: r.personId, target: r.target, priority: r.priority, work: r.work, size: r.size } as Ranking));
}
