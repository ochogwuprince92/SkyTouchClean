import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { LaundryOrderRepository } from "@/server/repositories/laundry-orders";
import { requireAuthMiddleware } from "@/lib/middleware";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth - both ADMIN and STAFF can view
    const authError = await requireAuthMiddleware(request);
    if (authError) return authError;

    const session = await getSession();
    const userRole = session?.role;

    const db = await getDb();
    const bookingRepo = new BookingRepository(db);
    const laundryRepo = new LaundryOrderRepository(db);

    const id = params.id;

    // Try to find as booking
    let booking = await bookingRepo.findById(new ObjectId(id));
    let type = "booking";

    // If not found, try as laundry order
    if (!booking) {
      booking = await laundryRepo.findById(new ObjectId(id));
      type = "laundry_order";
    }

    if (!booking) {
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
        reference: booking.reference,
        status: booking.status,
        customerName: booking.customerName,
        phone: booking.phone,
        createdAt: booking.createdAt,
      };

      if (type === "booking") {
        limitedData.serviceType = booking.serviceType;
        limitedData.preferredDate = booking.preferredDate;
        limitedData.preferredTime = booking.preferredTime;
        limitedData.estimatedTotalKobo = booking.estimatedTotalKobo;
      } else {
        limitedData.serviceType = "LAUNDRY";
        limitedData.preferredPickupDate = booking.preferredPickupDate;
        limitedData.preferredPickupTime = booking.preferredPickupTime;
        limitedData.totalKobo = booking.totalKobo;
      }

      return NextResponse.json({
        success: true,
        booking: limitedData,
      });
    }

    // ADMIN sees full details
    return NextResponse.json({
      success: true,
      booking,
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
