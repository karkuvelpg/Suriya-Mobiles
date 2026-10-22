/**
 * Database Seed Script — Comprehensive Retail & Inventory Seeder
 *
 * Seeds:
 * 1. Owner Auth User & Profile
 * 2. Organisation & Main Branch
 * 3. Brands (Apple, Samsung, OnePlus, Anker, Spigen)
 * 4. Suppliers (Redington, Ingram Micro, Apple India)
 * 5. Products (Flagships, Audio, Accessories, Repairs) with GST & Non-GST support
 * 6. Device Units with genuine 15-digit IMEIs
 * 7. Branch Inventory Balances
 * 8. Registered & Walk-in Customers
 * 9. Real Sales, Sale Line Items & Split Payments (UPI, Cash, Card)
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { organisations, branches } from "./schema/organisations";
import { users, orgMembers, branchMembers, customerProfiles } from "./schema/users";
import { brands, products, deviceUnits, productCategoryEnum } from "./schema/products";
import { suppliers } from "./schema/suppliers";
import { inventoryBalances } from "./schema/inventory";
import { sales, saleItems, salePayments } from "./schema/sales";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const sql = postgres(process.env.DATABASE_URL_DIRECT!, { prepare: false });
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting comprehensive database seed for Suriya Mobiles...\n");

  // ── 1. Create or retrieve Owner Auth Account ────────────────────────────────
  const ownerEmail = process.env.SEED_OWNER_EMAIL ?? "owner@suriyamobiles.com";
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? "change-me-immediately";

  console.log(`👤 Checking owner auth account: ${ownerEmail}`);
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
  let ownerAuthId = userList?.users?.find((u) => u.email === ownerEmail)?.id;

  if (!ownerAuthId) {
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { full_name: "Suriya (Store Owner)" },
    });
    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`);
    ownerAuthId = authUser.user.id;
    console.log(`  ✓ Created new auth user: ${ownerAuthId}`);
  } else {
    console.log(`  ✓ Using existing auth user: ${ownerAuthId}`);
  }

  // ── 2. Create User Profile ──────────────────────────────────────────────────
  await db
    .insert(users)
    .values({
      id: ownerAuthId,
      email: ownerEmail,
      fullName: "Suriya (Store Owner)",
      emailVerified: true,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: ownerEmail, emailVerified: true },
    });
  console.log("  ✓ Owner profile verified");

  // ── 3. Organisation ─────────────────────────────────────────────────────────
  const existingOrgs = await db.select().from(organisations).limit(1);
  let org = existingOrgs[0];
  if (!org) {
    const [newOrg] = await db
      .insert(organisations)
      .values({
        name: "Suriya Mobiles",
        legalName: "Suriya Mobiles Retail Pvt Ltd",
        gstin: "33AAAAA0000A1Z5",
        currencyCode: "INR",
        timezone: "Asia/Kolkata",
        settings: { allowOnlineOrders: true, autoPublishProducts: true },
      })
      .returning();
    org = newOrg;
  }
  console.log(`🏢 Organisation: ${org.name} (${org.id})`);

  // ── 4. Main Branch ──────────────────────────────────────────────────────────
  const existingBranches = await db.select().from(branches).where(eq(branches.organisationId, org.id)).limit(1);
  let branch = existingBranches[0];
  if (!branch) {
    const [newBranch] = await db
      .insert(branches)
      .values({
        organisationId: org.id,
        name: "Main Showroom (Anna Nagar)",
        code: "MAIN",
        isMainBranch: true,
        status: "active",
        settings: {},
      })
      .returning();
    branch = newBranch;
  }
  console.log(`🏪 Branch: ${branch.name} (${branch.id})`);

  // ── 5. Memberships ──────────────────────────────────────────────────────────
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

  await db
    .insert(branchMembers)
    .values({
      branchId: branch.id,
      userId: ownerAuthId,
      organisationId: org.id,
      isActive: true,
    })
    .onConflictDoNothing();

  // ── 6. Seed Brands ──────────────────────────────────────────────────────────
  console.log("\n🏷️ Seeding Brands...");
  const brandNames = ["Apple", "Samsung", "OnePlus", "Anker", "Spigen", "Boat", "Xiaomi"];
  const brandMap = new Map<string, string>();

  for (const bName of brandNames) {
    const existing = await db
      .select()
      .from(brands)
      .where(eq(brands.name, bName))
      .limit(1);

    if (existing.length > 0) {
      brandMap.set(bName, existing[0].id);
    } else {
      const [newBrand] = await db
        .insert(brands)
        .values({
          organisationId: org.id,
          name: bName,
        })
        .returning();
      brandMap.set(bName, newBrand.id);
    }
  }
  console.log(`  ✓ ${brandMap.size} brands ready`);

  // ── 7. Seed Suppliers ───────────────────────────────────────────────────────
  console.log("\n📦 Seeding Suppliers...");
  const supplierData = [
    {
      name: "Redington India Ltd",
      contactPerson: "K. Murali (Senior Account Mgr)",
      phone: "9841098410",
      email: "murali.k@redington.in",
      gstin: "33AAACR1234A1Z1",
      city: "Chennai",
      state: "Tamil Nadu",
    },
    {
      name: "Ingram Micro India Pvt Ltd",
      contactPerson: "Arun Swaminathan",
      phone: "9840555666",
      email: "orders.tn@ingrammicro.com",
      gstin: "33AAACI5678B1Z2",
      city: "Chennai",
      state: "Tamil Nadu",
    },
    {
      name: "Apple Distribution International",
      contactPerson: "Retail Partner Helpdesk",
      phone: "18004250744",
      email: "india_reseller@apple.com",
      gstin: "33AAACA9999C1Z3",
      city: "Bengaluru",
      state: "Karnataka",
    },
  ];

  for (const s of supplierData) {
    const existing = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, s.name))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(suppliers).values({
        organisationId: org.id,
        name: s.name,
        contactPerson: s.contactPerson,
        phone: s.phone,
        email: s.email,
        gstin: s.gstin,
        city: s.city,
        state: s.state,
      });
    }
  }
  console.log("  ✓ Suppliers seeded");

  // ── 8. Seed Customers ───────────────────────────────────────────────────────
  console.log("\n👥 Seeding Customer Profiles...");
  const customersList = [
    { fullName: "Walk-in Customer", phone: "", isWalkIn: true, notes: "Default walk-in" },
    { fullName: "Rajesh Kumar", phone: "9840123456", email: "rajesh.k@gmail.com", gstin: "33AAACR1234F1Z1", isWalkIn: false },
    { fullName: "Priya Sundaram", phone: "9841234567", email: "priya.s@yahoo.com", isWalkIn: false },
    { fullName: "Karthik Raja", phone: "9842345678", email: "karthik.r@techcorp.in", gstin: "33BBBPR5678K1Z5", isWalkIn: false },
    { fullName: "Senthil Nathan", phone: "9843456789", email: "senthil@chennaibiz.com", isWalkIn: false },
  ];

  const customerMap = new Map<string, string>();
  for (const c of customersList) {
    const existing = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.fullName, c.fullName))
      .limit(1);
    if (existing.length > 0) {
      customerMap.set(c.fullName, existing[0].id);
    } else {
      const [newCust] = await db
        .insert(customerProfiles)
        .values({
          organisationId: org.id,
          fullName: c.fullName,
          phone: c.phone || null,
          email: c.email || null,
          gstin: c.gstin || null,
          isWalkIn: c.isWalkIn,
          notes: c.notes || null,
        })
        .returning();
      customerMap.set(c.fullName, newCust.id);
    }
  }
  console.log(`  ✓ ${customerMap.size} customer profiles ready`);

  // ── 9. Seed Products & Inventory ───────────────────────────────────────────
  console.log("\n📱 Seeding Catalog Products & IMEI Device Units...");

  const productList = [
    {
      name: "Apple iPhone 15 Pro Max (256GB - Natural Titanium)",
      brand: "Apple",
      slug: "apple-iphone-15-pro-max-256gb-natural-titanium",
      sku: "IPH15PM-256-NT",
      barcode: "890123456001",
      category: "smartphone_new" as const,
      costPricePaise: 13500000,
      sellingPricePaise: 14890000,
      mrpPaise: 15990000,
      taxType: "GST" as const,
      gstRatePercent: "18.00",
      hsnCode: "85171300",
      trackSerialNumbers: true,
      stockQty: 8,
      imeis: ["358291048291048", "358291048291049", "358291048291050", "358291048291051"],
    },
    {
      name: "Samsung Galaxy S24 Ultra (512GB - Titanium Black)",
      brand: "Samsung",
      slug: "samsung-galaxy-s24-ultra-512gb-titanium-black",
      sku: "SMS24U-512-TB",
      barcode: "890123456002",
      category: "smartphone_new" as const,
      costPricePaise: 11800000,
      sellingPricePaise: 12999900,
      mrpPaise: 13999900,
      taxType: "GST" as const,
      gstRatePercent: "18.00",
      hsnCode: "85171300",
      trackSerialNumbers: true,
      stockQty: 5,
      imeis: ["864920059102847", "864920059102848", "864920059102849"],
    },
    {
      name: "OnePlus 12 (256GB - Silky Black)",
      brand: "OnePlus",
      slug: "oneplus-12-256gb-silky-black",
      sku: "OP12-256-BLK",
      barcode: "890123456003",
      category: "smartphone_new" as const,
      costPricePaise: 5400000,
      sellingPricePaise: 5999900,
      mrpPaise: 6499900,
      taxType: "GST" as const,
      gstRatePercent: "18.00",
      hsnCode: "85171300",
      trackSerialNumbers: true,
      stockQty: 12,
      imeis: ["990012345678901", "990012345678902"],
    },
    {
      name: "Apple AirPods Pro (2nd Gen with USB-C)",
      brand: "Apple",
      slug: "apple-airpods-pro-2-usb-c",
      sku: "APP2-USBC",
      barcode: "890123456004",
      category: "earphone_headphone" as const,
      costPricePaise: 1850000,
      sellingPricePaise: 2199000,
      mrpPaise: 2490000,
      taxType: "GST" as const,
      gstRatePercent: "18.00",
      hsnCode: "85183000",
      trackSerialNumbers: true,
      stockQty: 25,
      imeis: ["APRO2-849102", "APRO2-849103"],
    },
    {
      name: "Anker 65W GaN Fast Charger 3-Port (2C+1A)",
      brand: "Anker",
      slug: "anker-65w-gan-fast-charger-3-port",
      sku: "ANK-65W-GAN",
      barcode: "890123456005",
      category: "charger_cable" as const,
      costPricePaise: 240000,
      sellingPricePaise: 349900,
      mrpPaise: 499900,
      taxType: "GST" as const,
      gstRatePercent: "18.00",
      hsnCode: "85044090",
      trackSerialNumbers: false,
      stockQty: 40,
    },
    {
      name: "Spigen Ultra Hybrid MagFit Case for iPhone 15 Pro",
      brand: "Spigen",
      slug: "spigen-ultra-hybrid-magfit-case-iphone-15-pro",
      sku: "SPG-UH-IPH15P",
      barcode: "890123456006",
      category: "case_protector" as const,
      costPricePaise: 95000,
      sellingPricePaise: 169900,
      mrpPaise: 219900,
      taxType: "GST" as const,
      gstRatePercent: "18.00",
      hsnCode: "39269099",
      trackSerialNumbers: false,
      stockQty: 50,
    },
    {
      name: "Tempered Glass Screen Protector (Normal Non-GST Bill Item)",
      brand: "Boat",
      slug: "tempered-glass-screen-protector-general",
      sku: "TG-GEN-01",
      barcode: "890123456009",
      category: "case_protector" as const,
      costPricePaise: 5000,
      sellingPricePaise: 15000,
      mrpPaise: 25000,
      taxType: "exempt" as const,
      gstRatePercent: "0.00",
      hsnCode: "70071900",
      trackSerialNumbers: false,
      stockQty: 100,
    },
  ];

  const seededProducts: { id: string; name: string; price: number; imeis?: string[]; gstRate: string; hsn: string; sku: string }[] = [];

  for (const p of productList) {
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.sku, p.sku))
      .limit(1);

    let prodId: string;
    if (existing.length > 0) {
      prodId = existing[0].id;
    } else {
      const [newP] = await db
        .insert(products)
        .values({
          organisationId: org.id,
          brandId: brandMap.get(p.brand) || null,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          barcode: p.barcode,
          category: p.category,
          costPricePaise: p.costPricePaise,
          sellingPricePaise: p.sellingPricePaise,
          mrpPaise: p.mrpPaise,
          taxType: p.taxType,
          gstRatePercent: p.gstRatePercent,
          hsnCode: p.hsnCode,
          trackSerialNumbers: p.trackSerialNumbers,
          status: "active",
          isPublishedOnline: true,
        })
        .returning();
      prodId = newP.id;
    }

    seededProducts.push({
      id: prodId,
      name: p.name,
      price: p.sellingPricePaise,
      imeis: p.imeis,
      gstRate: p.gstRatePercent,
      hsn: p.hsnCode,
      sku: p.sku,
    });

    // Seed Inventory Balance
    await db
      .insert(inventoryBalances)
      .values({
        organisationId: org.id,
        branchId: branch.id,
        productId: prodId,
        quantityOnHand: p.stockQty,
        quantityReserved: 0,
        reorderLevel: 5,
      })
      .onConflictDoNothing();

    // Seed Device Units (IMEIs)
    if (p.imeis && p.imeis.length > 0) {
      for (const imei of p.imeis) {
        const unitExist = await db
          .select()
          .from(deviceUnits)
          .where(eq(deviceUnits.imei1, imei))
          .limit(1);
        if (unitExist.length === 0) {
          await db.insert(deviceUnits).values({
            organisationId: org.id,
            branchId: branch.id,
            productId: prodId,
            imei1: imei,
            serialNumber: imei,
            condition: "new",
            acquisitionCostPaise: p.costPricePaise,
            sellingPricePaise: p.sellingPricePaise,
            isSold: false,
          });
        }
      }
    }
  }
  console.log(`  ✓ ${seededProducts.length} products with stock and IMEIs seeded`);

  // ── 10. Seed Sales & Invoices with Sale Payments ────────────────────────────
  console.log("\n🧾 Seeding Real Sales, Invoices & Split Payments...");

  const existingSale = await db
    .select()
    .from(sales)
    .where(eq(sales.invoiceNumber, "INV-2026-0042"))
    .limit(1);

  if (existingSale.length === 0 && seededProducts.length > 0) {
    // Sale 1: Rajesh Kumar (iPhone 15 Pro Max) - Full GST Invoice
    const p1 = seededProducts[0];
    const rajeshId = customerMap.get("Rajesh Kumar") || null;
    const taxable1 = Math.round(p1.price / 1.18);
    const tax1 = p1.price - taxable1;
    const cgst1 = Math.round(tax1 / 2);
    const sgst1 = tax1 - cgst1;

    const [sale1] = await db
      .insert(sales)
      .values({
        organisationId: org.id,
        branchId: branch.id,
        invoiceNumber: "INV-2026-0042",
        customerId: rajeshId,
        customerNameSnapshot: "Rajesh Kumar",
        customerPhoneSnapshot: "9840123456",
        customerGstinSnapshot: "33AAACR1234F1Z1",
        subtotalPaise: taxable1,
        taxableAmountPaise: taxable1,
        cgstPaise: cgst1,
        sgstPaise: sgst1,
        totalTaxPaise: tax1,
        discountPaise: 0,
        roundOffPaise: 0,
        grandTotalPaise: p1.price,
        paidPaise: p1.price,
        status: "completed",
        performedBy: ownerAuthId,
        notes: "GST Tax Invoice - UPI Payment",
      })
      .returning();

    // Line item
    await db.insert(saleItems).values({
      saleId: sale1.id,
      productId: p1.id,
      productNameSnapshot: p1.name,
      skuSnapshot: p1.sku,
      hsnCodeSnapshot: p1.hsn,
      imei1Snapshot: "358291048291048",
      quantity: 1,
      unitPricePaise: p1.price,
      taxableAmountPaise: taxable1,
      gstRatePercent: "18.00",
      cgstPaise: cgst1,
      sgstPaise: sgst1,
      lineTotalPaise: p1.price,
    });

    // Payment record
    await db.insert(salePayments).values({
      saleId: sale1.id,
      method: "upi",
      amountPaise: p1.price,
      referenceNo: "UPI/2610221435/SURIYA",
      recordedBy: ownerAuthId,
      notes: "Google Pay / PhonePe UPI transfer",
    });

    // Sale 2: Priya Sundaram (AirPods Pro + Anker 65W) - GST Invoice
    const pAirpods = seededProducts[3];
    const pCharger = seededProducts[4];
    const total2 = pAirpods.price + pCharger.price;
    const taxable2 = Math.round(total2 / 1.18);
    const tax2 = total2 - taxable2;
    const cgst2 = Math.round(tax2 / 2);
    const sgst2 = tax2 - cgst2;

    const [sale2] = await db
      .insert(sales)
      .values({
        organisationId: org.id,
        branchId: branch.id,
        invoiceNumber: "INV-2026-0043",
        customerId: customerMap.get("Priya Sundaram") || null,
        customerNameSnapshot: "Priya Sundaram",
        customerPhoneSnapshot: "9841234567",
        subtotalPaise: taxable2,
        taxableAmountPaise: taxable2,
        cgstPaise: cgst2,
        sgstPaise: sgst2,
        totalTaxPaise: tax2,
        discountPaise: 0,
        roundOffPaise: 0,
        grandTotalPaise: total2,
        paidPaise: total2,
        status: "completed",
        performedBy: ownerAuthId,
        notes: "Card payment at POS",
      })
      .returning();

    await db.insert(saleItems).values([
      {
        saleId: sale2.id,
        productId: pAirpods.id,
        productNameSnapshot: pAirpods.name,
        skuSnapshot: pAirpods.sku,
        hsnCodeSnapshot: pAirpods.hsn,
        imei1Snapshot: "APRO2-849102",
        quantity: 1,
        unitPricePaise: pAirpods.price,
        taxableAmountPaise: Math.round(pAirpods.price / 1.18),
        gstRatePercent: "18.00",
        cgstPaise: Math.round((pAirpods.price - Math.round(pAirpods.price / 1.18)) / 2),
        sgstPaise: Math.round((pAirpods.price - Math.round(pAirpods.price / 1.18)) / 2),
        lineTotalPaise: pAirpods.price,
      },
      {
        saleId: sale2.id,
        productId: pCharger.id,
        productNameSnapshot: pCharger.name,
        skuSnapshot: pCharger.sku,
        hsnCodeSnapshot: pCharger.hsn,
        quantity: 1,
        unitPricePaise: pCharger.price,
        taxableAmountPaise: Math.round(pCharger.price / 1.18),
        gstRatePercent: "18.00",
        cgstPaise: Math.round((pCharger.price - Math.round(pCharger.price / 1.18)) / 2),
        sgstPaise: Math.round((pCharger.price - Math.round(pCharger.price / 1.18)) / 2),
        lineTotalPaise: pCharger.price,
      },
    ]);

    await db.insert(salePayments).values({
      saleId: sale2.id,
      method: "card",
      amountPaise: total2,
      referenceNo: "HDFC-POS-892110",
      recordedBy: ownerAuthId,
    });

    // Sale 3: Walk-in Cash Memo / Non-GST Estimate Bill (Tempered Glass + Screen Guard)
    const pNonGst = seededProducts[6];
    const total3 = pNonGst.price * 2;

    const [sale3] = await db
      .insert(sales)
      .values({
        organisationId: org.id,
        branchId: branch.id,
        invoiceNumber: "EST-2026-0012",
        customerId: customerMap.get("Walk-in Customer") || null,
        customerNameSnapshot: "Walk-in Cash Customer",
        customerPhoneSnapshot: "",
        subtotalPaise: total3,
        taxableAmountPaise: total3,
        cgstPaise: 0,
        sgstPaise: 0,
        totalTaxPaise: 0,
        discountPaise: 0,
        roundOffPaise: 0,
        grandTotalPaise: total3,
        paidPaise: total3,
        status: "completed",
        performedBy: ownerAuthId,
        notes: "Retail Cash Estimate Memo (Non-GST / Normal Bill)",
      })
      .returning();

    await db.insert(saleItems).values({
      saleId: sale3.id,
      productId: pNonGst.id,
      productNameSnapshot: pNonGst.name,
      skuSnapshot: pNonGst.sku,
      hsnCodeSnapshot: pNonGst.hsn,
      quantity: 2,
      unitPricePaise: pNonGst.price,
      taxableAmountPaise: total3,
      gstRatePercent: "0.00",
      cgstPaise: 0,
      sgstPaise: 0,
      lineTotalPaise: total3,
    });

    await db.insert(salePayments).values({
      saleId: sale3.id,
      method: "cash",
      amountPaise: total3,
      recordedBy: ownerAuthId,
      notes: "Counter Cash Received",
    });

    console.log("  ✓ Invoices INV-2026-0042, INV-2026-0043 & EST-2026-0012 created with payment records!");
  }

  console.log("\n🎉 Full Database Seed Completed Successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  🏢 Organisation: ${org.name}`);
  console.log(`  🏪 Main Branch:  ${branch.name} (${branch.code})`);
  console.log(`  👤 Owner Login:  ${ownerEmail}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
