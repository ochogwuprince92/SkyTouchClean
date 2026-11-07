import { Db, ObjectId } from "mongodb";

export interface StatusHistory {
  _id?: ObjectId;
  entityType?: string;
  entityId?: ObjectId;
  bookingId?: ObjectId;
  laundryOrderId?: ObjectId;
  fromStatus?: string;
  toStatus?: string;
  oldStatus?: string;
  newStatus: string;
  changedBy: ObjectId | "SYSTEM";
  note?: string;
  createdAt: Date;
}

export class StatusHistoryRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<StatusHistory>("status_history");
  }

  async create(data: Omit<StatusHistory, "_id" | "createdAt">): Promise<ObjectId> {
    const doc = {
      ...data,
      createdAt: new Date(),
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId;
  }

  async findByBookingId(bookingId: ObjectId): Promise<StatusHistory[]> {
    return this.collection
      .find({ bookingId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findByLaundryOrderId(laundryOrderId: ObjectId): Promise<StatusHistory[]> {
    return this.collection
      .find({ laundryOrderId })
      .sort({ createdAt: -1 })
      .toArray();
  }
}
