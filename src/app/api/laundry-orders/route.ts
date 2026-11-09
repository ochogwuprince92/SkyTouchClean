import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { LaundryOrderRepository } from "@/server/repositories/laundry-orders";
import { ServiceRepository } from "@/server/repositories/services";
import { ServicePriceRepository } from "@/server/repositories/service-prices";
import { PricingService } from "@/server/services/pricing";
import { laundryOrderSchema } from "@/lib/validation";
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
    const rateLimit = await checkRateLimit("api/laundry-orders", identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validation
    const validatedData = laundryOrderSchema.parse(body);

    const db = await getDb();
    const laundryOrderRepo = new LaundryOrderRepository(db);
    const serviceRepo = new ServiceRepository(db);
    const priceRepo = new ServicePriceRepository(db);
    const pricingService = new PricingService(serviceRepo, priceRepo);

    // Calculate pricing from server-side data
    const { items: processedItems, subtotalKobo, hasFromPrice } =
      await pricingService.calculateLaundryTotal(validatedData.items);

    // Generate unique reference
    const reference = generateReference("laundry");

    // Create order
    const orderId = await laundryOrderRepo.create({
      reference,
      customerName: validatedData.customerName,
      phone: validatedData.phone,
      email: validatedData.email,
      pickupAddress: validatedData.pickupAddress,
      deliveryAddress: validatedData.deliveryAddress,
      preferredPickupDate: validatedData.preferredPickupDate,
      preferredPickupTime: validatedData.preferredPickupTime,
      pickupDeliveryFeeKobo: 0, // Free pickup/delivery
      status: "PENDING_REVIEW",
      paymentStatus: "UNPAID",
      items: processedItems,
      subtotalKobo,
      additionalChargeKobo: 0,
      totalKobo: subtotalKobo,
      customerNotes: validatedData.customerNotes,
    });

    // Send confirmation email
    try {
      const emailProvider = getEmailProvider();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const totalNaira = subtotalKobo / 100;
      
      // Build items list for email
      const itemsList = processedItems.map((item: any) => 
        `<li>${item.itemCode} x${item.quantity} - ₦${((item.unitPriceKobo * item.quantity) / 100).toLocaleString()}</li>`
      ).join('');
      
      await emailProvider.send({
        to: validatedData.email,
        subject: "SkyTouchClean - Laundry Order Confirmation",
        html: `
          <h2>Order Confirmed!</h2>
          <p>Dear ${validatedData.customerName},</p>
          <p>Your laundry order has been successfully submitted.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Reference:</strong> ${reference}</p>
            <p><strong>Service:</strong> Laundry</p>
            <p><strong>Pickup Date:</strong> ${validatedData.preferredPickupDate}</p>
            <p><strong>Pickup Time:</strong> ${validatedData.preferredPickupTime}</p>
            <p><strong>Pickup Address:</strong> ${validatedData.pickupAddress}</p>
            <p><strong>Delivery Address:</strong> ${validatedData.deliveryAddress}</p>
            
            <h4 style="margin-top: 15px;">Items:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${itemsList}
            </ul>
            
            <p style="font-weight: bold; margin-top: 15px;">Estimated Total: ₦${totalNaira.toLocaleString()}</p>
            ${hasFromPrice ? '<p style="font-size: 12px; color: #666;">* Some items are priced "from" - final price may vary based on condition.</p>' : ''}
          </div>
          
          <p>Our team will review your order and contact you to confirm the pickup schedule.</p>
          <p>You can check your order status anytime using your reference number.</p>
          
          <p>
            <a href="${siteUrl}/status" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Check Order Status</a>
          </p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you did not make this order, please ignore this email.
          </p>
        `,
        text: `Order Confirmed!\n\nDear ${validatedData.customerName},\n\nYour laundry order has been successfully submitted.\n\nReference: ${reference}\nService: Laundry\nPickup Date: ${validatedData.preferredPickupDate}\nPickup Time: ${validatedData.preferredPickupTime}\nPickup Address: ${validatedData.pickupAddress}\nDelivery Address: ${validatedData.deliveryAddress}\n\nItems:\n${processedItems.map((item: any) => `- ${item.itemCode} x${item.quantity} - ₦${((item.unitPriceKobo * item.quantity) / 100).toLocaleString()}`).join('\n')}\n\nEstimated Total: ₦${totalNaira.toLocaleString()}\n${hasFromPrice ? '* Some items are priced "from" - final price may vary based on condition.' : ''}\n\nOur team will review your order and contact you to confirm the pickup schedule.\n\nCheck your order status at: ${siteUrl}/status`,
      });
    } catch (emailError) {
      // Log email error but don't fail the order
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      reference,
      orderId: orderId.toString(),
      total: subtotalKobo,
      hasFromPrice,
    });
  } catch (error: any) {
    console.error("Laundry order error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create laundry order" },
      { status: 500 }
    );
  }
}
