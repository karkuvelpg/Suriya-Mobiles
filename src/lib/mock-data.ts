export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: "smartphones" | "accessories" | "audio" | "wearables" | "repairs";
  sku: string;
  hsnCode: string;
  barcode: string;
  mrpPaise: number;
  sellingPricePaise: number;
  costPricePaise: number;
  taxRatePercent: number; // e.g. 18 for phones
  stockQty: number;
  lowStockThreshold: number;
  hasSerial: boolean; // requires IMEI/Serial number
  availableSerials?: string[];
  imageUrl: string;
  description: string;
  specs?: Record<string, string>;
  isFeatured?: boolean;
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  paymentMethod: "CASH" | "UPI" | "CARD" | "SPLIT" | "CREDIT";
  paymentStatus: "PAID" | "PENDING" | "PARTIAL";
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  discountPaise: number;
  roundOffPaise: number;
  grandTotalPaise: number;
  items: {
    productId: string;
    productName: string;
    imei?: string;
    qty: number;
    unitPricePaise: number;
    taxRatePercent: number;
    totalPaise: number;
  }[];
  cashierName: string;
  branchName: string;
}

export interface RepairJob {
  id: string;
  jobId: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imeiNumber: string;
  issueDescription: string;
  estimatedCostPaise: number;
  advancePaidPaise: number;
  status: "RECEIVED" | "IN_PROGRESS" | "WAITING_PARTS" | "COMPLETED" | "DELIVERED";
  createdAt: string;
  expectedDelivery: string;
  technicianNotes?: string;
}

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    name: "Apple iPhone 15 Pro Max (256GB - Natural Titanium)",
    brand: "Apple",
    category: "smartphones",
    sku: "IPH15PM-256-NT",
    hsnCode: "85171300",
    barcode: "890123456001",
    mrpPaise: 15990000,
    sellingPricePaise: 14890000,
    costPricePaise: 13500000,
    taxRatePercent: 18,
    stockQty: 8,
    lowStockThreshold: 3,
    hasSerial: true,
    availableSerials: ["358291048291048", "358291048291049", "358291048291050", "358291048291051"],
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    description: "A17 Pro chip, Titanium design, 48MP main camera, 5x Telephoto, Action Button, Type-C port.",
    specs: { RAM: "8GB", Storage: "256GB", Display: '6.7" Super Retina XDR OLED', Battery: "4422 mAh" },
    isFeatured: true,
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S24 Ultra (512GB - Titanium Black)",
    brand: "Samsung",
    category: "smartphones",
    sku: "SMS24U-512-TB",
    hsnCode: "85171300",
    barcode: "890123456002",
    mrpPaise: 13999900,
    sellingPricePaise: 12999900,
    costPricePaise: 11800000,
    taxRatePercent: 18,
    stockQty: 5,
    lowStockThreshold: 2,
    hasSerial: true,
    availableSerials: ["864920059102847", "864920059102848", "864920059102849"],
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
    description: "Galaxy AI powered, Snapdragon 8 Gen 3, S-Pen included, 200MP Quad Telephoto Camera.",
    specs: { RAM: "12GB", Storage: "512GB", Display: '6.8" Dynamic AMOLED 2X 120Hz', Battery: "5000 mAh" },
    isFeatured: true,
  },
  {
    id: "prod-3",
    name: "OnePlus 12 (256GB - Silky Black)",
    brand: "OnePlus",
    category: "smartphones",
    sku: "OP12-256-BLK",
    hsnCode: "85171300",
    barcode: "890123456003",
    mrpPaise: 6499900,
    sellingPricePaise: 5999900,
    costPricePaise: 5400000,
    taxRatePercent: 18,
    stockQty: 12,
    lowStockThreshold: 4,
    hasSerial: true,
    availableSerials: ["990012345678901", "990012345678902"],
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    description: "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 5400 mAh Battery with 100W SuperVOOC charging.",
    specs: { RAM: "12GB", Storage: "256GB", Display: '6.82" 2K ProXDR Display', Battery: "5400 mAh" },
    isFeatured: true,
  },
  {
    id: "prod-4",
    name: "Apple AirPods Pro (2nd Gen with USB-C)",
    brand: "Apple",
    category: "audio",
    sku: "APP2-USBC",
    hsnCode: "85183000",
    barcode: "890123456004",
    mrpPaise: 2490000,
    sellingPricePaise: 2199000,
    costPricePaise: 1850000,
    taxRatePercent: 18,
    stockQty: 25,
    lowStockThreshold: 5,
    hasSerial: true,
    availableSerials: ["APRO2-849102", "APRO2-849103"],
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    description: "Active Noise Cancellation, Adaptive Audio, Transparency mode, MagSafe Charging Case (USB-C).",
    isFeatured: true,
  },
  {
    id: "prod-5",
    name: "Anker 65W GaN Fast Charger 3-Port (2C+1A)",
    brand: "Anker",
    category: "accessories",
    sku: "ANK-65W-GAN",
    hsnCode: "85044090",
    barcode: "890123456005",
    mrpPaise: 499900,
    sellingPricePaise: 349900,
    costPricePaise: 240000,
    taxRatePercent: 18,
    stockQty: 40,
    lowStockThreshold: 10,
    hasSerial: false,
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    description: "High-speed GaN technology, simultaneous fast charging for MacBook, iPhone, and Apple Watch.",
  },
  {
    id: "prod-6",
    name: "Spigen Ultra Hybrid MagFit Case for iPhone 15 Pro",
    brand: "Spigen",
    category: "accessories",
    sku: "SPG-UH-IPH15P",
    hsnCode: "39269099",
    barcode: "890123456006",
    mrpPaise: 219900,
    sellingPricePaise: 169900,
    costPricePaise: 95000,
    taxRatePercent: 18,
    stockQty: 50,
    lowStockThreshold: 15,
    hasSerial: false,
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80",
    description: "Crystal clear back with built-in magnetic ring for MagSafe compatibility and Air Cushion drop protection.",
  },
  {
    id: "prod-7",
    name: "Samsung Galaxy Watch6 Classic (47mm Bluetooth)",
    brand: "Samsung",
    category: "wearables",
    sku: "GW6C-47-BT",
    hsnCode: "85176290",
    barcode: "890123456007",
    mrpPaise: 3999900,
    sellingPricePaise: 3299900,
    costPricePaise: 2750000,
    taxRatePercent: 18,
    stockQty: 6,
    lowStockThreshold: 3,
    hasSerial: true,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "Rotating bezel, Sapphire Crystal glass, Body Composition analysis, advanced sleep coaching.",
    isFeatured: true,
  },
  {
    id: "prod-8",
    name: "Screen Replacement Service (iPhone OLED OEM Grade)",
    brand: "Service",
    category: "repairs",
    sku: "REP-IPH-OLED",
    hsnCode: "998713",
    barcode: "890123456008",
    mrpPaise: 950000,
    sellingPricePaise: 799900,
    costPricePaise: 450000,
    taxRatePercent: 18,
    stockQty: 99,
    lowStockThreshold: 5,
    hasSerial: false,
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    description: "Original specification OLED display replacement with 6 months warranty, True Tone reprogramming included.",
  }
];

