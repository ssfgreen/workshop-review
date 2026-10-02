import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export type Db = LibSQLDatabase<typeof schema>;

/**
 * Turso (libsql:// or https://) goes through the web client, which is pure JavaScript. The native
 * client is loaded only for local `file:` databases: Vercel's packager leaves libSQL's native
 * binary out of the function, so importing it there kills the API at startup.
 * `server/db/client.test.ts` guards that the remote path never loads the native modules.
 */
export async function createDb(url: string, authToken?: string): Promise<Db> {
  const config = { url, authToken: authToken || undefined };
  if (url.startsWith("file:")) {
    const [{ createClient }, { drizzle }] = await Promise.all([import("@libsql/client"), import("drizzle-orm/libsql")]);
    return drizzle(createClient(config), { schema });
  }
  const [{ createClient }, { drizzle }] = await Promise.all([import("@libsql/client/web"), import("drizzle-orm/libsql/web")]);
  return drizzle(createClient(config), { schema }) as unknown as Db;
}

// One client per process: serverless cold starts pay for it once, not per request.
let shared: Promise<Db> | null = null;
export function getDb(): Promise<Db> {
  if (!shared) {
    const url = process.env.DATABASE_URL;
    if (!url) return Promise.reject(new Error("DATABASE_URL is not set."));
    shared = createDb(url, process.env.DATABASE_AUTH_TOKEN);
  }
  return shared;
}
