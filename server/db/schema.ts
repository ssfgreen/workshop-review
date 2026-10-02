import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ---- Catalogue: written only by the seed script, read-only at runtime ----

export const sections = sqliteTable("sections", {
  key: text("key").primaryKey(),
  position: integer("position").notNull(),
  label: text("label").notNull(),
  question: text("question").notNull(),
  prompt: text("prompt").notNull(),
  columnsJson: text("columns_json").notNull(),
});

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sectionKey: text("section_key").notNull(),
  position: integer("position").notNull(),
  title: text("title").notNull(),
});

export const codes = sqliteTable("codes", {
  id: text("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  gist: text("gist").notNull(),
  definition: text("definition").notNull(),
  participantsJson: text("participants_json").notNull(),
  roomsJson: text("rooms_json").notNull(),
  sectionsJson: text("sections_json").notNull(),
});

export const evidence = sqliteTable(
  "evidence",
  {
    codeId: text("code_id").notNull(),
    position: integer("position").notNull(),
    dataJson: text("data_json").notNull(),
  },
  (t) => [primaryKey({ columns: [t.codeId, t.position] })],
);

export const stories = sqliteTable(
  "stories",
  {
    codeId: text("code_id").notNull(),
    position: integer("position").notNull(),
    dataJson: text("data_json").notNull(),
  },
  (t) => [primaryKey({ columns: [t.codeId, t.position] })],
);

export const epics = sqliteTable("epics", {
  id: text("id").primaryKey(),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ---- People's input: never touched by the seed ----

export const people = sqliteTable("people", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

// Thumbs up / down and a comment, one row per person per target (see shared/keys.ts).
export const reactions = sqliteTable(
  "reactions",
  {
    personId: text("person_id").notNull(),
    target: text("target").notNull(),
    value: text("value"),
    note: text("note"),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.personId, t.target] })],
);

export const suggestions = sqliteTable(
  "suggestions",
  {
    id: text("id").primaryKey(),
    sectionKey: text("section_key").notNull(),
    groupTitle: text("group_title").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    evidence: text("evidence").notNull(),
    authorId: text("author_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("suggestions_section").on(t.sectionKey)],
);
