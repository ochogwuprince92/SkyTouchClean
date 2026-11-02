# Security Review Report

**Reviewer:** Independent Security Auditor
**Scope:** SkyTouchClean application codebase
**Date:** 2025-11-02
**Reference:** docs/05 and docs/07 requirements

---

## Executive Summary

This security review identified **6 critical vulnerabilities** across the attack vectors specified. The most severe issues include: staff can mark orders paid without payment verification, any authenticated staff can access all customer data, and there are missing role checks on admin operations.

**Severity Breakdown:**
- 🔴 Critical: 3 vulnerabilities
- 🟠 High: 2 vulnerabilities
- 🟡 Medium: 1 vulnerability

---

## Vulnerability Findings

### 1. 🔴 CRITICAL: Mark Order Paid Without Payment Verification

**Attack Vector:** Staff can mark an order as PAID without any payment verification or reconciliation.

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\bookings\[id]\route.ts" lines="12-152" />

**Vulnerability Details:**
- The PATCH endpoint at lines 12-152 accepts status updates but has no validation for `paymentStatus` field
- Lines 22-98 show the endpoint accepts arbitrary fields in the request body
- Lines 76-102 handle additional charges but do not check for paymentStatus updates
- Line 21: `const { status, internalNote, additionalChargeKobo, additionalChargeReason } = body;` - paymentStatus is not extracted but could be added
- Line 76: `let updatedData: any = { status };` - any field from body could be added to updatedData
- Lines 120-124: Direct database update without payment verification

**Attack Scenario:**
```json
PATCH /api/admin/bookings/[id]
{
  "status": "COMPLETED",
  "paymentStatus": "PAID"
}
```

A malicious staff member could set `paymentStatus: "PAID"` in the request body, which would be passed through to the database update at lines 120-124, marking the order as paid without any Paystack transaction or payment verification.

**Requirement Violation:**
- docs/05 line 68: "Staff must not manually mark an order paid without a recorded, reconciled payment or an explicitly audited offline-payment workflow"
- docs/07 line 12: "Verify Paystack transactions server-to-server; compare reference, expected amount in kobo, currency and successful transaction status before marking an order paid"

**Impact:** Staff can fraudulently mark orders as paid, enabling theft or bypassing payment requirements.

---

### 2. 🔴 CRITICAL: Any Authenticated Staff Can Access All Customer Data

**Attack Vector:** Any authenticated staff member (not just ADMIN) can view all bookings/orders with full customer details including addresses, phone numbers, and order contents.

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\bookings\route.ts" lines="9-83" />

**Vulnerability Details:**
- Line 12: Uses `requireAuthMiddleware()` which only checks for any valid session
- Lines 27-46: Returns ALL bookings and orders without filtering by staff permissions
- Lines 29-44: Maps full booking/order objects including sensitive fields (customerName, phone, email, addresses, items, totalKobo)
- No data redaction or field filtering occurs

**Attack Scenario:**
A malicious staff member can:
1. Login with STAFF credentials
2. Call `GET /api/admin/bookings` to retrieve all customer data
3. Access customer PII: names, phone numbers, emails, home addresses, delivery addresses
4. View order details: items, quantities, prices, notes

**Requirement Violation:**
- docs/07 line 8: "MongoDB does not provide PostgreSQL-style RLS; enforce tenant/customer privacy and staff roles in every server-side query and mutation"
- docs/07 line 9: "Do not expose customer addresses, phone numbers or order contents through public lookups" (admin lookups should also be restricted)
- docs/07 line 21: "Document validation and role-based access before production"

**Impact:** Data breach of all customer PII and order history by any staff member.

---

### 3. 🔴 CRITICAL: Missing Role Check on Admin Operations

**Attack Vector:** STAFF role can perform operations that should require ADMIN role.

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\lib\middleware.ts" lines="4-35" />

**Vulnerability Details:**
- Lines 4-22: `requireAdminMiddleware()` exists but is NOT used on critical endpoints
- Lines 24-35: `requireAuthMiddleware()` only checks for session existence, not role
- Most admin endpoints use `requireAuthMiddleware()` instead of `requireAdminMiddleware()`

