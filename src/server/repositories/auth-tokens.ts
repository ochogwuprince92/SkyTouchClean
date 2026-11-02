import { Db, ObjectId } from "mongodb";
import argon2 from "argon2";

export type AuthTokenType = "INVITE" | "PASSWORD_RESET";

export interface AuthToken {
  _id?: ObjectId;
  tokenHash: string;
  type: AuthTokenType;
  email: string;
  staffId?: ObjectId;
  expiresAt: Date;
  usedAt?: Date;
  metadata?: any;
  createdAt: Date;
}

export class AuthTokenRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<AuthToken>("auth_tokens");
  }

  async create(
    email: string,
    type: AuthTokenType,
    hours: number = 1,
    staffId?: ObjectId,
    metadata?: any
  ): Promise<string> {
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
      type,
      email,
      staffId,
      expiresAt,
      metadata,
      createdAt: now,
    });

    return token;
  }

  async findByToken(token: string, type?: AuthTokenType): Promise<AuthToken | null> {
    const query: any = {
      expiresAt: { $gt: new Date() },
      usedAt: { $exists: false },
    };
    if (type) query.type = type;

    const tokens = await this.collection.find(query).limit(100).toArray();

    for (const authToken of tokens) {
      const isValid = await argon2.verify(authToken.tokenHash, token);
      if (isValid) {
        return authToken;
      }
    }

    return null;
  }

  async markAsUsed(id: ObjectId): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { usedAt: new Date() } }
    );
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
