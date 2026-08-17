import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projectLogs = sqliteTable("project_logs", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  url: text().notNull(),
});
