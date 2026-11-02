import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { LaundryOrderRepository } from "@/server/repositories/laundry-orders";
import { requireAdminMiddleware } from "@/lib/middleware";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Check auth - require ADMIN role
    const authError = await requireAdminMiddleware(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const db = await getDb();
    const bookingRepo = new BookingRepository(db);
    const laundryRepo = new LaundryOrderRepository(db);

    let results: any[] = [];

    if (serviceType === "HOME_CLEANING" || serviceType === "FUMIGATION" || !serviceType) {
      const bookings = await bookingRepo.listAll();
      results = results.concat(
        bookings.map((b) => ({
          ...b,
          serviceType: b.serviceType,
          type: "booking",
        }))
      );
    }

    if (serviceType === "LAUNDRY" || !serviceType) {
      const orders = await laundryRepo.listAll();
      results = results.concat(
        orders.map((o) => ({
          ...o,
          serviceType: "LAUNDRY",
          type: "laundry_order",
        }))
      );
    }

    // Filter by status
    if (status) {
      results = results.filter((r) => r.status === status);
    }

    // Search by reference, name, or phone
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (r) =>
          r.reference?.toLowerCase().includes(searchLower) ||
          r.customerName?.toLowerCase().includes(searchLower) ||
          r.phone?.includes(search)
      );
    }

    // Sort by createdAt descending
    results.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    });
  } catch (error: any) {
    console.error("List bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
