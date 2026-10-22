import { describe, expect, it } from "vitest";
import { allClosed, allOpen, isOpen, isUniform, toggled } from "./disclosure.js";

describe("disclosure state", () => {
  it("opens or closes everything, with single items toggled against the default", () => {
    let d = allOpen();
    expect(isOpen(d, "A1")).toBe(true);
    expect(isUniform(d, true)).toBe(true);
    d = toggled(d, "A1");
    expect(isOpen(d, "A1")).toBe(false);
    expect(isOpen(d, "A2")).toBe(true);
    expect(isUniform(d, true)).toBe(false);
    d = toggled(d, "A1");
    expect(isUniform(d, true)).toBe(true);
    d = toggled(allClosed(), "A2");
    expect(isOpen(d, "A2")).toBe(true);
    expect(isOpen(d, "A1")).toBe(false);
    expect(isUniform(d, false)).toBe(false);
  });
});
