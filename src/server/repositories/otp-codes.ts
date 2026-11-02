import { Db, ObjectId } from "mongodb";
import argon2 from "argon2";

export interface OtpCode {
  _id?: ObjectId;
  reference: string;
  otpHash: string;
  email: string;
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
}

export class OtpCodeRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<OtpCode>("otp_codes");
  }

  async create(reference: string, email: string, minutes: number = 10): Promise<string> {
    const otp = this.generateOtp();
    const otpHash = await argon2.hash(otp, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + minutes * 60 * 1000);

    await this.collection.insertOne({
      reference,
      otpHash,
      email,
      attempts: 0,
      createdAt: now,
      expiresAt,
    });

    return otp;
  }

  async verify(reference: string, otp: string): Promise<boolean> {
    const code = await this.collection.findOne({
      reference,
      expiresAt: { $gt: new Date() },
    });

    if (!code) {
      return false;
    }

    if (code.attempts >= 5) {
      return false;
    }

    const isValid = await argon2.verify(code.otpHash, otp);

    if (!isValid) {
      await this.collection.updateOne(
        { _id: code._id },
        { $inc: { attempts: 1 } }
      );
    } else {
      // Delete after successful verification
      await this.collection.deleteOne({ _id: code._id });
    }

    return isValid;
  }

  async delete(reference: string): Promise<void> {
    await this.collection.deleteMany({ reference });
  }

  async deleteExpired(): Promise<void> {
    await this.collection.deleteMany({ expiresAt: { $lt: new Date() } });
  }

  private generateOtp(): string {
    const array = new Uint8Array(3);
    crypto.getRandomValues(array);
    const num = (array[0] << 16) | (array[1] << 8) | array[2];
    return (num % 1000000).toString().padStart(6, "0");
  }
}
