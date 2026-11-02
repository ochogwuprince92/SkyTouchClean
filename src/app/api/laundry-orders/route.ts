import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { LaundryOrderRepository } from "@/server/repositories/laundry-orders";
import { PricingService } from "@/server/services/pricing";
import { laundryOrderSchema } from "@/lib/validation";
import { generateReference } from "@/lib/reference";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json(
        { error: "Bot detected" },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier = getIdentifier(request);
    const rateLimit = await checkRateLimit("api/laundry-orders", identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validation
    const validatedData = laundryOrderSchema.parse(body);

    const db = await getDb();
    const laundryOrderRepo = new LaundryOrderRepository(db);
    const pricingService = new PricingService(
      db.collection("services"),
      db.collection("service_prices")
    );

    // Calculate pricing from server-side data
    const { items: processedItems, subtotalKobo, hasFromPrice } =
      await pricingService.calculateLaundryTotal(validatedData.items);

    // Generate unique reference
    const reference = generateReference("laundry");

    // Create order
    const orderId = await laundryOrderRepo.create({
      reference,
      customerName: validatedData.customerName,
      phone: validatedData.phone,
      email: validatedData.email,
      pickupAddress: validatedData.pickupAddress,
      deliveryAddress: validatedData.deliveryAddress,
      preferredPickupDate: validatedData.preferredPickupDate,
      preferredPickupTime: validatedData.preferredPickupTime,
      pickupDeliveryFeeKobo: 0, // Free pickup/delivery
      status: "PENDING_REVIEW",
      paymentStatus: "UNPAID",
      items: processedItems,
      subtotalKobo,
      additionalChargeKobo: 0,
      totalKobo: subtotalKobo,
      customerNotes: validatedData.customerNotes,
    });

    return NextResponse.json({
      success: true,
      reference,
      orderId: orderId.toString(),
      total: subtotalKobo,
      hasFromPrice,
    });
  } catch (error: any) {
    console.error("Laundry order error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create laundry order" },
      { status: 500 }
    );
  }
}
