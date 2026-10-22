import type { ComponentChildren } from "preact";
import type { DisclosureControl } from "../hooks/useDisclosure.js";
import "./Disclosure.css";

/** Open all / close all for the groups and for the code cards on a page. */
export function ViewControls({ groups, codes }: { groups: DisclosureControl; codes: DisclosureControl }) {
  const pair = (label: string, c: DisclosureControl) => (
    <span class="view-pair">
      <span class="lbl">{label}</span>
      <button class="pill small" type="button" aria-pressed={c.allOpen} onClick={c.openAll}>Open all</button>
      <button class="pill small" type="button" aria-pressed={c.allClosed} onClick={c.closeAll}>Close all</button>
    </span>
  );
  return (
    <div class="filter-row view-controls" role="group" aria-label="Open and close">
      <span class="lbl">View</span>
      {pair("Groups", groups)}
      {pair("Codes", codes)}
    </div>
  );
}

/** A heading that opens and closes what follows it: a button with a chevron, inside the heading element. */
export function DisclosureButton({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: ComponentChildren }) {
  return (
    <button class="disclosure" type="button" aria-expanded={open} onClick={onToggle}>
      <span class="chev" aria-hidden="true" />
      {children}
    </button>
  );
}
