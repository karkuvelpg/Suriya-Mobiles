"use client";

import { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { formatINR } from "@/lib/finance";

interface HsnSummaryRow {
  hsnCode: string;
  description: string;
  gstRate: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  totalTaxPaise: number;
}

const HSN_DATA: HsnSummaryRow[] = [
  {
    hsnCode: "85171300",
    description: "Smartphones & Cellular phones",
    gstRate: 18,
    taxablePaise: 210000000,
    cgstPaise: 18900000,
    sgstPaise: 18900000,
    totalTaxPaise: 37800000,
  },
  {
    hsnCode: "85183000",
    description: "Headphones, Earphones & Audio",
    gstRate: 18,
    taxablePaise: 22000000,
    cgstPaise: 1980000,
    sgstPaise: 1980000,
    totalTaxPaise: 3960000,
  },
  {
    hsnCode: "998713",
    description: "Repair & Maintenance of Phones",
    gstRate: 18,
    taxablePaise: 14500000,
    cgstPaise: 1305000,
    sgstPaise: 1305000,
    totalTaxPaise: 2610000,
  },
];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [isExporting, setIsExporting] = useState(false);

  // GST metrics
  const taxableTurnoverPaise = HSN_DATA.reduce((acc, row) => acc + row.taxablePaise, 0);
  const cgstCollectedPaise = HSN_DATA.reduce((acc, row) => acc + row.cgstPaise, 0);
  const sgstCollectedPaise = HSN_DATA.reduce((acc, row) => acc + row.sgstPaise, 0);
  const totalGstPaise = cgstCollectedPaise + sgstCollectedPaise;
  const grossSalesPaise = taxableTurnoverPaise + totalGstPaise;

  const exportGstr1Csv = () => {
    setIsExporting(true);

    const headers = [
      "HSN/SAC",
      "Description",
      "GST Rate (%)",
      "Taxable Value (INR)",
      "CGST (INR)",
      "SGST (INR)",
      "Total Tax (INR)",
    ];

    const rows = HSN_DATA.map((r) => [
      r.hsnCode,
      `"${r.description}"`,
      `${r.gstRate}%`,
      (r.taxablePaise / 100).toFixed(2),
      (r.cgstPaise / 100).toFixed(2),
      (r.sgstPaise / 100).toFixed(2),
      (r.totalTaxPaise / 100).toFixed(2),
    ]);

    const totalsRow = [
      "TOTAL",
      "All Taxable Categories",
      "18% Avg",
      (taxableTurnoverPaise / 100).toFixed(2),
      (cgstCollectedPaise / 100).toFixed(2),
      (sgstCollectedPaise / 100).toFixed(2),
      (totalGstPaise / 100).toFixed(2),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(",")), totalsRow.join(",")].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Suriya_Mobiles_GSTR1_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 800);
  };

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
          <button
            onClick={exportGstr1Csv}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Exporting..." : "Export GSTR-1 CSV"}</span>
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
              {HSN_DATA.map((row) => (
                <tr key={row.hsnCode} className="hover:bg-muted/30">
                  <td className="py-3 font-bold text-foreground">{row.hsnCode}</td>
                  <td className="py-3 font-sans text-muted-foreground">{row.description}</td>
                  <td className="py-3 text-center">{row.gstRate}%</td>
                  <td className="py-3 text-right">{formatINR(row.taxablePaise)}</td>
                  <td className="py-3 text-right">{formatINR(row.cgstPaise)}</td>
                  <td className="py-3 text-right">{formatINR(row.sgstPaise)}</td>
                  <td className="py-3 text-right font-bold text-foreground">
                    {formatINR(row.totalTaxPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
