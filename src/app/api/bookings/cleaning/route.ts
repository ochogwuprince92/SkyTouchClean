import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { ServiceRepository } from "@/server/repositories/services";
import { ServicePriceRepository } from "@/server/repositories/service-prices";
import { PricingService } from "@/server/services/pricing";
import { cleaningBookingSchema } from "@/lib/validation";
import { generateReference } from "@/lib/reference";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { getEmailProvider } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Convert bedroomCount to number if it's a string
    if (typeof body.bedroomCount === 'string') {
      body.bedroomCount = parseInt(body.bedroomCount, 10);
    }

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
    const serviceRepo = new ServiceRepository(db);
    const priceRepo = new ServicePriceRepository(db);
    const pricingService = new PricingService(serviceRepo, priceRepo);

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

    // Send confirmation email
    try {
      const emailProvider = getEmailProvider();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const priceNaira = priceKobo / 100;
      
      await emailProvider.send({
        to: validatedData.email,
        subject: "SkyTouchClean - Booking Confirmation",
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Dear ${validatedData.customerName},</p>
          <p>Your home cleaning booking has been successfully submitted.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Service:</strong> Home Cleaning</p>
            <p><strong>Bedrooms:</strong> ${validatedData.bedroomCount}</p>
            <p><strong>Plan:</strong> ${validatedData.bookingPlan === "MONTHLY" ? "Monthly Package" : "Single Visit"}</p>
            <p><strong>Date:</strong> ${validatedData.preferredDate}</p>
            <p><strong>Time:</strong> ${validatedData.preferredTime}</p>
            <p><strong>Address:</strong> ${validatedData.address}</p>
            <p><strong>Estimated Price:</strong> ₦${priceNaira.toLocaleString()}</p>
          </div>
          
          <p>Our team will review your booking and contact you to confirm the details.</p>
          <p>You can check your booking status anytime using your reference number.</p>
          
          <p>
            <a href="${siteUrl}/status" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Check Booking Status</a>
          </p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you did not make this booking, please ignore this email.
          </p>
        `,
        text: `Booking Confirmed!\n\nDear ${validatedData.customerName},\n\nYour home cleaning booking has been successfully submitted.\n\nReference: ${reference}\nService: Home Cleaning\nBedrooms: ${validatedData.bedroomCount}\nPlan: ${validatedData.bookingPlan === "MONTHLY" ? "Monthly Package" : "Single Visit"}\nDate: ${validatedData.preferredDate}\nTime: ${validatedData.preferredTime}\nAddress: ${validatedData.address}\nEstimated Price: ₦${priceNaira.toLocaleString()}\n\nOur team will review your booking and contact you to confirm the details.\n\nCheck your booking status at: ${siteUrl}/status`,
      });
    } catch (emailError) {
      // Log email error but don't fail the booking
      console.error("Failed to send confirmation email:", emailError);
    }

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
