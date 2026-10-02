import { describe, expect, it } from "vitest";
import { contextWindow, quoteParts, SHORT_TURN } from "./quote.js";

const sentence = (n: number) => `Sentence number ${n} says something about planning lessons for the class.`;
const long = Array.from({ length: 12 }, (_, i) => sentence(i)).join(" ");

describe("contextWindow", () => {
  it("shows a short turn whole", () => {
    const t = "Short turn. With a quote.";
    expect(contextWindow(t, [12, 24])).toEqual([0, t.length]);
  });

  it("always contains the quote and starts and ends on sentence boundaries", () => {
    const start = long.indexOf("Sentence number 6");
    const span: [number, number] = [start + 9, start + 30];
    const [a, b] = contextWindow(long, span);
    expect(long.length).toBeGreaterThan(SHORT_TURN);
    expect(a).toBeLessThanOrEqual(span[0]);
    expect(b).toBeGreaterThanOrEqual(span[1]);
    expect(long.slice(a, a + 8)).toBe("Sentence");
    expect(long[b - 1]).toBe(".");
    expect(b - a).toBeLessThan(long.length);
  });

  it("opens a long turn without a quote on its first lines", () => {
    const [a, b] = contextWindow(long, null);
    expect(a).toBe(0);
    expect(b).toBeLessThanOrEqual(320);
  });
});

describe("quoteParts", () => {
  it("splits around the highlighted quote and marks cuts", () => {
    const text = "Before the quote. The quote itself. After it.";
    const p = quoteParts(text, [18, 35], [18, 35]);
    expect(p).toEqual({ lead: true, before: "", mark: "The quote itself.", after: "", trail: true });
  });

  it("falls back to plain text when the quote is outside the window", () => {
    expect(quoteParts("abc def", [0, 3], [4, 7]).mark).toBe("");
  });
});
