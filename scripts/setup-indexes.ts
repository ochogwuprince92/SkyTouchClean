import "dotenv/config";
import { getDb } from "../src/lib/mongodb/client";

export const runtime = "nodejs";

async function setupIndexes() {
  console.log("Setting up MongoDB indexes...");

  const db = await getDb();

  // staff.email: unique
  await db.collection("staff").createIndex({ email: 1 }, { unique: true });
  console.log("✓ staff.email unique index");

  // services.code: unique
  await db.collection("services").createIndex({ code: 1 }, { unique: true });
  console.log("✓ services.code unique index");

  // service_prices: compound index on serviceId, itemCode, isActive, effectiveFrom
  await db.collection("service_prices").createIndex({
    serviceId: 1,
    itemCode: 1,
    isActive: 1,
    effectiveFrom: -1,
  });
  console.log("✓ service_prices compound index");

  // bookings.reference: unique
  await db.collection("bookings").createIndex({ reference: 1 }, { unique: true });
  console.log("✓ bookings.reference unique index");

  // bookings: additional indexes
  await db.collection("bookings").createIndex({ status: 1 });
  await db.collection("bookings").createIndex({ serviceType: 1 });
  await db.collection("bookings").createIndex({ createdAt: -1 });
  await db.collection("bookings").createIndex({ phone: 1 });
  console.log("✓ bookings additional indexes");

  // laundry_orders.reference: unique
  await db.collection("laundry_orders").createIndex({ reference: 1 }, { unique: true });
  console.log("✓ laundry_orders.reference unique index");

  // laundry_orders: additional indexes
  await db.collection("laundry_orders").createIndex({ status: 1 });
  await db.collection("laundry_orders").createIndex({ createdAt: -1 });
  await db.collection("laundry_orders").createIndex({ phone: 1 });
  console.log("✓ laundry_orders additional indexes");

  // payments.reference: unique
  await db.collection("payments").createIndex({ reference: 1 }, { unique: true });
  console.log("✓ payments.reference unique index");

  // payments: additional indexes
  await db.collection("payments").createIndex({ bookingId: 1 });
  await db.collection("payments").createIndex({ laundryOrderId: 1 });
  await db.collection("payments").createIndex({ status: 1 });
  console.log("✓ payments additional indexes");

  // status_history: indexes on bookingId/laundryOrderId with createdAt
  await db.collection("status_history").createIndex({ bookingId: 1, createdAt: -1 });
  await db.collection("status_history").createIndex({ laundryOrderId: 1, createdAt: -1 });
  console.log("✓ status_history indexes");

  // sessions.tokenHash: unique
  await db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true });
  console.log("✓ sessions.tokenHash unique index");

  // sessions.expiresAt: TTL index (8 hours)
  await db.collection("sessions").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  console.log("✓ sessions.expiresAt TTL index (8 hours)");

  // auth_tokens.tokenHash: unique
  await db.collection("auth_tokens").createIndex({ tokenHash: 1 }, { unique: true });
  console.log("✓ auth_tokens.tokenHash unique index");

  // auth_tokens.expiresAt: TTL index (24 hours for invites, 1 hour for resets)
  await db.collection("auth_tokens").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  console.log("✓ auth_tokens.expiresAt TTL index");

  // otp_codes: compound index on reference with email
  await db.collection("otp_codes").createIndex({ reference: 1, email: 1 });
  console.log("✓ otp_codes compound index");

  // otp_codes.expiresAt: TTL index (10 minutes)
  await db.collection("otp_codes").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  console.log("✓ otp_codes.expiresAt TTL index (10 minutes)");

  // rate_limits: compound index on identifier with endpoint
  await db.collection("rate_limits").createIndex({ identifier: 1, endpoint: 1 });
  console.log("✓ rate_limits compound index");

  // rate_limits.expiresAt: TTL index
  await db.collection("rate_limits").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
  console.log("✓ rate_limits.expiresAt TTL index");

  console.log("\n✅ All indexes created successfully");
}

// Run if executed directly
if (require.main === module) {
  setupIndexes()
    .then(() => {
      console.log("\nDone");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error setting up indexes:", error);
      process.exit(1);
    });
}
