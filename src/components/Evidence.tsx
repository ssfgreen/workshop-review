import { useState } from "preact/hooks";
import type { Evidence } from "../../shared/catalog.js";
import { evidenceKey } from "../../shared/keys.js";
import { useReview } from "../hooks/useReview.js";
import { sectionName } from "../lib/labels.js";
import { contextWindow, quoteParts } from "../lib/quote.js";
import { ReactBar } from "./ReactBar.js";
import "./Evidence.css";

const KIND = { turn: "Said in discussion", note: "Sticky note", chat: "Chat" } as const;

/** One piece of evidence for a code: a transcript turn, sticky note or chat message. */
export function EvidenceItem({ e, codeId }: { e: Evidence; codeId: string }) {
  const { catalog } = useReview();
  const head = (
    <div class="who">
      <b>{e.room}</b><b>{e.who}</b><span class="kind">{KIND[e.kind]}</span><span>· {sectionName(e.section, catalog.sections)}</span>
      <ReactBar target={evidenceKey(codeId, e.ref)} what="piece of evidence" />
    </div>
  );
  if (e.kind === "turn") return <TurnQuote e={e} head={head} />;
  return (
    <div class={`ev ${e.kind}`}>
      {head}
      {e.kind === "note" && <div class="column">Under: {e.column}{e.scribed ? " (typed by facilitator)" : ""}</div>}
      <p class="text">{e.text}</p>
    </div>
  );
}

/** A quote shown in the sentences around it, with the whole turn and the turn before on request. */
function TurnQuote({ e, head }: { e: Evidence; head: preact.JSX.Element }) {
  const [whole, setWhole] = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const win = contextWindow(e.text, e.span);
  const cut = win[0] > 0 || win[1] < e.text.length;
  const p = quoteParts(e.text, e.span, whole ? [0, e.text.length] : win);
  return (
    <div class={`ev turn${e.span ? " has-mark" : ""}`}>
      {head}
      {e.prev && showPrev && <div class="prev"><span class="kind">Before this, {e.prev.who}: </span>{e.prev.text}</div>}
      <p class="text">{p.lead && "… "}{p.before}{p.mark && <mark>{p.mark}</mark>}{p.after}{p.trail && " …"}</p>
      {(cut || e.prev) && (
        <div class="ev-tools">
          {cut && <button class="link-button" type="button" aria-expanded={whole} onClick={() => setWhole(!whole)}>{whole ? "Show less" : "Show whole turn"}</button>}
          {e.prev && <button class="link-button" type="button" aria-expanded={showPrev} onClick={() => setShowPrev(!showPrev)}>{showPrev ? "Hide what came before" : "Show what came before"}</button>}
        </div>
      )}
    </div>
  );
}
