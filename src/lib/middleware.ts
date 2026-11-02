import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./auth";

export async function requireAdminMiddleware(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  return null; // Allow request to proceed
}

export async function requireAuthMiddleware(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null; // Allow request to proceed
}
