# 5. API and Workflows

Implement endpoints as Next.js Route Handlers using Node.js runtime where needed.

## Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/services` | Active services and prices |
| POST | `/api/laundry-orders` | Submit laundry order |
| POST | `/api/bookings/cleaning` | Submit cleaning request |
| POST | `/api/bookings/fumigation` | Submit fumigation enquiry |
| GET | `/api/booking-status/[reference]` | Limited status lookup with verification |
| GET | `/api/admin/bookings` | Admin booking list |
| PATCH | `/api/admin/bookings/[id]` | Update booking |
| GET | `/api/admin/laundry-orders` | Admin laundry list |
| PATCH | `/api/admin/laundry-orders/[id]` | Update laundry order |
| POST | `/api/payments/initialize` | Initialize Paystack |
| GET | `/api/payments/verify` | Verify payment |
| POST | `/api/payments/webhook` | Paystack webhook |

All admin endpoints require an authenticated staff session and role check.

## Laundry workflow
1. Customer enters contact, pickup/delivery address and preferred collection time.
2. Customer adds item codes and quantities.
3. Server validates items and loads prices from MongoDB.
4. Server calculates totals and stores price snapshots.
5. Create order as PENDING_REVIEW with unique reference.
6. Staff confirms service area, collection and special-care needs.
7. Any extra charge is explained and approved before processing/payment.

## Cleaning workflow
1. Customer selects 1–4 bedrooms and monthly or single visit.
2. Server loads the approved price.
3. Customer enters address, schedule and materials preference.
4. Customer identifies deep-cleaning/heavy-soiling needs.
5. Create PENDING_REVIEW booking.
6. Staff assesses scope, confirms final price and schedule.
7. Customer accepts; booking is scheduled and completed.

## Fumigation workflow
Customer submits property/pest details. Staff assesses and enters quotation. Customer accepts or declines. No automatic fixed-price checkout before rates are approved.

## Paystack payment integration (required)
Backend calculates expected amount → initializes transaction → customer pays → backend verifies reference, amount, currency and status → webhook signature is validated → idempotently update payment. Never mark paid based only on browser redirect.

Use 400/401/403/404/409/422/500 responses appropriately. Rate-limit public endpoints, validate input sizes and prevent spam.


### Payment implementation requirements

1. **Create the payable request first.** Save the booking or laundry order in MongoDB with a server-generated unique reference and a payment state of `PENDING` (or `UNPAID` before initialization). Never accept an amount or price supplied by the browser as authoritative.
2. **Initialize from the server.** `POST /api/payments/initialize` accepts the order type and ID. The server loads the order and current approved price from MongoDB, checks that it is payable, calculates the amount in integer kobo, and obtains the customer's email. Generate a unique Paystack reference and persist a pending `payments` document before or as part of initialization. Call `POST https://api.paystack.co/transaction/initialize` with `Authorization: Bearer ${PAYSTACK_SECRET_KEY}`, `email`, `amount` (kobo), `currency: "NGN"`, `reference`, `callback_url`, and minimal metadata containing the internal order type/ID. Return only the authorization URL and reference to the browser.
3. **Redirect to hosted checkout.** Send the customer to the `authorization_url` returned by Paystack. Do not collect or store card numbers, PINs, CVVs or OTPs in SkyTouchClean.
4. **Verify on callback.** `GET /api/payments/verify?reference=...` calls `GET https://api.paystack.co/transaction/verify/{reference}` from the server. Match the returned reference to the stored pending payment and confirm `data.status === "success"`, `data.amount` equals the expected amount in kobo, `data.currency === "NGN"`, and the payment belongs to the expected order. Only then mark the payment and associated order as paid. A browser redirect or query-string status is never proof of payment.
5. **Process webhooks.** Configure the public endpoint `/api/payments/webhook` in the Paystack Dashboard for the correct test/live environment. Read the raw request body and validate `x-paystack-signature` as an HMAC-SHA512 digest using `PAYSTACK_SECRET_KEY` with a timing-safe comparison. Reject invalid signatures. For `charge.success`, verify the reference and transaction with Paystack's verify endpoint (or otherwise validate all required transaction fields against the stored pending payment) before updating MongoDB. Acknowledge valid events promptly with HTTP 200; safely handle retries.
6. **Make updates idempotent.** Enforce a unique index on `payments.reference`. Use an atomic conditional update so a payment/order is transitioned to `PAID` at most once, even if callback and webhook arrive together or Paystack retries an event. Do not create duplicate payment records or duplicate status-history entries for the same transition.
7. **Handle non-success states.** Keep abandoned, pending, ongoing, failed and reversed transactions distinct. A failed/abandoned attempt must not mark an order paid. Allow a fresh reference for a new attempt; do not overwrite a previously successful payment.
8. **Currency and fees.** The launch currency is NGN. Paystack's `amount` is expressed in the currency's subunit (kobo), so ₦1,000 is sent as `100000`. Store amounts as integer kobo. Do not add Paystack fees to the customer total unless the business explicitly approves and documents that policy.
9. **Testing and go-live.** Test successful, failed, abandoned, delayed/pending, duplicate webhook, invalid signature, amount mismatch, wrong currency, callback-before-webhook and webhook-before-callback cases using Paystack test keys. Switch to live keys only after end-to-end sign-off. Configure the live callback and webhook URLs separately in the Paystack Dashboard.

### Required environment variables
- `PAYSTACK_SECRET_KEY`: server-only test or live secret key.
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: public key only if a frontend Paystack SDK is used; the hosted-checkout redirect flow does not need to expose or use it.
- `NEXT_PUBLIC_SITE_URL`: used to construct the callback URL.

### Suggested payment states
`PENDING`, `SUCCESS`, `FAILED`, `ABANDONED`, `REVERSED`, `REFUNDED`. Keep order status separate from payment status. Staff must not manually mark an order paid without a recorded, reconciled payment or an explicitly audited offline-payment workflow.
