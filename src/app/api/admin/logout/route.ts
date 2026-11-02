import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await logout();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
