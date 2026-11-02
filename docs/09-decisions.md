# Decisions Log

This document identifies ambiguities, gaps, and contradictions in the specification, provides recommended defaults with rationale, defines state machines and permissions, specifies the seed catalogue, and designs the email authentication system.

## 1. Ambiguities, Contradictions, and Gaps

| # | Issue | Recommended Default | Rationale |
|---|-------|---------------------|-----------|
| 1 | Payment status vocabularies: docs/01 lists "NOT_REQUIRED, UNPAID, PENDING, PAID, FAILED, REFUNDED" while docs/05 suggests "PENDING, SUCCESS, FAILED, ABANDONED, REVERSED, REFUNDED" | Use: NOT_REQUIRED, UNPAID, PENDING, PAID, FAILED, REFUNDED, ABANDONED, REVERSED (merge both vocabularies) | Docs/01 is for order/booking status context, docs/05 is payment-specific. Combining covers all states including ABANDONED (customer left checkout) and REVERSED (Paystack reversal). |
| 2 | When an order becomes payable: docs/05 says "Create the payable request first" but doesn't specify timing relative to staff confirmation | Order becomes payable immediately after creation for laundry/cleaning, but fumigation requires quote acceptance first | Laundry and cleaning have fixed prices from docs/02, so can proceed to payment immediately. Fumigation has no approved rates (docs/02), so must wait for staff quote. |
| 3 | Status transitions: docs/01 lists statuses but no transition rules or triggers | See State Machines section below | Need explicit transition rules to prevent invalid state changes. |
| 4 | Role permissions: docs/01 says staff can "manage catalogue prices" but unclear if STAFF or ADMIN only | See Role/Permission Matrix below | Price edits and staff management are security-sensitive; restrict to ADMIN. |
| 5 | Session storage: docs/03 says "server-managed staff sessions" but no storage mechanism specified | DB-backed sessions with hashed token and TTL index (see Email Authentication section) | Serverless (Vercel) doesn't have persistent memory. DB storage ensures sessions survive redeployments and enables revocation. |
| 6 | Rate limiting on serverless without Redis: docs/05 says "Rate-limit public endpoints" but docs/03 says "No Redis" | Use MongoDB TTL-based rate limiting with per-IP and per-email counters (see Email Authentication section) | MongoDB TTL indexes can auto-expire rate-limit records. No Redis needed. |
| 7 | Booking-status verification: docs/05 has "/api/booking-status/[reference]" with "Limited status lookup with verification" but no mechanism specified | Require 6-digit OTP sent to customer email (see Email Authentication section) | Email-based OTP prevents unauthorized access to order details. Phone SMS would require SMS provider; email is already needed for Paystack. |
| 8 | Item codes and units: docs/02 lists items but no specific itemCodes defined | See Seed Catalogue section below | Use uppercase snake_case codes for consistency with database design. |
| 9 | Reference format: docs/01 says "Unique references are generated" but no format specified | Format: STC-{SERVICE}-{8-digit-alphanumeric} (e.g., STC-LAU-ABC12345) | Human-readable prefix identifies service type, random suffix prevents guessing. |
| 10 | Guest email vs Paystack: docs/05 requires email for Paystack initialization but docs/04 says email is optional in bookings/laundry_orders | Email is REQUIRED before payment initialization. If not provided at booking, prompt customer to enter email before payment | Paystack requires email. Enforce at payment time rather than forcing at booking to reduce friction. |
| 11 | Fumigation payment flow: docs/01 says fumigation is quotation-only but docs/05 says Paystack is required | Fumigation: customer submits enquiry → staff quotes → customer accepts quote → payment via Paystack (using quoted amount) | Fumigation can't have fixed price until staff assessment. Quote becomes the payable amount after acceptance. |
| 12 | Staff roles beyond ADMIN/STAFF: docs/04 defines only two roles | Use only ADMIN and STAFF (no additional roles for first release) | Keep simple. Add more roles only if business needs emerge. |
| 13 | Session TTL: Not specified in docs | Staff session: 8 hours (typical workday). OTP code: 10 minutes. | Staff sessions should last a workday without re-login. OTP must be short-lived for security. |
| 14 | Password reset: docs/07 mentions Argon2id but no reset flow | Email-based password reset with single-use hashed expiring token (see Email Authentication section) | Standard secure pattern. Email already required for staff accounts. |
| 15 | OTP/verification for customers: docs/05 has status lookup endpoint but no verification mechanism | 6-digit emailed one-time code, hashed, 10-minute expiry, max 5 attempts (see Email Authentication section) | Balances security and usability. Email is the verified contact method. |
| 16 | Rate limit values: docs/05 says "Rate-limit public endpoints" but no specific limits | Public booking endpoints: 5 requests per minute per IP/email. Login endpoint: 10 attempts per 15 minutes per IP/email. | Prevents spam and brute force while allowing legitimate retries. |
| 17 | Materials quote workflow: docs/02 says "additional agreed quotation" but no presentation/acceptance mechanism | Staff sends materials quote via email/phone. If accepted, staff updates booking with materialsQuoteKobo. No in-app acceptance flow in first release | Business-approved quotes can be communicated directly. In-app acceptance adds complexity not required for first release. |
| 18 | Extra charges workflow: docs/02 says "subject to customer approval" but no approval mechanism | Staff communicates extra charges via phone/WhatsApp/email. If customer approves, staff updates order with additionalChargeKobo. No in-app approval flow in first release | Same rationale as materials quote. Direct communication is simpler for first release. |
| 19 | Offline payment workflow: docs/05 mentions "explicitly audited offline-payment workflow" but not defined | Staff can manually mark order as PAID via admin dashboard with mandatory "paymentMethod" field (CASH, TRANSFER, OTHER) and "receiptReference". Requires ADMIN role. | Business needs to record offline payments. Audit trail via receiptReference and ADMIN-only restriction. |
| 20 | Multiple payment attempts: docs/05 says "Allow a fresh reference for a new attempt" but unclear if multiple pending payments allowed | Only one active payment attempt per order at a time. Previous FAILED/ABANDONED payments must be archived before new attempt. | Prevents payment confusion and double-payment risk. |
| 21 | Refund process: REFUNDED status mentioned but no workflow defined | [OPEN] Business input required: Who can initiate refunds? What approval process? Should integrate with Paystack refund API? | Refunds are business-critical. Need to define policy before implementation. |
| 22 | Email requirement for payment: Paystack requires email but docs/04 says email optional in database | Email is REQUIRED field for laundry_orders and bookings, not optional | Paystack requires email for initialization. Make email mandatory at submission time to avoid friction at payment. |
| 23 | Guest authentication for status lookup: No mechanism specified | 6-digit OTP sent to the email provided at booking (see Email Authentication section) | Prevents anyone with just a reference number from accessing order details. |
| 24 | OTP/code format for customer verification: Not specified | 6-digit numeric code, hashed in DB, 10-minute expiry, max 5 attempts | Standard OTP format. Short enough to type, long enough to resist brute force. |
| 25 | Email provider selection: docs/08 says "Add email notifications if provider is selected" | Default: Resend (resend.com). Fallback to: SendGrid if business prefers | Resend is simple, has good Node.js SDK, and is cost-effective for transactional email. |

