import { afterEach, describe, expect, it } from "vitest";
import type { Db } from "../db/client.js";
import { testDb } from "../test/helpers.js";
import { fixtureCatalog } from "../test/fixture.js";
import { getActivity } from "./activity.js";
import { getCatalog, getCatalogIds, seedCatalog } from "./catalog.js";
import { createPerson, renamePerson } from "./people.js";
import { setReaction, setVote } from "./responses.js";
import { addSuggestion, removeSuggestion } from "./suggestions.js";

let cleanup = () => {};
afterEach(() => cleanup());
async function fresh(): Promise<Db> { const t = await testDb(); cleanup = t.cleanup; return t.db; }

describe("catalogue", () => {
  it("round-trips the bundle through the database", async () => {
    const db = await fresh();
    expect(await getCatalog(db)).toEqual(fixtureCatalog());
  });

  it("reseeding replaces the catalogue but keeps people's input", async () => {
    const db = await fresh();
    const p = await createPerson(db, "Alex");
    await setVote(db, p.id, "KNOW_THE_CLASS", "keep", null);
    const next = fixtureCatalog();
    next.sections[0].groups[0].codes[0].gist = "Changed.";
    await seedCatalog(db, next);
    expect((await getCatalog(db)).sections[0].groups[0].codes[0].gist).toBe("Changed.");
    expect((await getActivity(db)).votes).toHaveLength(1);
  });

  it("lists the ids that writes are validated against", async () => {
    const ids = await getCatalogIds(await fresh());
    expect([...ids.codeIds].sort()).toEqual(["CHECK_QUICKLY", "KNOW_THE_CLASS"]);
    expect(ids.sectionKeys.has("q3_conditions")).toBe(true);
  });
});

describe("votes and reactions", () => {
  it("upserts one row per person and target, and deletes an empty one", async () => {
    const db = await fresh();
    const p = await createPerson(db, "Alex");
    await setReaction(db, p.id, "code:KNOW_THE_CLASS", "up", null);
    await setReaction(db, p.id, "code:KNOW_THE_CLASS", "up", "Good evidence");
    let a = await getActivity(db);
    expect(a.reactions).toEqual([{ personId: p.id, target: "code:KNOW_THE_CLASS", value: "up", note: "Good evidence" }]);
    await setReaction(db, p.id, "code:KNOW_THE_CLASS", null, null);
    a = await getActivity(db);
    expect(a.reactions).toEqual([]);
  });

  it("keeps different people's votes apart", async () => {
    const db = await fresh();
    const [a, b] = [await createPerson(db, "A"), await createPerson(db, "B")];
    await setVote(db, a.id, "CHECK_QUICKLY", "keep", null);
    await setVote(db, b.id, "CHECK_QUICKLY", "drop", "Merge it");
    const votes = (await getActivity(db)).votes.sort((x, y) => x.personId.localeCompare(y.personId));
    expect(votes.map((v) => v.value).sort()).toEqual(["drop", "keep"]);
  });
});

describe("people and suggestions", () => {
  it("renames a person", async () => {
    const db = await fresh();
    const p = await createPerson(db, "Alex");
    await renamePerson(db, p.id, "Alex G");
    expect((await getActivity(db)).people).toEqual([{ id: p.id, name: "Alex G" }]);
  });

  it("only lets the author remove a suggestion, and removes its votes", async () => {
    const db = await fresh();
    const [a, b] = [await createPerson(db, "A"), await createPerson(db, "B")];
    const s = await addSuggestion(db, a.id, { section: "q1_grounding", group: "Knowing the class", title: "New", description: "Desc", evidence: "" });
    await setVote(db, b.id, `s:${s.id}`, "keep", null);
    expect(await removeSuggestion(db, b.id, s.id)).toBe(false);
    expect(await removeSuggestion(db, a.id, s.id)).toBe(true);
    const act = await getActivity(db);
    expect(act.suggestions).toEqual([]);
    expect(act.votes).toEqual([]);
  });
});
