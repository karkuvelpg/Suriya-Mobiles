"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ShoppingBag,
  Search,
  ShieldCheck,
  Truck,
  Wrench,
  Sparkles,
  ArrowRight,
  Star,
  Check,
  Phone,
  MapPin,
  Clock,
  X,
  Plus,
  Minus,
  Trash2,
  Lock,
  ChevronRight,
  CreditCard,
  QrCode,
  Tag,
  Zap,
} from "lucide-react";
import { formatINR } from "@/lib/finance";
import { INITIAL_PRODUCTS, ProductItem } from "@/lib/mock-data";

export default function StorefrontPage() {
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cart state
  const [cart, setCart] = useState<{ product: ProductItem; qty: number }[]>([
    { product: INITIAL_PRODUCTS[3], qty: 1 }, // Default demo item: AirPods Pro
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Checkout form
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [payOption, setPayOption] = useState<"UPI" | "COD">("UPI");

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotalPaise = cart.reduce(
    (acc, item) => acc + item.product.sellingPricePaise * item.qty,
    0
  );

  const cartTotalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: ProductItem; qty: number }[]
    );
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !custAddress) return;
    setOrderPlaced(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-sky-500/30">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Diwali & Festive Offers Live! Get 0% EMI & Instant Exchange on iPhone 15 & Galaxy S24 Series</span>
        <span className="hidden sm:inline opacity-80">• Call store: +91 98401 99999</span>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Suriya Mobiles
              </span>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Retail & Service Lounge
              </p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search iPhone, Galaxy, OnePlus, AirPods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-2xl border border-border/80 bg-muted/40 hover:bg-muted/60 focus:bg-background text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Admin & POS Portal link */}
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted font-semibold text-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Staff / POS Portal</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              {cartTotalItems > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-black font-extrabold text-[10px]">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden py-12 md:py-20 border-b border-border/60 bg-gradient-to-b from-sky-950/20 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Authorized Flagship Reseller & Service Center</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                Next-Gen Smartphones. <br />
                <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Unbeatable Pricing.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Experience Chennai&apos;s most trusted mobile destination. Authentic Indian warranty, 15-digit IMEI registration, zero-downpayment EMI & expert repair lounge.
              </p>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <a
                  href="#catalog"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>Explore Mobile Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/pos"
                  className="px-5 py-3.5 rounded-2xl border border-border bg-card/80 hover:bg-accent font-semibold text-sm transition-all"
                >
                  Billing POS Demo
                </Link>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Original GST Bill</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Same-Day Store Pickup</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Certified Service Lounge</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-tr from-sky-950/40 via-card/80 to-indigo-950/40 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                    Deal of the Week
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Save ₹11,000
                  </span>
                </div>

                <div className="my-6 flex justify-center">
                  <img
                    src={INITIAL_PRODUCTS[0].imageUrl}
                    alt={INITIAL_PRODUCTS[0].name}
                    className="h-64 object-cover rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-foreground">
                    {INITIAL_PRODUCTS[0].name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-foreground">
                      {formatINR(INITIAL_PRODUCTS[0].sellingPricePaise)}
                    </span>
                    <span className="text-sm line-through text-muted-foreground">
                      {formatINR(INITIAL_PRODUCTS[0].mrpPaise)}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(INITIAL_PRODUCTS[0])}
                    className="w-full mt-3 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg transition-all"
                  >
                    Add to Cart & Buy with GST Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section id="catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Trending Devices & Audio
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select verified models available for immediate pickup at Anna Nagar & T. Nagar showrooms
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "All Items" },
              { id: "smartphones", label: "Smartphones" },
              { id: "audio", label: "Audio & AirPods" },
              { id: "accessories", label: "Accessories" },
              { id: "wearables", label: "Smartwatches" },
              { id: "repairs", label: "Repair Services" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="group flex flex-col justify-between p-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300"
            >
              <div>
                {/* Image and Badges */}
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-muted/40 flex items-center justify-center p-4 mb-4">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground">
                    {prod.brand}
                  </span>
                  {prod.hasSerial && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 backdrop-blur-md">
                      IMEI Tracked
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Price and Add button */}
              <div className="mt-4 pt-4 border-t border-border/60">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-lg font-black text-foreground">
                      {formatINR(prod.sellingPricePaise)}
                    </span>
                    {prod.mrpPaise > prod.sellingPricePaise && (
                      <span className="block text-[11px] line-through text-muted-foreground">
                        {formatINR(prod.mrpPaise)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    Incl. 18% GST
                  </span>
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl p-6 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-foreground">Shopping Bag</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-bold">
                  {cartTotalItems} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ShoppingBag className="w-10 h-10 opacity-30 mb-2" />
                  <p className="text-sm font-medium">Your bag is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-2xl border border-border/60 bg-muted/20"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl bg-card shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-foreground truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-bold text-foreground mt-0.5">
                        {formatINR(item.product.sellingPricePaise * item.qty)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2 bg-background rounded-lg border border-border px-1.5 py-0.5 text-xs">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold px-1 text-xs">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Footer */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-border/70 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Amount</span>
                    <span>{formatINR(Math.round(cartTotalPaise / 1.18))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18% included)</span>
                    <span>{formatINR(cartTotalPaise - Math.round(cartTotalPaise / 1.18))}</span>
                  </div>
                  <div className="flex justify-between font-black text-base text-foreground pt-1 border-t border-border">
                    <span>Total Payable</span>
                    <span className="text-emerald-400">{formatINR(cartTotalPaise)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setShowCheckoutModal(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Proceed to Checkout ({formatINR(cartTotalPaise)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Online Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => {
                setShowCheckoutModal(false);
                setOrderPlaced(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {orderPlaced ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Order Successfully Booked!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Order #SM-WEB-{Math.floor(1000 + Math.random() * 9000)} is confirmed. Our Anna Nagar store executive will call you to confirm dispatch and IMEI allotment.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderPlaced(false);
                      setCart([]);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-foreground">Complete Order & Tax Invoice</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9840123456"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Delivery / Pickup Address
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter delivery address in Chennai or specify Store Pickup (Anna Nagar / T. Nagar)"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setPayOption("UPI")}
                      className={`p-3 rounded-xl border text-left font-semibold flex items-center gap-2 ${
                        payOption === "UPI"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Instant UPI / QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayOption("COD")}
                      className={`p-3 rounded-xl border text-left font-semibold flex items-center gap-2 ${
                        payOption === "COD"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay on Delivery / Pickup</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex justify-between font-bold">
                  <span>Grand Total to Pay:</span>
                  <span className="text-emerald-400">{formatINR(cartTotalPaise)}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  Confirm & Place Order
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card/60 backdrop-blur-xl mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  SM
                </div>
                <span className="font-extrabold text-base text-foreground">Suriya Mobiles</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Tamil Nadu&apos;s leading retailer for genuine smartphones, wearable tech, authentic accessories, and certified mobile service.
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                GSTIN: 33AAAAA0000A1Z5
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Main Showroom
              </h4>
              <p className="text-muted-foreground">
                128, 2nd Avenue, Anna Nagar,<br />
                Chennai — 600040.<br />
                Near Roundtana Metro Station
              </p>
              <p className="text-sky-400 font-semibold pt-1">Ph: +91 98401 99999</p>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Express Branch
              </h4>
              <p className="text-muted-foreground">
                45, Usman Road, T. Nagar,<br />
                Chennai — 600017.<br />
                Opposite Panagal Park
              </p>
              <p className="text-sky-400 font-semibold pt-1">Ph: +91 98402 88888</p>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                Internal Systems
              </h4>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    → Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/pos" className="hover:text-primary transition-colors">
                    → POS Terminal & Quick Bill
                  </Link>
                </li>
                <li>
                  <Link href="/inventory" className="hover:text-primary transition-colors">
                    → IMEI & Inventory Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/repairs" className="hover:text-primary transition-colors">
                    → Repair Job Lounge
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
            <p>© 2026 Suriya Mobiles Retail Pvt Ltd. All rights reserved.</p>
            <p className="text-xs">Engineered with Next.js 16, TypeScript, Supabase & Drizzle ORM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
