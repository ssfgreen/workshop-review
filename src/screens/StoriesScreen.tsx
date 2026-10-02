import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import type { Component, Story, StoryKind } from "../../shared/catalog.js";
import { epicKey } from "../../shared/keys.js";
import { PeekDrawer } from "../components/PeekDrawer.js";
import { ReactBar } from "../components/ReactBar.js";
import { StoryLine } from "../components/StoryLine.js";
import { useFilters } from "../hooks/useFilters.js";
import { useReview } from "../hooks/useReview.js";
import type { PlacedCode } from "../lib/catalog.js";
import { filtersToQuery, inRoom } from "../lib/filters.js";
import { COMP_LABEL, KIND_LABEL, sectionName } from "../lib/labels.js";
import { codeKey } from "../../shared/keys.js";
import { reactionSummary } from "../lib/tally.js";
import "./screens.css";

const KINDS: StoryKind[] = ["feature", "setting", "guardrail"];
const COMPS: Component[] = ["data", "skill", "tool", "deployment"];

export function StoriesScreen() {
  const { catalog, codes, ix, me } = useReview();
  const [f, setF] = useFilters();
  const { route } = useLocation();
  const [peek, setPeek] = useState<string | null>(null);

  const all = codes.flatMap((c) => c.stories.map((s, i) => ({ s, i, c })));
  const keep = (s: Story) => (f.kind === "all" || s.kind === f.kind) && (f.comp === "all" || s.components.includes(f.comp));
  // How colleagues rate the code a story comes from.
  const codeRating = (c: PlacedCode) => { const r = reactionSummary(ix, codeKey(c.id), me); return `Code: ${r.up} up · ${r.down} down`; };

  const row = (label: string, options: [string, string][], current: string, pick: (k: string) => void) => (
    <div class="filter-row" role="group" aria-label={label}>
      <span class="lbl">{label}</span>
      {options.map(([k, text]) => <button key={k} class="pill" type="button" aria-pressed={current === k} onClick={() => pick(k)}>{text}</button>)}
    </div>
  );
  const count = (pred: (s: Story) => boolean) => all.filter(({ s }) => pred(s)).length;

  return (
    <main class="wrap">
      <section class="section-head">
        <h2>User stories for the tool</h2>
        <p class="prompt">Draft stories a differentiation tool could be built against, one to three per code. Features are things the tool does, settings are things a teacher or school configures, and guardrails are things it must avoid or check. Each story is tagged with the parts of the system that would carry it (the shaded tag is the main one) and with its epic. Click a code's name to see it with its evidence.</p>
        <ul class="comp-key">{COMPS.map((k) => <li key={k}><span class="comp-chip main">{COMP_LABEL[k]}</span> {catalog.component_definitions[k] ?? ""}</li>)}</ul>
        {row("Organise by", [["epic", "Epic"], ["question", "Question"]], f.org, (k) => setF({ org: k as "question" | "epic" }))}
        {row("Kind", [["all", `All (${all.length})`], ...KINDS.map((k) => [k, `${KIND_LABEL[k]}s (${count((s) => s.kind === k)})`] as [string, string])], f.kind, (k) => setF({ kind: k as StoryKind | "all" }))}
        {row("Component", [["all", "All"], ...COMPS.map((k) => [k, `${COMP_LABEL[k]} (${count((s) => s.components.includes(k))})`] as [string, string])], f.comp, (k) => setF({ comp: k as Component | "all" }))}
      </section>

      <div class="backlog">
        {f.org === "epic"
          ? catalog.epics.map((epic) => {
              const items = all.filter(({ s, c }) => s.epics.includes(epic.id) && keep(s) && inRoom(c, f.room));
              if (!items.length) return null;
              return (
                <section key={epic.id}>
                  <div class="epic-head"><h3>{epic.title} <span class="mono">{items.length} stor{items.length === 1 ? "y" : "ies"}</span></h3><ReactBar target={epicKey(epic.id)} what="epic" /></div>
                  <p class="epic-desc">{epic.description}</p>
                  <ul class="story-list">{items.map(({ s, i, c }) => <StoryLine key={`${c.id}:${i}`} story={s} code={c} index={i} showSource onPeek={setPeek} extra={codeRating(c)} />)}</ul>
                </section>
              );
            })
          : catalog.sections.map((sec) => {
              const secCodes = codes.filter((c) => c.sectionKey === sec.key && inRoom(c, f.room) && c.stories.some(keep));
              if (!secCodes.length) return null;
              return (
                <section key={sec.key}>
                  <h3>{sectionName(sec.key, catalog.sections)}</h3>
                  {secCodes.map((c) => (
                    <div class="code-block" key={c.id}>
                      <div><button class="peek strong" type="button" onClick={() => setPeek(c.id)}>{c.title}</button> <span class="mono">{codeRating(c)}</span></div>
                      <ul class="story-list">{c.stories.map((s, i) => (keep(s) ? <StoryLine key={i} story={s} code={c} index={i} /> : null))}</ul>
                    </div>
                  ))}
                </section>
              );
            })}
        {!all.some(({ s, c }) => keep(s) && inRoom(c, f.room)) && <p class="muted-note">No stories match these filters.</p>}
      </div>

      {peek && (
        <PeekDrawer codeId={peek} onClose={() => setPeek(null)} onOpenInQuestion={(id) => {
          const c = codes.find((x) => x.id === id)!;
          setPeek(null);
          // Keep the room only if this code drew on it, and show rated codes too, so the card is on the page.
          const qs = filtersToQuery({ ...f, room: inRoom(c, f.room) ? f.room : "all", unrated: false });
          route(`/q/${c.sectionKey}${qs}#code-${id}`);
        }} />
      )}
    </main>
  );
}
