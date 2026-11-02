import { cookies } from "next/headers";
import { getDb } from "./mongodb/client";
import { SessionRepository } from "../server/repositories/sessions";
import { StaffRepository } from "../server/repositories/staff";

export interface SessionUser {
  staffId: string;
  role: "ADMIN" | "STAFF";
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const db = await getDb();
  const sessionRepo = new SessionRepository(db);
  const session = await sessionRepo.findByToken(sessionToken);

  if (!session) {
    return null;
  }

  // Check if expired
  if (new Date() > session.expiresAt) {
    await sessionRepo.deleteByToken(sessionToken);
    return null;
  }

  return {
    staffId: session.staffId.toString(),
    role: session.role,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    const db = await getDb();
    const sessionRepo = new SessionRepository(db);
    await sessionRepo.deleteByToken(sessionToken);
  }

  cookieStore.delete("session_token");
}
