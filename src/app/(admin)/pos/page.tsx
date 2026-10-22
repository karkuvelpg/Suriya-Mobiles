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
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  Percent,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
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
  isGstItem: boolean;
}

interface LastInvoiceData {
  invoiceNumber: string;
  invoiceType: "TAX_INVOICE" | "NORMAL_BILL";
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
  billType: "TAX_INVOICE" | "NORMAL_BILL";
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
      isGstItem: INITIAL_PRODUCTS[0].isGstProduct !== false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Bill Mode: "TAX_INVOICE" (GST) vs "NORMAL_BILL" (Non-GST / Estimate)
  const [billType, setBillType] = useState<"TAX_INVOICE" | "NORMAL_BILL">("TAX_INVOICE");

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
  const [printFormat, setPrintFormat] = useState<"thermal" | "a4">("thermal");

  // Quick Customer Switcher
  const selectPresetCustomer = (name: string, phone: string, gstin = "") => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setCustomerGstin(gstin);
    if (gstin) {
      setBillType("TAX_INVOICE");
    }
  };

  // Filter products for quick-add catalog
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

  // Handle direct barcode scanner Enter key
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
    const isGst = product.isGstProduct !== false;

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
              isGstItem: isGst,
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
          isGstItem: isGst,
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
      billType,
    };
    setHeldBills([...heldBills, newHeld]);
    setCart([]);
    setBillDiscountRupees("0");
    setCustomerName("Walk-in Customer");
    setCustomerPhone("9840000000");
    setCustomerGstin("");
  };

  // Recall parked bill
  const handleRecallBill = (held: HeldBill) => {
    setCart(held.cart);
    setCustomerName(held.customerName);
    setBillDiscountRupees(held.discountRupees);
    setBillType(held.billType);
    setHeldBills(heldBills.filter((h) => h.id !== held.id));
  };

  // Cart Calculations with GST / Normal Bill differentiation
  const calculatedItems = useMemo(() => {
    return cart.map((item) => ({
      unitPricePaise: item.unitPricePaise,
      quantity: item.qty,
      discountPaise: item.discountPaise,
      // If cashier selected NORMAL_BILL or item is marked non-GST, rate is 0
      gstRatePercent: billType === "NORMAL_BILL" || !item.isGstItem ? 0 : item.taxRatePercent,
      isInterState: false,
    }));
  }, [cart, billType]);

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

    const prefix = billType === "TAX_INVOICE" ? "INV" : "EST";
    const invoiceData: LastInvoiceData = {
      invoiceNumber: `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceType: billType,
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
              Station #01 — Anna Nagar Showroom
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time cashier terminal with smart GST / Normal bill auto-switch and thermal receipt engine
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition-colors cursor-pointer"
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
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const isGst = p.isGstProduct !== false;
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="group relative p-3 rounded-2xl border border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md hover:scale-[1.01]"
                >
                  <div>
                    <div className="relative h-24 w-full rounded-xl overflow-hidden bg-muted/40 flex items-center justify-center p-2 mb-2">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="max-h-full object-contain group-hover:scale-105 transition-transform"
                      />
                      {/* GST / Non-GST indicator badge */}
                      <span
                        className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          isGst
                            ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {isGst ? "GST" : "Normal"}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-foreground line-clamp-2 leading-tight">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Stock: <span className="font-bold text-foreground">{p.stockQty}</span>
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="font-extrabold text-xs text-foreground">
                      {formatINR(p.sellingPricePaise)}
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cart, Customer & Checkout Sidebar (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Bill Type Selector: GST Tax Invoice vs Normal Bill */}
            <div className="p-3 rounded-2xl border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Bill Output Type
                </span>
                <span className="text-[10px] text-sky-400 font-semibold">
                  {billType === "TAX_INVOICE" ? "GST Tax Invoice" : "Normal Cash Estimate"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillType("TAX_INVOICE")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    billType === "TAX_INVOICE"
                      ? "bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>GST Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillType("NORMAL_BILL")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    billType === "NORMAL_BILL"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Normal Cash Bill</span>
                </button>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Customer Details</span>
                </div>
                {/* Preset Customer selector */}
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => selectPresetCustomer("Walk-in Customer", "9840000000")}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-semibold cursor-pointer"
                  >
                    Walk-in
                  </button>
                  <button
                    onClick={() => selectPresetCustomer("Rajesh Kumar", "9840123456", "33AAACR1234F1Z1")}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-semibold cursor-pointer"
                  >
                    Rajesh (B2B)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8 px-2.5 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Mobile (10 Digits)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-8 px-2.5 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-mono"
                />
              </div>

              {billType === "TAX_INVOICE" && (
                <input
                  type="text"
                  placeholder="Customer GSTIN (Optional for B2B Tax Credit)"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                  className="w-full h-8 px-2.5 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-mono text-[11px]"
                />
              )}
            </div>

            {/* Cart Line Items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs space-y-1">
                  <Receipt className="w-8 h-8 opacity-30 mx-auto" />
                  <p className="font-semibold">Cart is currently empty</p>
                  <p className="text-[10px]">Select or scan products from the left to start billing</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${index}`}
                    className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-foreground truncate">{item.product.name}</h5>
                          {billType === "TAX_INVOICE" && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                item.isGstItem
                                  ? "bg-sky-500/10 text-sky-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {item.isGstItem ? `${item.taxRatePercent}% GST` : "0% Non-GST"}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Rate: {formatINR(item.unitPricePaise)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQty(index, -1)}
                          className="w-6 h-6 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-foreground cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-foreground">{item.qty}</span>
                        <button
                          onClick={() => updateQty(index, 1)}
                          className="w-6 h-6 rounded-lg border border-border flex items-center justify-center hover:bg-muted text-foreground cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="w-6 h-6 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center justify-center ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* IMEI Selector for Serialized items */}
                    {item.product.hasSerial && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-[11px]">
                        <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold">IMEI:</span>
                        <select
                          value={item.selectedImei || ""}
                          onChange={(e) => updateImei(index, e.target.value)}
                          className="flex-1 h-7 px-2 rounded-lg border border-border bg-background text-[11px] font-mono font-semibold text-foreground focus:outline-none"
                        >
                          {item.product.availableSerials?.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Bill Level Discount & Summary */}
            {cart.length > 0 && (
              <div className="pt-2 border-t border-border/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1">
                    <Percent className="w-3 h-3 text-sky-400" /> Bill Discount (₹):
                  </span>
                  <input
                    type="number"
                    value={billDiscountRupees}
                    onChange={(e) => setBillDiscountRupees(e.target.value)}
                    className="w-24 h-7 px-2 rounded-lg border border-border bg-background text-right font-bold text-foreground text-xs"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Subtotal:</span>
                    <span>{formatINR(totals.taxableAmountPaise)}</span>
                  </div>

                  {billType === "TAX_INVOICE" ? (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>CGST (Central Tax):</span>
                        <span>{formatINR(totals.totalCgstPaise)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>SGST (State Tax):</span>
                        <span>{formatINR(totals.totalSgstPaise)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-amber-400 font-semibold text-[11px]">
                      <span>Tax Output:</span>
                      <span>₹0.00 (Exempt / Retail Estimate)</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-foreground pt-1 border-t border-border">
                    <span>Grand Total:</span>
                    <span className="text-emerald-400">{formatINR(totals.grandTotalPaise)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Payment Method
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "UPI", label: "UPI / QR", icon: QrCode },
                { id: "CASH", label: "Cash", icon: Banknote },
                { id: "CARD", label: "Card POS", icon: CreditCard },
                { id: "SPLIT", label: "Split", icon: Receipt },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash Tendered Calculator */}
            {paymentMethod === "CASH" && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block">
                    Cash Tendered:
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-28 mt-0.5 h-7 px-2 rounded-lg border border-border bg-background text-xs font-bold"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">Change Due:</span>
                  <p className="font-extrabold text-sm text-emerald-400">
                    {formatINR(changeReturnPaise)}
                  </p>
                </div>
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || missingImeiItems.length > 0}
              className={`w-full h-12 rounded-2xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                billType === "TAX_INVOICE"
                  ? "bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 hover:from-sky-600 hover:to-violet-700 shadow-sky-500/25"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Printer className="w-4 h-4" />
              <span>
                {billType === "TAX_INVOICE" ? "Generate GST Tax Invoice" : "Generate Normal Retail Bill"} (
                {formatINR(totals.grandTotalPaise)})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal — Dual Format (80mm Thermal Slip / A4 Invoice) */}
      {showInvoiceModal && lastInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Format toggle: 80mm thermal vs A4 invoice */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Format:</span>
              <button
                onClick={() => setPrintFormat("thermal")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                  printFormat === "thermal"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                80mm Thermal POS Slip
              </button>
              <button
                onClick={() => setPrintFormat("a4")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                  printFormat === "a4"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                A4 Tax Sheet
              </button>
            </div>

            {/* Printable Invoice Container */}
            <div
              id="printable-pos-receipt"
              className={`p-4 rounded-2xl bg-background border border-border text-xs font-sans space-y-3 ${
                printFormat === "thermal" ? "max-w-sm mx-auto font-mono text-[11px]" : "w-full"
              }`}
            >
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-border space-y-0.5">
                <h2 className="text-base font-black uppercase text-foreground tracking-tight">
                  Suriya Mobiles
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  Retail Showroom & Apple / Android Service Lounge
                </p>
                <p className="text-[9px] text-muted-foreground">
                  128, 2nd Avenue, Anna Nagar, Chennai — 600040 | Ph: +91 98401 99999
                </p>
                {lastInvoice.invoiceType === "TAX_INVOICE" ? (
                  <div className="pt-1">
                    <p className="text-[10px] font-bold text-sky-400">GSTIN: 33AAAAA0000A1Z5</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold text-[9px] uppercase mt-0.5">
                      Original Tax Invoice (B2C/B2B)
                    </span>
                  </div>
                ) : (
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold text-[9px] uppercase">
                      Retail Cash Estimate / Normal Bill
                    </span>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 text-[10px] py-1 border-b border-dashed border-border">
                <div>
                  <p>
                    <span className="text-muted-foreground">Bill #:</span>{" "}
                    <span className="font-bold text-foreground">{lastInvoice.invoiceNumber}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date:</span> {lastInvoice.date}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <span className="text-muted-foreground">Customer:</span>{" "}
                    <span className="font-bold text-foreground">{lastInvoice.customerName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span> {lastInvoice.customerPhone}
                  </p>
                  {lastInvoice.customerGstin && (
                    <p className="text-sky-400 font-bold">GSTIN: {lastInvoice.customerGstin}</p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div className="py-1">
                <table className="w-full text-left text-[10px]">
                  <thead className="border-b border-border/80 uppercase text-[9px] text-muted-foreground font-semibold">
                    <tr>
                      <th className="pb-1">Item & Details</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Rate</th>
                      <th className="pb-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {lastInvoice.items.map((it, idx) => (
                      <tr key={idx} className="py-1">
                        <td className="py-1 pr-1">
                          <p className="font-bold text-foreground">{it.product.name}</p>
                          {it.selectedImei && (
                            <p className="text-[9px] text-sky-400 font-mono">IMEI: {it.selectedImei}</p>
                          )}
                          {lastInvoice.invoiceType === "TAX_INVOICE" && (
                            <p className="text-[8px] text-muted-foreground font-mono">
                              HSN: {it.product.hsnCode} | GST: {it.taxRatePercent}%
                            </p>
                          )}
                        </td>
                        <td className="py-1 text-center font-medium">{it.qty}</td>
                        <td className="py-1 text-right">{formatINR(it.unitPricePaise)}</td>
                        <td className="py-1 text-right font-bold">
                          {formatINR(it.unitPricePaise * it.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Breakup / Totals */}
              <div className="pt-2 border-t border-dashed border-border space-y-1 text-right text-[10px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Amount:</span>
                  <span>{formatINR(lastInvoice.totals.subtotalPaise)}</span>
                </div>

                {lastInvoice.invoiceType === "TAX_INVOICE" && (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Central GST (CGST):</span>
                      <span>{formatINR(lastInvoice.totals.totalCgstPaise)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>State GST (SGST):</span>
                      <span>{formatINR(lastInvoice.totals.totalSgstPaise)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between font-black text-xs text-foreground pt-1 border-t border-border">
                  <span>Grand Total Net:</span>
                  <span className="text-emerald-400">{formatINR(lastInvoice.totals.grandTotalPaise)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Settlement Mode:</span>
                  <span className="font-bold text-foreground">{lastInvoice.paymentMethod} (PAID)</span>
                </div>
              </div>

              {/* Guarantee terms */}
              <div className="pt-2 border-t border-dashed border-border text-[8px] text-center text-muted-foreground space-y-0.5">
                <p>Goods once sold carry authorized brand warranty. Please retain bill for service.</p>
                <p>Thank you for choosing Suriya Mobiles!</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setCart([]);
                  setBillDiscountRupees("0");
                }}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-muted cursor-pointer"
              >
                Next Customer Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