## 2. State Machines

### 2.1 Order/Booking Status State Machine

| Current Status | Allowed Next Status | Trigger |
|----------------|---------------------|---------|
| PENDING_REVIEW | AWAITING_CUSTOMER_CONFIRMATION | Staff confirms schedule and price |
| PENDING_REVIEW | CANCELLED | Customer cancels or staff rejects request |
| AWAITING_CUSTOMER_CONFIRMATION | CONFIRMED | Customer accepts (phone/email confirmation) |
| AWAITING_CUSTOMER_CONFIRMATION | CANCELLED | Customer declines or staff cancels |
| CONFIRMED | SCHEDULED | Staff assigns specific date/time |
| CONFIRMED | CANCELLED | Customer cancels before scheduling |
| SCHEDULED | IN_PROGRESS | Service execution begins |
| SCHEDULED | CANCELLED | Customer cancels before service |
| IN_PROGRESS | COMPLETED | Service successfully finished |
| IN_PROGRESS | CANCELLED | Service interrupted/cancelled mid-execution |
| COMPLETED | (terminal) | No further transitions |
| CANCELLED | (terminal) | No further transitions |

**Notes:**
- Fumigation skips AWAITING_CUSTOMER_CONFIRMATION: PENDING_REVIEW → QUOTE_SENT → QUOTE_ACCEPTED → CONFIRMED (if business needs explicit quote states)
- For first release, fumigation uses standard states with quoteStatus embedded in details (docs/04)

