import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { LaundryOrderRepository } from "@/server/repositories/laundry-orders";
import { PaymentService } from "@/server/services/payment";
import { OtpCodeRepository } from "@/server/repositories/otp-codes";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderType, orderId: providedOrderId, reference: orderReference, otp } = body;
    let orderId = providedOrderId;

    if (!otp || (!orderId && !orderReference)) {
      return NextResponse.json(
        { error: "Order ID or reference, and OTP are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otpRepo = new OtpCodeRepository(db);

    // Find order first to get reference
    const bookingRepo = new BookingRepository(db);
    const laundryRepo = new LaundryOrderRepository(db);

    let order: any;
    let resolvedOrderType: string;
    let amountKobo: number;
    let email: string;

    if (orderReference) {
      order = await bookingRepo.findByReference(orderReference);
      resolvedOrderType = "booking";
      if (!order) {
        order = await laundryRepo.findByReference(orderReference);
        resolvedOrderType = "laundry_order";
      }
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      orderId = order._id;
    } else if (orderType === "booking") {
      resolvedOrderType = "booking";
      order = await bookingRepo.findById(new ObjectId(orderId));
      if (!order) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }
    } else {
      resolvedOrderType = "laundry_order";
      order = await laundryRepo.findById(new ObjectId(orderId));
      if (!order) {
        return NextResponse.json(
          { error: "Laundry order not found" },
          { status: 404 }
        );
      }
    }

    amountKobo = resolvedOrderType === "booking"
      ? order.estimatedTotalKobo || 0
      : order.totalKobo || 0;
    email = order.email;

    // Verify OTP using the order reference
    const isValid = await otpRepo.verify(order.reference, otp);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if order is payable
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    // Fumigation requires quote acceptance
    if (order.serviceType === "FUMIGATION" && order.details?.quoteStatus !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Fumigation requires quote acceptance before payment" },
        { status: 400 }
      );
    }

    // Initialize payment
    const paymentService = new PaymentService(db);
    const { reference, authorizationUrl } = await paymentService.initializePayment(
      resolvedOrderType as any,
      new ObjectId(orderId),
      amountKobo,
      email
    );

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl,
    });
  } catch (error: any) {
    console.error("Payment initialize error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
