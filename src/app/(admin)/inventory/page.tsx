"use client";

import { useState } from "react";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Tag,
  ArrowUpDown,
  MoreVertical,
  X,
  PlusCircle,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { formatINR } from "@/lib/finance";
import { INITIAL_PRODUCTS, ProductItem } from "@/lib/mock-data";

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProductSerials, setSelectedProductSerials] = useState<ProductItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding new product
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<"smartphones" | "accessories" | "audio" | "wearables">("smartphones");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdHsn, setNewProdHsn] = useState("85171300");
  const [newProdSellingPrice, setNewProdSellingPrice] = useState("");
  const [newProdCostPrice, setNewProdCostPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdHasSerial, setNewProdHasSerial] = useState(true);

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
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
      hsnCode: newProdHsn || "85171300",
      barcode: `890123${Date.now().toString().slice(-6)}`,
      mrpPaise: sellingPaise,
      sellingPricePaise: sellingPaise,
      costPricePaise: costPaise,
      taxRatePercent: 18,
      stockQty: stock,
      lowStockThreshold: 3,
      hasSerial: newProdHasSerial,
      availableSerials: newProdHasSerial
        ? Array.from({ length: stock }).map((_, i) => `IMEI${Date.now()}${i}`)
        : undefined,
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
      description: "Brand new stock intake.",
    };

    setProducts([newProduct, ...products]);
    setShowAddModal(false);
    // Reset form
    setNewProdName("");
    setNewProdBrand("");
    setNewProdSellingPrice("");
    setNewProdCostPrice("");
    setNewProdStock("");
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
            Real-time stock valuation, serial/IMEI history, and automated low-stock warnings
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stock / Product</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, brand, SKU or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-card/60 focus:bg-background text-xs font-medium focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border/80 bg-card/60 text-xs font-medium focus:outline-none text-foreground"
          >
            <option value="all">All Categories</option>
            <option value="smartphones">Smartphones</option>
            <option value="accessories">Accessories</option>
            <option value="audio">Audio</option>
            <option value="wearables">Wearables</option>
            <option value="repairs">Repairs & Parts</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Product & SKU</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right">Cost Price</th>
                <th className="py-3 px-3 font-semibold text-right">Selling Price</th>
                <th className="py-3 px-3 font-semibold text-center">Tax (GST)</th>
                <th className="py-3 px-3 font-semibold text-center">Stock Level</th>
                <th className="py-3 px-3 font-semibold text-center">IMEI / Serial</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((product) => {
                const isLowStock = product.stockQty <= product.lowStockThreshold;
                const isOutOfStock = product.stockQty === 0;

                return (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    {/* Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            SKU: {product.sku} • HSN: {product.hsnCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                        {product.category}
                      </span>
                    </td>

                    {/* Cost Price */}
                    <td className="py-3.5 px-3 text-right text-muted-foreground">
                      {formatINR(product.costPricePaise)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3.5 px-3 text-right font-bold text-foreground">
                      {formatINR(product.sellingPricePaise)}
                    </td>

                    {/* GST % */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-[11px] font-medium">{product.taxRatePercent}%</span>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOutOfStock
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : isLowStock
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {product.stockQty} Units
                      </span>
                    </td>

                    {/* IMEI Status */}
                    <td className="py-3.5 px-3 text-center">
                      {product.hasSerial ? (
                        <button
                          onClick={() => setSelectedProductSerials(product)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{product.availableSerials?.length || 0} Serials</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">N/A (Bulk)</span>
                      )}
                    </td>

                    {/* Stock quick adjust */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => adjustStock(product.id, -1)}
                          className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-xs"
                          title="Reduce stock"
                        >
                          -
                        </button>
                        <button
                          onClick={() => adjustStock(product.id, 1)}
                          className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-xs"
                          title="Increase stock"
                        >
                          +
                        </button>
                      </div>
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
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-base text-foreground">
                Registered IMEIs for Device
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-semibold mb-4">
              {selectedProductSerials.name}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
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
          </div>
        </div>
      )}

      {/* Add New Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Boxes className="w-5 h-5 text-primary" />
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
                  placeholder="e.g. OnePlus 12R (256GB Cool Blue)"
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
                    placeholder="e.g. OnePlus"
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
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none text-foreground"
                  >
                    <option value="smartphones">Smartphones</option>
                    <option value="accessories">Accessories</option>
                    <option value="audio">Audio</option>
                    <option value="wearables">Wearables</option>
                  </select>
                </div>
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
                    className="w-full mt-1 h-9 px-3 rounded-xl border border-border bg-background focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/70">
                <input
                  type="checkbox"
                  id="hasSerialCheck"
                  checked={newProdHasSerial}
                  onChange={(e) => setNewProdHasSerial(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="hasSerialCheck" className="text-xs text-foreground cursor-pointer">
                  Requires 15-digit IMEI Serial tracking (Smartphones & Cellular devices)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md"
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
