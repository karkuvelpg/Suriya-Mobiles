import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ─── Connection ────────────────────────────────────────────────────────────────
// Use connection pooler URL for serverless (Supabase transaction pooler port 6543)
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
    "Set it to your Supabase PostgreSQL connection string."
  );
}

// For migrations, use a direct connection (not pooler)
// For runtime, use the transaction pooler
const isProduction = process.env.NODE_ENV === "production";

const sql = postgres(connectionString, {
  max: isProduction ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Required for Supabase transaction pooler
});

export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export type DB = typeof db;

// Named export for use in Server Components and API routes
export default db;