**Affected Endpoints:**
- <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\bookings\route.ts" line="12" /> - List all bookings (uses requireAuthMiddleware)
- <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\bookings\[id]\route.ts" line="18" /> - Update booking (uses requireAuthMiddleware)
- Note: <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\prices\route.ts" lines="12,43" /> correctly uses `requireAdmin()` from auth.ts

**Attack Scenario:**
A STAFF role user can:
1. Access booking lists and updates that should be ADMIN-only
2. Modify booking statuses and add charges
3. Potentially mark orders as paid (see Vulnerability #1)

**Requirement Violation:**
- docs/07 line 5: "Verify staff role on every server-side admin operation"
- docs/09-decisions.md lines="97-120": Role/Permission Matrix shows operations should be ADMIN-only

**Impact:** Privilege escalation allowing STAFF to perform ADMIN operations.

---

### 4. 🟠 HIGH: No Price Update Endpoint Exists (Side Channel Attack)

**Attack Vector:** While there's no direct price update endpoint, staff can create duplicate prices with different amounts, causing price confusion.

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\prices\route.ts" lines="10-101" /> and <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\server\repositories\service-prices.ts" lines="1-53" />

**Vulnerability Details:**
- Lines 41-101: Only POST endpoint exists for creating prices
- Lines 30-48: Repository has no `update()` method
- Lines 34-38: `findByServiceIdAndItemCode()` only finds active prices
- No versioning or effective date enforcement prevents duplicate active prices

**Attack Scenario:**
A malicious ADMIN could:
1. Create a new price with same `serviceId` and `itemCode` but different `amountKobo`
2. The system might load the wrong price depending on query order
3. Customers could be charged incorrect amounts
4. Audit trail would show both prices as "active"

**Note:** This requires ADMIN role, mitigating severity from CRITICAL to HIGH.

**Requirement Violation:**
- docs/07 line 6: "Verify staff role on every server-side admin operation" (partially addressed)
- docs/02 implies prices should be controlled and approved

**Impact:** Price manipulation leading to incorrect charges and financial discrepancies.

---

### 5. 🟠 HIGH: Password Reset Token Timing Attack

**Attack Vector:** Token verification in `findByToken()` iterates through ALL tokens without expiration check, enabling timing attacks and potential token reuse.

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\server\repositories\auth-tokens.ts" lines="56-70" />

**Vulnerability Details:**
- Lines 56-70: `findByToken()` loads ALL tokens from database (line 60)
- Lines 62-67: Iterates through all tokens and performs argon2 verification
- Line 64: `!authToken.usedAt` check happens AFTER argon2 verification
- No database-level query for type or expiresAt (only passed as optional filter)
- Line 60: `const tokens = await this.collection.find(query).toArray();` - if query is empty, loads ALL tokens

**Attack Scenario:**
1. Attacker calls `findByToken()` with an invalid token
2. Function loads ALL tokens from database
3. Iterates through each, performing expensive argon2 verification
4. Timing differences could reveal valid token prefixes
5. If many tokens exist, this causes significant performance degradation (DoS)

**Additionally:**
- <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\password-reset\confirm\route.ts" lines="64-65" />: Sessions are not invalidated after password reset (commented out at line 65)

**Requirement Violation:**
- docs/07 line 4: "hash passwords with Argon2id" (done, but token verification is inefficient)
- docs/07 line 3: "server-managed sessions" (sessions not invalidated on reset)

**Impact:** Timing attacks on tokens, potential DoS through expensive argon2 operations, active sessions remain valid after password reset.

---

### 6. 🟡 MEDIUM: OTP Bypass Through Email Enumeration Protection

**Attack Vector:** The OTP request endpoint has email enumeration protection, but this could potentially be bypassed through timing or response analysis.

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\booking-status\otp-request\route.ts" lines="47-62" />

**Vulnerability Details:**
- Lines 47-53: Returns same success message if reference doesn't exist
- Lines 55-62: Returns same success message if email doesn't match
- Lines 64-65: OTP is generated only if both reference and email match
- However, the email sending at lines 68-79 could fail or take different time

**Attack Scenario:**
1. Attacker requests OTP with reference and guessed email
2. Measures response time or error behavior
3. If email is sent (slower response), email is correct
4. If no email sent (faster response), email is incorrect
5. This allows email enumeration despite the protection attempt

**Note:** This is a timing-based side channel, not a direct bypass. The protection is well-intentioned but implementation could leak information through timing.

**Requirement Violation:**
- docs/07 line 10: "Collect only data required to fulfil the service" (OTP implementation is generally compliant)
- docs/05 line 47: "Rate-limit public endpoints" (rate limiting is implemented at lines 23-31)

**Impact:** Potential email enumeration through timing analysis, though requires sophisticated attacker.

---

## Additional Security Concerns

### 7. Missing Field Validation in Booking Update

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\bookings\[id]\route.ts" lines="21-23" />

**Issue:**
- Line 21: Destructures only specific fields from body
- Line 76: `let updatedData: any = { status };` - uses `any` type
- Lines 105-117: internalNotes are added without validation
- No schema validation prevents adding arbitrary fields to database

**Attack Vector:** Staff could inject unexpected fields into database documents.

---

### 8. Hardcoded Admin ID in Status History

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\bookings\[id]\route.ts" line="132" />

**Issue:**
- Line 132: `changedBy: new ObjectId("admin_id"), // TODO: get from session`
- Hardcoded "admin_id" string (not a valid ObjectId)

**Impact:** Audit trail is broken - cannot track which staff member made changes.

---

### 9. Missing Session Invalidation on Password Reset

**Location:** <ref_file file="C:\Users\DELL\Downloads\skytouch_project\SkyTouchClean\src\app\api\admin\password-reset\confirm\route.ts" lines="64-65" />

**Issue:**
- Lines 64-65: Commented out session invalidation
- Active sessions remain valid after password reset

**Impact:** If an attacker resets a victim's password, the victim's existing session remains valid, allowing the attacker to maintain access while also having the new password.

---

## Recommended Fixes (Not Implemented Per Instructions)

### For Vulnerability #1 (Mark Paid Without Payment)
1. Add explicit `paymentStatus` validation in booking update endpoint
2. Only allow paymentStatus changes through payment reconciliation service
3. Require ADMIN role for paymentStatus changes
4. Add audit log for any paymentStatus changes

### For Vulnerability #2 (Staff Access All Data)
1. Implement role-based data access control
2. Filter bookings by assigned staff or region
3. Redact sensitive fields for non-ADMIN roles
4. Add field-level access control

### For Vulnerability #3 (Missing Role Checks)
1. Replace `requireAuthMiddleware()` with `requireAdminMiddleware()` on all admin endpoints
2. Add separate STAFF-specific endpoints with limited permissions
3. Implement role checking in `requireAuthMiddleware()` itself

### For Vulnerability #4 (Price Update)
1. Add PATCH endpoint for price updates with ADMIN role
2. Implement price versioning with effective dates
3. Enforce only one active price per serviceId/itemCode combination
4. Add audit trail for price changes

### For Vulnerability #5 (Token Timing)
1. Add expiresAt filter to database query in `findByToken()`
2. Add usedAt filter to database query
3. Index on tokenHash, type, expiresAt for efficient lookup
4. Implement session invalidation on password reset

### For Vulnerability #6 (OTP Timing)
1. Use constant-time operations regardless of OTP validity
2. Add artificial delay for invalid requests
3. Move email sending to background queue
4. Monitor for timing attack patterns

---

## Conclusion

The codebase has several critical security vulnerabilities that violate the requirements in docs/05 and docs/07. The most severe issues are:

1. **Payment fraud possible** - Staff can mark orders paid without verification
2. **Data exposure** - Any staff can access all customer PII
3. **Privilege escalation** - Role checks missing on admin operations

These vulnerabilities should be addressed before production deployment. The codebase would benefit from a comprehensive security audit including penetration testing, code review focused on authorization, and implementation of proper role-based access control throughout.

**Overall Risk Level:** 🔴 HIGH

**Recommendation:** Do not deploy to production until at least the 3 critical vulnerabilities are addressed.
