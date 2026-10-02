// Loads the catalogue from a bundle exported by the research repo:
//   npm run db:seed -- [path/to/bundle.json]   (default data/bundle.json)
// Replaces codes, evidence, stories and epics; never touches people's ratings, comments or suggestions.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Catalog } from "../../shared/catalog.js";
import { getDb } from "./client.js";
import { seedCatalog } from "../services/catalog.js";

export function checkBundle(value: unknown): Catalog {
  const b = value as Catalog;
  if (!b || !Array.isArray(b.sections) || !Array.isArray(b.epics)) throw new Error("Not a catalogue bundle: needs sections and epics arrays.");
  for (const s of b.sections) {
    if (!s.key || !Array.isArray(s.groups)) throw new Error(`Section ${s.key ?? "?"} has no groups.`);
    for (const g of s.groups) for (const c of g.codes) {
      if (!c.id || !Array.isArray(c.evidence) || !Array.isArray(c.stories)) throw new Error(`Code ${c.id ?? "?"} is incomplete.`);
    }
  }
  return b;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { process.loadEnvFile(); } catch { /* no .env: rely on the environment */ }
  const path = process.argv[2] ?? "data/bundle.json";
  const bundle = checkBundle(JSON.parse(readFileSync(path, "utf8")));
  const n = await seedCatalog(await getDb(), bundle);
  console.log(`Seeded ${n.codes} codes, ${n.evidence} evidence items, ${n.stories} stories from ${path}.`);
}
