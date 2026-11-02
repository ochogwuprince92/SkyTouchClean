import { Db, ObjectId } from "mongodb";
import argon2 from "argon2";

export interface Session {
  _id?: ObjectId;
  tokenHash: string;
  staffId: ObjectId;
  role: "ADMIN" | "STAFF";
  createdAt: Date;
  expiresAt: Date;
}

export class SessionRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<Session>("sessions");
  }

  async create(staffId: ObjectId, role: "ADMIN" | "STAFF", hours: number = 8): Promise<string> {
    const token = this.generateToken();
    const tokenHash = await argon2.hash(token, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

    await this.collection.insertOne({
      tokenHash,
      staffId,
      role,
      createdAt: now,
      expiresAt,
    });

    return token;
  }

  async findByToken(token: string): Promise<Session | null> {
    const sessions = await this.collection
      .find({ expiresAt: { $gt: new Date() } })
      .limit(100)
      .toArray();

    for (const session of sessions) {
      const isValid = await argon2.verify(session.tokenHash, token);
      if (isValid) {
        return session;
      }
    }

    return null;
  }

  async deleteByToken(token: string): Promise<void> {
    const sessions = await this.collection
      .find({ expiresAt: { $gt: new Date() } })
      .limit(100)
      .toArray();

    for (const session of sessions) {
      const isValid = await argon2.verify(session.tokenHash, token);
      if (isValid) {
        await this.collection.deleteOne({ _id: session._id });
        break;
      }
    }
  }

  async deleteByStaffId(staffId: ObjectId): Promise<void> {
    await this.collection.deleteMany({ staffId });
  }

  async deleteExpired(): Promise<void> {
    await this.collection.deleteMany({ expiresAt: { $lt: new Date() } });
  }

  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}
