# 4. Database Design — MongoDB

Use MongoDB collections with BSON `ObjectId` identifiers and ISODate timestamps. Store all money as integer kobo (₦1,000 = 100000 kobo). MongoDB has no SQL foreign keys or PostgreSQL-style Row Level Security, so enforce relationships, validation and access control in server-side application code.

## Collections

### `staff`
- `_id` (ObjectId), `fullName`, `phone`, `email` (unique), `passwordHash` (Argon2id), `role` (ADMIN/STAFF), `isActive`, `createdAt`, `updatedAt`.
- Staff accounts are provisioned privately by an administrator or seed script. Never expose public staff registration.

### `services`
- `_id`, `code` (HOME_CLEANING/LAUNDRY/FUMIGATION; unique), `name`, `description`, `pricingMode` (FIXED/FROM/QUOTE), `isActive`, `createdAt`, `updatedAt`.

### `service_prices`
- `_id`, `serviceId` (ObjectId reference to `services`), `itemCode`, `label`, `unit` (VISIT/MONTH/ITEM/SET), `amountKobo`, `isFromPrice`, `isActive`, `effectiveFrom`, `createdAt`.
- Index active prices by `serviceId`, `itemCode` and `isActive`.

### `bookings`
- `_id`, `reference` (unique), `serviceType`, `customerName`, `phone`, optional `email`, `address`, `preferredDate`, `preferredTime`, `status`, nullable `estimatedTotalKobo` and `finalTotalKobo`, `customerNotes`, `materialsOption` (CUSTOMER_PROVIDES/SKYTOUCH_PROVIDES`), `details` (embedded cleaning or fumigation detail document), `createdAt`, `updatedAt`.
- Cleaning `details`: `bedroomCount` (1–4), `bookingPlan` (MONTHLY/SINGLE_VISIT), `includedVisits` (4 for monthly; 1 for single), `requiresDeepCleaning`, `heavilySoiled`, optional `materialsQuoteKobo`.
- Fumigation `details`: `propertyType`, `pestProblem`, `propertySize`, `assessmentNotes`, `quotedAmountKobo`, `quoteStatus` (NOT_QUOTED/SENT/ACCEPTED/DECLINED).

### `laundry_orders`
- `_id`, `reference` (unique), `customerName`, `phone`, optional `email`, `pickupAddress`, `deliveryAddress`, `preferredPickupDate`, `preferredPickupTime`, `pickupDeliveryFeeKobo` (zero for advertised free service), `status`, `items` (array of item subdocuments), `subtotalKobo`, `additionalChargeKobo`, `totalKobo`, `customerNotes`, `createdAt`, `updatedAt`.
- Each item subdocument: `itemCode`, `itemNameSnapshot`, `quantity`, `unitPriceKobo`, `lineTotalKobo`, `itemNotes`.
- Embed items because they are created and managed as part of one laundry order. Keep the item-name and unit-price snapshots so catalogue changes do not alter historical orders.

### `payments`
- `_id`, `bookingId` (nullable ObjectId), `laundryOrderId` (nullable ObjectId), `provider`, `reference` (unique), `amountKobo`, `currency`, `status`, `paidAt`, sanitised `providerResponse`, `createdAt`.
- Exactly one of `bookingId` or `laundryOrderId` must be set.

### `status_history`
- `_id`, `bookingId` (nullable ObjectId), `laundryOrderId` (nullable ObjectId), `oldStatus`, `newStatus`, `changedBy` (staff ObjectId or system marker), `note`, `createdAt`.
- Index by the relevant booking/order ID and `createdAt`.

## Indexes
Create these indexes during deployment or through a repeatable database setup script:
- `staff.email`: unique.
- `services.code`: unique.
- `service_prices`: compound index on `serviceId`, `itemCode`, `isActive`, and `effectiveFrom`.
- `bookings.reference`: unique; additional indexes on `status`, `serviceType`, `createdAt`, and `phone`.
- `laundry_orders.reference`: unique; additional indexes on `status`, `createdAt`, and `phone`.
- `payments.reference`: unique; indexes on `bookingId` and `laundryOrderId`.
- `status_history`: indexes on `bookingId`/`laundryOrderId` with `createdAt`.

## Relationships and validation
- A service has many price documents, linked by `serviceId`.
- A booking embeds exactly one cleaning detail or fumigation detail document according to `serviceType`.
- A laundry order embeds one or more item subdocuments.
- A booking/order can have payment and status-history documents.
- Quantity > 0; money >= 0; bedroom count 1–4; monthly package has exactly four visits.
- Validate incoming data with Zod (or equivalent) and validate important document invariants in server-side services.
- Use MongoDB transactions for multi-document writes when running on a replica set. Make operations idempotent where retries are possible.

## Access and privacy
Public visitors can read active service catalogue/prices through restricted server endpoints and submit requests through server endpoints. They cannot list or read other customers' records. Staff access is checked on every server-side admin operation using a verified session and role. Never expose `MONGODB_URI`, password hashes or `SESSION_SECRET` to browser code. Do not rely on database network access rules alone as application authorisation.
