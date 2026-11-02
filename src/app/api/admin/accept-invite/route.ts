import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { StaffRepository } from "@/server/repositories/staff";
import { AuthTokenRepository } from "@/server/repositories/auth-tokens";
import argon2 from "argon2";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, fullName, phone } = body;

    if (!token || !password || !fullName || !phone) {
      return NextResponse.json(
        { error: "Token, password, full name, and phone are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const tokenRepo = new AuthTokenRepository(db);
    const staffRepo = new StaffRepository(db);

    // Verify token
    const authToken = await tokenRepo.findByToken(token, "INVITE");
    if (!authToken) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      );
    }

    // Check if already used
    if (authToken.usedAt) {
      return NextResponse.json(
        { error: "Invitation already used" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create staff account
    const staffId = await staffRepo.create({
      email: authToken.email,
      passwordHash,
      fullName,
      phone,
      role: authToken.metadata?.role || "STAFF",
      isActive: true,
    });

    // Mark token as used
    await tokenRepo.markAsUsed(authToken._id!);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error: any) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
