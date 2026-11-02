import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb/client";
import { StaffRepository } from "@/server/repositories/staff";
import { AuthTokenRepository } from "@/server/repositories/auth-tokens";
import { requireAdmin } from "@/lib/auth";
import { getEmailProvider } from "@/lib/email";
import argon2 from "argon2";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin();

    const body = await request.json();
    const { email, role = "STAFF" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const staffRepo = new StaffRepository(db);
    const tokenRepo = new AuthTokenRepository(db);

    // Check if staff already exists
    const existingStaff = await staffRepo.findByEmail(email);
    if (existingStaff) {
      return NextResponse.json(
        { error: "Staff with this email already exists" },
        { status: 409 }
      );
    }

    // Generate invite token (24-hour expiry)
    const token = await tokenRepo.create(email, "INVITE", 24);

    // Send invite email
    const emailProvider = getEmailProvider();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const inviteUrl = `${siteUrl}/admin/accept-invite?token=${token}`;

    await emailProvider.send({
      to: email,
      subject: "SkyTouchClean Staff Invitation",
      html: `
        <h2>You're invited to join SkyTouchClean</h2>
        <p>You have been invited to join the SkyTouchClean team as a ${role}.</p>
        <p>Click the link below to set up your account:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
      text: `You're invited to join SkyTouchClean as a ${role}. Set up your account at: ${inviteUrl}`,
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error: any) {
    console.error("Invite error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
