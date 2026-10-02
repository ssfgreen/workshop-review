import { useEffect, useRef, useState } from "preact/hooks";
import type { ReactionValue } from "../../shared/activity.js";
import { useReact } from "../api/queries.js";
import { useReview } from "../hooks/useReview.js";
import { reactionSummary } from "../lib/tally.js";
import { Icon } from "./Icon.js";
import "./ReactBar.css";

/** Thumbs up / down and a short comment on any code, piece of evidence, story or epic. */
export function ReactBar({ target, what }: { target: string; what: string }) {
  const { ix, me } = useReview();
  const react = useReact();
  const s = reactionSummary(ix, target, me);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const root = useRef<HTMLSpanElement>(null);
  const noteButton = useRef<HTMLButtonElement>(null);

  const close = (refocus: boolean) => { setOpen(false); if (refocus) noteButton.current?.focus(); };

  // While open: Esc or a click outside closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); close(true); } };
    const onClick = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) close(false); };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey, true); document.removeEventListener("click", onClick); };
  }, [open]);

  const thumb = (v: ReactionValue) =>
    react.mutate({ target, value: s.mine?.value === v ? null : v, note: s.mine?.note ?? null });

  const toggle = () => {
    if (!open) setDraft(s.mine?.note ?? "");
    setOpen(!open);
  };

  const save = () => {
    react.mutate({ target, value: s.mine?.value ?? null, note: draft.trim() || null });
    close(true);
  };

  return (
    <span class="react" ref={root}>
      <button class="rb up" type="button" aria-pressed={s.mine?.value === "up"} aria-label={`Thumbs up for this ${what}`} onClick={() => thumb("up")}>
        <Icon name="up" /><span class="c">{s.up || ""}</span>
      </button>
      <button class="rb down" type="button" aria-pressed={s.mine?.value === "down"} aria-label={`Thumbs down for this ${what}`} onClick={() => thumb("down")}>
        <Icon name="down" /><span class="c">{s.down || ""}</span>
      </button>
      <button ref={noteButton} class={`rb note${s.mine?.note ? " has" : ""}`} type="button" aria-expanded={open} aria-label={`Comments on this ${what}`} onClick={toggle}>
        <Icon name="note" /><span class="c">{s.comments || ""}</span>
      </button>
      {open && (
        <div class="react-panel" role="dialog" aria-label={`Comments on this ${what}`}>
          <div class="react-list">
            {s.others.length === 0 && <p class="muted-note">No one else has reacted yet.</p>}
            {s.others.map((o) => (
              <div class="o" key={o.personId}>
                <b>{o.name}</b>
                {o.value && <span class={`tag ${o.value}`}>{o.value === "up" ? "Thumbs up" : "Thumbs down"}</span>}
                {o.note ? `: ${o.note}` : ""}
              </div>
            ))}
          </div>
          <textarea class="field" rows={2} maxLength={400} value={draft} placeholder="A short comment (optional)"
            aria-label={`Your comment on this ${what}`} onInput={(e) => setDraft(e.currentTarget.value)} autoFocus />
          <div class="react-actions">
            <button class="primary small" type="button" onClick={save}>Save comment</button>
            <button class="link-button" type="button" onClick={() => close(true)}>Cancel</button>
          </div>
        </div>
      )}
    </span>
  );
}