export const INITIAL_SALES: SaleInvoice[] = [
  {
    id: "inv-1001",
    invoiceNumber: "INV-2026-0042",
    date: "2026-10-22 14:35",
    customerName: "Rajesh Kumar",
    customerPhone: "9840123456",
    customerGstin: "33AAACR1234F1Z1",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    subtotalPaise: 12618644,
    cgstPaise: 1135678,
    sgstPaise: 1135678,
    discountPaise: 0,
    roundOffPaise: 0,
    grandTotalPaise: 14890000,
    items: [
      {
        productId: "prod-1",
        productName: "Apple iPhone 15 Pro Max (256GB - Natural Titanium)",
        imei: "358291048291048",
        qty: 1,
        unitPricePaise: 14890000,
        taxRatePercent: 18,
        totalPaise: 14890000,
      }
    ],
    cashierName: "Karthik Raja",
    branchName: "Main Branch - Anna Nagar"
  },
  {
    id: "inv-1002",
    invoiceNumber: "INV-2026-0043",
    date: "2026-10-22 15:10",
    customerName: "Priya Sundaram",
    customerPhone: "9790456789",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    subtotalPaise: 2007627,
    cgstPaise: 180686,
    sgstPaise: 180686,
    discountPaise: 10000,
    roundOffPaise: 1,
    grandTotalPaise: 2359000,
    items: [
      {
        productId: "prod-4",
        productName: "Apple AirPods Pro (2nd Gen with USB-C)",
        imei: "APRO2-849102",
        qty: 1,
        unitPricePaise: 2199000,
        taxRatePercent: 18,
        totalPaise: 2199000,
      },
      {
        productId: "prod-6",
        productName: "Spigen Ultra Hybrid MagFit Case for iPhone 15 Pro",
        qty: 1,
        unitPricePaise: 169900,
        taxRatePercent: 18,
        totalPaise: 169900,
      }
    ],
    cashierName: "Karthik Raja",
    branchName: "Main Branch - Anna Nagar"
  }
];

export const INITIAL_REPAIRS: RepairJob[] = [
  {
    id: "rep-01",
    jobId: "JOB-26-089",
    customerName: "Senthil Nathan",
    customerPhone: "9444123890",
    deviceModel: "iPhone 13",
    imeiNumber: "354920194820192",
    issueDescription: "Cracked display glass, touch unresponsive on top half",
    estimatedCostPaise: 650000,
    advancePaidPaise: 200000,
    status: "IN_PROGRESS",
    createdAt: "2026-10-21 11:30",
    expectedDelivery: "2026-10-23 17:00",
    technicianNotes: "Awaiting original display module from supplier.",
  },
  {
    id: "rep-02",
    jobId: "JOB-26-090",
    customerName: "Ananya Rao",
    customerPhone: "9884561234",
    deviceModel: "Samsung S22 Ultra",
    imeiNumber: "869201948291044",
    issueDescription: "Battery draining rapidly, heats up during fast charging",
    estimatedCostPaise: 320000,
    advancePaidPaise: 100000,
    status: "COMPLETED",
    createdAt: "2026-10-22 09:15",
    expectedDelivery: "2026-10-22 18:00",
    technicianNotes: "Replaced battery with authentic Samsung part. Tested 45W fast charge OK.",
  }
];
