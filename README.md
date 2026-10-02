# Workshop Review

A small web app for a research team to review the draft codes from the ELM differentiation
workshop (1 October 2026): vote Keep / Unsure / Drop, react with thumbs up or down and a short
comment on codes, evidence, user stories and epics, suggest new codes, and browse the user stories
by question or epic. Decisions and structure: [ARCHITECTURE.md](ARCHITECTURE.md).

The research data is not in this repository. The research repo exports it as a bundle, and the
seed script loads it into the database.

## Run it locally

Needs Node 22.

```bash
npm install
cp .env.example .env            # then set ACCESS_CODE and SESSION_SECRET
# put the exported bundle at data/bundle.json (see "Update the data" below)
npm run db:migrate
npm run db:seed
npm run dev                     # API on :8787, app on http://localhost:5173
```

## Check it

```bash
npm run check                   # typecheck: client, server, tests
npm test                        # unit, service, API and screen-render tests
ACCESS_CODE=... npm run smoke -- http://localhost:8787   # or the deployed URL
```

The screen-render test also renders every screen from `data/bundle.json` when the file is present.

## Update the data

In the research repo (`codesigning-lesson-planning-agents`):

```bash
python 90_pipeline/scripts/build_workshop_vote_page.py --bundle-out <this repo>/data/bundle.json
```

Then `npm run db:seed` here (locally, or with the production `DATABASE_URL`). Seeding replaces the
codes, evidence, stories and epics and keeps everyone's votes, reactions and suggestions. Reactions
on stories are keyed by position: add new stories at the end of a code's list.

## Deploy (Vercel + Turso)

1. Create a Turso database: `turso db create workshop-review`, then note its URL
   (`turso db show workshop-review --url`) and a token (`turso db tokens create workshop-review`).
2. Apply the schema and load the data from your machine:
   `DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:migrate && ... npm run db:seed`.
3. Import this repo into Vercel (framework: Vite). Set `ACCESS_CODE`, `SESSION_SECRET`
   (`openssl rand -hex 32`), `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in the project settings.
4. Deploy, then run the smoke test against the deployment URL and note the timings.

Share the URL and the access code with the team. Everyone signs in once with the code and their name.
