import { describe, expect, it } from "vitest";
import { codeKey, epicKey, evidenceKey, isReactionTarget, isVoteTarget, storyKey, suggestionTarget } from "./keys.js";

describe("reaction targets", () => {
  it("accepts every key the builders make", () => {
    expect(isReactionTarget(codeKey("KEEP_THE_SAME_LEARNING_GOAL_FOR_ALL"))).toBe(true);
    expect(isReactionTarget(epicKey("adapt"))).toBe(true);
    expect(isReactionTarget(storyKey("GENERATE_QUICK_QUIZZES", 1))).toBe(true);
    expect(isReactionTarget(evidenceKey("GENERATE_QUICK_QUIZZES", "R2-0045"))).toBe(true);
    expect(isReactionTarget(evidenceKey("GENERATE_QUICK_QUIZZES", "CH-017"))).toBe(true);
    expect(isReactionTarget(evidenceKey("X", "note:6d569606-1f2e-4a3b-9c8d-0123456789ab"))).toBe(true);
  });

  it("rejects malformed keys", () => {
    for (const bad of ["", "code:", "code:lower", "story:X:abc", "ev:X:R2-45", "epic:Adapt", "other:X", "code:A:B"]) {
      expect(isReactionTarget(bad)).toBe(false);
    }
  });
});

describe("vote targets", () => {
  it("accepts code ids and suggestion targets", () => {
    expect(isVoteTarget("KEEP_FEEDBACK_FOR_MYSELF")).toBe(true);
    expect(isVoteTarget(suggestionTarget("a1b2c3d4e5"))).toBe(true);
  });
  it("rejects anything else", () => {
    expect(isVoteTarget("code:KEEP")).toBe(false);
    expect(isVoteTarget("s:x")).toBe(false);
  });
});
