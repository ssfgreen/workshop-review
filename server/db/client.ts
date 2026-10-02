import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export type Db = LibSQLDatabase<typeof schema>;

export function createDb(url: string, authToken?: string): Db {
  return drizzle(createClient({ url, authToken: authToken || undefined }), { schema });
}

// One client per process: serverless cold starts pay for it once, not per request.
let shared: Db | null = null;
export function getDb(): Db {
  if (!shared) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    shared = createDb(url, process.env.DATABASE_AUTH_TOKEN);
  }
  return shared;
}
