import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { testDb } from "./test/helpers.js";

let cleanup = () => {};
afterEach(() => cleanup());

async function setup() {
  const t = await testDb();
  cleanup = t.cleanup;
  const app = createApp({ db: t.db, accessCode: "team-code", sessionSecret: "test-secret-test-secret", secureCookies: false });
  const call = (path: string, init: RequestInit & { cookie?: string } = {}) =>
    app.request(`/api${path}`, { ...init, headers: { "content-type": "application/json", ...(init.cookie ? { cookie: init.cookie } : {}) } });
  const signIn = async (name = "Alex") => {
    const res = await call("/session", { method: "POST", body: JSON.stringify({ code: "team-code", name }) });
    const cookie = res.headers.get("set-cookie")!.split(";")[0];
    return { cookie, person: await res.json() as { id: string; name: string } };
  };
  return { call, signIn };
}

describe("sign-in and access", () => {
  it("rejects every data route without a session", async () => {
    const { call } = await setup();
    for (const path of ["/catalog", "/activity", "/session"]) expect((await call(path)).status).toBe(401);
    expect((await call(`/reactions/${encodeURIComponent("code:KNOW_THE_CLASS")}`, { method: "PUT", body: "{}" })).status).toBe(401);
  });

  it("rejects a wrong access code and a missing name", async () => {
    const { call } = await setup();
    expect((await call("/session", { method: "POST", body: JSON.stringify({ code: "nope", name: "A" }) })).status).toBe(403);
    expect((await call("/session", { method: "POST", body: JSON.stringify({ code: "team-code", name: "  " }) })).status).toBe(400);
  });

  it("signs in with an httpOnly cookie, reads the catalogue, and renames", async () => {
    const { call, signIn } = await setup();
    const { cookie, person } = await signIn("Alex");
    expect(person.name).toBe("Alex");
    const cat = await (await call("/catalog", { cookie })).json() as { sections: unknown[] };
    expect(cat.sections).toHaveLength(2);
    await call("/session", { method: "PATCH", cookie, body: JSON.stringify({ name: "Alex G" }) });
    expect(await (await call("/session", { cookie })).json()).toEqual({ id: person.id, name: "Alex G" });
  });

  it("does not accept a tampered cookie", async () => {
    const { call, signIn } = await setup();
    const { cookie } = await signIn();
    expect((await call("/catalog", { cookie: cookie.replace(/.$/, (ch) => (ch === "A" ? "B" : "A")) })).status).toBe(401);
  });
});

describe("reactions and suggestions", () => {
  it("records reactions on a code and on evidence and shows them in activity", async () => {
    const { call, signIn } = await setup();
    const { cookie, person } = await signIn();
    const put = (target: string, body: unknown) => call(`/reactions/${encodeURIComponent(target)}`, { method: "PUT", cookie, body: JSON.stringify(body) });
    expect((await put("code:KNOW_THE_CLASS", { value: "up", note: "Clear" })).status).toBe(204);
    expect((await put("ev:KNOW_THE_CLASS:R1-0001", { value: "down" })).status).toBe(204);
    const act = await (await call("/activity", { cookie })).json() as { reactions: { target: string }[]; people: unknown[] };
    expect(act.reactions.sort((x, y) => x.target.localeCompare(y.target))).toEqual([
      { personId: person.id, target: "code:KNOW_THE_CLASS", value: "up", note: "Clear" },
      { personId: person.id, target: "ev:KNOW_THE_CLASS:R1-0001", value: "down", note: null },
    ]);
    expect(act.people).toEqual([person]);
  });

  it("rejects bad values, malformed targets and items that do not exist", async () => {
    const { call, signIn } = await setup();
    const { cookie } = await signIn();
    const put = (target: string, body: unknown) => call(`/reactions/${encodeURIComponent(target)}`, { method: "PUT", cookie, body: JSON.stringify(body) });
    expect((await put("code:KNOW_THE_CLASS", { value: "love" })).status).toBe(400);
    expect((await put("nonsense", {})).status).toBe(400);
    expect((await put("code:NOT_A_CODE", { value: "up" })).status).toBe(404);
    expect((await put("epic:missing", { value: "up" })).status).toBe(404);
    expect((await put("suggestion:missing0000", { value: "up" })).status).toBe(404);
    expect((await call("/votes/KNOW_THE_CLASS", { method: "PUT", cookie, body: "{}" })).status).toBe(404); // votes are gone
  });

  it("lets anyone react to a suggestion but only its author remove it", async () => {
    const { call, signIn } = await setup();
    const a = await signIn("A"), b = await signIn("B");
    const res = await call("/suggestions", { method: "POST", cookie: a.cookie, body: JSON.stringify({ section: "q1_grounding", group: "Knowing the class", title: "New code", description: "Means this." }) });
    const s = await res.json() as { id: string };
    expect((await call(`/reactions/${encodeURIComponent(`suggestion:${s.id}`)}`, { method: "PUT", cookie: b.cookie, body: JSON.stringify({ value: "up" }) })).status).toBe(204);
    expect((await call(`/suggestions/${s.id}`, { method: "DELETE", cookie: b.cookie })).status).toBe(403);
    expect((await call(`/suggestions/${s.id}`, { method: "DELETE", cookie: a.cookie })).status).toBe(204);
  });
});

describe("Vercel entry", () => {
  // Guards the deployment shape: the entry must import cleanly under Node ESM with only env vars,
  // and never read research data from the filesystem at runtime.
  it("answers with a readable error when settings are missing, then recovers once they are set", async () => {
    const t = await testDb(false);
    cleanup = t.cleanup;
    for (const k of ["ACCESS_CODE", "SESSION_SECRET", "DATABASE_URL"]) delete process.env[k];
    const mod = await import("../api/index.js");
    for (const verb of ["GET", "POST", "PUT", "PATCH", "DELETE"]) expect(typeof (mod as Record<string, unknown>)[verb]).toBe("function");

    const broken = await mod.GET(new Request("http://localhost/api/health"));
    expect(broken.status).toBe(500);
    expect(((await broken.json()) as { error: string }).error).toContain("Missing settings: ACCESS_CODE, SESSION_SECRET, DATABASE_URL");

    Object.assign(process.env, { ACCESS_CODE: "x", SESSION_SECRET: "y".repeat(32), DATABASE_URL: "file::memory:" });
    const ok = await mod.GET(new Request("http://localhost/api/health"));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true });
  });
});
