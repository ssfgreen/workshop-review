import { useState } from "preact/hooks";
import { useFilters } from "../hooks/useFilters.js";
import { useReview } from "../hooks/useReview.js";
import type { PlacedCode } from "../lib/catalog.js";
import { filtersToQuery } from "../lib/filters.js";
import { sectionName } from "../lib/labels.js";
import { groupGloss, placementsOf } from "../lib/structures.js";
import "./StructureTabs.css";

interface Tab {
  id: string;
  /** The structure's title, shown on hover. */
  title: string;
  /** "A4 · Here is what you can do". */
  where: string;
  gloss: string;
  href: string;
}

/**
 * Small tabs showing where a code sits in each way of grouping the codes: its question and
 * reading group (Q) and each thematic structure (A, C, E, F). The active tab opens on whichever
 * view the card is shown in; the others are a click away, and each links to its group.
 */
export function StructureTabs({ code: c, active = "Q" }: { code: PlacedCode; active?: string }) {
  const { catalog } = useReview();
  const [f] = useFilters();
  const [open, setOpen] = useState(active);
  if (!catalog.structures.length) return null;

  const tabs: Tab[] = [
    {
      id: "Q", title: "The question it came from",
      where: `${sectionName(c.sectionKey, catalog.sections)} · ${c.group}`, gloss: "",
      href: `/q/${c.sectionKey}${filtersToQuery({ ...f, group: "all", unrated: false })}#code-${c.id}`,
    },
    ...placementsOf(catalog, c.id).map(({ structure, group, sublabel, remark }) => ({
      id: structure.id, title: `${structure.id}. ${structure.title}`,
      where: `${group.id} · ${group.title}${sublabel ? ` › ${sublabel}` : ""}`,
      gloss: [groupGloss(group), remark].filter(Boolean).join(" · "),
      href: `/s/${structure.id}${filtersToQuery({ ...f, group: group.id, unrated: false })}#code-${c.id}`,
    })),
  ];
  const current = tabs.find((t) => t.id === open) ?? tabs[0];

  return (
    <div class="stabs" aria-label="Where this code sits">
      <div class="stabs-row" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} class="stab" type="button" role="tab" aria-selected={t.id === current.id} title={t.title} onClick={() => setOpen(t.id)}>{t.id}</button>
        ))}
      </div>
      <div class="stabs-panel" role="tabpanel">
        <span class="where">{current.where}</span>
        {current.gloss && <span class="gloss">{current.gloss}</span>}
        {current.id !== active && <a class="go" href={current.href}>See group</a>}
      </div>
    </div>
  );
}
