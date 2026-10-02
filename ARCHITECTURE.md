# Architecture

Workshop Review lets a research team rate (thumbs up or down) and comment on the draft codes from
a teacher workshop, the evidence behind each code, the user stories derived from them and their
epics. Thumbs replaced an earlier Keep / Unsure / Drop vote (migration `0001_drop_votes`).
It replaces a single-file claude.ai artifact that outgrew one file (decisions follow the research
repo's `greenfield-architecture` skill).

## 1. Deployment target

Vercel: the Vite build is served as static files; `api/index.ts` is one Node serverless function,
and `vercel.json` rewrites every `/api/*` request to it, where the Hono app in `server/` routes it.
Known constraints, each guarded by a test or comment where it bites:
- Serverless functions have no repo filesystem at runtime: the catalogue lives in the database,
  never read from `data/` by the server (`server/app.test.ts` builds the app with no files).
- Node ESM on Vercel needs explicit `.js` extensions on relative imports inside `server/` and
  `api/` (TypeScript `"module": "NodeNext"` there enforces it at typecheck).
- Cold starts: the database client is created once per process (`server/db/client.ts`).

Local development runs the same Hono app under `@hono/node-server` (`server/dev.ts`) with Vite
proxying `/api`.

## 2. Where state lives

- Catalogue (sections, groups, codes, evidence, user stories, epics): database tables, written
  only by `npm run db:seed` from a data bundle exported by the research repo. Read-only at runtime.
- People's input (a thumb and comment per person per target, suggested codes, display names):
  database tables, written through the API.
- Server data on the client: TanStack Query (via `preact/compat`); no fetch-into-state. The
  catalogue is fetched once; people's input comes from one `/api/activity` read, polled every
  15 s and refetched after each write (writes show at once through optimistic updates). Polling
  replaces the old artifact's realtime store; switch to server-sent events only if 15 s is too slow.
- Navigation and filters that should survive a refresh (question, room, organise-by with epic as
  the default, kind, component, only-unrated): the URL, through `preact-iso`.
- Local UI state (open comment panel, drawer, dialog, typed drafts): the component that owns it.

## 3. Module map

- `shared/`: types and pure helpers used by both sides (catalogue types, target keys).
- `server/`: `app.ts` assembles routes; `routes/` one file per resource (thin handlers);
  `services/` one file per aggregate (all SQL); `db/` client, schema, migrate and seed scripts;
  `auth/` access-code sign-in and signed session cookie.
- `src/`: the Preact client. `screens/` one per route; `components/` one per component with its
  own CSS file; `lib/` pure logic (quote context window, tallies, filters) with unit tests;
  `api/` the fetch wrapper and query hooks; `styles/` design tokens only.
- `scripts/`: smoke test against a running deployment.
- `data/` (gitignored): the bundle exported by the research repo, used only by the seed script.

## 4. Libraries and hand-rolled parts

Routing: preact-iso. Server data: TanStack Query. API: Hono. Database: libSQL (`@libsql/client`)
with Drizzle ORM and drizzle-kit migrations. Tests: Vitest. Nothing is hand-rolled where a
standard tool exists. Pinned choices: Preact 10.x (TanStack Query runs through `preact/compat`,
proven on 10; Preact 11 is a new major) and TypeScript 5.9 (TypeScript 7 is a new rewrite).
Lists are at most ~90 cards per view, so no virtualisation yet; add it if a view passes ~150.

## 5. Identity and access

Participant quotes are research data, so every `/api` route except sign-in requires a session.
Sign-in takes the team access code (`ACCESS_CODE`) and a display name; the server issues a
random person id and an HMAC-signed, httpOnly cookie (`SESSION_SECRET`). Names are what people
type, editable later; ratings and comments are keyed by person id.

## 6. Verification

`npm run check` (typecheck of client, server and tests, each with its own tsconfig so browser code
cannot use Node globals) and `npm test` (Vitest: pure logic, services against a temp-file
database, route handlers through `app.request`, and every screen rendered to HTML from a seeded
query cache) stay green on every commit. `npm run smoke --
<url>` signs in to a deployment, loads the catalogue, writes and reads back a reaction, then
removes it, and prints timings.
