/**
 * Financial calculation utilities for Suriya Mobiles
 *
 * All monetary values are stored and calculated in PAISE (₹1 = 100 paise).
 * This avoids floating-point errors in financial calculations.
 *
 * Rules:
 * - Always use integer paise for storage and DB
 * - Round half-up for GST calculations
 * - Never use floating point for money
 */

// ─── Paise Conversions ────────────────────────────────────────────────────────

/** Convert rupees (number) to paise (integer) */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise (integer) to rupees (number) */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Format paise as INR string e.g. "₹1,234.56" */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paiseToRupees(paise));
}

/** Format paise as plain number string e.g. "1234.56" */
export function formatAmount(paise: number): string {
  return paiseToRupees(paise).toFixed(2);
}

// ─── GST Calculations ─────────────────────────────────────────────────────────

interface GSTBreakdown {
  taxableAmountPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
  lineTotalPaise: number;
}

/**
 * Calculate GST breakdown for a line item.
 *
 * @param priceAfterDiscountPaise - Price after discount, before tax (paise)
 * @param gstRatePercent - GST rate as percentage (e.g., 18 for 18%)
 * @param isInterState - If true, use IGST; if false, split as CGST + SGST
 * @param quantity - Quantity of items
 */
export function calculateGST(
  priceAfterDiscountPaise: number,
  gstRatePercent: number,
  isInterState: boolean = false,
  quantity: number = 1
): GSTBreakdown {
  const taxableAmountPaise = priceAfterDiscountPaise * quantity;
  const totalTaxPaise = Math.round((taxableAmountPaise * gstRatePercent) / 100);

  if (isInterState) {
    return {
      taxableAmountPaise,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: totalTaxPaise,
      totalTaxPaise,
      lineTotalPaise: taxableAmountPaise + totalTaxPaise,
    };
  }

  const halfTaxPaise = Math.floor(totalTaxPaise / 2);
  const cgstPaise = halfTaxPaise;
  const sgstPaise = totalTaxPaise - halfTaxPaise; // handles odd paise

  return {
    taxableAmountPaise,
    cgstPaise,
    sgstPaise,
    igstPaise: 0,
    totalTaxPaise,
    lineTotalPaise: taxableAmountPaise + totalTaxPaise,
  };
}

// ─── Cart / Invoice Totals ────────────────────────────────────────────────────

interface CartItem {
  unitPricePaise: number;
  quantity: number;
  discountPaise: number;
  gstRatePercent: number;
  isInterState?: boolean;
}

interface CartTotals {
  subtotalPaise: number;
  totalDiscountPaise: number;
  taxableAmountPaise: number;
  totalCgstPaise: number;
  totalSgstPaise: number;
  totalIgstPaise: number;
  totalTaxPaise: number;
  grandTotalBeforeRoundOff: number;
  roundOffPaise: number;
  grandTotalPaise: number;
}

export function calculateCartTotals(
  items: CartItem[],
  additionalDiscountPaise: number = 0
): CartTotals {
  let subtotalPaise = 0;
  let totalItemDiscountPaise = 0;
  let taxableAmountPaise = 0;
  let totalCgstPaise = 0;
  let totalSgstPaise = 0;
  let totalIgstPaise = 0;
  let totalTaxPaise = 0;

  for (const item of items) {
    const lineSubtotal = item.unitPricePaise * item.quantity;
    const lineDiscount = Math.min(item.discountPaise, lineSubtotal);
    const priceAfterDiscount = lineSubtotal - lineDiscount;

    subtotalPaise += lineSubtotal;
    totalItemDiscountPaise += lineDiscount;

    const gst = calculateGST(
      priceAfterDiscount,
      item.gstRatePercent,
      item.isInterState ?? false,
      1 // already multiplied in priceAfterDiscount
    );

    taxableAmountPaise += gst.taxableAmountPaise;
    totalCgstPaise += gst.cgstPaise;
    totalSgstPaise += gst.sgstPaise;
    totalIgstPaise += gst.igstPaise;
    totalTaxPaise += gst.totalTaxPaise;
  }

  const totalDiscountPaise = totalItemDiscountPaise + additionalDiscountPaise;
  const grandTotalBeforeRoundOff = taxableAmountPaise + totalTaxPaise - additionalDiscountPaise;

  // Round to nearest rupee
  const roundedRupees = Math.round(grandTotalBeforeRoundOff / 100);
  const grandTotalPaise = roundedRupees * 100;
  const roundOffPaise = grandTotalPaise - grandTotalBeforeRoundOff;

  return {
    subtotalPaise,
    totalDiscountPaise,
    taxableAmountPaise: taxableAmountPaise - additionalDiscountPaise,
    totalCgstPaise,
    totalSgstPaise,
    totalIgstPaise,
    totalTaxPaise,
    grandTotalBeforeRoundOff,
    roundOffPaise,
    grandTotalPaise,
  };
}

// ─── Invoice Number Generator ─────────────────────────────────────────────────

/**
 * Generates a unique invoice number based on branch code and timestamp.
 * Format: SM-{BRANCH}-{YYYYMMDD}-{SEQUENCE}
 * Actual sequence is managed by DB to guarantee uniqueness.
 */
export function generateInvoicePrefix(branchCode: string): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  return `SM-${branchCode.toUpperCase()}-${datePart}`;
}

// ─── Discount Validation ─────────────────────────────────────────────────────

const MAX_CASHIER_DISCOUNT_PERCENT = 5;
const MAX_ADMIN_DISCOUNT_PERCENT = 15;

export function validateDiscount(
  role: string,
  discountPaise: number,
  grandTotalBeforeDiscountPaise: number
): { valid: boolean; maxAllowedPercent: number; error?: string } {
  if (grandTotalBeforeDiscountPaise === 0) {
    return { valid: true, maxAllowedPercent: 0 };
  }

  const discountPercent = (discountPaise / grandTotalBeforeDiscountPaise) * 100;
  const maxPercent =
    role === "owner"
      ? 100
      : role === "admin"
      ? MAX_ADMIN_DISCOUNT_PERCENT
      : MAX_CASHIER_DISCOUNT_PERCENT;

  if (discountPercent > maxPercent) {
    return {
      valid: false,
      maxAllowedPercent: maxPercent,
      error: `Discount of ${discountPercent.toFixed(1)}% exceeds the maximum allowed ${maxPercent}% for role '${role}'.`,
    };
  }

  return { valid: true, maxAllowedPercent: maxPercent };
}
