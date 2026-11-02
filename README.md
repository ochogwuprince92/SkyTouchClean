# SkyTouchClean Web App — Documentation v2

Improvement to the earlier specification. The agreed stack is retained, with a minimal Node.js backend using Next.js Route Handlers and Server Actions.

## Stack
- Next.js App Router + TypeScript
- Node.js runtime (Next.js backend; no separate Express server initially)
- MongoDB Atlas (MongoDB database) using the official MongoDB Node.js driver or Mongoose
- Staff authentication using secure server-managed sessions (Argon2id password hashing); no public admin registration
- Paystack for online payments (transaction initialization, hosted checkout, server-side verification and signed webhooks)
- Tailwind CSS
- Vercel
- Git/GitHub

No Spring Boot, microservices, Redis or message broker for the first release.

## Brand
SkyTouchClean | Clean Spaces. Fresh Clothes. Less Worries.
WE CLEAN. WE WASH. WE FUMIGATE.
Phone/WhatsApp: 08157278277
Address: 28 Agberin Street, Close to St Daniel Hospital, Oworo, Lagos.
Footer: SKYTOUCHCLEAN — HONESTY AND SERVICE.

## Documents
1. Product requirements
2. Pricing and business rules
3. Architecture
4. Database design
5. API and workflows
6. UI/UX guidelines
7. Security and operations
8. Implementation plan

## Decisions to preserve
- Laundry is priced per garment/item, not by weight.
- Native wear: ₦1,500 per item/set under the latest supplied price list.
- Duvets: from ₦3,500; staff confirms final price.
- Monthly home-cleaning packages include four visits.
- Fumigation is enquiry/quotation-only until its prices are supplied.
- Laundry pickup and delivery are advertised as free; staff confirms service-area eligibility.
- Cleaning can be labour-only with customer-supplied materials, or with materials supplied by SkyTouchClean for an additional agreed quote.
- Guest booking is allowed; admin registration is private.
