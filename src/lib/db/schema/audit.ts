import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { organisations } from "./organisations";
import { users } from "./users";

// ─── Audit Logs ────────────────────────────────────────────────────────────────
// Immutable record of important business actions
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .references(() => organisations.id, { onDelete: "set null" }),
    actorId: uuid("actor_id")
      .references(() => users.id, { onDelete: "set null" }),
    actorRole: varchar("actor_role", { length: 50 }),
    actorEmail: varchar("actor_email", { length: 255 }), // snapshot in case user deleted
    action: varchar("action", { length: 100 }).notNull(), // e.g. "sale.create", "inventory.adjust"
    module: varchar("module", { length: 50 }).notNull(), // e.g. "sales", "inventory"
    entityType: varchar("entity_type", { length: 50 }), // e.g. "sale", "product"
    entityId: uuid("entity_id"),
    previousState: jsonb("previous_state"), // snapshot before change
    newState: jsonb("new_state"), // snapshot after change
    reason: text("reason"), // required for owner-override actions
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_logs_org_idx").on(t.organisationId),
    index("audit_logs_actor_idx").on(t.actorId),
    index("audit_logs_action_idx").on(t.action),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_created_at_idx").on(t.createdAt),
  ]
);

// ─── Idempotency Records ───────────────────────────────────────────────────────
// Prevents duplicate processing of webhook events and checkout submissions
export const idempotencyRecords = pgTable(
  "idempotency_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    status: varchar("status", { length: 30 }).notNull().default("processing"),
    responseData: jsonb("response_data"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idempotency_key_idx").on(t.key),
    index("idempotency_expires_idx").on(t.expiresAt),
  ]
);

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "info", "success", "warning", "error"
  isRead: varchar("is_read", { length: 5 }).default("false").notNull(),
  link: text("link"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Product Reviews ──────────────────────────────────────────────────────────
export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderId: uuid("order_id"),
  rating: varchar("rating", { length: 2 }).notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  body: text("body"),
  isVerifiedPurchase: varchar("is_verified_purchase", { length: 5 }).default("false").notNull(),
  isApproved: varchar("is_approved", { length: 5 }).default("false").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
