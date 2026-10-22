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
  reactions: [
    { personId: "b", target: "code:KNOW_THE_CLASS", value: "up", note: "Strong" },
    { personId: "me", target: "code:KNOW_THE_CLASS", value: "down", note: null },
  ],
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

  it("question screen: code, evidence, thumbs and suggestions; no Keep/Unsure/Drop", () => {
    const html = render("/q/q1_grounding", cat);
    expect(html).toContain("Q1 · Grounding: what should it know?");
    expect(html).toContain("Know the class");
    expect(html).toContain("<mark>It needs to know the year group.</mark>");
    expect(html).toContain('class="card rated-down"'); // my own thumb colours the card
    expect(html).toContain('aria-label="Thumbs up for this code"');
    expect(html).toContain('aria-label="Thumbs up for this suggested code"');
    expect(html).toContain("A suggested code");
    expect(html).toContain("Remove my suggestion");
    expect(html).toContain("You've rated 1 of 2 codes");
    expect(html).not.toMatch(/>Keep\b|>Unsure\b|>Drop\b/);
  });

  it("only-unrated filter hides codes I've rated", () => {
    expect(render("/q/q1_grounding?unrated=1", cat)).toContain("You've rated every code in this group.");
  });

  it("room filter keeps only codes with that room's evidence", () => {
    const html = render("/q/q1_grounding?room=Room%203", cat);
    expect(html).toContain("No code in this question drew on Room 3");
    expect(html).not.toContain("Know the class</button></h4>");
  });

  it("stories screen opens by epic, with the question view one click away", () => {
    const byEpic = render("/stories", cat);
    expect(byEpic).toContain("Adapt my resource");
    expect(byEpic).toContain("From: ");
    expect(byEpic).toContain("Code: 1 up · 1 down");
    const filtered = render("/stories?comp=data", cat);
    expect(filtered).not.toContain("output I can check at a glance"); // a skill-only story is filtered out
    const byQuestion = render("/stories?org=question", cat);
    expect(byQuestion).toContain("I want to set up a class once");
    expect(byQuestion).not.toContain("From: ");
  });

  it("every card carries small tabs for the question and each structure, opening on the view it is shown in", () => {
    const onQuestion = render("/q/q1_grounding", cat);
    expect(onQuestion).toContain('aria-label="Where this code sits"');
    expect(onQuestion).toMatch(/role="tab" aria-selected="true"[^>]*>Q</);
    expect(onQuestion).toContain("Q1 Grounding · Knowing the class");
    expect(onQuestion).toContain(`title="A. The teacher's terms"`);
    const onStructure = render("/s/A", cat);
    expect(onStructure).toMatch(/role="tab" aria-selected="true"[^>]*>A</);
    expect(onStructure).toContain("A1 · Tell it what it needs");
    expect(onStructure).toContain('class="gloss">context only the teacher can supply<');
  });

  it("structure screen groups every code by one structure and filters to a group", () => {
    const all = render("/s/A", cat);
    expect(all).toContain("A. The teacher's terms");
    expect(all).toContain("A1 · Tell it what it needs");
    expect(all).toContain("A8 · Make checking cheap");
    expect(all).toContain("Know the class</button></h4>");
    expect(all).toContain("Check quickly</button></h4>");
    expect(all).toContain("A8 is the checking cluster."); // the structure's notes, shown with every group
    expect(all).toContain('aria-current="page"'); // the Structures tab in the bar, and the A pill
    const one = render("/s/A?g=A8", cat);
    expect(one).toContain("Check quickly</button></h4>");
    expect(one).not.toContain("Know the class</button></h4>");
    expect(one).not.toContain("A8 is the checking cluster.");
    const build = render("/s/E", cat);
    expect(build).toContain("T2"); // the tier gloss
    expect(build).toContain('class="sublabel">Metrics'); // a sub-heading within a group
    expect(build).toContain("Build notes: a class profile schema.");
    expect(render("/s/Z", cat)).toContain("No structure with that letter");
  });

  it("groups and cards are disclosures, open by default, with open-all and close-all for each level", () => {
    for (const url of ["/q/q1_grounding", "/s/A"]) {
      const html = render(url, cat);
      expect(html).toContain('aria-label="Open and close"');
      expect(html).toMatch(/<h3><button type="button" aria-expanded="true" class="disclosure"/); // a group heading
      expect(html).toMatch(/<h4 class="code-title"><button type="button" aria-expanded="true" class="disclosure"/); // a card
      expect((html.match(/aria-pressed="true"[^>]*>Open all</g) ?? []).length).toBe(2); // groups and codes both all open
      expect(html).toContain("Close all");
    }
  });

  it("results screen counts thumbs per code and suggestion", () => {
    const html = render("/results", cat);
    expect(html).toContain("2 people have rated codes so far");
    expect(html).toContain("Suggested · Knowing the class");
    expect(html).toContain("<th>Up</th><th>Down</th>");
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
    for (const st of cat.structures) {
      const html = render(`/s/${st.id}`, cat);
      for (const g of st.groups) expect(html).toContain(`${g.id} · ${g.title}`);
    }
  });
});
