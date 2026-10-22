"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  PlusCircle,
  Bell,
  Building2,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const [branch, setBranch] = useState("branch-1");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 md:px-8 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search IMEI, phone, customer, bill #..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/70 focus:bg-background focus:border-primary text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Branch Selector */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/30 text-xs font-medium">
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer text-foreground"
          >
            <option value="branch-1" className="bg-popover text-popover-foreground">
              Main Branch — Anna Nagar
            </option>
            <option value="branch-2" className="bg-popover text-popover-foreground">
              Branch 2 — T. Nagar Express
            </option>
          </select>
        </div>

        {/* Quick New POS Bill Button */}
        <Link
          href="/pos"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Bill</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <p className="font-semibold text-sm">Notifications</p>
                <span className="text-[10px] text-primary font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Low Stock Alert: Galaxy S24 Ultra</p>
                    <p className="text-[11px] text-muted-foreground">Only 2 units remaining in Main Branch.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Repair Completed: JOB-26-090</p>
                    <p className="text-[11px] text-muted-foreground">Customer Ananya Rao notified for pickup.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile & role badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            SM
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground">Suriya P.</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <ShieldCheck className="w-2.5 h-2.5" />
                OWNER
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Full Permissions</p>
          </div>
        </div>
      </div>
    </header>
  );
}
