import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  integer,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organisations, branches } from "./organisations";
import { products, deviceUnits } from "./products";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "draft",
  "ordered",
  "partially_received",
  "received",
  "cancelled",
]);

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  gstin: varchar("gstin", { length: 15 }),
  pan: varchar("pan", { length: 10 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  bankName: varchar("bank_name", { length: 100 }),
  accountNumber: varchar("account_number", { length: 50 }),
  ifscCode: varchar("ifsc_code", { length: 20 }),
  paymentTermsDays: integer("payment_terms_days").default(0),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Purchase Orders ───────────────────────────────────────────────────────────
export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "restrict" }),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "restrict" }),
    poNumber: varchar("po_number", { length: 50 }).notNull(),
    status: purchaseOrderStatusEnum("status").default("draft").notNull(),
    supplierInvoiceNo: varchar("supplier_invoice_no", { length: 100 }),
    orderDate: timestamp("order_date", { withTimezone: true }).defaultNow().notNull(),
    expectedDeliveryDate: timestamp("expected_delivery_date", { withTimezone: true }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    // Amounts in paise
    subtotalPaise: integer("subtotal_paise").default(0).notNull(),
    taxPaise: integer("tax_paise").default(0).notNull(),
    shippingPaise: integer("shipping_paise").default(0).notNull(),
    totalPaise: integer("total_paise").default(0).notNull(),
    paidPaise: integer("paid_paise").default(0).notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    receivedBy: uuid("received_by")
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("purchase_orders_supplier_idx").on(t.supplierId),
    index("purchase_orders_status_idx").on(t.status),
    index("purchase_orders_branch_idx").on(t.branchId),
  ]
);

// ─── Purchase Order Items ─────────────────────────────────────────────────────
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseOrderId: uuid("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").default(0).notNull(),
  unitCostPaise: integer("unit_cost_paise").notNull(),
  taxPercent: numeric("tax_percent", { precision: 5, scale: 2 }).default("0"),
  lineTotalPaise: integer("line_total_paise").notNull(),
  notes: text("notes"),
});

// ─── Relations ─────────────────────────────────────────────────────────────────
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  branch: one(branches, {
    fields: [purchaseOrders.branchId],
    references: [branches.id],
  }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
}));
