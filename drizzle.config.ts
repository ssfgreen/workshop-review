import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "turso",
  dbCredentials: { url: process.env.DATABASE_URL ?? "file:local.db", authToken: process.env.DATABASE_AUTH_TOKEN },
});
