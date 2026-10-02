// End-to-end check against a running deployment (or local API):
//   ACCESS_CODE=... npm run smoke -- https://your-app.vercel.app
// Signs in as "Smoke test", loads the catalogue and activity, writes a reaction, reads it back,
// removes it, and prints timings so regressions show up as numbers.

import type { Activity, Session } from "../shared/activity.js";
import type { Catalog } from "../shared/catalog.js";

const base = (process.argv[2] ?? "http://localhost:8787").replace(/\/$/, "");
const code = process.env.ACCESS_CODE;
if (!code) { console.error("Set ACCESS_CODE to the deployment's access code."); process.exit(2); }

let cookie = "";
async function call<T = unknown>(path: string, init: RequestInit = {}): Promise<{ res: Response; body: T; ms: number }> {
  const t0 = performance.now();
  const res = await fetch(`${base}/api${path}`, { ...init, headers: { "content-type": "application/json", cookie } });
  const ms = Math.round(performance.now() - t0);
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  return { res, body: body as T, ms };
}
function check(ok: boolean, what: string) {
  if (!ok) { console.error(`FAIL  ${what}`); process.exit(1); }
  console.log(`ok    ${what}`);
}

const signIn = await call<Session>("/session", { method: "POST", body: JSON.stringify({ code, name: "Smoke test" }) });
check(signIn.res.status === 201 && !!cookie, `sign in (${signIn.ms} ms)`);

const cat = await call<Catalog | null>("/catalog");
const codes = (cat.body?.sections ?? []).flatMap((s) => s.groups.flatMap((g) => g.codes));
check(cat.res.ok && codes.length > 0, `catalogue: ${codes.length} codes (${cat.ms} ms)`);

const act = await call<Activity | null>("/activity");
check(act.res.ok, `activity: ${act.body?.reactions.length} reactions, ${act.body?.suggestions.length} suggestions (${act.ms} ms)`);

const target = encodeURIComponent(`code:${codes[0].id}`);
const write = await call(`/reactions/${target}`, { method: "PUT", body: JSON.stringify({ value: "up", note: "smoke test" }) });
check(write.res.status === 204, `write a reaction (${write.ms} ms)`);
const me = signIn.body.id;
const back = await call<Activity>("/activity");
check(back.body.reactions.some((r) => r.personId === me && r.note === "smoke test"), `read it back (${back.ms} ms)`);
const clear = await call(`/reactions/${target}`, { method: "PUT", body: JSON.stringify({ value: null, note: null }) });
check(clear.res.status === 204, `remove it (${clear.ms} ms)`);
console.log(`\nAll checks passed against ${base}. The "Smoke test" person remains in the people list.`);
