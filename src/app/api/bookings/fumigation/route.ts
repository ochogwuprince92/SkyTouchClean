import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { ServiceRepository } from "@/server/repositories/services";
import { ServicePriceRepository } from "@/server/repositories/service-prices";
import { PricingService } from "@/server/services/pricing";
import { fumigationBookingSchema } from "@/lib/validation";
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
    const rateLimit = await checkRateLimit("api/bookings/fumigation", identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validation
    const validatedData = fumigationBookingSchema.parse(body);

    const db = await getDb();
    const bookingRepo = new BookingRepository(db);
    const serviceRepo = new ServiceRepository(db);
    const priceRepo = new ServicePriceRepository(db);
    const pricingService = new PricingService(serviceRepo, priceRepo);

    // Verify fumigation is quote-only
    await pricingService.getFumigationPrice();

    // Generate unique reference
    const reference = generateReference("fumigation");

    // Create booking (no price - quote only)
    const bookingId = await bookingRepo.create({
      reference,
      serviceType: "FUMIGATION",
      customerName: validatedData.customerName,
      phone: validatedData.phone,
      email: validatedData.email,
      address: validatedData.address,
      preferredDate: validatedData.preferredDate,
      preferredTime: "",
      status: "PENDING_REVIEW",
      paymentStatus: "NOT_REQUIRED", // Quote-only initially
      materialsOption: "CUSTOMER_PROVIDES",
      details: {
        propertyType: validatedData.propertyType,
        pestProblem: validatedData.pestProblem,
        propertySize: validatedData.propertySize,
        assessmentNotes: "",
        quotedAmountKobo: 0,
        quoteStatus: "NOT_QUOTED",
      },
      customerNotes: validatedData.customerNotes,
    });

    return NextResponse.json({
      success: true,
      reference,
      bookingId: bookingId.toString(),
      quoteOnly: true,
    });
  } catch (error: any) {
    console.error("Fumigation booking error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create fumigation booking" },
      { status: 500 }
    );
  }
}
