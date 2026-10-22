"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Boxes,
  Plus,
  Search,
  Smartphone,
  X,
  Eye,
  Trash2,
  ShieldCheck,
  FileText,
  Percent,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/finance";
import { INITIAL_PRODUCTS, ProductItem } from "@/lib/mock-data";

function InventoryContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [gstFilter, setGstFilter] = useState<"all" | "gst" | "non-gst">("all");
  const [selectedProductSerials, setSelectedProductSerials] = useState<ProductItem | null>(null);
  const [newSerialInput, setNewSerialInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding new product
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"smartphones" | "accessories" | "audio" | "wearables" | "repairs">("smartphones");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdHsn, setNewProdHsn] = useState("85171300");
  const [newProdSellingPrice, setNewProdSellingPrice] = useState("");
  const [newProdCostPrice, setNewProdCostPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdHasSerial, setNewProdHasSerial] = useState(true);

  // GST Choice: Tax Invoice Product vs Normal Bill Product
  const [newProdIsGst, setNewProdIsGst] = useState<boolean>(true);
  const [newProdGstRate, setNewProdGstRate] = useState<number>(18);

  // Read URL query search parameter
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  // Inventory KPI Totals
  const totalStockCount = useMemo(() => products.reduce((acc, p) => acc + p.stockQty, 0), [products]);
  const totalStockValuationPaise = useMemo(
    () => products.reduce((acc, p) => acc + p.sellingPricePaise * p.stockQty, 0),
    [products]
  );
  const totalGstProducts = useMemo(() => products.filter((p) => p.isGstProduct !== false).length, [products]);
  const totalNonGstProducts = useMemo(() => products.filter((p) => p.isGstProduct === false).length, [products]);

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchGst =
      gstFilter === "all"
        ? true
        : gstFilter === "gst"
        ? p.isGstProduct !== false
        : p.isGstProduct === false;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.availableSerials && p.availableSerials.some((s) => s.includes(search)));
    return matchCat && matchGst && matchSearch;
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdBrand || !newProdSellingPrice) return;

    const sellingPaise = Math.round(parseFloat(newProdSellingPrice) * 100);
    const costPaise = Math.round(parseFloat(newProdCostPrice || "0") * 100);
    const stock = parseInt(newProdStock || "1", 10);

    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      brand: newProdBrand,
      category: newProdCategory,
      sku: newProdSku || `${newProdBrand.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      hsnCode: newProdIsGst ? newProdHsn || "85171300" : "EXEMPT",
      barcode: `890123${Date.now().toString().slice(-6)}`,
      mrpPaise: sellingPaise,
      sellingPricePaise: sellingPaise,
      costPricePaise: costPaise,
      taxRatePercent: newProdIsGst ? newProdGstRate : 0,
      isGstProduct: newProdIsGst,
      stockQty: stock,
      lowStockThreshold: 3,
      hasSerial: newProdHasSerial,
      availableSerials: newProdHasSerial
        ? Array.from({ length: stock }).map((_, i) => `IMEI${Date.now()}${i}`)
        : undefined,
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
      description: newProdIsGst ? "Tax invoice eligible product." : "Normal retail cash bill item.",
    };

    setProducts([newProduct, ...products]);
    setShowAddModal(false);
    // Reset form
    setNewProdName("");
    setNewProdBrand("");
    setNewProdSellingPrice("");
    setNewProdCostPrice("");
    setNewProdStock("");
    setNewProdIsGst(true);
    setNewProdGstRate(18);
  };

  const adjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newQty = Math.max(0, p.stockQty + delta);
          return { ...p, stockQty: newQty };
        }
        return p;
      })
    );
  };

  const toggleProductGstType = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextIsGst = !(p.isGstProduct !== false);
          return {
            ...p,
            isGstProduct: nextIsGst,
            taxRatePercent: nextIsGst ? 18 : 0,
          };
        }
        return p;
      })
    );
  };

  const deleteProduct = (productId: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const handleAddNewSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductSerials || !newSerialInput.trim()) return;

    const trimmed = newSerialInput.trim();
    const updatedSerials = [...(selectedProductSerials.availableSerials || []), trimmed];

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProductSerials.id
          ? { ...p, availableSerials: updatedSerials, stockQty: p.stockQty + 1 }
          : p
      )
    );

    setSelectedProductSerials({
      ...selectedProductSerials,
      availableSerials: updatedSerials,
      stockQty: selectedProductSerials.stockQty + 1,
    });

    setNewSerialInput("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Inventory & IMEI Stock Tracking
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time stock valuation, 15-digit IMEI vault, and dual GST / Normal Bill tax classification
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stock / Product</span>
        </button>
      </div>

      {/* KPI Cards: Valuation & GST / Non-GST breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Total Stock Units</span>
          <p className="text-2xl font-bold text-foreground">{totalStockCount} Units</p>
          <span className="text-[10px] text-sky-400 font-semibold">Across all categories</span>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Stock Valuation (Retail)</span>
          <p className="text-2xl font-bold text-emerald-400">{formatINR(totalStockValuationPaise)}</p>
          <span className="text-[10px] text-muted-foreground">At current selling prices</span>
        </div>

        <div className="p-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-sky-300">GST Invoice Eligible</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400">{totalGstProducts} Items</p>
          <span className="text-[10px] text-muted-foreground">Generates B2B/B2C Tax Invoice</span>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-300">Normal Bill / Estimate</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{totalNonGstProducts} Items</p>
          <span className="text-[10px] text-muted-foreground">Cash memo / Exempt retail bill</span>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, brand, SKU or IMEI barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-card/60 focus:bg-background text-xs font-medium focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:outline-none text-foreground cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="smartphones">Smartphones</option>
            <option value="accessories">Accessories</option>
            <option value="audio">Audio & AirPods</option>
            <option value="wearables">Smartwatches</option>
            <option value="repairs">Service Parts</option>
          </select>

          <select
            value={gstFilter}
            onChange={(e) => setGstFilter(e.target.value as "all" | "gst" | "non-gst")}
            className="h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:outline-none text-foreground cursor-pointer"
          >
            <option value="all">All Tax Types</option>
            <option value="gst">GST Tax Products Only</option>
            <option value="non-gst">Non-GST / Normal Bill Only</option>
          </select>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/20">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Product & SKU</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Tax / Bill Type</th>
                <th className="py-3.5 px-4 font-semibold text-right">Selling Price</th>
                <th className="py-3.5 px-4 font-semibold text-right">Cost Price</th>
                <th className="py-3.5 px-4 font-semibold text-center">In Stock</th>
                <th className="py-3.5 px-4 font-semibold text-center">IMEI / Serials</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((prod) => {
                const isGst = prod.isGstProduct !== false;
                return (
                  <tr key={prod.id} className="hover:bg-muted/40 transition-colors">
                    {/* Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-10 h-10 object-contain rounded-lg bg-background p-1 border border-border/60 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-foreground">{prod.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              SKU: {prod.sku}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              HSN: {prod.hsnCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-muted-foreground font-medium">
                        {prod.category}
                      </span>
                    </td>

                    {/* Tax Type / GST Option Badge */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleProductGstType(prod.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          isGst
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                        }`}
                        title="Click to toggle between GST Tax Invoice and Normal Cash Bill"
                      >
                        {isGst ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-sky-400" />
                            <span>GST {prod.taxRatePercent}% (Tax Bill)</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span>Non-GST (Normal Bill)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Selling Price */}
                    <td className="py-3.5 px-4 text-right font-black text-foreground">
                      {formatINR(prod.sellingPricePaise)}
                    </td>

                    {/* Cost Price */}
                    <td className="py-3.5 px-4 text-right text-muted-foreground font-mono">
                      {formatINR(prod.costPricePaise)}
                    </td>

                    {/* Stock with Steppers */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-background border border-border rounded-xl px-2 py-0.5 shadow-xs">
                        <button
                          onClick={() => adjustStock(prod.id, -1)}
                          className="text-muted-foreground hover:text-foreground font-bold px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span
                          className={`font-black text-xs min-w-[20px] text-center ${
                            prod.stockQty <= prod.lowStockThreshold
                              ? "text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {prod.stockQty}
                        </span>
                        <button
                          onClick={() => adjustStock(prod.id, 1)}
                          className="text-muted-foreground hover:text-foreground font-bold px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Serials / IMEI button */}
                    <td className="py-3.5 px-4 text-center">
                      {prod.hasSerial ? (
                        <button
                          onClick={() => setSelectedProductSerials(prod)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{prod.availableSerials?.length || 0} IMEIs</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">General Barcode</span>
                      )}
                    </td>

                    {/* Delete action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteProduct(prod.id, prod.name)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Serials/IMEI Modal */}
      {selectedProductSerials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setSelectedProductSerials(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-base text-foreground">
                Registered IMEIs in Vault
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-semibold mb-4">
              {selectedProductSerials.name}
            </p>

            {/* List of current IMEIs */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mb-4">
              {selectedProductSerials.availableSerials &&
              selectedProductSerials.availableSerials.length > 0 ? (
                selectedProductSerials.availableSerials.map((imei, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/30 font-mono text-xs"
                  >
                    <span className="font-semibold text-foreground">#{idx + 1}</span>
                    <span className="text-sky-400">{imei}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                      In Vault
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No active serials registered.
                </p>
              )}
            </div>

            {/* Fast Add New IMEI form */}
            <form onSubmit={handleAddNewSerial} className="pt-3 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Scan or type new 15-digit IMEI"
                value={newSerialInput}
                onChange={(e) => setNewSerialInput(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl border border-border bg-background text-xs font-mono focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newSerialInput.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm disabled:opacity-40 cursor-pointer"
              >
                Add IMEI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Product & Stock Intake Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Boxes className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-lg text-foreground">New Product & Stock Intake</h3>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OnePlus 12R (256GB Cool Blue) or Tempered Glass"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OnePlus, Apple, Generic"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Category
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) =>
                      setNewProdCategory(
                        e.target.value as "smartphones" | "accessories" | "audio" | "wearables" | "repairs"
                      )
                    }
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-foreground cursor-pointer"
                  >
                    <option value="smartphones">Smartphones</option>
                    <option value="accessories">Accessories</option>
                    <option value="audio">Audio</option>
                    <option value="wearables">Wearables</option>
                    <option value="repairs">Repairs & Parts</option>
                  </select>
                </div>
              </div>

              {/* GST vs Normal Bill Option Selection */}
              <div className="p-3.5 rounded-2xl border border-sky-500/30 bg-sky-950/20 space-y-3">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                  Tax & Billing Classification (Required)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewProdIsGst(true)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      newProdIsGst
                        ? "bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      <span className="font-bold text-xs">GST Tax Product</span>
                    </div>
                    <p className="text-[10px] mt-1 text-muted-foreground">
                      Generates official GST Tax Invoice with CGST & SGST.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewProdIsGst(false);
                      setNewProdGstRate(0);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !newProdIsGst
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs">Non-GST / Normal</span>
                    </div>
                    <p className="text-[10px] mt-1 text-muted-foreground">
                      Generates standard retail cash estimate memo.
                    </p>
                  </button>
                </div>

                {newProdIsGst && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                        GST Rate (%)
                      </label>
                      <select
                        value={newProdGstRate}
                        onChange={(e) => setNewProdGstRate(parseInt(e.target.value, 10))}
                        className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-foreground cursor-pointer font-bold"
                      >
                        <option value={18}>18% (Smartphones & Tech)</option>
                        <option value={12}>12% (Telecom equipment)</option>
                        <option value={5}>5% (Basic spares)</option>
                        <option value={28}>28% (Luxury accessories)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                        HSN / SAC Code
                      </label>
                      <input
                        type="text"
                        value={newProdHsn}
                        onChange={(e) => setNewProdHsn(e.target.value)}
                        className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="39999"
                    value={newProdSellingPrice}
                    onChange={(e) => setNewProdSellingPrice(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-bold text-foreground"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground uppercase text-[10px]">
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/70">
                <input
                  type="checkbox"
                  id="hasSerialCheck"
                  checked={newProdHasSerial}
                  onChange={(e) => setNewProdHasSerial(e.target.checked)}
                  className="rounded text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="hasSerialCheck" className="text-xs text-foreground cursor-pointer">
                  Requires 15-digit IMEI Serial tracking (Smartphones & Cellular devices)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Add Product to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading stock...</div>}>
      <InventoryContent />
    </Suspense>
  );
}
