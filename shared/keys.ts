// Reaction targets: the thing a thumbs up / down or comment is about.
// A story is keyed by its code and its position in that code's list, so reordering stories in the
// research repo would move reactions: append new stories instead.

export const codeKey = (codeId: string) => `code:${codeId}`;
export const evidenceKey = (codeId: string, ref: string) => `ev:${codeId}:${ref}`;
export const storyKey = (codeId: string, index: number) => `story:${codeId}:${index}`;
export const epicKey = (epicId: string) => `epic:${epicId}`;
export const suggestionKey = (suggestionId: string) => `suggestion:${suggestionId}`;

const CODE_ID = /^[A-Z][A-Z0-9_]*$/;
const EPIC_ID = /^[a-z][a-z0-9_-]*$/;
const SUGGESTION_ID = /^[A-Za-z0-9_-]{6,40}$/;
// Turn ids are PL/R1/R2/R3-nnnn, chat messages CH-nnn, sticky notes note:<uuid>.
const REF = /^(?:[A-Z][A-Z0-9]-\d{4}|CH-\d{3}|note:[0-9a-f-]{36})$/;

/** True for any reaction target the catalogue or a suggestion could have (format only, not existence). */
export function isReactionTarget(key: string): boolean {
  const [kind, ...rest] = key.split(":");
  if (kind === "code") return rest.length === 1 && CODE_ID.test(rest[0]);
  if (kind === "epic") return rest.length === 1 && EPIC_ID.test(rest[0]);
  if (kind === "suggestion") return rest.length === 1 && SUGGESTION_ID.test(rest[0]);
  if (kind === "story") return rest.length === 2 && CODE_ID.test(rest[0]) && /^\d{1,2}$/.test(rest[1]);
  if (kind === "ev") return rest.length >= 2 && CODE_ID.test(rest[0]) && REF.test(rest.slice(1).join(":"));
  return false;
}
