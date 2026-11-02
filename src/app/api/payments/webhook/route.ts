import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { PaymentService } from "@/server/services/payment";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const hmac = crypto.createHmac("sha512", secretKey);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    // Timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse event
    const event = JSON.parse(rawBody);
    const { event: eventType, data } = event;

    // Only process charge.success events
    if (eventType !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const db = await getDb();
    const paymentService = new PaymentService(db);

    // Reconcile payment
    const reconcileResult = await paymentService.reconcilePayment({
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      email: data.customer.email,
      metadata: data.metadata,
    });

    // Acknowledge promptly
    return NextResponse.json({ received: true, reconcileResult });
  } catch (error: any) {
    console.error("Webhook error:", error);
    // Still acknowledge to prevent retries
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}
