import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NAME_MAX, type Person } from "../../shared/activity.js";
import type { Db } from "../db/client.js";
import { people } from "../db/schema.js";

export function cleanName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const n = name.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
  return n || null;
}

export async function createPerson(db: Db, name: string): Promise<Person> {
  const person = { id: randomUUID(), name };
  await db.insert(people).values({ ...person, createdAt: new Date().toISOString() });
  return person;
}

export async function getPerson(db: Db, id: string): Promise<Person | null> {
  const [row] = await db.select({ id: people.id, name: people.name }).from(people).where(eq(people.id, id)).limit(1);
  return row ?? null;
}

export async function renamePerson(db: Db, id: string, name: string): Promise<void> {
  await db.update(people).set({ name }).where(eq(people.id, id));
}

export async function listPeople(db: Db): Promise<Person[]> {
  return db.select({ id: people.id, name: people.name }).from(people);
}
