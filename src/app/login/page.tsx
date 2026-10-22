"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  User,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@suriyamobiles.com");
  const [password, setPassword] = useState("••••••••");
  const [role, setRole] = useState<"owner" | "admin" | "cashier">("owner");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const setDemoRole = (r: "owner" | "admin" | "cashier") => {
    setRole(r);
    if (r === "owner") setEmail("owner@suriyamobiles.com");
    if (r === "admin") setEmail("admin@suriyamobiles.com");
    if (r === "cashier") setEmail("cashier@suriyamobiles.com");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-sky-500/30">
            <Smartphone className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Suriya Mobiles
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to access POS billing, inventory & branch controls
          </p>
        </div>

        {/* Demo Fast Login Switcher */}
        <div className="p-3 rounded-2xl border border-border/80 bg-muted/30 text-xs space-y-2">
          <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider text-center">
            One-Click Demo Staff Role
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoRole("owner")}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                role === "owner"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-background border border-border text-muted-foreground"
              }`}
            >
              👑 Owner
            </button>
            <button
              type="button"
              onClick={() => setDemoRole("admin")}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                role === "admin"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-background border border-border text-muted-foreground"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoRole("cashier")}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                role === "cashier"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-background border border-border text-muted-foreground"
              }`}
            >
              Cashier
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-foreground font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-foreground font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span>Authenticating with Supabase...</span>
              ) : (
                <>
                  <span>Sign In as {role.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground font-semibold"
          >
            ← Return to Consumer Store
          </Link>
        </div>
      </div>
    </div>
  );
}
