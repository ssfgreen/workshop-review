import { useEffect } from "preact/hooks";
import { useRoute } from "preact-iso";
import type { StructureGroup } from "../../shared/catalog.js";
import { codeKey } from "../../shared/keys.js";
import { CodeCard } from "../components/CodeCard.js";
import { DisclosureButton, ViewControls } from "../components/Disclosure.js";
import { useDisclosure } from "../hooks/useDisclosure.js";
import { useFilters } from "../hooks/useFilters.js";
import { useReview } from "../hooks/useReview.js";
import type { PlacedCode } from "../lib/catalog.js";
import { filtersToQuery, inRoom } from "../lib/filters.js";
import { groupGloss } from "../lib/structures.js";
import { myThumb } from "../lib/tally.js";
import "./screens.css";

/**
 * The same codes grouped by one thematic structure (A, C, E or F) instead of by question, with a
 * filter down to one of its groups. Ratings are the same ratings: a thumb here is a thumb on the code.
 */
export function StructureScreen() {
  const { params } = useRoute();
  const { catalog, codes, ix, me } = useReview();
  const [f, setF] = useFilters();
  const groupsOpen = useDisclosure();
  const codesOpen = useDisclosure();
  const structure = catalog.structures.find((s) => s.id === params.structure);

  // Arriving from a card's "See group" link (#code-ID): scroll the card into view and outline it.
  useEffect(() => {
    const id = location.hash.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    el.classList.add("flash");
    const t = setTimeout(() => el.classList.remove("flash"), 1600);
    return () => clearTimeout(t);
  }, [params.structure, f.group]);

  if (!structure) {
    return <main class="wrap"><p class="muted-note">{catalog.structures.length ? "No structure with that letter. Pick one from the bar above." : "This data has no thematic structures yet; re-export the bundle to add them."}</p></main>;
  }
  const byId = new Map(codes.map((c) => [c.id, c]));
  const visible = (c: PlacedCode) => !(f.unrated && myThumb(ix, codeKey(c.id), me));
  const inGroup = (g: StructureGroup) => g.codes.map((id) => byId.get(id)).filter((c): c is PlacedCode => !!c && inRoom(c, f.room));
  const groups = structure.groups.filter((g) => f.group === "all" || g.id === f.group);
  const total = structure.groups.reduce((n, g) => n + inGroup(g).length, 0);
  const switchTo = (id: string) => `/s/${id}${filtersToQuery({ ...f, group: "all" })}`;

  return (
    <main class="wrap">
      <section class="section-head">
        <div class="filter-row" role="group" aria-label="Structure">
          <span class="lbl">Structure</span>
          {catalog.structures.map((s) => (
            <a key={s.id} class="pill tab" href={switchTo(s.id)} aria-current={s.id === structure.id ? "page" : undefined}>{s.id} · {s.title}</a>
          ))}
        </div>
        <h2>{structure.id}. {structure.title}{structure.purpose ? <span class="purpose"> ({structure.purpose})</span> : null}</h2>
        <p class="prompt">{structure.intro} Every code appears once. The same codes, the same ratings: this is another way of reading them, not a second codebook.</p>
        <div class="filter-row" role="group" aria-label="Group">
          <span class="lbl">Group</span>
          <button class="pill small" type="button" aria-pressed={f.group === "all"} onClick={() => setF({ group: "all" })}>All ({total})</button>
          {structure.groups.map((g) => (
            <button key={g.id} class="pill small" type="button" aria-pressed={f.group === g.id} title={g.title} onClick={() => setF({ group: g.id })}>{g.id} <span class="n">{inGroup(g).length}</span></button>
          ))}
        </div>
        {f.room !== "all" && <p class="room-banner">Showing the codes that drew on {f.room}, with {f.room}'s evidence first. Choose "All rooms" in the bar above to see every code.</p>}
        <ViewControls groups={groupsOpen} codes={codesOpen} />
      </section>
      {total === 0 && <p class="muted-note">No code in this structure drew on {f.room}. Choose another room or "All rooms".</p>}
      {groups.map((g) => {
        const placed = inGroup(g);
        if (!placed.length) return null;
        const cards = placed.filter(visible);
        const gloss = groupGloss(g);
        const open = groupsOpen.isOpen(g.id);
        let lastLabel: string | undefined;
        return (
          <section class="group" key={g.id} id={`group-${g.id}`}>
            <h3>
              <DisclosureButton open={open} onToggle={() => groupsOpen.toggle(g.id)}>{g.id} · {g.title}</DisclosureButton>
              <span class="n">{f.room === "all" ? `${g.codes.length} code${g.codes.length > 1 ? "s" : ""}` : `${placed.length} of ${g.codes.length} codes`}</span>
            </h3>
            {gloss && <p class="prompt gloss">{gloss}</p>}
            {open && g.note && <details class="def group-note"><summary>Notes on this group</summary><p>{g.note}</p></details>}
            {open && cards.length === 0 && <p class="muted-note">You've rated every code in this group.</p>}
            {open && cards.map((c) => {
              const label = g.sublabels[c.id];
              const heading = label && label !== lastLabel ? <h4 class="sublabel">{label}</h4> : null;
              lastLabel = label ?? lastLabel;
              return (
                <div key={c.id} class="placed">
                  {heading}
                  {g.remarks[c.id] && <p class="muted-note remark">{g.remarks[c.id]}</p>}
                  <CodeCard code={c} room={f.room} structure={structure.id} open={codesOpen.isOpen(c.id)} onToggle={() => codesOpen.toggle(c.id)} />
                </div>
              );
            })}
          </section>
        );
      })}
      {f.group === "all" && structure.notes && (
        <section class="group"><h3>Notes on this structure</h3><p class="prompt">{structure.notes}</p></section>
      )}
    </main>
  );
}
