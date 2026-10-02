// Local API server; Vite proxies /api here (see vite.config.ts).
import { serve } from "@hono/node-server";
import { createAppFromEnv } from "./app.js";

try { process.loadEnvFile(); } catch { /* no .env: rely on the environment */ }
const port = Number(process.env.API_PORT ?? 8787);
serve({ fetch: (await createAppFromEnv()).fetch, port });
console.log(`API on http://localhost:${port}/api`);
