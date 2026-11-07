import { Db, ObjectId } from "mongodb";

export interface BaseOrder {
  _id?: ObjectId;
  reference: string;
  customerName: string;
  phone: string;
  email: string;
  status: string;
  paymentStatus: "NOT_REQUIRED" | "UNPAID" | "PENDING" | "PAID" | "FAILED";
  customerNotes?: string;
  internalNotes?: Array<{ note: string; createdAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking extends BaseOrder {
  serviceType: "HOME_CLEANING" | "FUMIGATION";
  address: string;
  preferredDate: string;
  preferredTime: string;
  estimatedTotalKobo?: number;
  finalTotalKobo?: number;
  materialsOption: "CUSTOMER_PROVIDES" | "SKYTOUCH_PROVIDES";
  details: any;
}

export class BookingRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<Booking>("bookings");
  }

  async findByReference(reference: string): Promise<Booking | null> {
    return this.collection.findOne({ reference });
  }

  async create(data: Omit<Booking, "_id" | "createdAt" | "updatedAt">): Promise<ObjectId> {
    const now = new Date();
    const doc = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId;
  }

  async updateStatus(id: ObjectId, status: string): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    );
  }

  async update(id: ObjectId, data: Partial<Booking>): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { ...data, updatedAt: new Date() } }
    );
  }

  async findById(id: ObjectId): Promise<Booking | null> {
    return this.collection.findOne({ _id: id });
  }

  async listAll(): Promise<Booking[]> {
    return this.collection.find().toArray();
  }

  async findByPhone(phone: string): Promise<Booking[]> {
    return this.collection.find({ phone }).toArray();
  }

  async findByStatus(status: string): Promise<Booking[]> {
    return this.collection.find({ status }).toArray();
  }

  async findByServiceType(serviceType: string): Promise<Booking[]> {
    return this.collection.find({ serviceType: serviceType as any }).toArray();
  }

  async findAll(): Promise<Booking[]> {
    return this.collection.find().toArray();
  }
}
