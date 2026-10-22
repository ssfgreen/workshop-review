import { useEffect } from "preact/hooks";
import { useRoute } from "preact-iso";
import { CodeCard } from "../components/CodeCard.js";
import { DisclosureButton, ViewControls } from "../components/Disclosure.js";
import { SuggestForm } from "../components/SuggestForm.js";
import { SuggestionCard } from "../components/SuggestionCard.js";
import { useDisclosure } from "../hooks/useDisclosure.js";
import { useFilters } from "../hooks/useFilters.js";
import { useReview } from "../hooks/useReview.js";
import { inRoom } from "../lib/filters.js";
import { questionNumber } from "../lib/labels.js";
import { codeKey, suggestionKey } from "../../shared/keys.js";
import { myThumb } from "../lib/tally.js";
import "./screens.css";

export function QuestionScreen() {
  const { params } = useRoute();
  const { catalog, codes, activity, ix, me } = useReview();
  const [f] = useFilters();
  const groupsOpen = useDisclosure();
  const codesOpen = useDisclosure();
  const section = catalog.sections.find((s) => s.key === params.section);

  // Arriving from "Open in its question" (#code-ID): scroll the card into view and outline it.
  useEffect(() => {
    const id = location.hash.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    el.classList.add("flash");
    const t = setTimeout(() => el.classList.remove("flash"), 1600);
    return () => clearTimeout(t);
  }, [params.section]);

  if (!section) return <main class="wrap"><p class="muted-note">That question doesn't exist. Pick one from the tabs above.</p></main>;
  const qn = questionNumber(section.key);
  const question = section.question.charAt(0).toLowerCase() + section.question.slice(1);
  const lead = section.key === "supporting_teaching"
    ? "One to three tasks you would hand to an agent, with a line about why, placed in the column that fits best:"
    : section.columns.length ? null : section.prompt;
  // With "only codes I haven't rated" on, hide anything I've given a thumb.
  const visible = (target: string) => !(f.unrated && myThumb(ix, target, me));
  const anyInRoom = codes.some((c) => c.sectionKey === section.key && inRoom(c, f.room));
  const suggestions = activity.suggestions.filter((s) => s.section === section.key && visible(suggestionKey(s.id)))
    .sort((a, b) => a.created.localeCompare(b.created));

  return (
    <main class="wrap">
      <section class="section-head">
        <h2>{qn ? `${qn} · ` : ""}{section.label}: {question}</h2>
        {lead && <p class="prompt">{lead}</p>}
        {section.columns.length > 0 && (
          <ul class="columns">{section.columns.map((c) => <li key={c.column_key}>{/^[A-C]$/.test(c.column_key) ? `${c.column_key}: ` : ""}{c.column_label}</li>)}</ul>
        )}
        {f.room !== "all" && <p class="room-banner">Showing the codes that drew on {f.room}, with {f.room}'s evidence first. Choose "All rooms" in the bar above to see every code.</p>}
        <ViewControls groups={groupsOpen} codes={codesOpen} />
      </section>
      {!anyInRoom && <p class="muted-note">No code in this question drew on {f.room}. Choose another room or "All rooms".</p>}
      {section.groups.map((g) => {
        const placed = codes.filter((c) => c.sectionKey === section.key && c.group === g.title && inRoom(c, f.room));
        if (!placed.length) return null;
        const cards = placed.filter((c) => visible(codeKey(c.id)));
        const gid = `${section.key}:${g.title}`;
        const open = groupsOpen.isOpen(gid);
        return (
          <section class="group" key={g.title}>
            <h3>
              <DisclosureButton open={open} onToggle={() => groupsOpen.toggle(gid)}>{g.title}</DisclosureButton>
              <span class="n">{f.room === "all" ? `${g.codes.length} code${g.codes.length > 1 ? "s" : ""}` : `${placed.length} of ${g.codes.length} codes`}</span>
            </h3>
            {open && cards.length === 0 && <p class="muted-note">You've rated every code in this group.</p>}
            {open && cards.map((c) => <CodeCard key={c.id} code={c} room={f.room} open={codesOpen.isOpen(c.id)} onToggle={() => codesOpen.toggle(c.id)} />)}
          </section>
        );
      })}
      <section class="group">
        <h3>Suggested codes for {section.label}</h3>
        {suggestions.length === 0 && <p class="muted-note">No suggestions yet. Add one with the form below.</p>}
        {suggestions.map((s) => <SuggestionCard key={s.id} s={s} />)}
        <SuggestForm section={section} />
      </section>
    </main>
  );
}
