import { describe, expect, it } from "vitest";
import { fixtureCatalog } from "../../server/test/fixture.js";
import { groupGloss, placementsOf } from "./structures.js";

describe("structure placements", () => {
  const cat = fixtureCatalog();

  it("finds the group a code sits in for every structure, with its sublabel and remark", () => {
    const p = placementsOf(cat, "CHECK_QUICKLY");
    expect(p.map((x) => `${x.structure.id}:${x.group.id}`)).toEqual(["A:A8", "E:E1"]);
    expect(p[1].sublabel).toBe("Metrics");
    expect(placementsOf(cat, "KNOW_THE_CLASS")[1].remark).toBe("schema");
    expect(placementsOf(cat, "NOT_A_CODE")).toEqual([]);
  });

  it("glosses a group from its annotation, tier and next step", () => {
    expect(groupGloss(cat.structures[0].groups[0])).toBe("context only the teacher can supply");
    expect(groupGloss(cat.structures[1].groups[0])).toBe("T2");
    expect(groupGloss({ ...cat.structures[1].groups[0], action: "measure in a trial" })).toBe("T2 · next step: measure in a trial");
  });
});
