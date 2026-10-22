"use client";

import { useState } from "react";
import {
  Settings,
  Building,
  Printer,
  Shield,
  Smartphone,
  CheckCircle2,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Suriya Mobiles");
  const [gstin, setGstin] = useState("33AAAAA0000A1Z5");
  const [phone, setPhone] = useState("+91 98401 99999");
  const [address, setAddress] = useState("128, 2nd Avenue, Anna Nagar, Chennai — 600040");
  const [printerPaperSize, setPrinterPaperSize] = useState("80mm");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-2026-");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="pb-4 border-b border-border/70">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Store Profile & Station Configuration
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tax information, thermal POS printer specifications, branch parameters & invoice serialization
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
            Legal Business & Tax Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Business / Legal Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                GSTIN (15 Digits)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background font-mono font-bold focus:border-primary focus:outline-none text-foreground"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Primary Contact Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Invoice Series Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background font-mono focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Store Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* POS Hardware & Printer */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            POS Hardware & Receipt Format
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Thermal Printer Paper Width
              </label>
              <select
                value={printerPaperSize}
                onChange={(e) => setPrinterPaperSize(e.target.value)}
                className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-foreground"
              >
                <option value="80mm">80mm (Standard POS Thermal Receipt)</option>
                <option value="58mm">58mm (Compact Mobile Printer)</option>
                <option value="A4">A4 Tax Invoice (Laser / DeskJet)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Auto-Print on Bill Completion
              </label>
              <select className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-foreground">
                <option value="prompt">Prompt Preview Modal First</option>
                <option value="instant">Instant Print to Default ESC/POS Printer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md shadow-primary/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
