import { Db, ObjectId } from "mongodb";

export interface RateLimit {
  _id?: ObjectId;
  identifier: string;
  endpoint: string;
  count: number;
  windowStart: Date;
  expiresAt: Date;
}

export class RateLimitRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<RateLimit>("rate_limits");
  }

  async checkRateLimit(
    identifier: string,
    endpoint: string,
    maxRequests: number,
    windowMinutes: number = 1
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    const expiresAt = new Date(now.getTime() + windowMinutes * 60 * 1000);

    // Clean up expired entries
    await this.collection.deleteMany({ expiresAt: { $lt: now } });

    const existing = await this.collection.findOne({
      identifier,
      endpoint,
      windowStart: { $gte: windowStart },
    });

    if (existing) {
      if (existing.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }

      await this.collection.updateOne(
        { _id: existing._id },
        { $inc: { count: 1 } }
      );

      return { allowed: true, remaining: maxRequests - existing.count - 1 };
    }

    // Create new rate limit entry
    await this.collection.insertOne({
      identifier,
      endpoint,
      count: 1,
      windowStart: now,
      expiresAt,
    });

    return { allowed: true, remaining: maxRequests - 1 };
  }

  async deleteExpired(): Promise<void> {
    await this.collection.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}
