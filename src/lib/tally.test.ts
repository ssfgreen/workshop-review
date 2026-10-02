import { describe, expect, it } from "vitest";
import type { Activity } from "../../shared/activity.js";
import { indexActivity, myThumb, reactionSummary } from "./tally.js";

const activity: Activity = {
  people: [{ id: "a", name: "Alex" }, { id: "b", name: "Bea" }],
  reactions: [
    { personId: "a", target: "code:X", value: "up", note: "Good" },
    { personId: "b", target: "code:X", value: "up", note: null },
    { personId: "c", target: "code:X", value: "down", note: null },
    { personId: "a", target: "code:Y", value: null, note: "Just a comment" },
  ],
  suggestions: [],
};

describe("reaction tallies", () => {
  const ix = indexActivity(activity);

  it("summarises thumbs and comments, and falls back for unknown people", () => {
    const s = reactionSummary(ix, "code:X", "a");
    expect([s.up, s.down, s.comments]).toEqual([2, 1, 1]);
    expect(s.mine?.note).toBe("Good");
    expect(s.others.map((o) => o.name)).toEqual(["Bea", "A colleague"]);
    expect(reactionSummary(ix, "missing", "a")).toMatchObject({ up: 0, down: 0, comments: 0, others: [] });
  });

  it("counts only a thumb as my rating, not a comment alone", () => {
    expect(myThumb(ix, "code:X", "a")).toBe("up");
    expect(myThumb(ix, "code:Y", "a")).toBeNull();
    expect(myThumb(ix, "code:X", "nobody")).toBeNull();
  });
});
