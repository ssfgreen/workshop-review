// Vercel entry: one Node function for all of /api (vercel.json rewrites /api/* here).
// Relative imports need explicit .js extensions under Node ESM on Vercel; tsconfig.server.json
// (NodeNext) enforces that at typecheck, and server/app.test.ts imports this file to keep it honest.
import { handle } from "hono/vercel";
import { createAppFromEnv } from "../server/app.js";

type Handler = (req: Request) => Response | Promise<Response>;

// Built on the first request and reused. If it cannot be built (a missing setting, an unreachable
// database), answer with a readable error instead of crashing, and try again on the next request.
let handler: Promise<Handler> | null = null;

async function serve(req: Request): Promise<Response> {
  try {
    handler ??= createAppFromEnv().then((app) => handle(app) as Handler);
    return await (await handler)(req);
  } catch (err) {
    handler = null;
    console.error("API failed to start:", err);
    const reason = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: `The server could not start. ${reason} Check the project's environment variables.` }, { status: 500 });
  }
}

export const GET = serve;
export const POST = serve;
export const PUT = serve;
export const PATCH = serve;
export const DELETE = serve;
