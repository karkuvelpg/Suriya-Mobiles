"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  UserPlus,
  Mail,
  Building,
  Crown,
} from "lucide-react";
import { UserRole, Permission, ROLE_PERMISSIONS } from "@/lib/permissions";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Suriya P.",
    email: "owner@suriyamobiles.com",
    role: "owner",
    branch: "All Branches (Master)",
    phone: "+91 98400 11111",
    status: "ACTIVE",
  },
  {
    id: "emp-2",
    name: "Murugan Selvam",
    email: "murugan@suriyamobiles.com",
    role: "admin",
    branch: "Main Branch - Anna Nagar",
    phone: "+91 98400 22222",
    status: "ACTIVE",
  },
  {
    id: "emp-3",
    name: "Karthik Raja",
    email: "karthik@suriyamobiles.com",
    role: "cashier",
    branch: "Main Branch - Anna Nagar",
    phone: "+91 98400 33333",
    status: "ACTIVE",
  },
  {
    id: "emp-4",
    name: "Saravanan K.",
    email: "saravanan@suriyamobiles.com",
    role: "inventory_staff",
    branch: "Main Warehouse",
    phone: "+91 98400 44444",
    status: "ACTIVE",
  },
];

const PERMISSION_GROUPS: { group: string; permissions: { key: Permission; label: string }[] }[] = [
  {
    group: "POS & Billing",
    permissions: [
      { key: "pos.access", label: "Open POS Station" },
      { key: "sales.create", label: "Create & Print Bills" },
      { key: "sales.apply_discount", label: "Apply Standard Discounts (<10%)" },
      { key: "sales.apply_override_discount", label: "Override Discounts (>10%)" },
      { key: "sales.return", label: "Process Return & Refunds" },
      { key: "pos.session.close", label: "Close Cash Drawer & Day End" },
    ],
  },
  {
    group: "Inventory & Stock",
    permissions: [
      { key: "inventory.view", label: "View Stock Levels & Valuations" },
      { key: "products.create", label: "Add New Products & SKUs" },
      { key: "inventory.adjust", label: "Manual Stock Adjustments" },
      { key: "inventory.transfer", label: "Inter-Branch Stock Transfers" },
      { key: "inventory.receive_purchase", label: "Inward Goods from Suppliers" },
    ],
  },
  {
    group: "Administrative & Financial",
    permissions: [
      { key: "reports.sales", label: "View Sales & Revenue Reports" },
      { key: "reports.tax", label: "Generate GST Filing Returns (GSTR-1)" },
      { key: "staff.edit", label: "Add/Edit Employee Roles" },
      { key: "settings.edit", label: "Edit Company Profile & GSTIN" },
    ],
  },
];

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedRole, setSelectedRole] = useState<UserRole>("cashier");

  const hasPermission = (role: UserRole, perm: Permission) => {
    if (role === "owner") return true; // Owner has ALL permissions by architectural rule
    const allowed = ROLE_PERMISSIONS[role] || [];
    return allowed.includes(perm);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Staff Roles & Access Control (RBAC)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Strict role-based segregation. Owner holds unilateral master access to every branch and feature.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all">
          <UserPlus className="w-4 h-4" />
          <span>Invite New Employee</span>
        </button>
      </div>

      {/* Staff Directory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="p-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {emp.name.slice(0, 2).toUpperCase()}
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  emp.role === "owner"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30 flex items-center gap-1"
                    : emp.role === "admin"
                    ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                    : emp.role === "cashier"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                }`}
              >
                {emp.role === "owner" && <Crown className="w-2.5 h-2.5" />}
                {emp.role}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-foreground">{emp.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {emp.email}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3" /> {emp.branch}
              </p>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
              </span>
              <span className="text-muted-foreground font-mono">{emp.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Permission Inspector Matrix */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-sky-400" />
              Role Permission Inspector
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a role below to inspect verified capabilities enforced server-side.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/60">
            {(["owner", "admin", "cashier", "inventory_staff"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedRole === r
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "owner" ? "👑 Owner (Master)" : r.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERMISSION_GROUPS.map((grp) => (
            <div
              key={grp.group}
              className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 pb-2 border-b border-border/40">
                {grp.group}
              </h4>
              <div className="space-y-2.5">
                {grp.permissions.map((p) => {
                  const allowed = hasPermission(selectedRole, p.key);
                  return (
                    <div
                      key={p.key}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <span className={allowed ? "text-foreground font-medium" : "text-muted-foreground line-through opacity-60"}>
                        {p.label}
                      </span>
                      {allowed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/50 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
