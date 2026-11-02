import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { PricingService } from "@/server/services/pricing";
import { cleaningBookingSchema } from "@/lib/validation";
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
    const rateLimit = await checkRateLimit("api/bookings/cleaning", identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validation
    const validatedData = cleaningBookingSchema.parse(body);

    const db = await getDb();
    const bookingRepo = new BookingRepository(db);
    const pricingService = new PricingService(
      db.collection("services"),
      db.collection("service_prices")
    );

    // Calculate pricing from server-side data
    const { priceKobo, includedVisits } = await pricingService.calculateCleaningPrice(
      validatedData.bedroomCount,
      validatedData.bookingPlan
    );

    // Generate unique reference
    const reference = generateReference("cleaning");

    // Create booking
    const bookingId = await bookingRepo.create({
      reference,
      serviceType: "HOME_CLEANING",
      customerName: validatedData.customerName,
      phone: validatedData.phone,
      email: validatedData.email,
      address: validatedData.address,
      preferredDate: validatedData.preferredDate,
      preferredTime: validatedData.preferredTime,
      status: "PENDING_REVIEW",
      paymentStatus: "UNPAID",
      estimatedTotalKobo: priceKobo,
      materialsOption: validatedData.materialsOption,
      details: {
        bedroomCount: validatedData.bedroomCount,
        bookingPlan: validatedData.bookingPlan,
        includedVisits,
        requiresDeepCleaning: validatedData.requiresDeepCleaning || false,
        heavilySoiled: validatedData.heavilySoiled || false,
      },
      customerNotes: validatedData.customerNotes,
    });

    return NextResponse.json({
      success: true,
      reference,
      bookingId: bookingId.toString(),
      total: priceKobo,
    });
  } catch (error: any) {
    console.error("Cleaning booking error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create cleaning booking" },
      { status: 500 }
    );
  }
}
