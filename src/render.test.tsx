// Renders every screen to HTML with a seeded query cache: catches runtime errors in components
// and checks the key content appears. Uses the fixture always, and the real exported bundle
// (data/bundle.json, gitignored) when it is present.
import { existsSync, readFileSync } from "node:fs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocationProvider } from "preact-iso";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import type { Activity } from "../shared/activity.js";
import type { Catalog } from "../shared/catalog.js";
import { fixtureCatalog } from "../server/test/fixture.js";
import { Shell } from "./app.js";

// preact-iso reads location.origin even when given a url; Node has no location.
Object.assign(globalThis, { location: { origin: "http://localhost", pathname: "/", search: "", hash: "" } });

const me = { id: "me", name: "Alex" };
const activity: Activity = {
  people: [me, { id: "b", name: "Bea" }],
  votes: [{ personId: "b", target: "KNOW_THE_CLASS", value: "drop", note: "Merge with another" }],
  reactions: [{ personId: "b", target: "code:KNOW_THE_CLASS", value: "up", note: "Strong" }],
  suggestions: [{ id: "abc123def456", section: "q1_grounding", group: "Knowing the class", title: "A suggested code", description: "It means this.", evidence: "", authorId: "me", created: "2026-10-02T10:00:00Z" }],
};

function render(url: string, catalog: Catalog) {
  const qc = new QueryClient();
  qc.setQueryData(["session"], me);
  qc.setQueryData(["catalog"], catalog);
  qc.setQueryData(["activity"], activity);
  return renderToString(
    <QueryClientProvider client={qc}>
      <LocationProvider {...({ url } as object)}><Shell /></LocationProvider>
    </QueryClientProvider>,
  );
}

describe("screens render (fixture)", () => {
  const cat = fixtureCatalog();

  it("question screen: code, evidence, votes, notes, reactions and suggestions", () => {
    const html = render("/q/q1_grounding", cat);
    expect(html).toContain("Q1 · Grounding: what should it know?");
    expect(html).toContain("Know the class");
    expect(html).toContain("<mark>It needs to know the year group.</mark>");
    expect(html).toContain("Merge with another");
    expect(html).toContain("A suggested code");
    expect(html).toContain("Remove my suggestion");
    expect(html).toContain('aria-label="Thumbs up for this code"');
  });

  it("room filter keeps only codes with that room's evidence", () => {
    const html = render("/q/q1_grounding?room=Room%203", cat);
    expect(html).toContain("No code in this question drew on Room 3");
    expect(html).not.toContain("Know the class</h4>");
  });

  it("stories screen by question and by epic", () => {
    expect(render("/stories", cat)).toContain("I want to set up a class once");
    const epic = render("/stories?org=epic&comp=data", cat);
    expect(epic).toContain("Adapt my resource");
    expect(epic).toContain("From: ");
    expect(epic).not.toContain("output I can check at a glance"); // a skill-only story is filtered out
  });

  it("results screen", () => {
    const html = render("/results", cat);
    expect(html).toContain("1 person has voted so far");
    expect(html).toContain("Suggested · Knowing the class");
  });
});

const BUNDLE = "data/bundle.json";
describe.skipIf(!existsSync(BUNDLE))("screens render (real bundle)", () => {
  const cat: Catalog = existsSync(BUNDLE) ? JSON.parse(readFileSync(BUNDLE, "utf8")) : fixtureCatalog();
  it("every question, the stories in both views and results render", () => {
    for (const s of cat.sections) {
      const html = render(`/q/${s.key}`, cat);
      for (const g of s.groups) expect(html).toContain(g.title);
    }
    expect(render("/stories?org=epic", cat)).toContain(cat.epics[0].title);
    expect(render("/results", cat)).toContain("Results");
  });
});
