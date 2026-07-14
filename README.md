# My TMS

A transportation management system for freight brokers, built step by step.

## What's here so far

- **Loads** — the central record: origin/destination, pickup/delivery dates, commodity, weight, customer rate, carrier rate, and status (Booked → Dispatched → In Transit → Delivered → Invoiced).
- **Customers** — the shippers you bill for each load.
- **Carriers** — the trucking companies you dispatch loads to and pay.
- A dashboard with live counts.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript — one project for both the pages and the backend logic.
- [Prisma](https://www.prisma.io) + SQLite — the database. SQLite is a single file (`dev.db`) so there's nothing to install or configure locally. We'll move to Postgres when this goes to production.
- [Tailwind CSS](https://tailwindcss.com) — styling.

## Running it locally

```bash
npm install
cp .env.example .env
npx prisma migrate dev   # creates/updates dev.db from prisma/schema.prisma
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
prisma/schema.prisma        # data model: Load, Customer, Carrier
src/lib/prisma.ts           # shared database client
src/app/page.tsx            # dashboard
src/app/loads/              # loads list, create form, status actions
src/app/customers/          # customers list + create form
src/app/carriers/           # carriers list + create form
```

Each `page.tsx` fetches data straight from the database on the server. Each `actions.ts` holds "Server Actions" — functions that run on the server when a form is submitted, no separate API layer needed.
