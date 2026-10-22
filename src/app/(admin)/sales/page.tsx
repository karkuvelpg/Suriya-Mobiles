"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Search,
  Printer,
  RotateCcw,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  Smartphone,
} from "lucide-react";
import { formatINR } from "@/lib/finance";
import { INITIAL_SALES, SaleInvoice } from "@/lib/mock-data";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleInvoice[]>(INITIAL_SALES);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoice | null>(null);

  const filtered = sales.filter((s) => {
    const matchMethod = methodFilter === "all" || s.paymentMethod === methodFilter;
    const matchSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.customerPhone.includes(search) ||
      s.items.some((it) => it.imei?.includes(search) || it.productName.toLowerCase().includes(search.toLowerCase()));
    return matchMethod && matchSearch;
  });

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
            Complete audit trail of all in-store POS and online sales with GST breakup & reprint capability
          </p>
        </div>
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

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:outline-none text-foreground"
        >
          <option value="all">All Payment Methods</option>
          <option value="UPI">UPI Payments</option>
          <option value="CASH">Cash Bills</option>
          <option value="CARD">Debit / Credit Card</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Bill # & Date</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Items Sold</th>
                <th className="py-3 px-3 font-semibold">Payment</th>
                <th className="py-3 px-3 font-semibold text-right">Taxable</th>
                <th className="py-3 px-3 font-semibold text-right">GST (18%)</th>
                <th className="py-3 px-3 font-semibold text-right">Grand Total</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-foreground">{inv.invoiceNumber}</span>
                    <span className="block text-[10px] text-muted-foreground font-sans">
                      {inv.date}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-foreground">{inv.customerName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{inv.customerPhone}</p>
                    {inv.customerGstin && (
                      <span className="text-[9px] px-1 rounded bg-sky-500/10 text-sky-400 font-mono">
                        {inv.customerGstin}
                      </span>
                    )}
                  </td>
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
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {inv.paymentMethod}
                    </span>
                    <span className="block text-[10px] text-emerald-500 font-medium mt-0.5">
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-muted-foreground">
                    {formatINR(inv.subtotalPaise)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-muted-foreground font-mono">
                    {formatINR(inv.cgstPaise + inv.sgstPaise)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-foreground">
                    {formatINR(inv.grandTotalPaise)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium hover:bg-muted"
                      >
                        <Eye className="w-3 h-3 text-sky-400" />
                        <span>View / Print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details & Thermal Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tax Invoice Details */}
            <div className="space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-dashed border-border">
                <h2 className="text-lg font-black tracking-tight text-foreground uppercase">
                  Suriya Mobiles
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  128, 2nd Avenue, Anna Nagar, Chennai — 600040
                </p>
                <p className="text-[10px] font-mono font-semibold text-foreground mt-0.5">
                  GSTIN: 33AAAAA0000A1Z5 | Cashier: {selectedInvoice.cashierName}
                </p>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] mt-1.5 uppercase">
                  Tax Invoice: {selectedInvoice.invoiceNumber}
                </div>
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
                  <span>Taxable Value:</span>
                  <span>{formatINR(selectedInvoice.subtotalPaise)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>CGST (9%):</span>
                  <span>{formatINR(selectedInvoice.cgstPaise)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>SGST (9%):</span>
                  <span>{formatINR(selectedInvoice.sgstPaise)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-foreground pt-1 border-t border-border">
                  <span>Grand Total:</span>
                  <span className="text-emerald-500">{formatINR(selectedInvoice.grandTotalPaise)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
