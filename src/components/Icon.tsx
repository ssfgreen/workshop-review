const THUMB = "M7 10v10H4V10h3zm2 10h8.2a2 2 0 0 0 2-1.6l1.3-6A2 2 0 0 0 18.5 10H14V6a2 2 0 0 0-2-2l-3 6v10z";

export function Icon({ name }: { name: "up" | "down" | "note" }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
      {name === "note" ? <path d="M4 5h16v11H9l-5 4V5z" /> : <path d={THUMB} transform={name === "down" ? "rotate(180 12 12)" : undefined} />}
    </svg>
  );
}
