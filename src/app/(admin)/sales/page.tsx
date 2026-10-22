"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileSpreadsheet,
  Search,
  Download,
  Eye,
  Printer,
  X,
  CreditCard,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { formatINR } from "@/lib/finance";
import { INITIAL_SALES, SaleInvoice } from "@/lib/mock-data";

function SalesHistoryContent() {
  const searchParams = useSearchParams();
  const [sales] = useState<SaleInvoice[]>(INITIAL_SALES);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [billTypeFilter, setBillTypeFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);

  // If redirected with ?inv=INV-2026-0042, auto open
  useEffect(() => {
    const invNumber = searchParams.get("inv");
    if (invNumber) {
      const match = sales.find((s) => s.invoiceNumber === invNumber);
      if (match) setSelectedInvoice(match);
    }
  }, [searchParams, sales]);

  const filtered = sales.filter((s) => {
    const matchMethod = methodFilter === "all" || s.paymentMethod === methodFilter;
    const isGst = s.invoiceType !== "RETAIL_ESTIMATE" && !s.invoiceNumber.startsWith("EST");
    const matchType =
      billTypeFilter === "all"
        ? true
        : billTypeFilter === "gst"
        ? isGst
        : !isGst;

    const matchSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.customerPhone.includes(search) ||
      (s.items && s.items.some((it) => it.imei?.includes(search) || it.productName.toLowerCase().includes(search.toLowerCase())));
    return matchMethod && matchType && matchSearch;
  });

  const exportSalesCsv = () => {
    const headers = [
      "Invoice Number",
      "Bill Type",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Payment Method",
      "Payment Status",
      "Taxable Subtotal (INR)",
      "CGST (INR)",
      "SGST (INR)",
      "Grand Total (INR)",
    ];

    const rows = filtered.map((s) => {
      const isGst = s.invoiceType !== "RETAIL_ESTIMATE" && !s.invoiceNumber.startsWith("EST");
      return [
        s.invoiceNumber,
        isGst ? "GST Tax Invoice" : "Normal Retail Bill",
        `"${s.date}"`,
        `"${s.customerName}"`,
        s.customerPhone,
        s.paymentMethod,
        s.paymentStatus,
        (s.subtotalPaise / 100).toFixed(2),
        (s.cgstPaise / 100).toFixed(2),
        (s.sgstPaise / 100).toFixed(2),
        (s.grandTotalPaise / 100).toFixed(2),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Suriya_Mobiles_Sales_Register.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sales Invoices & Tax Register
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete audit trail of all in-store POS sales with GST breakdown, cash memo history & reprint engine
          </p>
        </div>

        <button
          onClick={exportSalesCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice number, customer phone, customer name, IMEI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-card/60 focus:bg-background text-xs font-medium focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={billTypeFilter}
            onChange={(e) => setBillTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:outline-none text-foreground cursor-pointer"
          >
            <option value="all">All Bill Types</option>
            <option value="gst">GST Tax Invoices Only</option>
            <option value="normal">Normal Retail Bills Only</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:outline-none text-foreground cursor-pointer"
          >
            <option value="all">All Payment Modes</option>
            <option value="UPI">UPI / QR</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="SPLIT">Split Payment</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Bill # & Date</th>
                <th className="py-3 px-3 font-semibold">Bill Type</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Items Sold</th>
                <th className="py-3 px-3 font-semibold">Payment</th>
                <th className="py-3 px-3 font-semibold text-right">Taxable</th>
                <th className="py-3 px-3 font-semibold text-right">GST Total</th>
                <th className="py-3 px-3 font-semibold text-right">Grand Total</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((inv) => {
                const isGst = inv.invoiceType !== "RETAIL_ESTIMATE" && !inv.invoiceNumber.startsWith("EST");
                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    {/* Bill # */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-foreground">{inv.invoiceNumber}</span>
                      <span className="block text-[10px] text-muted-foreground font-sans">
                        {inv.date}
                      </span>
                    </td>

                    {/* Bill Type Badge */}
                    <td className="py-3.5 px-3">
                      {isGst ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/25">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Tax Invoice</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                          <FileText className="w-3 h-3" />
                          <span>Normal Bill</span>
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-foreground">{inv.customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{inv.customerPhone}</p>
                      {inv.customerGstin && (
                        <span className="text-[9px] px-1 rounded bg-sky-500/10 text-sky-400 font-mono">
                          {inv.customerGstin}
                        </span>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        {inv.items.map((it, idx) => (
                          <div key={idx} className="text-[11px] text-foreground">
                            <span>{it.qty}x {it.productName}</span>
                            {it.imei && (
                              <span className="block text-[9px] font-mono text-sky-400">
                                IMEI: {it.imei}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {inv.paymentMethod}
                      </span>
                      <span className="block text-[10px] text-emerald-400 font-medium mt-0.5">
                        {inv.paymentStatus}
                      </span>
                    </td>

                    {/* Taxable */}
                    <td className="py-3.5 px-3 text-right text-muted-foreground font-mono">
                      {formatINR(inv.subtotalPaise)}
                    </td>

                    {/* GST Total */}
                    <td className="py-3.5 px-3 text-right text-muted-foreground font-mono">
                      {isGst ? formatINR(inv.cgstPaise + inv.sgstPaise) : "₹0.00"}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-3 text-right font-extrabold text-foreground">
                      {formatINR(inv.grandTotalPaise)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] font-semibold hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3 text-sky-400" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details & Thermal Print Modal */}
      {selectedInvoice && (() => {
        const isGst = selectedInvoice.invoiceType !== "RETAIL_ESTIMATE" && !selectedInvoice.invoiceNumber.startsWith("EST");
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Invoice Details */}
              <div className="space-y-4 text-xs font-sans">
                <div className="text-center pb-3 border-b border-dashed border-border space-y-1">
                  <h2 className="text-lg font-black tracking-tight text-foreground uppercase">
                    Suriya Mobiles
                  </h2>
                  <p className="text-[10px] text-muted-foreground">
                    128, 2nd Avenue, Anna Nagar, Chennai — 600040 | Ph: +91 98401 99999
                  </p>
                  {isGst ? (
                    <div>
                      <p className="text-[10px] font-mono font-semibold text-sky-400">
                        GSTIN: 33AAAAA0000A1Z5 | Cashier: {selectedInvoice.cashierName}
                      </p>
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold text-[10px] mt-1 uppercase">
                        GST Tax Invoice: {selectedInvoice.invoiceNumber}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Cashier: {selectedInvoice.cashierName}
                      </p>
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[10px] mt-1 uppercase">
                        Retail Cash Memo / Normal Bill: {selectedInvoice.invoiceNumber}
                      </div>
                    </div>
                  )}
                </div>

                <div className="py-2 border-b border-dashed border-border text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-foreground">{selectedInvoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-bold text-foreground">{selectedInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile:</span>
                    <span className="font-mono text-foreground">{selectedInvoice.customerPhone}</span>
                  </div>
                  {selectedInvoice.customerGstin && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GSTIN:</span>
                      <span className="font-mono font-bold text-sky-400">{selectedInvoice.customerGstin}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2 py-2 border-b border-dashed border-border">
                  {selectedInvoice.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <div>
                        <p className="font-semibold text-foreground">{it.productName}</p>
                        {it.imei && (
                          <p className="text-[10px] font-mono text-sky-400">
                            IMEI: {it.imei}
                          </p>
                        )}
                        <p className="text-[9px] text-muted-foreground">Qty: {it.qty}</p>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatINR(it.totalPaise)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-right text-[11px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal / Taxable:</span>
                    <span>{formatINR(selectedInvoice.subtotalPaise)}</span>
                  </div>

                  {isGst && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>CGST (Central):</span>
                        <span>{formatINR(selectedInvoice.cgstPaise)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>SGST (State):</span>
                        <span>{formatINR(selectedInvoice.sgstPaise)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between font-black text-sm text-foreground pt-1 border-t border-border">
                    <span>Grand Total:</span>
                    <span className="text-emerald-400">{formatINR(selectedInvoice.grandTotalPaise)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isGst ? "Print Tax Invoice" : "Print Cash Memo"}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function SalesHistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading invoices...</div>}>
      <SalesHistoryContent />
    </Suspense>
  );
}
