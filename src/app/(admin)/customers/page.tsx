"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  CheckCircle2,
  X,
  CreditCard,
  History,
  Banknote,
  QrCode,
  ShieldCheck,
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
    creditDuePaise: 450000, // ₹4,500 due on repair service
    loyaltyPoints: 90,
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activePaymentCustomer, setActivePaymentCustomer] = useState<Customer | null>(null);
  const [paymentAmountRupees, setPaymentAmountRupees] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newGstin, setNewGstin] = useState("");

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      gstin: newGstin.trim().toUpperCase() || undefined,
      totalOrders: 0,
      totalSpentPaise: 0,
      creditDuePaise: 0,
      loyaltyPoints: 50, // Welcome points
    };

    setCustomers([newCustomer, ...customers]);
    setShowAddModal(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewGstin("");
  };

  const handleRecordKhataPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentCustomer) return;

    const paymentPaise = Math.round(parseFloat(paymentAmountRupees || "0") * 100);
    if (paymentPaise <= 0) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === activePaymentCustomer.id) {
          const remainingDue = Math.max(0, c.creditDuePaise - paymentPaise);
          return { ...c, creditDuePaise: remainingDue };
        }
        return c;
      })
    );

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setActivePaymentCustomer(null);
      setPaymentAmountRupees("");
    }, 1200);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Input */}
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

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="flex flex-col justify-between p-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{customer.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {customer.phone}
                  </p>
                  {customer.email && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {customer.email}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {customer.loyaltyPoints} Pts
                </span>
              </div>

              {customer.gstin && (
                <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] mt-3">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    GSTIN:
                  </span>{" "}
                  <span className="font-mono font-bold text-foreground">{customer.gstin}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between text-xs">
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {customer.creditDuePaise > 0 ? (
                  <button
                    onClick={() => {
                      setActivePaymentCustomer(customer);
                      setPaymentAmountRupees((customer.creditDuePaise / 100).toString());
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Clear Khata Due</span>
                  </button>
                ) : (
                  <span className="flex-1 text-center py-1.5 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    Account In Good Standing
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">Add New Customer</h3>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9840123456"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="ramesh@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  GSTIN (For Business Customers)
                </label>
                <input
                  type="text"
                  placeholder="33AAAAA0000A1Z5"
                  value={newGstin}
                  onChange={(e) => setNewGstin(e.target.value)}
                  className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Khata Payment Modal */}
      {activePaymentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setActivePaymentCustomer(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-sm text-foreground">Payment Recorded!</h3>
                <p className="text-xs text-muted-foreground">
                  Khata balance updated successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRecordKhataPayment} className="space-y-4 text-xs">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-foreground">Record Khata Payment</h3>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
                  <p className="font-bold text-foreground">{activePaymentCustomer.name}</p>
                  <p className="text-muted-foreground text-[11px] font-mono">
                    {activePaymentCustomer.phone}
                  </p>
                  <div className="mt-2 flex justify-between font-bold text-xs">
                    <span className="text-muted-foreground">Current Due:</span>
                    <span className="text-rose-400">
                      {formatINR(activePaymentCustomer.creditDuePaise)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Amount Received (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={paymentAmountRupees}
                    onChange={(e) => setPaymentAmountRupees(e.target.value)}
                    className="w-full mt-1 h-10 px-3 rounded-xl border border-border bg-background text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActivePaymentCustomer(null)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md"
                  >
                    Confirm & Update Khata
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
