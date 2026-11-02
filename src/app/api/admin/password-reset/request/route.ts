import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { StaffRepository } from "@/server/repositories/staff";
import { AuthTokenRepository } from "@/server/repositories/auth-tokens";
import { checkRateLimit, getIdentifier } from "@/lib/rate-limit";
import { getEmailProvider } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier = getIdentifier(request);
    const rateLimit = await checkRateLimit("api/admin/password-reset/request", identifier, 5, 15);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const db = await getDb();
    const staffRepo = new StaffRepository(db);
    const tokenRepo = new AuthTokenRepository(db);

    // Check if email exists (don't reveal if not found to prevent enumeration)
    const staff = await staffRepo.findByEmail(email);

    if (staff) {
      // Generate reset token (1-hour expiry)
      const token = await tokenRepo.create(email, "PASSWORD_RESET", 1);

      // Send reset email
      const emailProvider = getEmailProvider();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`;

      await emailProvider.send({
        to: email,
        subject: "SkyTouchClean Password Reset",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your SkyTouchClean account.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
        text: `Reset your password at: ${resetUrl}. This link expires in 1 hour.`,
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
