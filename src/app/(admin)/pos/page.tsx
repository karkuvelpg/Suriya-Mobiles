"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Barcode,
  Smartphone,
  Trash2,
  Plus,
  Minus,
  Receipt,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  X,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  Percent,
} from "lucide-react";
import { formatINR, calculateCartTotals } from "@/lib/finance";
import { INITIAL_PRODUCTS, ProductItem } from "@/lib/mock-data";

interface CartLineItem {
  product: ProductItem;
  qty: number;
  selectedImei?: string;
  unitPricePaise: number;
  discountPaise: number;
  taxRatePercent: number;
}

interface LastInvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerGstin: string;
  paymentMethod: "CASH" | "UPI" | "CARD" | "SPLIT";
  totals: ReturnType<typeof calculateCartTotals>;
  items: CartLineItem[];
}

interface HeldBill {
  id: string;
  customerName: string;
  time: string;
  cart: CartLineItem[];
  discountRupees: string;
}

export default function POSBillingPage() {
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartLineItem[]>([
    {
      product: INITIAL_PRODUCTS[0],
      qty: 1,
      selectedImei: "358291048291048",
      unitPricePaise: INITIAL_PRODUCTS[0].sellingPricePaise,
      discountPaise: 0,
      taxRatePercent: INITIAL_PRODUCTS[0].taxRatePercent,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Customer details
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("9840000000");
  const [customerGstin, setCustomerGstin] = useState("");

  // Discounts
  const [billDiscountRupees, setBillDiscountRupees] = useState<string>("0");

  // Hold / Recall Bills
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "SPLIT">("UPI");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<LastInvoiceData | null>(null);

  // Quick Customer Switcher
  const selectPresetCustomer = (name: string, phone: string, gstin = "") => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setCustomerGstin(gstin);
  };

  // Filter products for quick-add grid
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        (p.availableSerials && p.availableSerials.some((s) => s.includes(searchQuery)));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle direct barcode scanner enter
  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const match = products.find(
        (p) =>
          p.barcode === searchQuery.trim() ||
          p.sku.toLowerCase() === searchQuery.trim().toLowerCase() ||
          p.availableSerials?.includes(searchQuery.trim())
      );
      if (match) {
        addToCart(match);
        setSearchQuery("");
      }
    }
  };

  // Cart operations
  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (product.hasSerial) {
          return [
            ...prev,
            {
              product,
              qty: 1,
              selectedImei: product.availableSerials?.[prev.length % (product.availableSerials.length || 1)],
              unitPricePaise: product.sellingPricePaise,
              discountPaise: 0,
              taxRatePercent: product.taxRatePercent,
            },
          ];
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          qty: 1,
          selectedImei: product.hasSerial ? product.availableSerials?.[0] : undefined,
          unitPricePaise: product.sellingPricePaise,
          discountPaise: 0,
          taxRatePercent: product.taxRatePercent,
        },
      ];
    });
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((it, i) => (i === index ? { ...it, qty: newQty } : it));
    });
  };

  const updateImei = (index: number, imei: string) => {
    setCart((prev) => prev.map((it, i) => (i === index ? { ...it, selectedImei: imei } : it)));
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Park / Hold current bill
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const newHeld: HeldBill = {
      id: `park-${Date.now()}`,
      customerName,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      cart,
      discountRupees: billDiscountRupees,
    };
    setHeldBills([...heldBills, newHeld]);
    setCart([]);
    setBillDiscountRupees("0");
    setCustomerName("Walk-in Customer");
    setCustomerPhone("9840000000");
  };

  // Recall parked bill
  const handleRecallBill = (held: HeldBill) => {
    setCart(held.cart);
    setCustomerName(held.customerName);
    setBillDiscountRupees(held.discountRupees);
    setHeldBills(heldBills.filter((h) => h.id !== held.id));
  };

  // Cart Calculations
  const calculatedItems = useMemo(() => {
    return cart.map((item) => ({
      unitPricePaise: item.unitPricePaise,
      quantity: item.qty,
      discountPaise: item.discountPaise,
      gstRatePercent: item.taxRatePercent,
      isInterState: false,
    }));
  }, [cart]);

  const additionalDiscountPaise = useMemo(() => {
    const val = parseFloat(billDiscountRupees || "0");
    return isNaN(val) ? 0 : Math.round(val * 100);
  }, [billDiscountRupees]);

  const totals = useMemo(() => {
    return calculateCartTotals(calculatedItems, additionalDiscountPaise);
  }, [calculatedItems, additionalDiscountPaise]);

  const changeReturnPaise = useMemo(() => {
    if (paymentMethod !== "CASH" || !cashTendered) return 0;
    const tenderedPaise = Math.round(parseFloat(cashTendered) * 100);
    return Math.max(0, tenderedPaise - totals.grandTotalPaise);
  }, [paymentMethod, cashTendered, totals.grandTotalPaise]);

  // Validation: Check if any phone is missing IMEI
  const missingImeiItems = useMemo(() => {
    return cart.filter((item) => item.product.hasSerial && (!item.selectedImei || item.selectedImei.trim() === ""));
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (missingImeiItems.length > 0) {
      alert("Error: All mobile phones and serialized products require a valid IMEI before billing.");
      return;
    }

    const invoiceData: LastInvoiceData = {
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      customerName,
      customerPhone,
      customerGstin,
      paymentMethod,
      totals,
      items: cart,
    };

    setLastInvoice(invoiceData);
    setShowInvoiceModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">POS Terminal</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
              Station #01 — Anna Nagar
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fast billing with automated 18% GST calculation, IMEI assignment & thermal receipt generation
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {heldBills.length > 0 && (
            <div className="flex items-center gap-1.5">
              {heldBills.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleRecallBill(h)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px] hover:bg-amber-500/25 transition-colors cursor-pointer"
                  title="Click to resume held bill"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Resume ({h.customerName.slice(0, 8)} - {h.time})</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleHoldBill}
            disabled={cart.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Hold Bill</span>
          </button>

          <button
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Main Grid: Catalog Left (7 cols) | Cart & Bill Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Scan barcode, IMEI or type phone model (Press Enter to auto-add)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                className="w-full h-11 pl-10 pr-12 rounded-xl border border-border/80 bg-card/60 focus:bg-background text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Barcode className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400" />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: "All Items" },
                { id: "smartphones", label: "Smartphones" },
                { id: "accessories", label: "Accessories" },
                { id: "audio", label: "Audio & AirPods" },
                { id: "wearables", label: "Smartwatches" },
                { id: "repairs", label: "Repairs & Services" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative flex flex-col justify-between p-3 rounded-2xl border border-border/70 bg-card/50 hover:bg-card/90 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      {product.brand}
                    </span>
                    {product.hasSerial && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        IMEI
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    SKU: {product.sku}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-foreground">
                      {formatINR(product.sellingPricePaise)}
                    </span>
                    <span className="block text-[9px] text-muted-foreground">
                      Incl. 18% GST
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    Stock: {product.stockQty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Bill & Checkout Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-xl">
          {/* Quick Customer Selection */}
          <div className="pb-3 border-b border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-sky-400" />
                <span>Customer Details</span>
              </label>

              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "c1") selectPresetCustomer("Rajesh Kumar", "9840123456", "33AAACR1234F1Z1");
                  else if (val === "c2") selectPresetCustomer("Priya Sundaram", "9790456789");
                  else if (val === "c3") selectPresetCustomer("Senthil Nathan", "9444123890");
                  else selectPresetCustomer("Walk-in Customer", "9840000000");
                }}
                className="text-[10px] bg-muted/40 border border-border rounded-lg px-2 py-0.5 text-foreground cursor-pointer"
              >
                <option value="walkin">Walk-in Customer</option>
                <option value="c1">Rajesh Kumar (B2B)</option>
                <option value="c2">Priya Sundaram</option>
                <option value="c3">Senthil Nathan (Khata)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto my-3 space-y-2.5 max-h-[290px] pr-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-44 text-muted-foreground">
                <Receipt className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs font-medium">Bill is currently empty</p>
                <p className="text-[11px] opacity-70">Click items on the left or scan barcode to add</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${index}`}
                  className="p-3 rounded-2xl border border-border/70 bg-background/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-foreground truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        HSN: {item.product.hsnCode} • Tax: {item.taxRatePercent}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-foreground">
                        {formatINR(item.unitPricePaise * item.qty - item.discountPaise)}
                      </p>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* IMEI selection if serialized */}
                  {item.product.hasSerial && (
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                      <Smartphone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[10px] font-semibold text-amber-500 uppercase">
                        IMEI:
                      </span>
                      <input
                        type="text"
                        placeholder="Scan or select 15-digit IMEI"
                        value={item.selectedImei || ""}
                        onChange={(e) => updateImei(index, e.target.value)}
                        className="flex-1 bg-transparent border-none text-[11px] font-mono font-medium focus:outline-none text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  )}

                  {/* Quantity and Price controls */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2 bg-muted/40 rounded-lg p-1 border border-border/50">
                      <button
                        onClick={() => updateQty(index, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-background hover:bg-card text-foreground cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold px-1 text-xs">{item.qty}</span>
                      <button
                        onClick={() => updateQty(index, 1)}
                        disabled={item.product.hasSerial} // phones add as separate IMEI line
                        className="w-5 h-5 flex items-center justify-center rounded bg-background hover:bg-card text-foreground disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[11px] text-muted-foreground">
                      @ {formatINR(item.unitPricePaise)} each
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Missing IMEI Alert */}
          {missingImeiItems.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs mb-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Please assign 15-digit IMEI to all smartphones before checkout.</span>
            </div>
          )}

          {/* Discount & Calculation Summary */}
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-xs">
            {/* Bill Discount Input */}
            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-sky-400" /> Bill Discount (₹):
              </span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={billDiscountRupees}
                onChange={(e) => setBillDiscountRupees(e.target.value)}
                className="w-24 h-6 px-2 rounded border border-border bg-background text-xs font-bold text-right"
              />
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Taxable Subtotal:</span>
              <span>{formatINR(totals.taxableAmountPaise)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>CGST (9%):</span>
              <span>{formatINR(totals.totalCgstPaise)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>SGST (9%):</span>
              <span>{formatINR(totals.totalSgstPaise)}</span>
            </div>
            {totals.roundOffPaise !== 0 && (
              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Round-off:</span>
                <span>{totals.roundOffPaise > 0 ? `+${totals.roundOffPaise}p` : `${totals.roundOffPaise}p`}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-foreground pt-1.5 border-t border-border">
              <span>Grand Total:</span>
              <span className="text-emerald-500">{formatINR(totals.grandTotalPaise)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-3">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[
                { id: "UPI", label: "UPI", icon: QrCode },
                { id: "CASH", label: "Cash", icon: Banknote },
                { id: "CARD", label: "Card", icon: CreditCard },
                { id: "SPLIT", label: "Split", icon: Receipt },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      setPaymentMethod(m.id as "CASH" | "UPI" | "CARD" | "SPLIT")
                    }
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered Input if Cash */}
          {paymentMethod === "CASH" && (
            <div className="mt-2.5 p-2 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Cash Received (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="w-28 mt-0.5 h-7 px-2 rounded border border-border bg-background text-xs font-bold"
                />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground">Change Due:</span>
                <p className="font-extrabold text-sm text-emerald-500">
                  {formatINR(changeReturnPaise)}
                </p>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || missingImeiItems.length > 0}
            className="mt-4 w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generate GST Tax Invoice ({formatINR(totals.grandTotalPaise)})</span>
          </button>
        </div>
      </div>

      {/* Invoice Print & Share Modal */}
      {showInvoiceModal && lastInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Tax Invoice Content */}
            <div id="printable-invoice" className="space-y-4 text-xs font-sans">
              {/* Store Header */}
              <div className="text-center pb-3 border-b border-dashed border-border">
                <h2 className="text-lg font-black tracking-tight text-foreground uppercase">
                  Suriya Mobiles
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Premium Mobile Retail & Service Lounge
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  128, 2nd Avenue, Anna Nagar, Chennai — 600040
                </p>
                <p className="text-[10px] font-mono font-semibold text-foreground mt-0.5">
                  GSTIN: 33AAAAA0000A1Z5 | Phone: +91 98401 99999
                </p>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] mt-1.5 uppercase">
                  Original Tax Invoice (B2C)
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-b border-dashed border-border">
                <div>
                  <span className="text-muted-foreground">Invoice No: </span>
                  <span className="font-mono font-bold text-foreground">{lastInvoice.invoiceNumber}</span>
                  <br />
                  <span className="text-muted-foreground">Date: </span>
                  <span className="font-medium text-foreground">{lastInvoice.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Customer: </span>
                  <span className="font-bold text-foreground">{lastInvoice.customerName}</span>
                  <br />
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium text-foreground">{lastInvoice.customerPhone}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2">
                <table className="w-full text-left">
                  <thead className="border-b border-border text-muted-foreground text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="pb-1.5">Item & IMEI</th>
                      <th className="pb-1.5 text-center">Qty</th>
                      <th className="pb-1.5 text-right">Rate</th>
                      <th className="pb-1.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-[11px]">
                    {lastInvoice.items.map((it: CartLineItem, i: number) => (
                      <tr key={i} className="py-1.5">
                        <td className="py-1.5 pr-2">
                          <p className="font-semibold text-foreground">{it.product.name}</p>
                          {it.selectedImei && (
                            <p className="text-[10px] font-mono text-sky-400">
                              IMEI: {it.selectedImei}
                            </p>
                          )}
                          <p className="text-[9px] text-muted-foreground">HSN: {it.product.hsnCode}</p>
                        </td>
                        <td className="py-1.5 text-center font-medium">{it.qty}</td>
                        <td className="py-1.5 text-right">{formatINR(it.unitPricePaise)}</td>
                        <td className="py-1.5 text-right font-bold">
                          {formatINR(it.unitPricePaise * it.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Breakup & Grand Total */}
              <div className="pt-2 border-t border-dashed border-border space-y-1 text-right text-[11px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxable Value:</span>
                  <span>{formatINR(lastInvoice.totals.taxableAmountPaise)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>CGST (9%):</span>
                  <span>{formatINR(lastInvoice.totals.totalCgstPaise)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>SGST (9%):</span>
                  <span>{formatINR(lastInvoice.totals.totalSgstPaise)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-foreground pt-1 border-t border-border">
                  <span>Grand Total (Net):</span>
                  <span className="text-emerald-500">{formatINR(lastInvoice.totals.grandTotalPaise)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Payment Mode:</span>
                  <span className="font-semibold">{lastInvoice.paymentMethod} (PAID)</span>
                </div>
              </div>

              {/* Declaration / Guarantee terms */}
              <div className="pt-3 border-t border-dashed border-border text-[9px] text-muted-foreground text-center space-y-0.5">
                <p>Terms: Goods once sold carry brand manufacturer warranty against hardware defects.</p>
                <p>Thank you for shopping at Suriya Mobiles! Have a great day.</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setCart([]);
                  setBillDiscountRupees("0");
                }}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-muted cursor-pointer"
              >
                Close & Next Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