### 2.2 Payment Attempt Status State Machine

| Current Status | Allowed Next Status | Trigger |
|----------------|---------------------|---------|
| PENDING | PAID | Paystack verification confirms success |
| PENDING | FAILED | Paystack verification confirms failure |
| PENDING | ABANDONED | Customer leaves checkout (no callback after 30 min) |
| PENDING | EXPIRED | Paystack transaction expires (if applicable) |
| PAID | REVERSED | Paystack webhook indicates reversal |
| PAID | REFUNDED | [OPEN] Business-initiated refund via admin |
| FAILED | PENDING | Customer retries payment (new reference) |
| ABANDONED | PENDING | Customer retries payment (new reference) |
| FAILED | (terminal) | Customer does not retry |
| ABANDONED | (terminal) | Customer does not retry |
| REVERSED | (terminal) | Transaction reversed by Paystack |
| REFUNDED | (terminal) | Refund completed |

**Notes:**
- Only one PENDING payment per order at a time
- FAILED/ABANDONED must be resolved before new PENDING

### 2.3 Order PaymentStatus State Machine

| Current Status | Allowed Next Status | Trigger |
|----------------|---------------------|---------|
| NOT_REQUIRED | (terminal) | Service type doesn't require payment (e.g., free fumigation quote) |
| UNPAID | PENDING | Payment initialization started |
| UNPAID | (terminal) | Order cancelled before payment |
| PENDING | PAID | Payment attempt succeeds |
| PENDING | UNPAID | Payment attempt fails/abandoned, customer may retry |
| PAID | (terminal) | Payment completed successfully |
| FAILED | UNPAID | Payment failed, customer may retry |
| FAILED | (terminal) | Customer does not retry |

**Notes:**
- Order paymentStatus is separate from payment attempt status
- Order is PAID only when at least one payment attempt is PAID
- FAILED on order means "all payment attempts failed, customer may retry"

## 3. Role/Permission Matrix

| Operation | ADMIN | STAFF | Public |
|-----------|-------|-------|--------|
| View bookings/orders | ✅ | ✅ | ❌ |
| Update booking/order status | ✅ | ✅ | ❌ |
| Add internal notes | ✅ | ✅ | ❌ |
| Quote extra charges/materials | ✅ | ✅ | ❌ |
| Create/edit service prices | ✅ | ❌ | ❌ |
| Create/edit staff accounts | ✅ | ❌ | ❌ |
| Delete staff accounts | ✅ | ❌ | ❌ |
| View all payments | ✅ | ✅ | ❌ |
| Manually mark order as PAID (offline) | ✅ | ❌ | ❌ |
| Process refunds | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |
| Submit new booking/order | ❌ | ❌ | ✅ |
| View own booking status (with OTP) | ❌ | ❌ | ✅ |
| Initialize payment | ❌ | ❌ | ✅ |

**Notes:**
- All ADMIN operations require ADMIN role check on server
- STAFF cannot modify prices or staff accounts
- Public access strictly limited to submission and status lookup (with OTP)

## 4. Seed Catalogue (from docs/02 only)

All amounts in kobo (₦1 = 100 kobo).

### Services

| code | name | pricingMode | isActive |
|------|------|-------------|----------|
| HOME_CLEANING | Home Cleaning | FIXED | true |
| LAUNDRY | Laundry Services | FIXED | true |
| FUMIGATION | Fumigation | QUOTE | true |

### Service Prices - Home Cleaning

