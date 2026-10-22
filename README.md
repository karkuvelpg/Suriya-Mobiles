# Suriya Mobiles 📱

A professional, full-stack mobile retail billing and e-commerce platform built with Next.js 16, TypeScript, Supabase, and Drizzle ORM.

## Features

- **Owner & Admin Dashboard** — Unified control over all business modules
- **POS / Billing** — Fast, GST-ready point-of-sale with IMEI tracking
- **Product & Inventory Management** — New and used phones, accessories, IMEI/serial tracking
- **Multi-Branch Operations** — Branch-specific inventory, staff, and cash sessions
- **E-Commerce Storefront** — Customer-facing online shop with cart and checkout
- **Online Payments** — Razorpay integration (UPI, card, net banking)
- **GST Invoices** — Compliant invoices with CGST/SGST/IGST breakdown
- **Role-Based Access Control** — Owner, Admin, Cashier, Inventory Staff, Customer
- **Audit Logs** — Immutable records of all critical business operations

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI Primitives |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (SSR) |
| Payments | Razorpay |
| Testing | Vitest + Testing Library |
| Deployment | Vercel |

## Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com) project (free tier)
- A [Razorpay](https://razorpay.com) account (free to register)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/karkuvelpg/Suriya-Mobiles.git
cd Suriya-Mobiles/suriya-mobiles
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@host:6543/postgres
DATABASE_URL_DIRECT=postgresql://postgres:password@host:5432/postgres
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

### 3. Database Setup

Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

Seed the database (creates org, branch, and owner account):

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** → copy the Project URL and anon key
3. Go to **Settings → Database** → copy the connection string
4. For the `DATABASE_URL`, use the **Transaction pooler** (port 6543)
5. For `DATABASE_URL_DIRECT` (migrations), use the **Direct connection** (port 5432)

### Row-Level Security (RLS)

Run the RLS policies file after migrations:
```bash
# Coming in Stage 2 — RLS policies will be provided as a separate migration
```

## Testing

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Current test coverage:
- **Permission system**: 113 tests — Owner bypass, role restrictions, branch guards
- **Financial calculations**: 18 tests — GST, cart totals, discount validation

## Database Commands

```bash
# Generate new migration after schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed the database with initial data
npm run db:seed
```

## Roles and Permissions

| Role | Access Level |
|------|-------------|
| **Owner** | Full access to ALL features — no restrictions |
| **Admin** | All operations except sensitive owner settings |
| **Cashier** | POS, sales, cash sessions, customers |
| **Inventory Staff** | Products, stock, suppliers, purchase orders |
| **Customer** | Own orders and account only |

> **Important**: Permissions are enforced server-side via database lookups. Client-side role values are never trusted.

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin dashboard (protected)
│   ├── (pos)/             # POS interface (protected)
│   ├── (store)/           # Public storefront
│   └── api/               # API routes
├── lib/
│   ├── db/
│   │   ├── schema/        # Drizzle ORM table definitions
│   │   └── seed.ts        # Database seed script
│   ├── auth/              # Server-side auth helpers
│   ├── supabase/          # Supabase client factories
│   ├── permissions.ts     # RBAC permission system
│   ├── finance.ts         # GST and financial calculations
│   ├── audit.ts           # Audit logging utility
│   └── utils.ts           # General utilities
├── components/            # Reusable UI components
└── tests/                 # Unit and integration tests
```

## Payment Integration (Razorpay)

1. Register at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys** → Generate Test Key
3. Add test keys to `.env.local`
4. Configure webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
5. Enable webhook events: `payment.captured`, `payment.failed`, `refund.created`

> ⚠️ Never use live keys until you're ready for production. All payment verification is server-side.

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in Vercel dashboard under **Settings → Environment Variables**.

## Backup & Recovery

Supabase provides automated daily backups on all plans. For manual backups:

```bash
pg_dump "postgresql://postgres:password@host:5432/postgres" > backup.sql
```

Restore:
```bash
psql "postgresql://postgres:password@host:5432/postgres" < backup.sql
```

## Known Limitations & External Service Notes

| Service | Free Tier Limits | Notes |
|---------|-----------------|-------|
| Supabase | 500MB DB, 1GB storage, 50K MAU | Sufficient for small-medium retail |
| Razorpay | 2% + ₹2 per transaction | No monthly fee, charged per transaction |
| Vercel | 100GB bandwidth, 100 deploys/day | Sufficient for initial launch |

## Development Stages

- [x] **Stage 1**: Foundation — DB schema, RBAC, permissions, 131 tests
- [ ] **Stage 2**: Products & Inventory — IMEI tracking, suppliers, stock
- [ ] **Stage 3**: POS & Billing — Cart, invoices, GST printing
- [ ] **Stage 4**: E-Commerce Storefront — Public shop, cart, checkout
- [ ] **Stage 5**: Payments & Fulfilment — Razorpay, orders, shipping
- [ ] **Stage 6**: Reports & Production — Analytics, deployment, monitoring

## Contributing

This is a private business application. For support or issues, contact the development team.

## License

Private — All rights reserved © Suriya Mobiles
