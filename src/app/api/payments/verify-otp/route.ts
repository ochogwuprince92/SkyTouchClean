import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { LaundryOrderRepository } from "@/server/repositories/laundry-orders";
import { OtpCodeRepository } from "@/server/repositories/otp-codes";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, otp } = body;

    if (!reference || !otp) {
      return NextResponse.json(
        { error: "Reference and OTP are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otpRepo = new OtpCodeRepository(db);

    // Verify OTP
    const isValid = await otpRepo.verify(reference, otp);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Return success - caller can now proceed to payment initialization
    return NextResponse.json({
      success: true,
      message: "OTP verified. You can now proceed to payment.",
    });
  } catch (error: any) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
