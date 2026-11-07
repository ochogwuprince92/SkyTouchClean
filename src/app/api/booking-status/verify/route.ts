import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository, Booking } from "@/server/repositories/bookings";
import { LaundryOrderRepository, LaundryOrder } from "@/server/repositories/laundry-orders";
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
    const otpRecord = await otpRepo.verify(reference, otp);
    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Get booking/order details
    const bookingRepo = new BookingRepository(db);
    const laundryRepo = new LaundryOrderRepository(db);

    let record: Booking | LaundryOrder | null = await bookingRepo.findByReference(reference);
    let type = "booking";

    if (!record) {
      const laundryOrder = await laundryRepo.findByReference(reference);
      if (laundryOrder) {
        record = laundryOrder;
        type = "laundry_order";
      }
    }

    if (!record) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Return limited information (no sensitive data)
    return NextResponse.json({
      success: true,
      booking: {
        reference: record.reference,
        serviceType: type === "booking" ? (record as Booking).serviceType : "LAUNDRY",
        status: record.status,
        customerName: record.customerName,
        createdAt: record.createdAt,
        // Include pricing info if available
        ...(type === "booking"
          ? { estimatedTotalKobo: (record as Booking).estimatedTotalKobo }
          : { totalKobo: (record as LaundryOrder).totalKobo }),
      },
    });
  } catch (error: any) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
