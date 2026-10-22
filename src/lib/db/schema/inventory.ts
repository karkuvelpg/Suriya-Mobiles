import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql, type SQL } from "drizzle-orm";
import { organisations, branches } from "./organisations";
import { products, deviceUnits } from "./products";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const movementTypeEnum = pgEnum("movement_type", [
  "purchase_received",
  "sale",
  "return_in",
  "return_out",
  "transfer_in",
  "transfer_out",
  "adjustment_in",
  "adjustment_out",
  "opening_stock",
  "reservation",
  "reservation_release",
]);

export const transferStatusEnum = pgEnum("transfer_status", [
  "pending",
  "in_transit",
  "received",
  "cancelled",
]);

// ─── Inventory Balances ────────────────────────────────────────────────────────
// One record per (product, branch) — represents current stock level
export const inventoryBalances = pgTable(
  "inventory_balances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
    quantityReserved: integer("quantity_reserved").default(0).notNull(),
    quantityAvailable: integer("quantity_available")
      .generatedAlwaysAs((): SQL => sql`quantity_on_hand - quantity_reserved`)
      .notNull(),
    reorderLevel: integer("reorder_level").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("inventory_balances_product_branch_idx").on(t.productId, t.branchId),
    index("inventory_balances_org_idx").on(t.organisationId),
    index("inventory_balances_branch_idx").on(t.branchId),
  ]
);

// ─── Inventory Movements (full ledger) ────────────────────────────────────────
export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    deviceUnitId: uuid("device_unit_id")
      .references(() => deviceUnits.id, { onDelete: "set null" }),
    movementType: movementTypeEnum("movement_type").notNull(),
    quantity: integer("quantity").notNull(), // positive = in, negative = out
    quantityBefore: integer("quantity_before").notNull(),
    quantityAfter: integer("quantity_after").notNull(),
    costPricePaise: integer("cost_price_paise"),
    sellingPricePaise: integer("selling_price_paise"),
    referenceType: varchar("reference_type", { length: 50 }), // "sale", "purchase_order", "transfer", "adjustment"
    referenceId: uuid("reference_id"),
    notes: text("notes"),
    performedBy: uuid("performed_by")
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("inventory_movements_product_branch_idx").on(t.productId, t.branchId),
    index("inventory_movements_type_idx").on(t.movementType),
    index("inventory_movements_created_at_idx").on(t.createdAt),
    index("inventory_movements_reference_idx").on(t.referenceType, t.referenceId),
  ]
);

// ─── Branch Transfers ─────────────────────────────────────────────────────────
export const branchTransfers = pgTable("branch_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  fromBranchId: uuid("from_branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "restrict" }),
  toBranchId: uuid("to_branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "restrict" }),
  referenceNo: varchar("reference_no", { length: 50 }).notNull(),
  status: transferStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  requestedBy: uuid("requested_by")
    .notNull()
    .references(() => users.id),
  approvedBy: uuid("approved_by")
    .references(() => users.id),
  receivedBy: uuid("received_by")
    .references(() => users.id),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Branch Transfer Items ─────────────────────────────────────────────────────
export const branchTransferItems = pgTable("branch_transfer_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id")
    .notNull()
    .references(() => branchTransfers.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  deviceUnitId: uuid("device_unit_id")
    .references(() => deviceUnits.id, { onDelete: "set null" }),
  quantityRequested: integer("quantity_requested").notNull(),
  quantityReceived: integer("quantity_received"),
  notes: text("notes"),
});

// ─── Stock Reservations ───────────────────────────────────────────────────────
export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    deviceUnitId: uuid("device_unit_id")
      .references(() => deviceUnits.id, { onDelete: "set null" }),
    quantity: integer("quantity").notNull(),
    referenceType: varchar("reference_type", { length: 50 }).notNull(), // "checkout_session", "order"
    referenceId: uuid("reference_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isReleased: boolean("is_released").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("stock_reservations_product_branch_idx").on(t.productId, t.branchId),
    index("stock_reservations_reference_idx").on(t.referenceType, t.referenceId),
    index("stock_reservations_expires_idx").on(t.expiresAt, t.isReleased),
  ]
);

// ─── Relations ─────────────────────────────────────────────────────────────────
export const inventoryBalancesRelations = relations(inventoryBalances, ({ one }) => ({
  product: one(products, {
    fields: [inventoryBalances.productId],
    references: [products.id],
  }),
  branch: one(branches, {
    fields: [inventoryBalances.branchId],
    references: [branches.id],
  }),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
  branch: one(branches, {
    fields: [inventoryMovements.branchId],
    references: [branches.id],
  }),
}));

export const branchTransfersRelations = relations(branchTransfers, ({ one, many }) => ({
  fromBranch: one(branches, {
    fields: [branchTransfers.fromBranchId],
    references: [branches.id],
  }),
  toBranch: one(branches, {
    fields: [branchTransfers.toBranchId],
    references: [branches.id],
  }),
  items: many(branchTransferItems),
}));
