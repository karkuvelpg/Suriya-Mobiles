import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organisations, branches, userRoleEnum } from "./organisations";

// ─── Users ─────────────────────────────────────────────────────────────────────
// Mirrors Supabase auth.users — extended profile
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches auth.users.id from Supabase
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Organisation Members ──────────────────────────────────────────────────────
// Maps users to organisations with a role
export const orgMembers = pgTable("org_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  invitedBy: uuid("invited_by").references(() => users.id),
  customPermissions: jsonb("custom_permissions").default([]).notNull(), // array of permission codes
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Branch Members ────────────────────────────────────────────────────────────
// Restricts staff to specific branches (owners bypass this)
export const branchMembers = pgTable("branch_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Customer Profiles ─────────────────────────────────────────────────────────
export const customerProfiles = pgTable("customer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  gstin: varchar("gstin", { length: 15 }),
  isWalkIn: boolean("is_walk_in").default(false).notNull(),
  notes: text("notes"),
  loyaltyPoints: varchar("loyalty_points", { length: 20 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Customer Addresses ────────────────────────────────────────────────────────
export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerProfileId: uuid("customer_profile_id")
    .notNull()
    .references(() => customerProfiles.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }).default("Home"),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  orgMemberships: many(orgMembers),
  branchMemberships: many(branchMembers),
  customerProfiles: many(customerProfiles),
}));

export const orgMembersRelations = relations(orgMembers, ({ one }) => ({
  organisation: one(organisations, {
    fields: [orgMembers.organisationId],
    references: [organisations.id],
  }),
  user: one(users, {
    fields: [orgMembers.userId],
    references: [users.id],
  }),
}));

export const branchMembersRelations = relations(branchMembers, ({ one }) => ({
  branch: one(branches, {
    fields: [branchMembers.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [branchMembers.userId],
    references: [users.id],
  }),
}));

export const customerProfilesRelations = relations(customerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [customerProfiles.userId],
    references: [users.id],
  }),
  addresses: many(customerAddresses),
}));
