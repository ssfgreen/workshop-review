import type { Catalog, Structure, StructureGroup } from "../../shared/catalog.js";

/** Where one code sits in one structure. */
export interface Placement {
  structure: Structure;
  group: StructureGroup;
  /** The sub-heading the code sits under within the group, if the group has them. */
  sublabel?: string;
  /** A short remark beside the code in that group, if any. */
  remark?: string;
}

export function groupOf(structure: Structure, codeId: string): StructureGroup | undefined {
  return structure.groups.find((g) => g.codes.includes(codeId));
}

/** The code's place in every structure that places it, in catalogue order. */
export function placementsOf(catalog: Catalog, codeId: string): Placement[] {
  const out: Placement[] = [];
  for (const structure of catalog.structures) {
    const group = groupOf(structure, codeId);
    if (group) out.push({ structure, group, sublabel: group.sublabels[codeId], remark: group.remarks[codeId] });
  }
  return out;
}

/** "T2 + T3" for the build structure, "measure in a trial" for the kind-of-claim one, else the heading gloss. */
export function groupGloss(g: StructureGroup): string {
  return [g.annotation, g.tier, g.action ? `next step: ${g.action}` : ""].filter(Boolean).join(" · ");
}
