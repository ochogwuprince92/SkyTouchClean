import { Db, ObjectId } from "mongodb";
import { BaseOrder } from "./bookings";

export interface LaundryItem {
  itemCode: string;
  itemNameSnapshot: string;
  quantity: number;
  unitPriceKobo: number;
  lineTotalKobo: number;
  itemNotes?: string;
}

export interface LaundryOrder extends BaseOrder {
  pickupAddress: string;
  deliveryAddress: string;
  preferredPickupDate: string;
  preferredPickupTime: string;
  pickupDeliveryFeeKobo: number;
  items: LaundryItem[];
  subtotalKobo: number;
  additionalChargeKobo: number;
  totalKobo: number;
}

export class LaundryOrderRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<LaundryOrder>("laundry_orders");
  }

  async findByReference(reference: string): Promise<LaundryOrder | null> {
    return this.collection.findOne({ reference });
  }

  async create(data: Omit<LaundryOrder, "_id" | "createdAt" | "updatedAt">): Promise<ObjectId> {
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

  async update(id: ObjectId, data: Partial<LaundryOrder>): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { ...data, updatedAt: new Date() } }
    );
  }

  async findById(id: ObjectId): Promise<LaundryOrder | null> {
    return this.collection.findOne({ _id: id });
  }

  async listAll(): Promise<LaundryOrder[]> {
    return this.collection.find().toArray();
  }

  async findByPhone(phone: string): Promise<LaundryOrder[]> {
    return this.collection.find({ phone }).toArray();
  }

  async findByStatus(status: string): Promise<LaundryOrder[]> {
    return this.collection.find({ status }).toArray();
  }

  async findAll(): Promise<LaundryOrder[]> {
    return this.collection.find().toArray();
  }
}
