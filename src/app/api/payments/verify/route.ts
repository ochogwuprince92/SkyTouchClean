import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { PaymentService } from "@/server/services/payment";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const paymentService = new PaymentService(db);

    // Call Paystack verify API
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const result = await response.json();

    if (!result.status) {
      return NextResponse.json(
        { error: "Paystack verification failed" },
        { status: 400 }
      );
    }

    const paystackData = result.data;

    // Reconcile payment
    const reconcileResult = await paymentService.reconcilePayment({
      status: paystackData.status,
      amount: paystackData.amount,
      currency: paystackData.currency,
      reference: paystackData.reference,
      email: paystackData.customer.email,
      metadata: paystackData.metadata,
    });

    if (reconcileResult.success) {
      // Redirect to success page
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      return NextResponse.redirect(`${siteUrl}/book/payment-success?reference=${reference}`);
    } else {
      // Redirect to failure page
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      return NextResponse.redirect(`${siteUrl}/book/payment-failed?reference=${reference}`);
    }
  } catch (error: any) {
    console.error("Payment verify error:", error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/book/payment-failed`);
  }
}
