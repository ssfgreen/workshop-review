import type { Story } from "../../shared/catalog.js";
import { storyKey } from "../../shared/keys.js";
import { useReview } from "../hooks/useReview.js";
import { COMP_LABEL, KIND_LABEL, sectionName } from "../lib/labels.js";
import type { PlacedCode } from "../lib/catalog.js";
import { ReactBar } from "./ReactBar.js";
import "./StoryLine.css";

interface Props {
  story: Story;
  code: PlacedCode;
  index: number;
  /** In the epic view, show where the story came from (with a peek link) instead of its epics. */
  showSource?: boolean;
  onPeek?: (codeId: string) => void;
  extra?: string;
}

export function StoryLine({ story: s, code, index, showSource, onPeek, extra }: Props) {
  const { catalog } = useReview();
  const epicTitle = (id: string) => catalog.epics.find((e) => e.id === id);
  return (
    <li class="story">
      <span class={`kind-chip ${s.kind}`}>{KIND_LABEL[s.kind]}</span>
      <span class="story-body">
        <span>As a <b>{s.as}</b>, I want {s.want}, so that {s.so_that}.</span>
        <span class="tags">
          {s.components.map((c, i) => (
            <span key={c} class={`comp-chip${i === 0 ? " main" : ""}`} title={catalog.component_definitions[c] ?? ""}>{COMP_LABEL[c]}</span>
          ))}
          {!showSource && s.epics.map((id) => (
            <span key={id} class="epic-chip" title={epicTitle(id)?.description ?? ""}>{epicTitle(id)?.title ?? id}</span>
          ))}
          <ReactBar target={storyKey(code.id, index)} what="story" />
        </span>
        {showSource && (
          <span class="story-source">
            From: {onPeek ? <button class="peek" type="button" onClick={() => onPeek(code.id)}>{code.title}</button> : code.title}
            {` (${sectionName(code.sectionKey, catalog.sections)})`}{extra ? ` · ${extra}` : ""}
          </span>
        )}
      </span>
    </li>
  );
}
