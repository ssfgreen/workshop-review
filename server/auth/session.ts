import { timingSafeEqual } from "node:crypto";
import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import type { AppEnv } from "../types.js";

export const SESSION_COOKIE = "wr_session";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days: a review runs for weeks, not hours

export function codeMatches(given: unknown, expected: string): boolean {
  if (typeof given !== "string") return false;
  const a = Buffer.from(given.trim()), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function startSession(c: Context<AppEnv>, personId: string): Promise<void> {
  const { sessionSecret, secureCookies } = c.get("deps");
  await setSignedCookie(c, SESSION_COOKIE, personId, sessionSecret, {
    httpOnly: true, sameSite: "Lax", path: "/", maxAge: MAX_AGE, secure: secureCookies,
  });
}

export function endSession(c: Context<AppEnv>): void {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

/** Rejects requests without a valid signed session; sets `personId` for handlers. */
export const requireSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const id = await getSignedCookie(c, c.get("deps").sessionSecret, SESSION_COOKIE);
  if (!id) return c.json({ error: "Sign in to continue." }, 401);
  c.set("personId", id);
  await next();
};
