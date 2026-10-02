import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb, type Db } from "../db/client.js";
import { migrateDb } from "../db/migrate.js";
import { seedCatalog } from "../services/catalog.js";
import { fixtureCatalog } from "./fixture.js";

/** A fresh, migrated database in a temp file (in-memory libSQL does not survive transactions). */
export async function testDb(seed = true): Promise<{ db: Db; cleanup: () => void }> {
  const dir = mkdtempSync(join(tmpdir(), "workshop-review-"));
  const db = await createDb(`file:${join(dir, "test.db")}`);
  await migrateDb(db);
  if (seed) await seedCatalog(db, fixtureCatalog());
  return { db, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
