import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: "./app/server/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.ACCOUNT_ID!,
    databaseId: process.env.D1_ID!,
    token: process.env.D1_TOKEN!,
  },
});
