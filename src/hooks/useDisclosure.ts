import { useState } from "preact/hooks";
import { allClosed, allOpen, isOpen, isUniform, toggled, type Disclosure } from "../lib/disclosure.js";

export interface DisclosureControl {
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  openAll: () => void;
  closeAll: () => void;
  /** Every item open, or every item closed: the matching control shows as pressed. */
  allOpen: boolean;
  allClosed: boolean;
}

/** Open / closed state for one level of headings (groups, or code cards), owned by the screen. */
export function useDisclosure(initiallyOpen = true): DisclosureControl {
  const [d, setD] = useState<Disclosure>(initiallyOpen ? allOpen() : allClosed());
  return {
    isOpen: (id) => isOpen(d, id),
    toggle: (id) => setD((x) => toggled(x, id)),
    openAll: () => setD(allOpen()),
    closeAll: () => setD(allClosed()),
    allOpen: isUniform(d, true),
    allClosed: isUniform(d, false),
  };
}
