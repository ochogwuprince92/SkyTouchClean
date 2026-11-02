# 1. Product Requirements

## Product goal
A simple, mobile-first website and booking application where customers can learn about SkyTouchClean, view approved prices, request laundry or cleaning services, and contact the business. Staff manage requests from a protected admin dashboard.

## Roles
**Public customer:** browse services/prices, submit requests without an account, provide contact/address/schedule details, receive a unique reference.

**Admin/staff:** sign in, view and manage requests, confirm schedules and scope, quote extra charges, update statuses, manage catalogue prices and record payment status. No public admin sign-up.

## Public pages
- Home
- Services
- Home Cleaning and Pricing
- Laundry and Pricing
- Fumigation Enquiry
- Book a Service
- About/Contact
- Booking Confirmation
- Privacy Policy and Terms

## Features
### Home
Show laundry, home/office cleaning and fumigation; display brand details, contact information, address, free laundry pickup/delivery and clear booking actions.

### Laundry booking
Customer provides name, phone, pickup/delivery address, preferred pickup date/time, notes, and one or more garment/item types with quantities. Show item prices and totals. Duvets display “From ₦3,500” and require staff confirmation. Special stain treatment/delicate items may attract extra charges after customer approval. Request starts as Pending Review.

### Home cleaning
Customer selects 1–4 bedrooms and either monthly package or individual visit. Monthly includes four visits. Capture address, schedule, notes and whether the customer supplies materials or wants SkyTouchClean to provide them. Deep cleaning, heavy soiling and out-of-scope work require assessment and a separate quote.

### Fumigation
Capture property type, address, pest issue, property size and preferred date. No fixed price or checkout until rates are approved. Staff quotes after assessment.

### Admin
Dashboard counts for new, pending, confirmed, in-progress, completed and cancelled requests. Separate laundry, cleaning and fumigation views. Search by reference/name/phone. Update status, add internal notes, quote additional work and manage active prices.

## Statuses
Booking/order: PENDING_REVIEW, AWAITING_CUSTOMER_CONFIRMATION, CONFIRMED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED.
Payment: NOT_REQUIRED, UNPAID, PENDING, PAID, FAILED, REFUNDED.

## Not in first release
Customer accounts, loyalty points, driver tracking, route optimisation, payroll/accounting, native mobile apps, automated WhatsApp API, multi-branch inventory, complex subscriptions, fixed fumigation checkout.

## Acceptance criteria
- Laundry order supports multiple item types and quantities.
- Backend calculates prices from database catalogue, never browser-submitted prices.
- Cleaning supports single visit and monthly four-visit package.
- Fumigation can be requested without an invented price.
- Cleaning-materials preference is recorded.
- Unique references are generated.
- Admin access is role-protected.
- Mobile, tablet and desktop layouts work.
