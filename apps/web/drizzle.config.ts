import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Lê apps/web/.env.local (o drizzle-kit não o faz sozinho).
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
