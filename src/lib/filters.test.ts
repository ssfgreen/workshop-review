import { describe, expect, it } from "vitest";
import { filtersToQuery, parseFilters } from "./filters.js";

describe("URL filters", () => {
  it("defaults anything missing or invalid", () => {
    expect(parseFilters({ room: "Room 9", kind: "bogus" })).toEqual({ room: "all", unvoted: false, org: "question", kind: "all", comp: "all" });
  });

  it("round-trips through the query string", () => {
    const f = parseFilters({ room: "Room 2", unvoted: "1", org: "epic", kind: "guardrail", comp: "tool" });
    const q = Object.fromEntries(new URLSearchParams(filtersToQuery(f).slice(1)));
    expect(parseFilters(q)).toEqual(f);
  });

  it("leaves defaults out of the URL", () => {
    expect(filtersToQuery(parseFilters({}))).toBe("");
  });
});
