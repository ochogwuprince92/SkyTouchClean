import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { StaffRepository } from "@/server/repositories/staff";
import { SessionRepository } from "@/server/repositories/sessions";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import argon2 from "argon2";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Rate limiting: 10 attempts per 15 minutes per IP/email
    const identifier = getIdentifier(request);
    const rateLimit = await checkRateLimit("api/admin/login", identifier, 10, 15);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const db = await getDb();
    const staffRepo = new StaffRepository(db);
    const sessionRepo = new SessionRepository(db);

    // Find staff by email
    const staff = await staffRepo.findByEmail(email);
    if (!staff) {
      // Don't reveal if email exists
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await argon2.verify(staff.passwordHash, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session (8 hours)
    const sessionToken = await sessionRepo.create(
      staff._id!,
      staff.role,
      8
    );

    // Set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: staff._id!.toString(),
        name: staff.fullName,
        email: staff.email,
        role: staff.role,
      },
    });

    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
