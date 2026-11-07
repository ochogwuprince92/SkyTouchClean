import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository, Booking } from "@/server/repositories/bookings";
import { LaundryOrderRepository, LaundryOrder } from "@/server/repositories/laundry-orders";
import { requireAuthMiddleware } from "@/lib/middleware";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth - both ADMIN and STAFF can view
    const authError = await requireAuthMiddleware(request);
    if (authError) return authError;

    const session = await getSession();
    const userRole = session?.role;

    const { id } = await params;

    const db = await getDb();
    const bookingRepo = new BookingRepository(db);
    const laundryRepo = new LaundryOrderRepository(db);

    // Try to find as booking
    let order: Booking | LaundryOrder | null = await bookingRepo.findById(new ObjectId(id));
    let type = "booking";

    // If not found, try as laundry order
    if (!order) {
      const laundryOrder = await laundryRepo.findById(new ObjectId(id));
      if (laundryOrder) {
        order = laundryOrder;
        type = "laundry_order";
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Booking/order not found" },
        { status: 404 }
      );
    }

    // Return limited data based on role
    // STAFF sees: reference, status, customerName, phone, preferred date/time, status
    // ADMIN sees: full details including addresses, email, internal notes
    if (userRole === "STAFF") {
      // Limited view for STAFF
      const limitedData: any = {
        reference: order.reference,
        status: order.status,
        customerName: order.customerName,
        phone: order.phone,
        createdAt: order.createdAt,
      };

      if (type === "booking") {
        limitedData.serviceType = (order as Booking).serviceType;
        limitedData.preferredDate = (order as Booking).preferredDate;
        limitedData.preferredTime = (order as Booking).preferredTime;
        limitedData.estimatedTotalKobo = (order as Booking).estimatedTotalKobo;
      } else {
        limitedData.serviceType = "LAUNDRY";
        limitedData.preferredPickupDate = (order as LaundryOrder).preferredPickupDate;
        limitedData.preferredPickupTime = (order as LaundryOrder).preferredPickupTime;
        limitedData.totalKobo = (order as LaundryOrder).totalKobo;
      }

      return NextResponse.json({
        success: true,
        booking: limitedData,
      });
    }

    // ADMIN sees full details
    return NextResponse.json({
      success: true,
      booking: order,
    });
  } catch (error: any) {
    console.error("View booking error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
