import { asc } from "drizzle-orm";
import type { Catalog, Code, Evidence, Section, Story } from "../../shared/catalog.js";
import type { Db } from "../db/client.js";
import { codes, epics, evidence, groups, meta, sections, stories } from "../db/schema.js";

/** Replace the whole catalogue with a bundle. People's votes, reactions and suggestions are kept. */
export async function seedCatalog(db: Db, bundle: Catalog): Promise<{ codes: number; evidence: number; stories: number }> {
  let nCodes = 0, nEvidence = 0, nStories = 0;
  await db.transaction(async (tx) => {
    for (const table of [sections, groups, codes, evidence, stories, epics, meta]) await tx.delete(table);
    for (const [si, s] of bundle.sections.entries()) {
      await tx.insert(sections).values({ key: s.key, position: si, label: s.label, question: s.question, prompt: s.prompt, columnsJson: JSON.stringify(s.columns) });
      for (const [gi, g] of s.groups.entries()) {
        const [row] = await tx.insert(groups).values({ sectionKey: s.key, position: gi, title: g.title }).returning({ id: groups.id });
        for (const [ci, c] of g.codes.entries()) {
          await tx.insert(codes).values({
            id: c.id, groupId: row.id, position: ci, title: c.title, gist: c.gist, definition: c.definition,
            participantsJson: JSON.stringify(c.participants), roomsJson: JSON.stringify(c.rooms), sectionsJson: JSON.stringify(c.sections),
          });
          nCodes++;
          if (c.evidence.length) {
            await tx.insert(evidence).values(c.evidence.map((e, i) => ({ codeId: c.id, position: i, dataJson: JSON.stringify(e) })));
            nEvidence += c.evidence.length;
          }
          if (c.stories.length) {
            await tx.insert(stories).values(c.stories.map((st, i) => ({ codeId: c.id, position: i, dataJson: JSON.stringify(st) })));
            nStories += c.stories.length;
          }
        }
      }
    }
    if (bundle.epics.length) {
      await tx.insert(epics).values(bundle.epics.map((e, i) => ({ id: e.id, position: i, title: e.title, description: e.description })));
    }
    await tx.insert(meta).values([
      { key: "generated", value: bundle.generated },
      { key: "component_definitions", value: JSON.stringify(bundle.component_definitions ?? {}) },
    ]);
  });
  return { codes: nCodes, evidence: nEvidence, stories: nStories };
}

/** Assemble the catalogue from its tables: one query per table, joined in memory. */
export async function getCatalog(db: Db): Promise<Catalog> {
  const [sRows, gRows, cRows, eRows, stRows, epRows, mRows] = await Promise.all([
    db.select().from(sections).orderBy(asc(sections.position)),
    db.select().from(groups).orderBy(asc(groups.sectionKey), asc(groups.position)),
    db.select().from(codes).orderBy(asc(codes.groupId), asc(codes.position)),
    db.select().from(evidence).orderBy(asc(evidence.codeId), asc(evidence.position)),
    db.select().from(stories).orderBy(asc(stories.codeId), asc(stories.position)),
    db.select().from(epics).orderBy(asc(epics.position)),
    db.select().from(meta),
  ]);
  const evByCode = new Map<string, Evidence[]>();
  for (const r of eRows) (evByCode.get(r.codeId) ?? evByCode.set(r.codeId, []).get(r.codeId)!).push(JSON.parse(r.dataJson));
  const stByCode = new Map<string, Story[]>();
  for (const r of stRows) (stByCode.get(r.codeId) ?? stByCode.set(r.codeId, []).get(r.codeId)!).push(JSON.parse(r.dataJson));
  const codesByGroup = new Map<number, Code[]>();
  for (const r of cRows) {
    const code: Code = {
      id: r.id, title: r.title, gist: r.gist, definition: r.definition,
      participants: JSON.parse(r.participantsJson), rooms: JSON.parse(r.roomsJson), sections: JSON.parse(r.sectionsJson),
      evidence: evByCode.get(r.id) ?? [], stories: stByCode.get(r.id) ?? [],
    };
    (codesByGroup.get(r.groupId) ?? codesByGroup.set(r.groupId, []).get(r.groupId)!).push(code);
  }
  const out: Section[] = sRows.map((s) => ({
    key: s.key, label: s.label, question: s.question, prompt: s.prompt, columns: JSON.parse(s.columnsJson),
    groups: gRows.filter((g) => g.sectionKey === s.key).map((g) => ({ title: g.title, codes: codesByGroup.get(g.id) ?? [] })),
  }));
  const m = Object.fromEntries(mRows.map((r) => [r.key, r.value]));
  return {
    generated: m.generated ?? "",
    sections: out,
    epics: epRows.map((e) => ({ id: e.id, title: e.title, description: e.description })),
    component_definitions: m.component_definitions ? JSON.parse(m.component_definitions) : {},
  };
}

/** Code ids and section keys that exist, for validating writes. */
export async function getCatalogIds(db: Db): Promise<{ codeIds: Set<string>; sectionKeys: Set<string> }> {
  const [c, s] = await Promise.all([db.select({ id: codes.id }).from(codes), db.select({ key: sections.key }).from(sections)]);
  return { codeIds: new Set(c.map((r) => r.id)), sectionKeys: new Set(s.map((r) => r.key)) };
}
