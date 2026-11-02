import { Db, ObjectId } from "mongodb";

export interface Booking {
  _id?: ObjectId;
  reference: string;
  serviceType: "HOME_CLEANING" | "FUMIGATION";
  customerName: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  paymentStatus: "NOT_REQUIRED" | "UNPAID" | "PENDING" | "PAID" | "FAILED";
  estimatedTotalKobo?: number;
  finalTotalKobo?: number;
  customerNotes?: string;
  materialsOption: "CUSTOMER_PROVIDES" | "SKYTOUCH_PROVIDES";
  details: any;
  internalNotes?: Array<{ note: string; createdAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
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
