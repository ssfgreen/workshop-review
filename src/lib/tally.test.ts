import { describe, expect, it } from "vitest";
import type { Activity } from "../../shared/activity.js";
import { indexActivity, myVote, otherVoteNotes, reactionSummary, voteTally } from "./tally.js";

const activity: Activity = {
  people: [{ id: "a", name: "Alex" }, { id: "b", name: "Bea" }],
  votes: [
    { personId: "a", target: "X", value: "keep", note: null },
    { personId: "b", target: "X", value: "drop", note: "Merge with Y" },
    { personId: "b", target: "Y", value: "keep", note: null },
  ],
  reactions: [
    { personId: "a", target: "code:X", value: "up", note: "Good" },
    { personId: "b", target: "code:X", value: "up", note: null },
    { personId: "c", target: "code:X", value: "down", note: null },
  ],
  suggestions: [],
};

describe("tallies", () => {
  const ix = indexActivity(activity);

  it("counts votes per value", () => {
    expect(voteTally(ix, "X")).toEqual({ keep: 1, unsure: 0, drop: 1 });
    expect(voteTally(ix, "missing")).toEqual({ keep: 0, unsure: 0, drop: 0 });
  });

  it("finds my vote and others' notes with names", () => {
    expect(myVote(ix, "X", "a")?.value).toBe("keep");
    expect(otherVoteNotes(ix, "X", "a")).toEqual([{ personId: "b", name: "Bea", value: "drop", note: "Merge with Y" }]);
  });

  it("summarises reactions and falls back for unknown people", () => {
    const s = reactionSummary(ix, "code:X", "a");
    expect([s.up, s.down, s.comments]).toEqual([2, 1, 1]);
    expect(s.mine?.note).toBe("Good");
    expect(s.others.map((o) => o.name)).toEqual(["Bea", "A colleague"]);
  });
});
