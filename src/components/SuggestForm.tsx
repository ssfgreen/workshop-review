import { useState } from "preact/hooks";
import type { Section } from "../../shared/catalog.js";
import { useAddSuggestion } from "../api/queries.js";
import "./Suggestions.css";

const EMPTY = { title: "", description: "", evidence: "" };

export function SuggestForm({ section }: { section: Section }) {
  const add = useAddSuggestion();
  const [form, setForm] = useState(EMPTY);
  const [group, setGroup] = useState(section.groups[0]?.title ?? "New group");
  const [done, setDone] = useState(false);
  const id = (f: string) => `sg-${f}-${section.key}`;
  const set = (f: keyof typeof EMPTY) => (e: Event) => { setDone(false); setForm({ ...form, [f]: (e.currentTarget as HTMLInputElement).value }); };

  const submit = (e: Event) => {
    e.preventDefault();
    add.mutate({ section: section.key, group, ...form }, { onSuccess: () => { setForm(EMPTY); setDone(true); } });
  };

  return (
    <form class="suggest-form" onSubmit={submit}>
      <label for={id("title")}>Name of the code
        <input class="field" id={id("title")} required maxLength={120} value={form.title} onInput={set("title")} placeholder="e.g. Agent keeps a record of what worked" />
      </label>
      <label for={id("desc")}>What it means
        <textarea class="field" id={id("desc")} required maxLength={800} rows={3} value={form.description} onInput={set("description")} placeholder="One or two sentences a colleague could apply" />
      </label>
      <label for={id("group")}>Group
        <select class="field" id={id("group")} value={group} onChange={(e) => setGroup(e.currentTarget.value)}>
          {section.groups.map((g) => <option key={g.title} value={g.title}>{g.title}</option>)}
          <option value="New group">A new group</option>
        </select>
      </label>
      <label for={id("ev")}>Where you saw it (optional)
        <textarea class="field" id={id("ev")} maxLength={800} rows={2} value={form.evidence} onInput={set("evidence")} placeholder="e.g. Room 2, P07, or a quote from a sticky note" />
      </label>
      <button class="primary" type="submit" disabled={add.isPending}>Add suggestion</button>
      {done && <p class="muted-note">Added. It now appears above for everyone to vote on.</p>}
      {add.error && <p class="muted-note status-warn">{add.error.message}</p>}
    </form>
  );
}
