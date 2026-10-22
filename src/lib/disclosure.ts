// Which items in a list are open, kept as a default for all plus the exceptions, so "open all"
// and "close all" are one state each and any single item can still be toggled the other way.

export interface Disclosure {
  /** The default for every item not listed in `except`. */
  open: boolean;
  except: ReadonlySet<string>;
}

export const allOpen = (): Disclosure => ({ open: true, except: new Set() });
export const allClosed = (): Disclosure => ({ open: false, except: new Set() });

export const isOpen = (d: Disclosure, id: string) => d.open !== d.except.has(id);

export function toggled(d: Disclosure, id: string): Disclosure {
  const except = new Set(d.except);
  if (except.has(id)) except.delete(id); else except.add(id);
  return { open: d.open, except };
}

/** True when every item is in the given state, so the matching "all" control can show as pressed. */
export const isUniform = (d: Disclosure, open: boolean) => d.open === open && d.except.size === 0;
