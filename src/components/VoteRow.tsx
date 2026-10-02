import { useEffect, useRef, useState } from "preact/hooks";
import { VOTE_VALUES, type VoteValue } from "../../shared/activity.js";
import { useVote } from "../api/queries.js";
import { useReview } from "../hooks/useReview.js";
import { VOTE_LABEL } from "../lib/labels.js";
import { myVote, otherVoteNotes, voteTally } from "../lib/tally.js";
import "./VoteRow.css";

const NOTE_DELAY_MS = 900;

/** Keep / Unsure / Drop with live totals, my note (saved after a pause) and others' notes. */
export function VoteRow({ target }: { target: string }) {
  const { ix, me } = useReview();
  const vote = useVote();
  const mine = myVote(ix, target, me);
  const tally = voteTally(ix, target);
  const [note, setNote] = useState(mine?.note ?? "");
  const typing = useRef(false);

  // Follow the saved note unless the person is mid-edit.
  useEffect(() => { if (!typing.current) setNote(mine?.note ?? ""); }, [mine?.note]);

  useEffect(() => {
    if (!typing.current) return;
    const t = setTimeout(() => {
      typing.current = false;
      if ((note.trim() || null) !== (mine?.note ?? null)) vote.mutate({ target, value: mine?.value ?? null, note: note.trim() || null });
    }, NOTE_DELAY_MS);
    return () => clearTimeout(t);
  }, [note]);

  const choose = (v: VoteValue) => vote.mutate({ target, value: mine?.value === v ? null : v, note: mine?.note ?? null });

  return (
    <div class="vote">
      <div class="vote-buttons">
        {VOTE_VALUES.map((v) => (
          <button key={v} class={`vb ${v}`} type="button" aria-pressed={mine?.value === v} onClick={() => choose(v)}>
            {VOTE_LABEL[v]} <span class="c">{tally[v]}</span>
          </button>
        ))}
      </div>
      <textarea class="field note-input" rows={1} value={note} aria-label="Your note on this code"
        placeholder="Add a note (optional): why, a better name, or a merge"
        onInput={(e) => { typing.current = true; setNote(e.currentTarget.value); }} />
      {otherVoteNotes(ix, target, me).map((n) => (
        <div class="vote-note" key={n.personId}>
          <b>{n.name}</b>{n.value && <span class={`tag ${n.value}`}>{VOTE_LABEL[n.value as VoteValue]}</span>}: {n.note}
        </div>
      ))}
    </div>
  );
}
