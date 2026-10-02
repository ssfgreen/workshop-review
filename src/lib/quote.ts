// Shows a quote inside the sentences around it rather than as a bare fragment.

export const SHORT_TURN = 420; // turns up to this length are shown whole
const REACH = 170; // how far past the quote to extend to the next sentence boundary

export function sentenceStart(text: string, i: number): number {
  const ends = [...text.slice(0, i).matchAll(/[.!?]\s+/g)];
  const last = ends[ends.length - 1];
  return last ? last.index! + last[0].length : 0;
}

export function sentenceEnd(text: string, i: number): number {
  const m = /[.!?](\s|$)/.exec(text.slice(i));
  return m ? i + m.index + 1 : text.length;
}

/** The [start, end) part of a turn to show by default: the quote and its neighbouring sentences. */
export function contextWindow(text: string, span: [number, number] | null | undefined): [number, number] {
  if (text.length <= SHORT_TURN) return [0, text.length];
  if (!span) {
    const cut = text.lastIndexOf(" ", 320);
    return [0, cut > 0 ? cut : 320];
  }
  let a = sentenceStart(text, span[0]);
  if (span[0] - a < 40 && a > 0) {
    const a2 = sentenceStart(text, a - 1);
    if (span[0] - a2 <= REACH) a = a2;
  }
  let b = sentenceEnd(text, span[1]);
  if (b - span[1] < 40 && b < text.length) {
    const b2 = sentenceEnd(text, b + 1);
    if (b2 - span[1] <= REACH) b = b2;
  }
  return [a, b];
}

export interface QuoteParts {
  lead: boolean; // text was cut before
  before: string;
  mark: string; // the highlighted quote ("" when none)
  after: string;
  trail: boolean; // text was cut after
}

/** Split a turn into the parts to render for a given window. */
export function quoteParts(text: string, span: [number, number] | null | undefined, win: [number, number]): QuoteParts {
  const [a, b] = win;
  if (span && span[0] >= a && span[1] <= b) {
    return { lead: a > 0, before: text.slice(a, span[0]), mark: text.slice(span[0], span[1]), after: text.slice(span[1], b), trail: b < text.length };
  }
  return { lead: a > 0, before: text.slice(a, b), mark: "", after: "", trail: b < text.length };
}
