import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { ServiceRepository } from "@/server/repositories/services";
import { ServicePriceRepository } from "@/server/repositories/service-prices";
import { PricingService } from "@/server/services/pricing";
import { fumigationBookingSchema } from "@/lib/validation";
import { generateReference } from "@/lib/reference";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { getEmailProvider } from "@/lib/email";

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

    // Send confirmation email
    try {
      const emailProvider = getEmailProvider();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      
      await emailProvider.send({
        to: validatedData.email,
        subject: "SkyTouchClean - Fumigation Booking Received",
        html: `
          <h2>Booking Received!</h2>
          <p>Dear ${validatedData.customerName},</p>
          <p>Your fumigation booking request has been successfully submitted.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Service:</strong> Fumigation</p>
            <p><strong>Property Type:</strong> ${validatedData.propertyType}</p>
            <p><strong>Property Size:</strong> ${validatedData.propertySize}</p>
            <p><strong>Pest Problem:</strong> ${validatedData.pestProblem}</p>
            <p><strong>Preferred Date:</strong> ${validatedData.preferredDate}</p>
            <p><strong>Address:</strong> ${validatedData.address}</p>
          </div>
          
          <p><strong>Important:</strong> Fumigation services require an on-site assessment to provide an accurate quote. Our team will contact you to schedule the assessment and provide a detailed quote.</p>
          <p>You can check your booking status anytime using your reference number.</p>
          
          <p>
            <a href="${siteUrl}/status" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Check Booking Status</a>
          </p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you did not make this booking, please ignore this email.
          </p>
        `,
        text: `Booking Received!\n\nDear ${validatedData.customerName},\n\nYour fumigation booking request has been successfully submitted.\n\nReference: ${reference}\nService: Fumigation\nProperty Type: ${validatedData.propertyType}\nProperty Size: ${validatedData.propertySize}\nPest Problem: ${validatedData.pestProblem}\nPreferred Date: ${validatedData.preferredDate}\nAddress: ${validatedData.address}\n\nImportant: Fumigation services require an on-site assessment to provide an accurate quote. Our team will contact you to schedule the assessment and provide a detailed quote.\n\nCheck your booking status at: ${siteUrl}/status`,
      });
    } catch (emailError) {
      // Log email error but don't fail the booking
      console.error("Failed to send confirmation email:", emailError);
    }

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
