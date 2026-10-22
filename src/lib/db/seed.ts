/**
 * Database Seed Script
 *
 * Creates the initial organisation, main branch, and owner account.
 * Run with: npm run db:seed
 *
 * ⚠️  This uses the SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL_DIRECT.
 * ⚠️  Never run against production without careful review.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { organisations, branches } from "./schema/organisations";
import { users, orgMembers, branchMembers } from "./schema/users";
import { permissions, rolePermissions } from "./schema/organisations";
import type { Permission } from "@/lib/permissions";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const sql = postgres(process.env.DATABASE_URL_DIRECT!, { prepare: false });
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // ── 1. Create Supabase Auth user for owner ──────────────────────────────────
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@suriyamobiles.com";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe@123!";

  console.log(`👤 Creating owner auth account: ${ownerEmail}`);
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: { full_name: "Store Owner" },
  });

  if (authError && !authError.message.includes("already registered")) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  const ownerId = authUser?.user?.id;
  if (!ownerId) {
    // Try to get existing user
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUser?.users?.find((u) => u.email === ownerEmail);
    if (!existing) throw new Error("Could not find or create owner user");
    console.log(`  ✓ Using existing auth account: ${existing.id}`);
  } else {
    console.log(`  ✓ Created auth user: ${ownerId}`);
  }

  const { data: ownerUser } = await supabaseAdmin.auth.admin.listUsers();
  const ownerAuthId = ownerUser?.users?.find((u) => u.email === ownerEmail)?.id;
  if (!ownerAuthId) throw new Error("Could not find owner user ID");

  // ── 2. Create user profile ──────────────────────────────────────────────────
  console.log("\n📋 Creating user profile...");
  await db
    .insert(users)
    .values({
      id: ownerAuthId,
      email: ownerEmail,
      fullName: "Store Owner",
      emailVerified: true,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: ownerEmail, emailVerified: true },
    });
  console.log("  ✓ User profile created");

  // ── 3. Create Organisation ──────────────────────────────────────────────────
  console.log("\n🏢 Creating organisation...");
  const [org] = await db
    .insert(organisations)
    .values({
      name: process.env.SEED_ORG_NAME ?? "Suriya Mobiles",
      legalName: process.env.SEED_ORG_NAME ?? "Suriya Mobiles",
      gstin: process.env.SEED_ORG_GSTIN ?? "",
      currencyCode: "INR",
      timezone: "Asia/Kolkata",
      settings: { allowOnlineOrders: true, autoPublishProducts: false },
    })
    .returning();
  console.log(`  ✓ Organisation: ${org.name} (${org.id})`);

  // ── 4. Create Main Branch ───────────────────────────────────────────────────
  console.log("\n🏪 Creating main branch...");
  const [branch] = await db
    .insert(branches)
    .values({
      organisationId: org.id,
      name: process.env.SEED_BRANCH_NAME ?? "Main Branch",
      code: process.env.SEED_BRANCH_CODE ?? "MAIN",
      isMainBranch: true,
      status: "active",
      settings: {},
    })
    .returning();
  console.log(`  ✓ Branch: ${branch.name} (${branch.id})`);

  // ── 5. Create Org Membership for Owner ─────────────────────────────────────
  console.log("\n🔑 Assigning owner role...");
  await db
    .insert(orgMembers)
    .values({
      organisationId: org.id,
      userId: ownerAuthId,
      role: "owner",
      isActive: true,
      customPermissions: [],
    })
    .onConflictDoNothing();

  // ── 6. Create Branch Membership for Owner ──────────────────────────────────
  await db
    .insert(branchMembers)
    .values({
      branchId: branch.id,
      userId: ownerAuthId,
      organisationId: org.id,
      isActive: true,
    })
    .onConflictDoNothing();
  console.log("  ✓ Owner assigned to org and branch");

  // ── 7. Seed Walk-In Customer ────────────────────────────────────────────────
  const { customerProfiles } = await import("./schema/users");
  await db
    .insert(customerProfiles)
    .values({
      organisationId: org.id,
      fullName: "Walk-in Customer",
      isWalkIn: true,
      notes: "Default walk-in customer for POS transactions",
    })
    .onConflictDoNothing();
  console.log("\n👥 Walk-in customer created");

  console.log("\n✅ Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Organisation: ${org.name}`);
  console.log(`  Branch: ${branch.name} (code: ${branch.code})`);
  console.log(`  Owner email: ${ownerEmail}`);
  console.log(`  Owner password: ${ownerPassword}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ⚠️  Change the owner password immediately!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
