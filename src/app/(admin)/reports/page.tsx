"use client";

import { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Receipt,
  TrendingUp,
  Percent,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { formatINR } from "@/lib/finance";

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-10");

  // GST metrics
  const taxableTurnoverPaise = 246500000; // ~₹24.65L
  const cgstCollectedPaise = 22185000;   // ~₹2.21L
  const sgstCollectedPaise = 22185000;   // ~₹2.21L
  const totalGstPaise = cgstCollectedPaise + sgstCollectedPaise;
  const grossSalesPaise = taxableTurnoverPaise + totalGstPaise;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              GST Tax Reports & Revenue Analytics
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated GSTR-1 summaries, HSN-wise tax liability & branch sales reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-semibold focus:outline-none text-foreground"
          />
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md">
            <Download className="w-3.5 h-3.5" />
            <span>Export GSTR-1 Excel</span>
          </button>
        </div>
      </div>

      {/* Tax Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">Gross Revenue (M-T-D)</span>
          <h3 className="text-2xl font-bold text-foreground mt-2">
            {formatINR(grossSalesPaise)}
          </h3>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">100% Tax Compliant</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">Taxable Value (Base)</span>
          <h3 className="text-2xl font-bold text-foreground mt-2">
            {formatINR(taxableTurnoverPaise)}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">Excluding GST</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">CGST (9%) Collected</span>
          <h3 className="text-2xl font-bold text-sky-400 mt-2">
            {formatINR(cgstCollectedPaise)}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">Central Tax Liability</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">SGST (9%) Collected</span>
          <h3 className="text-2xl font-bold text-indigo-400 mt-2">
            {formatINR(sgstCollectedPaise)}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">Tamil Nadu State Tax</p>
        </div>
      </div>

      {/* HSN Wise Summary Table */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">HSN-Wise GST Breakdown</h3>
            <p className="text-xs text-muted-foreground">Summary required for GSTR-1 Table 12 filing</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            GSTIN: 33AAAAA0000A1Z5
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="pb-3 font-semibold">HSN Code</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold text-center">GST Rate</th>
                <th className="pb-3 font-semibold text-right">Taxable Turnover</th>
                <th className="pb-3 font-semibold text-right">CGST</th>
                <th className="pb-3 font-semibold text-right">SGST</th>
                <th className="pb-3 font-semibold text-right">Total GST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono text-xs">
              <tr className="hover:bg-muted/30">
                <td className="py-3 font-bold text-foreground">85171300</td>
                <td className="py-3 font-sans text-muted-foreground">Smartphones & Cellular phones</td>
                <td className="py-3 text-center">18%</td>
                <td className="py-3 text-right">{formatINR(210000000)}</td>
                <td className="py-3 text-right">{formatINR(18900000)}</td>
                <td className="py-3 text-right">{formatINR(18900000)}</td>
                <td className="py-3 text-right font-bold text-foreground">{formatINR(37800000)}</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="py-3 font-bold text-foreground">85183000</td>
                <td className="py-3 font-sans text-muted-foreground">Headphones, Earphones & Audio</td>
                <td className="py-3 text-center">18%</td>
                <td className="py-3 text-right">{formatINR(22000000)}</td>
                <td className="py-3 text-right">{formatINR(1980000)}</td>
                <td className="py-3 text-right">{formatINR(1980000)}</td>
                <td className="py-3 text-right font-bold text-foreground">{formatINR(3960000)}</td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="py-3 font-bold text-foreground">998713</td>
                <td className="py-3 font-sans text-muted-foreground">Repair & Maintenance of Phones</td>
                <td className="py-3 text-center">18%</td>
                <td className="py-3 text-right">{formatINR(14500000)}</td>
                <td className="py-3 text-right">{formatINR(1305000)}</td>
                <td className="py-3 text-right">{formatINR(1305000)}</td>
                <td className="py-3 text-right font-bold text-foreground">{formatINR(2610000)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
