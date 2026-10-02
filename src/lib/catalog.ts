import type { Catalog, Code } from "../../shared/catalog.js";

export interface PlacedCode extends Code {
  sectionKey: string;
  group: string;
}

/** Every code with the question and group it sits in, in catalogue order. */
export function placeCodes(catalog: Catalog): PlacedCode[] {
  return catalog.sections.flatMap((s) => s.groups.flatMap((g) => g.codes.map((c) => ({ ...c, sectionKey: s.key, group: g.title }))));
}