| serviceId (code) | itemCode | label | unit | amountKobo | isFromPrice | isActive |
|------------------|----------|-------|------|------------|-------------|----------|
| HOME_CLEANING | HC_1BD_MONTHLY | 1 Bedroom (Monthly Package) | MONTH | 2500000 | false | true |
| HOME_CLEANING | HC_1BD_SINGLE | 1 Bedroom (Single Visit) | VISIT | 700000 | false | true |
| HOME_CLEANING | HC_2BD_MONTHLY | 2 Bedrooms (Monthly Package) | MONTH | 3000000 | false | true |
| HOME_CLEANING | HC_2BD_SINGLE | 2 Bedrooms (Single Visit) | VISIT | 800000 | false | true |
| HOME_CLEANING | HC_3BD_MONTHLY | 3 Bedrooms (Monthly Package) | MONTH | 3500000 | false | true |
| HOME_CLEANING | HC_3BD_SINGLE | 3 Bedrooms (Single Visit) | VISIT | 1000000 | false | true |
| HOME_CLEANING | HC_4BD_MONTHLY | 4 Bedrooms (Monthly Package) | MONTH | 4500000 | false | true |
| HOME_CLEANING | HC_4BD_SINGLE | 4 Bedrooms (Single Visit) | VISIT | 1500000 | false | true |

### Service Prices - Laundry

| serviceId (code) | itemCode | label | unit | amountKobo | isFromPrice | isActive |
|------------------|----------|-------|------|------------|-------------|----------|
| LAUNDRY | LA_TROUSERS_SHIRT | Trousers and Shirt | ITEM | 100000 | false | true |
| LAUNDRY | LA_NATIVE_WEAR | Native Wear | SET | 150000 | false | true |
| LAUNDRY | LA_AGBADA | Agbada (Complete Set) | SET | 300000 | false | true |
| LAUNDRY | LA_BEDSPREAD | Bedspread | ITEM | 150000 | false | true |
| LAUNDRY | LA_DUVET | Duvets | ITEM | 350000 | true | true |

### Service Prices - Fumigation

| serviceId (code) | itemCode | label | unit | amountKobo | isFromPrice | isActive |
|------------------|----------|-------|------|------------|-------------|----------|
| FUMIGATION | FU_QUOTE | Fumigation Quotation | QUOTE | 0 | false | true |

**Notes:**
- Monthly packages include 4 visits (enforced in business logic, not in price table)
- Duvets have isFromPrice=true to display "From ₦3,500"
- Fumigation has zero-amount placeholder; actual price set by staff in booking.details.quotedAmountKobo

## 5. Email Authentication Design

### 5.1 Staff Authentication

**Account Creation:**
- Provisioned by ADMIN only (no public registration)
- Invite-by-email flow: ADMIN enters email → system generates single-use invite token (hashed, 24-hour expiry) → email sent with signup link → staff sets password
- Alternative: ADMIN can create account with temporary password (force password change on first login)

**Login:**
- Endpoint: POST /api/admin/login
- Input: email, password
- Validation: Argon2id hash comparison
- Rate limiting: 10 attempts per 15 minutes per IP/email
- Session creation: Generate random session token (32 bytes), hash with Argon2id, store in sessions collection with TTL (8 hours)
- Response: Set httpOnly cookie with session token

**Session Storage (sessions collection):**
```typescript
{
  _id: ObjectId,
  tokenHash: string,      // Argon2id hash of session token
  staffId: ObjectId,       // Reference to staff._id
  role: 'ADMIN' | 'STAFF',
  createdAt: ISODate,
  expiresAt: ISODate      // TTL index auto-expires
}
```

