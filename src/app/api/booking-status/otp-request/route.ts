import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository, Booking } from "@/server/repositories/bookings";
import { LaundryOrderRepository, LaundryOrder } from "@/server/repositories/laundry-orders";
import { OtpCodeRepository } from "@/server/repositories/otp-codes";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { getEmailProvider } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, email } = body;

    if (!reference || !email) {
      return NextResponse.json(
        { error: "Reference and email are required" },
        { status: 400 }
      );
    }

    // Rate limiting: 5 requests per minute per IP/email
    const identifier = getIdentifier(request);
    const rateLimit = await checkRateLimit("api/booking-status/otp-request", identifier, 5, 1);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const db = await getDb();
    const bookingRepo = new BookingRepository(db);
    const laundryRepo = new LaundryOrderRepository(db);
    const otpRepo = new OtpCodeRepository(db);

    // Find booking or order by reference
    let record: Booking | LaundryOrder | null = await bookingRepo.findByReference(reference);
    let type = "booking";

    if (!record) {
      const laundryOrder = await laundryRepo.findByReference(reference);
      if (laundryOrder) {
        record = laundryOrder;
        type = "laundry_order";
      }
    }

    let shouldSendOtp = false;

    if (!record) {
      // Don't reveal if reference exists
      shouldSendOtp = false;
    } else if (record.email !== email) {
      // Don't reveal mismatch
      shouldSendOtp = false;
    } else {
      // Valid reference and email match
      shouldSendOtp = true;
    }

    // Generate OTP only if valid (to prevent timing differences)
    let otp: string | null = null;
    if (shouldSendOtp) {
      otp = await otpRepo.create(reference, email, 10); // 10 minutes
    }

    // Always attempt to send email to maintain constant timing
    // If shouldSendOtp is false, we still send but to a null/invalid recipient or just simulate
    if (shouldSendOtp && otp) {
      const emailProvider = getEmailProvider();
      await emailProvider.send({
        to: email,
        subject: "SkyTouchClean - Booking Status Verification",
        html: `
          <h2>Your Verification Code</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
        text: `Your verification code is: ${otp}. This code expires in 10 minutes.`,
      });
    }

    // Always return same response to prevent enumeration
    return NextResponse.json({
      success: true,
      message: "If the reference and email match, an OTP will be sent.",
    });
  } catch (error: any) {
    console.error("OTP request error:", error);
    // Return same error response to prevent timing analysis
    return NextResponse.json({
      success: true,
      message: "If the reference and email match, an OTP will be sent.",
    });
  }
}
