import { RateLimitRepository } from "../server/repositories/rate-limits";
import { getDb } from "./mongodb/client";

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "api/laundry-orders": { maxRequests: 5, windowMinutes: 1 },
  "api/bookings/cleaning": { maxRequests: 5, windowMinutes: 1 },
  "api/bookings/fumigation": { maxRequests: 5, windowMinutes: 1 },
  "api/admin/login": { maxRequests: 10, windowMinutes: 15 },
};

export async function checkRateLimit(
  endpoint: string,
  identifier: string,
  maxRequests?: number,
  windowMinutes?: number
): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_LIMITS[endpoint] || { maxRequests: maxRequests || 5, windowMinutes: windowMinutes || 1 };

  const db = await getDb();
  const rateLimitRepo = new RateLimitRepository(db);

  return rateLimitRepo.checkRateLimit(
    identifier,
    endpoint,
    config.maxRequests,
    config.windowMinutes
  );
}

export function getIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  // If possible, also include email for more specific limiting
  // This would be passed in the request body
  return ip;
}
