import { useState } from "preact/hooks";
import { useRename, useSession } from "../api/queries.js";
import "./Header.css";

export function Header() {
  const session = useSession();
  const rename = useRename();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const save = (e: Event) => {
    e.preventDefault();
    rename.mutate(name, { onSuccess: () => setEditing(false) });
  };

  return (
    <header class="wrap intro">
      <div class="eyebrow">ELM differentiation workshop · 1 October 2026 · code review</div>
      <h1>Which codes should we keep?</h1>
      <p>These are draft codes from the workshop, sorted by the question each came from and grouped by theme. Each one shows the evidence behind it: what someone said in a room, a sticky note from the board, or a chat message. Vote on each code and suggest any that are missing.</p>
      <div class="howto">
        <div><b>Vote</b>Keep, Unsure or Drop. You can change your vote at any time. Everyone sees the totals.</div>
        <div><b>Add a note</b>Say why, or suggest a better name or a merge with another code.</div>
        <div><b>Suggest a code</b>Use the form at the end of each question. Colleagues can vote on it too.</div>
        <div><b>React</b>Thumbs up or down on any code, piece of evidence, user story or epic. The speech-bubble icon adds a short comment.</div>
      </div>
      <p class="muted-note">Participants: P04, P06 and P07 also took part in the earlier interviews; W01 to W09 were new. Facilitators are not quoted. Sticky notes marked "typed by facilitator" were written down by a facilitator for that participant.</p>
      {session.data && !editing && (
        <p class="who-line">Signed in as <b>{session.data.name}</b> · <button class="link-button" type="button" onClick={() => { setName(session.data!.name); setEditing(true); }}>Change name</button></p>
      )}
      {editing && (
        <form class="rename" onSubmit={save}>
          <label for="rename-name">Your name</label>
          <input class="field" id="rename-name" maxLength={60} value={name} onInput={(e) => setName(e.currentTarget.value)} autoFocus />
          <button class="primary" type="submit" disabled={rename.isPending}>Save</button>
          <button class="link-button" type="button" onClick={() => setEditing(false)}>Cancel</button>
          {rename.error && <span class="muted-note status-warn">{rename.error.message}</span>}
        </form>
      )}
    </header>
  );
}
