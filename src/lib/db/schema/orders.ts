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
import { users, customerProfiles, customerAddresses } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "ready_to_ship",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "return_requested",
  "return_approved",
  "return_received",
  "refunded",
]);

export const orderTypeEnum = pgEnum("order_type", ["online", "cod"]);

// ─── Online Orders ─────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    fulfilmentBranchId: uuid("fulfilment_branch_id")
      .references(() => branches.id, { onDelete: "set null" }),
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customerProfiles.id, { onDelete: "restrict" }),
    addressId: uuid("address_id")
      .references(() => customerAddresses.id, { onDelete: "set null" }),
    // Shipping address snapshot
    shippingNameSnapshot: varchar("shipping_name_snapshot", { length: 255 }),
    shippingPhoneSnapshot: varchar("shipping_phone_snapshot", { length: 20 }),
    shippingAddressSnapshot: text("shipping_address_snapshot"),
    shippingCitySnapshot: varchar("shipping_city_snapshot", { length: 100 }),
    shippingStateSnapshot: varchar("shipping_state_snapshot", { length: 100 }),
    shippingPincodeSnapshot: varchar("shipping_pincode_snapshot", { length: 10 }),
    orderType: orderTypeEnum("order_type").default("online").notNull(),
    status: orderStatusEnum("status").default("pending").notNull(),
    // Amounts in paise
    subtotalPaise: integer("subtotal_paise").notNull(),
    discountPaise: integer("discount_paise").default(0).notNull(),
    couponCode: varchar("coupon_code", { length: 50 }),
    couponDiscountPaise: integer("coupon_discount_paise").default(0).notNull(),
    taxableAmountPaise: integer("taxable_amount_paise").notNull(),
    totalTaxPaise: integer("total_tax_paise").default(0).notNull(),
    shippingChargePaise: integer("shipping_charge_paise").default(0).notNull(),
    grandTotalPaise: integer("grand_total_paise").notNull(),
    paidPaise: integer("paid_paise").default(0).notNull(),
    // Tracking
    trackingNumber: varchar("tracking_number", { length: 100 }),
    courierName: varchar("courier_name", { length: 100 }),
    estimatedDeliveryAt: timestamp("estimated_delivery_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    notes: text("notes"),
    customerNotes: text("customer_notes"),
    // Gateway
    gatewayOrderId: varchar("gateway_order_id", { length: 100 }),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 100 }),
    processedBy: uuid("processed_by")
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("orders_customer_idx").on(t.customerId),
    index("orders_status_idx").on(t.status),
    index("orders_org_created_idx").on(t.organisationId, t.createdAt),
    index("orders_gateway_order_idx").on(t.gatewayOrderId),
  ]
);

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  deviceUnitId: uuid("device_unit_id")
    .references(() => deviceUnits.id, { onDelete: "set null" }),
  productNameSnapshot: varchar("product_name_snapshot", { length: 255 }).notNull(),
  skuSnapshot: varchar("sku_snapshot", { length: 100 }),
  imageUrlSnapshot: text("image_url_snapshot"),
  quantity: integer("quantity").notNull(),
  unitPricePaise: integer("unit_price_paise").notNull(),
  discountPaise: integer("discount_paise").default(0).notNull(),
  gstRatePercent: numeric("gst_rate_percent", { precision: 5, scale: 2 }).notNull(),
  taxPaise: integer("tax_paise").default(0).notNull(),
  lineTotalPaise: integer("line_total_paise").notNull(),
  returnedQuantity: integer("returned_quantity").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Payment Attempts ─────────────────────────────────────────────────────────
export const paymentAttempts = pgTable(
  "payment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "restrict" }),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "set null" }),
    idempotencyKey: varchar("idempotency_key", { length: 100 }).notNull().unique(),
    gatewayName: varchar("gateway_name", { length: 50 }).notNull().default("razorpay"),
    gatewayOrderId: varchar("gateway_order_id", { length: 100 }),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 100 }),
    gatewaySignature: text("gateway_signature"),
    amountPaise: integer("amount_paise").notNull(),
    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    status: varchar("status", { length: 30 }).notNull().default("created"), // created, authorized, captured, failed, refunded
    failureReason: text("failure_reason"),
    gatewayResponse: jsonb("gateway_response"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("payment_attempts_order_idx").on(t.orderId),
    index("payment_attempts_gateway_payment_idx").on(t.gatewayPaymentId),
    index("payment_attempts_status_idx").on(t.status),
  ]
);

// ─── Refunds ──────────────────────────────────────────────────────────────────
export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "restrict" }),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "set null" }),
  paymentAttemptId: uuid("payment_attempt_id")
    .references(() => paymentAttempts.id, { onDelete: "set null" }),
  gatewayRefundId: varchar("gateway_refund_id", { length: 100 }),
  amountPaise: integer("amount_paise").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  processedBy: uuid("processed_by")
    .references(() => users.id, { onDelete: "set null" }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 50 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // "flat", "percent"
  discountValue: integer("discount_value").notNull(), // paise or percent * 100
  minOrderPaise: integer("min_order_paise").default(0),
  maxDiscountPaise: integer("max_discount_paise"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ─────────────────────────────────────────────────────────────────
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customerProfiles, {
    fields: [orders.customerId],
    references: [customerProfiles.id],
  }),
  items: many(orderItems),
  paymentAttempts: many(paymentAttempts),
  refunds: many(refunds),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentAttemptsRelations = relations(paymentAttempts, ({ one }) => ({
  order: one(orders, {
    fields: [paymentAttempts.orderId],
    references: [orders.id],
  }),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  paymentAttempt: one(paymentAttempts, {
    fields: [refunds.paymentAttemptId],
    references: [paymentAttempts.id],
  }),
}));
