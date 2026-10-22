import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL_DIRECT or DATABASE_URL must be set for migrations.\n" +
    "Use DATABASE_URL_DIRECT for the non-pooled direct connection."
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
