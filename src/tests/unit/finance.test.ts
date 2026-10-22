import { describe, it, expect } from "vitest";
import {
  rupeesToPaise,
  paiseToRupees,
  calculateGST,
  calculateCartTotals,
  formatINR,
  validateDiscount,
} from "@/lib/finance";

describe("paise conversions", () => {
  it("converts rupees to paise correctly", () => {
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise(1)).toBe(100);
    expect(rupeesToPaise(1234.56)).toBe(123456);
    expect(rupeesToPaise(0)).toBe(0);
  });

  it("converts paise to rupees correctly", () => {
    expect(paiseToRupees(10000)).toBe(100);
    expect(paiseToRupees(100)).toBe(1);
    expect(paiseToRupees(0)).toBe(0);
  });

  it("formats INR correctly", () => {
    expect(formatINR(10000)).toBe("₹100.00");
    expect(formatINR(0)).toBe("₹0.00");
  });
});

describe("GST calculations", () => {
  it("calculates 18% GST intrastate correctly", () => {
    const result = calculateGST(10000, 18, false); // ₹100 at 18%
    expect(result.taxableAmountPaise).toBe(10000);
    expect(result.totalTaxPaise).toBe(1800);
    expect(result.cgstPaise).toBe(900);
    expect(result.sgstPaise).toBe(900);
    expect(result.igstPaise).toBe(0);
    expect(result.lineTotalPaise).toBe(11800);
  });

  it("calculates 18% GST interstate (IGST) correctly", () => {
    const result = calculateGST(10000, 18, true);
    expect(result.igstPaise).toBe(1800);
    expect(result.cgstPaise).toBe(0);
    expect(result.sgstPaise).toBe(0);
    expect(result.lineTotalPaise).toBe(11800);
  });

  it("calculates 5% GST correctly", () => {
    const result = calculateGST(10000, 5, false);
    expect(result.totalTaxPaise).toBe(500);
    expect(result.cgstPaise).toBe(250);
    expect(result.sgstPaise).toBe(250);
    expect(result.lineTotalPaise).toBe(10500);
  });

  it("calculates 0% GST (exempt) correctly", () => {
    const result = calculateGST(10000, 0, false);
    expect(result.totalTaxPaise).toBe(0);
    expect(result.lineTotalPaise).toBe(10000);
  });

  it("handles CGST+SGST rounding for odd amounts", () => {
    // 3% on ₹100 = ₹3.00 — splits evenly
    const result = calculateGST(10000, 3, false);
    expect(result.totalTaxPaise).toBe(300);
    expect(result.cgstPaise + result.sgstPaise).toBe(result.totalTaxPaise);
  });
});

describe("Cart totals", () => {
  it("calculates a simple single-item cart", () => {
    const items = [
      { unitPricePaise: 50000, quantity: 1, discountPaise: 0, gstRatePercent: 18 },
    ];
    const totals = calculateCartTotals(items);
    expect(totals.subtotalPaise).toBe(50000);
    expect(totals.taxableAmountPaise).toBe(50000);
    expect(totals.totalTaxPaise).toBe(9000);
    expect(totals.grandTotalPaise).toBe(59000);
  });

  it("applies item-level discounts before tax", () => {
    const items = [
      { unitPricePaise: 50000, quantity: 1, discountPaise: 5000, gstRatePercent: 18 },
    ];
    const totals = calculateCartTotals(items);
    expect(totals.taxableAmountPaise).toBe(45000); // 500 - 50 discount
    expect(totals.totalTaxPaise).toBe(8100); // 18% of ₹450
    expect(totals.grandTotalPaise).toBe(53100);
  });

  it("calculates multi-item cart correctly", () => {
    const items = [
      { unitPricePaise: 30000, quantity: 2, discountPaise: 0, gstRatePercent: 18 },
      { unitPricePaise: 10000, quantity: 1, discountPaise: 1000, gstRatePercent: 12 },
    ];
    const totals = calculateCartTotals(items);
    // Item 1: 60000 taxable, 10800 GST
    // Item 2: 9000 taxable, 1080 GST
    // Total taxable: 69000, Total GST: 11880, Grand = 80880
    // Round to nearest rupee: 80880 → ₹808.80 → rounds to ₹809.00 = 80900
    expect(totals.taxableAmountPaise).toBe(69000);
    expect(totals.totalTaxPaise).toBe(11880);
    expect(totals.grandTotalPaise).toBe(80900); // rounded to nearest rupee
    expect(totals.roundOffPaise).toBe(20); // +20 paise round-off
  });

  it("rounds grand total to nearest rupee", () => {
    const items = [
      { unitPricePaise: 10001, quantity: 1, discountPaise: 0, gstRatePercent: 18 },
    ];
    const totals = calculateCartTotals(items);
    // Must be divisible by 100 (whole rupees)
    expect(totals.grandTotalPaise % 100).toBe(0);
  });

  it("invoice total and tax calculations are correct for standard test case", () => {
    // Standard test: ₹1000 phone at 18% GST
    const items = [
      { unitPricePaise: 100000, quantity: 1, discountPaise: 0, gstRatePercent: 18 },
    ];
    const totals = calculateCartTotals(items);
    expect(totals.subtotalPaise).toBe(100000);
    expect(totals.totalTaxPaise).toBe(18000);
    expect(totals.grandTotalPaise).toBe(118000);
    expect(totals.totalCgstPaise).toBe(9000);
    expect(totals.totalSgstPaise).toBe(9000);
  });
});

describe("Discount validation", () => {
  it("owner can apply any discount including 100%", () => {
    const result = validateDiscount("owner", 50000, 50000);
    expect(result.valid).toBe(true);
  });

  it("cashier can apply up to 5% discount", () => {
    const result = validateDiscount("cashier", 500, 10000); // 5%
    expect(result.valid).toBe(true);
  });

  it("cashier cannot apply more than 5% discount", () => {
    const result = validateDiscount("cashier", 600, 10000); // 6%
    expect(result.valid).toBe(false);
    expect(result.error).toContain("5%");
  });

  it("admin can apply up to 15% discount", () => {
    const result = validateDiscount("admin", 1500, 10000); // 15%
    expect(result.valid).toBe(true);
  });

  it("admin cannot apply more than 15% discount", () => {
    const result = validateDiscount("admin", 1600, 10000); // 16%
    expect(result.valid).toBe(false);
  });
});
