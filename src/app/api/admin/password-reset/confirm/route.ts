import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { StaffRepository } from "@/server/repositories/staff";
import { AuthTokenRepository } from "@/server/repositories/auth-tokens";
import { SessionRepository } from "@/server/repositories/sessions";
import argon2 from "argon2";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const tokenRepo = new AuthTokenRepository(db);
    const staffRepo = new StaffRepository(db);
    const sessionRepo = new SessionRepository(db);

    // Verify token
    const authToken = await tokenRepo.findByToken(token, "PASSWORD_RESET");
    if (!authToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if already used
    if (authToken.usedAt) {
      return NextResponse.json(
        { error: "Reset token already used" },
        { status: 400 }
      );
    }

    // Find staff by email
    const staff = await staffRepo.findByEmail(authToken.email);
    if (!staff) {
      return NextResponse.json(
        { error: "Staff account not found" },
        { status: 404 }
      );
    }

    // Update password
    await staffRepo.updatePassword(staff._id!, newPassword);

    // Mark token as used
    await tokenRepo.markAsUsed(authToken._id!);

    // Invalidate all existing sessions for this staff
    await sessionRepo.deleteByStaffId(staff._id!);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    console.error("Password reset confirm error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
