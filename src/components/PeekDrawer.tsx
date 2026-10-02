import { useEffect, useRef } from "preact/hooks";
import { useReview } from "../hooks/useReview.js";
import { sectionName } from "../lib/labels.js";
import { CodeCard } from "./CodeCard.js";
import "./PeekDrawer.css";

interface Props {
  codeId: string;
  onClose: () => void;
  onOpenInQuestion: (codeId: string) => void;
}

/** A side panel showing one code and its evidence, opened from the stories page. */
export function PeekDrawer({ codeId, onClose, onOpenInQuestion }: Props) {
  const { codes, catalog } = useReview();
  const code = codes.find((c) => c.id === codeId);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); returnTo?.focus?.(); };
  }, []);

  if (!code) return null;
  return (
    <>
      <div class="drawer-backdrop" onClick={onClose} />
      <aside class="drawer" role="dialog" aria-modal="false" aria-labelledby="drawer-title">
        <div class="drawer-head">
          <span class="eyebrow" id="drawer-title">Code and its evidence</span>
          <button class="link-button" type="button" onClick={() => onOpenInQuestion(code.id)}>Open in its question</button>
          <button class="drawer-close" type="button" ref={closeRef} onClick={onClose}>Close</button>
        </div>
        <div class="drawer-body">
          <p class="muted-note">{sectionName(code.sectionKey, catalog.sections)} · {code.group}</p>
          <CodeCard code={code} />
        </div>
      </aside>
    </>
  );
}
