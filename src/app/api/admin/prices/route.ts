import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { ServicePriceRepository } from "@/server/repositories/service-prices";
import { StatusHistoryRepository } from "@/server/repositories/status-history";
import { requireAdmin } from "@/lib/auth";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const db = await getDb();
    const priceRepo = new ServicePriceRepository(db);

    const prices = await priceRepo.findActive();

    return NextResponse.json({
      success: true,
      prices,
    });
  } catch (error: any) {
    console.error("List prices error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { serviceId, itemCode, label, unit, amountKobo, isFromPrice } = body;

    if (!serviceId || !itemCode || !label || !unit || amountKobo === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const priceRepo = new ServicePriceRepository(db);
    const statusHistoryRepo = new StatusHistoryRepository(db);

    // Convert serviceId to ObjectId if it's a string
    const serviceObjectId = typeof serviceId === 'string' ? new ObjectId(serviceId) : serviceId;

    // Deactivate any existing active prices for this serviceId/itemCode combination
    await priceRepo.deactivatePreviousPrices(serviceObjectId, itemCode);

    // Create new price
    const priceId = await priceRepo.create({
      serviceId: serviceObjectId,
      itemCode,
      label,
      unit,
      amountKobo,
      isFromPrice: isFromPrice || false,
      isActive: true,
      effectiveFrom: new Date(),
    });

    // Get session for audit trail
    const session = await getSession();
    const changedBy: ObjectId | "SYSTEM" = session?.staffId
      ? new ObjectId(session.staffId)
      : new ObjectId("507f1f77bcf86cd799439011"); // Fallback to system ID

    // Audit log
    await statusHistoryRepo.create({
      entityType: "price",
      entityId: priceId,
      fromStatus: "NEW",
      toStatus: "ACTIVE",
      newStatus: "ACTIVE",
      changedBy,
      note: `Created price: ${label} - ₦${(amountKobo / 100).toFixed(2)}`,
    });

    return NextResponse.json({
      success: true,
      message: "Price created successfully",
      priceId: priceId.toString(),
    });
  } catch (error: any) {
    console.error("Create price error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to create price" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{}> }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, label, unit, amountKobo, isFromPrice, isActive } = body;

    if (!id || (!label && unit === undefined && amountKobo === undefined && isActive === undefined)) {
      return NextResponse.json(
        { error: "ID and at least one field to update are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const priceRepo = new ServicePriceRepository(db);
    const statusHistoryRepo = new StatusHistoryRepository(db);
    const existingPrice = await priceRepo.findById(typeof id === 'string' ? new ObjectId(id) : id);

    if (!existingPrice) {
      return NextResponse.json(
        { error: "Price not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (label !== undefined) updateData.label = label;
    if (unit !== undefined) updateData.unit = unit;
    if (amountKobo !== undefined) updateData.amountKobo = amountKobo;
    if (isFromPrice !== undefined) updateData.isFromPrice = isFromPrice;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If activating this price, deactivate others with same serviceId/itemCode
    if (isActive === true) {
      await priceRepo.deactivatePreviousPrices(existingPrice.serviceId, existingPrice.itemCode);
    }

    // Update price
    await priceRepo.update(typeof id === 'string' ? new ObjectId(id) : id, updateData);

    // Get session for audit trail
    const session = await getSession();
    const changedBy: ObjectId | "SYSTEM" = session?.staffId
      ? new ObjectId(session.staffId)
      : new ObjectId("507f1f77bcf86cd799439011"); // Fallback to system ID

    // Audit log
    await statusHistoryRepo.create({
      entityType: "price",
      entityId: new ObjectId(id),
      fromStatus: existingPrice.isActive ? "ACTIVE" : "INACTIVE",
      toStatus: isActive !== undefined ? (isActive ? "ACTIVE" : "INACTIVE") : (existingPrice.isActive ? "ACTIVE" : "INACTIVE"),
      newStatus: isActive !== undefined ? (isActive ? "ACTIVE" : "INACTIVE") : (existingPrice.isActive ? "ACTIVE" : "INACTIVE"),
      changedBy,
      note: `Updated price: ${existingPrice.label}`,
    });

    return NextResponse.json({
      success: true,
      message: "Price updated successfully",
    });
  } catch (error: any) {
    console.error("Update price error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update price" },
      { status: 500 }
    );
  }
}
