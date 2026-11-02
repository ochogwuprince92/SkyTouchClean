# 8. Implementation Plan

## Phase 1 — Foundation
Create Next.js App Router + TypeScript project, configure Tailwind, GitHub and Vercel, validate environment variables and build shared brand components.
**Deliverable:** Responsive website shell.

## Phase 2 — MongoDB
Create a MongoDB Atlas cluster (or local development database), configure `MONGODB_URI` and `MONGODB_DB`, implement the shared server-only database connection, create collections/indexes and seed approved service prices.
**Deliverable:** Secure MongoDB database and catalogue.

## Phase 3 — Public website and bookings
Build home/services/pricing/contact pages, laundry order form, home-cleaning form and fumigation enquiry. Add validation, server-side pricing and unique references.
**Deliverable:** Customers can submit all request types.

## Phase 4 — Admin
Add private staff login with secure server-managed sessions and role checks, protected dashboard, search/filter, status updates, notes, quotations and price management.
**Deliverable:** Staff can operate bookings.

## Phase 5 — Paystack payments and notifications
Implement Paystack hosted checkout, server-side transaction initialization, callback verification, signed HMAC-SHA512 webhook validation, NGN/kobo amount checks, unique references and idempotent MongoDB reconciliation. Complete test-mode acceptance tests before enabling live keys. Add email notifications if provider is selected. Keep WhatsApp click-to-chat; automated WhatsApp API is not needed initially.
**Deliverable:** End-to-end verified Paystack payments with safe webhook reconciliation.

## Phase 6 — QA and launch
Test pricing, guest booking, role access, customer-data privacy, mobile layouts and payment edge cases. Add privacy/terms, configure production environment and train staff.
**Deliverable:** First production release.

## Launch checklist
- [ ] Home-cleaning prices match approved list.
- [ ] Monthly packages show four visits.
- [ ] Laundry prices are item-based.
- [ ] Duvets show “From ₦3,500”.
- [ ] Fumigation is enquiry-only until rates are approved.
- [ ] Cleaning-materials preference is captured.
- [ ] Free pickup/delivery is explained and service area confirmed by staff.
- [ ] Unique references are generated.
- [ ] Admin access is private and role-protected.
- [ ] Server calculates all prices.
- [ ] Payment is not marked successful from redirect alone.
- [ ] Mobile and desktop testing is complete.
