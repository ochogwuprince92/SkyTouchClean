import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { BookingRepository } from "@/server/repositories/bookings";
import { LaundryOrderRepository } from "@/server/repositories/laundry-orders";
import { StatusHistoryRepository } from "@/server/repositories/status-history";
import { requireAdminMiddleware } from "@/lib/middleware";
import { getSession } from "@/lib/auth";
import { isValidTransition, isTerminalState } from "@/lib/state-machine";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check auth - require ADMIN role
    const authError = await requireAdminMiddleware(request);
    if (authError) return authError;

    const body = await request.json();
    const { status, internalNote, additionalChargeKobo, additionalChargeReason } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Explicitly block paymentStatus field to prevent unauthorized payment marking
    if ('paymentStatus' in body) {
      return NextResponse.json(
        { error: "paymentStatus cannot be modified through this endpoint. Use payment reconciliation for payment status changes." },
        { status: 403 }
      );
    }

    // Validate that only allowed fields are present
    const allowedFields = ['status', 'internalNote', 'additionalChargeKobo', 'additionalChargeReason'];
    const extraFields = Object.keys(body).filter(field => !allowedFields.includes(field));
    if (extraFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${extraFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate field types
    if (additionalChargeKobo !== undefined && typeof additionalChargeKobo !== 'number') {
      return NextResponse.json(
        { error: "additionalChargeKobo must be a number" },
        { status: 400 }
      );
    }

    if (additionalChargeKobo !== undefined && additionalChargeKobo < 0) {
      return NextResponse.json(
        { error: "additionalChargeKobo cannot be negative" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const bookingRepo = new BookingRepository(db);
    const laundryRepo = new LaundryOrderRepository(db);
    const statusHistoryRepo = new StatusHistoryRepository(db);

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

    // Validate status transition
    const currentStatus = booking.status;
    if (!isValidTransition(currentStatus, status)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${status}`,
          allowedTransitions: require("./state-machine").STATE_TRANSITIONS[currentStatus],
        },
        { status: 409 }
      );
    }

    // Check if current state is terminal
    if (isTerminalState(currentStatus)) {
      return NextResponse.json(
        { error: `Cannot modify ${currentStatus} booking` },
        { status: 422 }
      );
    }

    // Handle extra charge
    let updatedData: any = { status };
    if (additionalChargeKobo !== undefined) {
      if (!additionalChargeReason) {
        return NextResponse.json(
          { error: "Additional charge reason is required" },
          { status: 400 }
        );
      }

      if (type === "booking") {
        updatedData.additionalChargeKobo = additionalChargeKobo;
        updatedData.details = {
          ...booking.details,
          additionalChargeReason,
        };
        updatedData.estimatedTotalKobo =
          (booking.estimatedTotalKobo || 0) + additionalChargeKobo;
      } else {
        updatedData.additionalChargeKobo = additionalChargeKobo;
        updatedData.totalKobo = (booking.totalKobo || 0) + additionalChargeKobo;
      }

      // If extra charge added, move to AWAITING_CUSTOMER_CONFIRMATION
      if (currentStatus !== "AWAITING_CUSTOMER_CONFIRMATION") {
        updatedData.status = "AWAITING_CUSTOMER_CONFIRMATION";
      }
    }

    // Add internal note
    if (internalNote) {
      if (type === "booking") {
        updatedData.internalNotes = [
          ...(booking.internalNotes || []),
          { note: internalNote, createdAt: new Date() },
        ];
      } else {
        updatedData.internalNotes = [
          ...(booking.internalNotes || []),
          { note: internalNote, createdAt: new Date() },
        ];
      }
    }

    // Update booking/order
    if (type === "booking") {
      await bookingRepo.update(new ObjectId(id), updatedData);
    } else {
      await laundryRepo.update(new ObjectId(id), updatedData);
    }

    // Get session for audit trail
    const session = await getSession();
    const changedBy = session?.staffId || new ObjectId("507f1f77bcf86cd799439011"); // Fallback to system ID

    // Record status history
    await statusHistoryRepo.create({
      entityType: type,
      entityId: new ObjectId(id),
      fromStatus: currentStatus,
      toStatus: updatedData.status,
      changedBy,
      notes: internalNote || additionalChargeReason || "",
    });

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
    });
  } catch (error: any) {
    console.error("Update booking error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
