import { Db, ObjectId } from "mongodb";
import argon2 from "argon2";

export interface Staff {
  _id?: ObjectId;
  fullName: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class StaffRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<Staff>("staff");
  }

  async findByEmail(email: string): Promise<Staff | null> {
    return this.collection.findOne({ email, isActive: true });
  }

  async findById(id: ObjectId): Promise<Staff | null> {
    return this.collection.findOne({ _id: id, isActive: true });
  }

  async create(data: Omit<Staff, "_id" | "createdAt" | "updatedAt">): Promise<ObjectId> {
    const now = new Date();
    const doc = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId;
  }

  async updatePassword(id: ObjectId, newPassword: string): Promise<void> {
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    await this.collection.updateOne(
      { _id: id },
      { $set: { passwordHash, updatedAt: new Date() } }
    );
  }

  async listAll(): Promise<Staff[]> {
    return this.collection.find({ isActive: true }).toArray();
  }

  async deactivate(id: ObjectId): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
  }
}
