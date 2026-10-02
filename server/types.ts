import type { Db } from "./db/client.js";

export interface AppDeps {
  db: Db;
  accessCode: string;
  sessionSecret: string;
  /** Secure cookies need HTTPS; off only for local development over http. */
  secureCookies: boolean;
}

export interface AppEnv {
  Variables: { deps: AppDeps; personId: string };
}
