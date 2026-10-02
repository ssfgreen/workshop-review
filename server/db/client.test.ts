import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../..", import.meta.url));

/** Which libSQL entry points does createDb resolve for a given URL? Run in a fresh process. */
function modulesLoadedFor(url: string): string[] {
  const script = `
    import { registerHooks } from "node:module";
    const seen = [];
    const watch = new Set(["libsql", "@libsql/client", "drizzle-orm/libsql"]);
    registerHooks({ resolve(spec, ctx, next) { if (watch.has(spec)) seen.push(spec); return next(spec, ctx); } });
    const { createDb } = await import("./server/db/client.ts");
    await createDb(${JSON.stringify(url)}, "token");
    console.log(JSON.stringify([...new Set(seen)]));`;
  const out = execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script], { cwd: root });
  return JSON.parse(out.toString().trim().split("\n").pop()!);
}

describe("database client", () => {
  // Vercel's packager leaves libSQL's native binary out of the function; loading it there
  // crashes the API at startup. A hosted database must use the pure-JavaScript web client.
  it("never loads libSQL's native modules for a hosted (Turso) database", () => {
    expect(modulesLoadedFor("libsql://example.turso.io")).toEqual([]);
  });

  it("uses the native client for a local file database", () => {
    expect(modulesLoadedFor("file:/tmp/never-opened.db")).toContain("@libsql/client");
  });
});