**Password Reset:**
- Endpoint: POST /api/admin/password-reset/request
- Input: email
- Validation: Check if email exists in staff collection (don't reveal if not found to prevent enumeration)
- Token generation: Single-use reset token (hashed, 1-hour expiry)
- Email sent with reset link
- Endpoint: POST /api/admin/password-reset/confirm
- Input: token, newPassword
- Validation: Token hash, expiry, one-time use
- Update: New password hashed with Argon2id

**Rate Limiting (MongoDB TTL-based):**
```typescript
// rate_limits collection
{
  _id: ObjectId,
  identifier: string,     // IP address or email
  endpoint: string,        // e.g., 'admin/login'
  count: number,
  windowStart: ISODate,   // TTL index auto-expires after window
  expiresAt: ISODate
}
```

### 5.2 Customer Authentication (No Accounts)

**Booking Status Lookup:**
- Endpoint: GET /api/booking-status/[reference]
- Customer must first request OTP: POST /api/booking-status/otp-request
  - Input: reference, email
  - Validation: Check if email matches booking/laundry_order email
  - Generate 6-digit OTP, hash with Argon2id, store in otp_codes collection (10-minute expiry)
  - Send email with OTP
- OTP verification: POST /api/booking-status/verify
  - Input: reference, otp
  - Validation: OTP hash, expiry, attempt count (max 5)
  - On success: Return booking/order status
- Rate limiting: 5 OTP requests per minute per IP/email

**OTP Storage (otp_codes collection):**
```typescript
{
  _id: ObjectId,
  reference: string,       // Booking or laundry order reference
  otpHash: string,         // Argon2id hash of 6-digit OTP
  email: string,
  attempts: number,        // Increment on each failed attempt
  createdAt: ISODate,
  expiresAt: ISODate       // TTL index auto-expires after 10 minutes
}
```

**Pre-Payment Verification:**
- Before payment initialization, if customer email not verified for this order:
  - Require OTP verification (same flow as status lookup)
  - Only allow payment after successful OTP verification
- Rationale: Ensures person initiating payment has access to the email associated with the order

### 5.3 Email Provider Interface

**Adapter Pattern:**
```typescript
// src/lib/email/types.ts
interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
```

**Default Adapter (Resend):**
```typescript
// src/lib/email/resend-adapter.ts
import { Resend } from 'resend';

class ResendAdapter implements EmailProvider {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(options: EmailOptions): Promise<void> {
    await this.client.emails.send({
      from: 'SkyTouchClean <noreply@skytouchclean.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
```

**Environment Variables:**
```bash
# Email provider (default: resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Fallback to SendGrid if business prefers
# EMAIL_PROVIDER=sendgrid
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# SENDGRID_FROM_EMAIL=noreply@skytouchclean.com
```

**New Collections:**
- `sessions` (staff authentication)
- `auth_tokens` (invite tokens, password reset tokens)
- `otp_codes` (customer OTP codes)
- `rate_limits` (MongoDB-based rate limiting)

**Indexes:**
- `sessions.tokenHash`: unique
- `sessions.expiresAt`: TTL index (8 hours)
- `auth_tokens.tokenHash`: unique
- `auth_tokens.expiresAt`: TTL index (24 hours for invites, 1 hour for resets)
- `otp_codes.reference`: compound index with email
- `otp_codes.expiresAt`: TTL index (10 minutes)
- `rate_limits.identifier`: compound index with endpoint
- `rate_limits.expiresAt`: TTL index (varies by endpoint)

## 6. OPEN Items Requiring Business Input

| # | Item | Why OPEN |
|---|------|----------|
| 1 | Refund process and permissions | Who can initiate refunds? What approval? Integrate with Paystack refund API? Business policy needed. |
| 2 | Brand color exact hex values | docs/reference/flyer.jpg not found in extracted docs. Using interim colors (#4a148c deep purple, #009688 teal). Need to sample exact values from actual flyer. |
| 3 | Materials quote in-app acceptance | First release uses phone/email communication. Future: Should in-app acceptance be added? |
| 4 | Extra charges in-app approval | First release uses phone/email communication. Future: Should in-app approval be added? |
| 5 | Email provider preference | Default is Resend, but business may prefer SendGrid or another provider. |
| 6 | Office cleaning and move-in/out cleaning pricing | Docs/02 mentions these as "quote-only" but no pricing supplied. Business to provide rates if needed. |
| 7 | Bedsheets and curtains pricing | Docs/02 says "price on request". Business to provide rates if needed. |
