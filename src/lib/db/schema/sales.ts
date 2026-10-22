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
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organisations, branches } from "./organisations";
import { products, deviceUnits } from "./products";
import { users, customerProfiles } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const saleStatusEnum = pgEnum("sale_status", [
  "draft",
  "completed",
  "cancelled",
  "returned",
  "partially_returned",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "upi",
  "card",
  "bank_transfer",
  "cheque",
  "online",
  "exchange",
  "credit",
]);

export const sessionStatusEnum = pgEnum("session_status", ["open", "closed"]);

// ─── Cash Register Sessions ───────────────────────────────────────────────────
export const cashSessions = pgTable("cash_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "restrict" }),
  openedBy: uuid("opened_by")
    .notNull()
    .references(() => users.id),
  closedBy: uuid("closed_by")
    .references(() => users.id),
  status: sessionStatusEnum("status").default("open").notNull(),
  openingCashPaise: integer("opening_cash_paise").default(0).notNull(),
  expectedCashPaise: integer("expected_cash_paise"),
  actualCashPaise: integer("actual_cash_paise"),
  cashDifferencePaise: integer("cash_difference_paise"),
  notes: text("notes"),
  openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow().notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

// ─── Sales / Invoices ─────────────────────────────────────────────────────────
export const sales = pgTable(
  "sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "restrict" }),
    cashSessionId: uuid("cash_session_id")
      .references(() => cashSessions.id, { onDelete: "set null" }),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }).defaultNow().notNull(),
    customerId: uuid("customer_id")
      .references(() => customerProfiles.id, { onDelete: "set null" }),
    // Snapshot fields (preserved forever, even if product/customer changes)
    customerNameSnapshot: varchar("customer_name_snapshot", { length: 255 }),
    customerPhoneSnapshot: varchar("customer_phone_snapshot", { length: 20 }),
    customerGstinSnapshot: varchar("customer_gstin_snapshot", { length: 15 }),
    // Amounts (all in paise)
    subtotalPaise: integer("subtotal_paise").notNull(),
    discountPaise: integer("discount_paise").default(0).notNull(),
    taxableAmountPaise: integer("taxable_amount_paise").notNull(),
    cgstPaise: integer("cgst_paise").default(0).notNull(),
    sgstPaise: integer("sgst_paise").default(0).notNull(),
    igstPaise: integer("igst_paise").default(0).notNull(),
    totalTaxPaise: integer("total_tax_paise").default(0).notNull(),
    roundOffPaise: integer("round_off_paise").default(0).notNull(),
    grandTotalPaise: integer("grand_total_paise").notNull(),
    paidPaise: integer("paid_paise").default(0).notNull(),
    balancePaise: integer("balance_paise").default(0).notNull(),
    status: saleStatusEnum("status").default("completed").notNull(),
    notes: text("notes"),
    // Return reference
    originalSaleId: uuid("original_sale_id"),
    isReturn: boolean("is_return").default(false).notNull(),
    performedBy: uuid("performed_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("sales_invoice_org_idx").on(t.invoiceNumber, t.organisationId),
    index("sales_customer_idx").on(t.customerId),
    index("sales_branch_date_idx").on(t.branchId, t.invoiceDate),
    index("sales_status_idx").on(t.status),
  ]
);

// ─── Sale Line Items ───────────────────────────────────────────────────────────
export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  deviceUnitId: uuid("device_unit_id")
    .references(() => deviceUnits.id, { onDelete: "set null" }),
  // Immutable snapshots
  productNameSnapshot: varchar("product_name_snapshot", { length: 255 }).notNull(),
  skuSnapshot: varchar("sku_snapshot", { length: 100 }),
  hsnCodeSnapshot: varchar("hsn_code_snapshot", { length: 20 }),
  imei1Snapshot: varchar("imei1_snapshot", { length: 20 }),
  imei2Snapshot: varchar("imei2_snapshot", { length: 20 }),
  serialSnapshot: varchar("serial_snapshot", { length: 100 }),
  quantity: integer("quantity").notNull(),
  unitPricePaise: integer("unit_price_paise").notNull(),
  discountPaise: integer("discount_paise").default(0).notNull(),
  taxableAmountPaise: integer("taxable_amount_paise").notNull(),
  gstRatePercent: numeric("gst_rate_percent", { precision: 5, scale: 2 }).notNull(),
  cgstPaise: integer("cgst_paise").default(0).notNull(),
  sgstPaise: integer("sgst_paise").default(0).notNull(),
  igstPaise: integer("igst_paise").default(0).notNull(),
  lineTotalPaise: integer("line_total_paise").notNull(),
  warrantyExpiresAt: timestamp("warranty_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Sale Payments ─────────────────────────────────────────────────────────────
export const salePayments = pgTable("sale_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  method: paymentMethodEnum("method").notNull(),
  amountPaise: integer("amount_paise").notNull(),
  referenceNo: varchar("reference_no", { length: 100 }),
  notes: text("notes"),
  recordedBy: uuid("recorded_by")
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Cash Expenses ─────────────────────────────────────────────────────────────
export const cashExpenses = pgTable("cash_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "restrict" }),
  cashSessionId: uuid("cash_session_id")
    .references(() => cashSessions.id, { onDelete: "set null" }),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amountPaise: integer("amount_paise").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("cash").notNull(),
  referenceNo: varchar("reference_no", { length: 100 }),
  recordedBy: uuid("recorded_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ─────────────────────────────────────────────────────────────────
export const salesRelations = relations(sales, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [sales.organisationId],
    references: [organisations.id],
  }),
  branch: one(branches, {
    fields: [sales.branchId],
    references: [branches.id],
  }),
  customer: one(customerProfiles, {
    fields: [sales.customerId],
    references: [customerProfiles.id],
  }),
  items: many(saleItems),
  payments: many(salePayments),
  cashSession: one(cashSessions, {
    fields: [sales.cashSessionId],
    references: [cashSessions.id],
  }),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
  deviceUnit: one(deviceUnits, {
    fields: [saleItems.deviceUnitId],
    references: [deviceUnits.id],
  }),
}));

export const salePaymentsRelations = relations(salePayments, ({ one }) => ({
  sale: one(sales, {
    fields: [salePayments.saleId],
    references: [sales.id],
  }),
}));
