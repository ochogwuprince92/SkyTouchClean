import { Db, ObjectId } from "mongodb";

export interface Service {
  _id?: ObjectId;
  code: string;
  name: string;
  description: string;
  pricingMode: "FIXED" | "FROM" | "QUOTE";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<Service>("services");
  }

  async findByCode(code: string): Promise<Service | null> {
    return this.collection.findOne({ code, isActive: true });
  }

  async findActive(): Promise<Service[]> {
    return this.collection.find({ isActive: true }).toArray();
  }

  async create(data: Omit<Service, "_id" | "createdAt" | "updatedAt">): Promise<ObjectId> {
    const now = new Date();
    const doc = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId;
  }

  async findById(id: ObjectId): Promise<Service | null> {
    return this.collection.findOne({ _id: id });
  }
}
