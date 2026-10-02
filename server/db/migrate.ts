// Applies pending migrations. Run as an explicit step (`npm run db:migrate`), never per request.
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
import { getDb, type Db } from "./client.js";

export const MIGRATIONS_DIR = fileURLToPath(new URL("./migrations", import.meta.url));

export async function migrateDb(db: Db): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { process.loadEnvFile(); } catch { /* no .env: rely on the environment */ }
  await migrateDb(getDb());
  console.log("Migrations applied.");
}
