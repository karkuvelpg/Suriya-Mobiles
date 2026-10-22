"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Receipt,
  Wrench,
  AlertCircle,
  ArrowUpRight,
  Smartphone,
  Plus,
  ScanBarcode,
  ShoppingBag,
  ExternalLink,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@/lib/finance";
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_REPAIRS } from "@/lib/mock-data";

export default function DashboardPage() {
  const [sales] = useState(INITIAL_SALES);
  const [repairs] = useState(INITIAL_REPAIRS);
  const [products] = useState(INITIAL_PRODUCTS);

  // Today metrics
  const totalTodaySalesPaise = sales.reduce((acc, curr) => acc + curr.grandTotalPaise, 0);
  const totalInvoicesToday = sales.length;
  const activeRepairsCount = repairs.filter((r) => r.status !== "DELIVERED").length;
  const lowStockItems = products.filter((p) => p.stockQty <= p.lowStockThreshold);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-background border border-sky-500/20 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Live Store Operations
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, Suriya! 🚀
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Main Branch (Anna Nagar) is actively syncing. 2 new repair requests require technician assignment.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/pos"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
          <Link
            href="/inventory"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/80 hover:bg-accent text-foreground font-semibold text-xs transition-all hover:scale-105 active:scale-95"
          >
            <ScanBarcode className="w-4 h-4 text-sky-400" />
            <span>Scan IMEI</span>
          </Link>
          <Link
            href="/repairs"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/80 hover:bg-accent text-foreground font-semibold text-xs transition-all hover:scale-105 active:scale-95"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>New Job Sheet</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card/50 hover:bg-card/80 transition-all shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Today&apos;s Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {formatINR(totalTodaySalesPaise)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-500 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Invoices Generated */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card/50 hover:bg-card/80 transition-all shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Invoices Generated</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {totalInvoicesToday} Bills
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-medium">
              <span>Avg bill value: {formatINR(Math.round(totalTodaySalesPaise / (totalInvoicesToday || 1)))}</span>
            </div>
          </div>
        </div>

        {/* Active Repairs */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card/50 hover:bg-card/80 transition-all shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Service & Repairs</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {activeRepairsCount} In Progress
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 font-medium">
              <span>1 ready for pickup</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="p-5 rounded-2xl border border-border/80 bg-card/50 hover:bg-card/80 transition-all shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {lowStockItems.length} Products
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-500 font-medium">
              <span>Require immediate purchase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Sales & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Recent Invoices</h2>
              <p className="text-xs text-muted-foreground">Real-time billing transactions from POS</p>
            </div>
            <Link
              href="/sales"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All Invoices <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-3 font-semibold">Bill #</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Mode</th>
                  <th className="pb-3 font-semibold text-right">Grand Total</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 font-mono font-medium text-foreground">
                      {sale.invoiceNumber}
                      <span className="block text-[10px] text-muted-foreground font-sans">
                        {sale.date}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-foreground">{sale.customerName}</p>
                      <p className="text-[11px] text-muted-foreground">{sale.customerPhone}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-sky-500/10 text-sky-500 border border-sky-500/20">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-foreground">
                      {formatINR(sale.grandTotalPaise)}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/sales?inv=${sale.invoiceNumber}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80"
                      >
                        Print GST <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Urgent Low Stock Alert + Service Status */}
        <div className="space-y-6">
          {/* Low Stock Card */}
          <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-foreground">Low Stock Alert</h3>
              </div>
              <Link href="/inventory" className="text-[11px] text-primary font-medium hover:underline">
                Manage Stock
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-muted/20"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-xs truncate text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {item.stockQty} left
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      Min: {item.lowStockThreshold}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service & Repair Quick Glance */}
          <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-foreground">Active Repair Jobs</h3>
              </div>
              <Link href="/repairs" className="text-[11px] text-primary font-medium hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {repairs.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{rep.deviceModel}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{rep.issueDescription}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>Est: {formatINR(rep.estimatedCostPaise)}</span>
                    <span>Due: {rep.expectedDelivery}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
