// Vercel entry: one Node function for all of /api (vercel.json rewrites /api/* here).
// Relative imports need explicit .js extensions under Node ESM on Vercel; tsconfig.server.json
// (NodeNext) enforces that at typecheck, and server/app.test.ts imports this file to keep it honest.
import { handle } from "hono/vercel";
import { createAppFromEnv } from "../server/app.js";

const handler = handle(createAppFromEnv());
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
