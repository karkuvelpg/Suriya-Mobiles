"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Receipt,
  CreditCard,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "@/lib/finance";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  totalOrders: number;
  totalSpentPaise: number;
  creditDuePaise: number;
  loyaltyPoints: number;
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "c-1",
    name: "Rajesh Kumar",
    phone: "9840123456",
    email: "rajesh.kumar@gmail.com",
    gstin: "33AAACR1234F1Z1",
    totalOrders: 4,
    totalSpentPaise: 24500000,
    creditDuePaise: 0,
    loyaltyPoints: 1200,
  },
  {
    id: "c-2",
    name: "Priya Sundaram",
    phone: "9790456789",
    email: "priya.sundaram@outlook.com",
    totalOrders: 2,
    totalSpentPaise: 5400000,
    creditDuePaise: 0,
    loyaltyPoints: 350,
  },
  {
    id: "c-3",
    name: "Senthil Nathan",
    phone: "9444123890",
    totalOrders: 3,
    totalSpentPaise: 1850000,
    creditDuePaise: 450000, // Due on repair service
    loyaltyPoints: 90,
  },
];

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Customer Directory & Khata Ledger
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customer lifetime purchases, loyalty rewards, credit dues & GSTIN records
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by customer name, mobile or GSTIN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-card/60 focus:bg-background text-xs font-medium focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="p-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">{customer.name}</h3>
                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {customer.phone}
                </p>
                {customer.email && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {customer.email}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {customer.loyaltyPoints} Pts
              </span>
            </div>

            {customer.gstin && (
              <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px]">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                  GSTIN:
                </span>{" "}
                <span className="font-mono font-bold text-foreground">{customer.gstin}</span>
              </div>
            )}

            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground">Total Spent</span>
                <p className="font-bold text-foreground">
                  {formatINR(customer.totalSpentPaise)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted-foreground">Khata Due</span>
                <p
                  className={`font-bold ${
                    customer.creditDuePaise > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {customer.creditDuePaise > 0
                    ? formatINR(customer.creditDuePaise)
                    : "Nil (Cleared)"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
