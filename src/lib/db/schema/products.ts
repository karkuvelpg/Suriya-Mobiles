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
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organisations, branches } from "./organisations";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const productCategoryEnum = pgEnum("product_category", [
  "smartphone_new",
  "smartphone_used",
  "tablet",
  "charger_cable",
  "earphone_headphone",
  "case_protector",
  "smartwatch",
  "memory_storage",
  "power_bank",
  "other_accessory",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "discontinued",
  "out_of_stock",
]);

export const deviceConditionEnum = pgEnum("device_condition", [
  "new",
  "like_new",
  "good",
  "fair",
  "poor",
]);

export const taxTypeEnum = pgEnum("tax_type", ["GST", "IGST", "exempt"]);

// ─── Brands ───────────────────────────────────────────────────────────────────
export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 300 }).notNull(),
    sku: varchar("sku", { length: 100 }),
    barcode: varchar("barcode", { length: 100 }),
    category: productCategoryEnum("category").notNull(),
    description: text("description"),
    specifications: jsonb("specifications").default({}).notNull(),
    // Phone-specific fields
    model: varchar("model", { length: 100 }),
    storage: varchar("storage", { length: 20 }),
    ram: varchar("ram", { length: 20 }),
    color: varchar("color", { length: 50 }),
    // Pricing (stored in paise / smallest currency unit)
    costPricePaise: integer("cost_price_paise").default(0).notNull(),
    sellingPricePaise: integer("selling_price_paise").notNull(),
    mrpPaise: integer("mrp_paise"),
    // Tax
    taxType: taxTypeEnum("tax_type").default("GST").notNull(),
    gstRatePercent: numeric("gst_rate_percent", { precision: 5, scale: 2 }).default("18").notNull(),
    hsnCode: varchar("hsn_code", { length: 20 }),
    // Warranty
    warrantyMonths: integer("warranty_months").default(0).notNull(),
    warrantyDescription: text("warranty_description"),
    // Status
    status: productStatusEnum("status").default("draft").notNull(),
    isPublishedOnline: boolean("is_published_online").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // Tracking
    trackSerialNumbers: boolean("track_serial_numbers").default(false).notNull(),
    isUsedDevice: boolean("is_used_device").default(false).notNull(),
    // Metadata
    weight: numeric("weight", { precision: 8, scale: 3 }),
    tags: jsonb("tags").default([]).notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("products_org_slug_idx").on(t.organisationId, t.slug),
    index("products_category_idx").on(t.category),
    index("products_sku_idx").on(t.sku),
    index("products_barcode_idx").on(t.barcode),
    index("products_published_idx").on(t.isPublishedOnline, t.status),
  ]
);

// ─── Product Images ────────────────────────────────────────────────────────────
export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Individual Device Units (IMEI / Serial tracking) ─────────────────────────
export const deviceUnits = pgTable(
  "device_units",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .references(() => branches.id, { onDelete: "set null" }),
    imei1: varchar("imei1", { length: 20 }),
    imei2: varchar("imei2", { length: 20 }),
    serialNumber: varchar("serial_number", { length: 100 }),
    condition: deviceConditionEnum("condition").default("new").notNull(),
    inspectionNotes: text("inspection_notes"),
    acquisitionCostPaise: integer("acquisition_cost_paise"),
    sellingPricePaise: integer("selling_price_paise"),
    // Status
    isSold: boolean("is_sold").default(false).notNull(),
    isReserved: boolean("is_reserved").default(false).notNull(),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    soldInSaleId: uuid("sold_in_sale_id"), // FK added after sales table
    // Purchase info
    purchaseOrderId: uuid("purchase_order_id"), // FK added after suppliers table
    supplierInvoiceNo: varchar("supplier_invoice_no", { length: 100 }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    // Warranty
    warrantyExpiresAt: timestamp("warranty_expires_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("device_units_imei1_org_idx").on(t.imei1, t.organisationId),
    uniqueIndex("device_units_serial_org_idx").on(t.serialNumber, t.organisationId),
    index("device_units_product_idx").on(t.productId),
    index("device_units_branch_idx").on(t.branchId),
    index("device_units_sold_idx").on(t.isSold),
  ]
);

// ─── Relations ─────────────────────────────────────────────────────────────────
export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  images: many(productImages),
  deviceUnits: many(deviceUnits),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const deviceUnitsRelations = relations(deviceUnits, ({ one }) => ({
  product: one(products, {
    fields: [deviceUnits.productId],
    references: [products.id],
  }),
}));
