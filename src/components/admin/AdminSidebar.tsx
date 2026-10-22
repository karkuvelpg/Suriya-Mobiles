"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  FileSpreadsheet,
  Wrench,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  ShoppingBag,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "POS Billing",
    href: "/pos",
    icon: Receipt,
    badge: "Quick",
  },
  {
    title: "Inventory & IMEI",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Sales & Invoices",
    href: "/sales",
    icon: FileSpreadsheet,
  },
  {
    title: "Service & Repairs",
    href: "/repairs",
    icon: Wrench,
    badge: "2 Active",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Employees & Roles",
    href: "/employees",
    icon: ShieldCheck,
  },
  {
    title: "Reports & GST",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AdminSidebar({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/70 bg-card/60 backdrop-blur-xl transition-all duration-300",
        isMobile ? "w-full h-full" : "w-64 h-screen sticky top-0 hidden md:flex"
      )}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 px-6 h-18 border-b border-border/60">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-sky-500/25">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Suriya Mobiles
            </span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Retail & Billing OS
          </p>
        </div>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70">
          Core Operations
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                <span>{item.title}</span>
              </div>
              {item.badge ? (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary border border-primary/20"
                  )}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0",
                    isActive && "opacity-0"
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer link to Consumer E-Commerce Store */}
      <div className="p-3 border-t border-border/60">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-border/80 bg-background/50 hover:bg-accent/40 transition-colors text-xs font-medium"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-sky-500" />
            <div>
              <p className="font-semibold text-foreground">Customer Store</p>
              <p className="text-[10px] text-muted-foreground">Open online catalog</p>
            </div>
          </div>
          <span className="text-[10px] text-sky-400 font-semibold">Live ↗</span>
        </Link>
      </div>
    </aside>
  );
}
