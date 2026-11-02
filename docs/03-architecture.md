# 3. Architecture

## Approach
Use a Next.js modular monolith. Next.js runs on Node.js and provides the frontend and minimal backend in one deployment. Do not create a separate Express API server initially.

## Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js App Router + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js via Next.js Route Handlers and Server Actions |
| Database | MongoDB Atlas |
| Authentication | Server-managed staff sessions (Argon2id password hashing) |
| File storage | Not required for the first release; add a dedicated object-storage provider only if uploads are introduced |
| Payments | Paystack, when enabled |
| Hosting | Vercel |
| Version control | Git/GitHub |

## Suggested structure
```text
src/
  app/
    (public)/              # home, services, pricing, booking, contact
    admin/                 # login and protected dashboard
    api/
      services/route.ts
      laundry-orders/route.ts
      bookings/cleaning/route.ts
      bookings/fumigation/route.ts
      admin/
      payments/
  components/              # shared UI, layout and forms
  features/
    laundry/
    cleaning/
    fumigation/
    bookings/
    payments/
    admin/
  lib/
    mongodb/
    auth/
    paystack/
    validation/
    pricing/
    security/
  server/
    services/
    repositories/
    workflows/
  types/
scripts/ (database indexes and seed scripts)
docs/
```

## Backend rules
- Use Route Handlers for API endpoints, webhooks and admin mutations.
- Server Actions may handle suitable same-app forms but must validate and authorise on the server.
- Keep business logic in server-only modules, not React components.
- Use Zod or equivalent validation.
- Keep `MONGODB_URI`, `SESSION_SECRET` and Paystack secret keys server-only.
- Use Node.js runtime for payment and webhook routes.
- Avoid Express, queues and microservices until there is a demonstrated need.

## Request flow
Browser → Next.js server validation → read service price from MongoDB → calculate amount → save request → return unique reference. Admin reviews and confirms. Paystack is initiated and verified server-side; signed webhooks reconcile asynchronous payment outcomes.

## MongoDB implementation notes
- Connect with the official MongoDB Node.js driver or Mongoose through a server-only `lib/mongodb` module. Reuse one connection/pool across Next.js requests; do not connect separately in every handler.
- Use MongoDB Atlas for production and a local MongoDB instance for development. Set `MONGODB_URI` and `MONGODB_DB` in the server environment.
- Create indexes for unique booking/order/payment references, service and price lookup fields, and admin list filters (status, service type and creation date).
- Use BSON `ObjectId` identifiers. Store related detail records as embedded documents where they are naturally one-to-one; use separate collections for growing order items and status history where appropriate.
- Use MongoDB transactions for multi-document operations when the deployment runs on a replica set (including Atlas); otherwise design writes to be safely retryable and consistent.
- Validate all documents at the application boundary and enforce important invariants in server-side business logic. MongoDB does not provide PostgreSQL-style foreign keys or Row Level Security.
- Never expose database credentials or staff session secrets to browser code.

- Paystack checkout uses the hosted authorization URL returned by server-side transaction initialization. The secret key never reaches the browser.
- Callback verification and signed webhooks converge on one idempotent payment reconciliation service.
