import { Db, ObjectId } from "mongodb";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED" | "REVERSED" | "REFUNDED";
export type OrderType = "booking" | "laundry_order";

export interface Payment {
  _id?: ObjectId;
  bookingId?: ObjectId;
  laundryOrderId?: ObjectId;
  orderType: OrderType;
  provider: string;
  reference: string; // Paystack reference (unique)
  amountKobo: number;
  currency: string;
  status: PaymentStatus;
  email: string;
  paidAt?: Date;
  providerResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<Payment>("payments");
  }

  async findByReference(reference: string): Promise<Payment | null> {
    return this.collection.findOne({ reference });
  }

  async create(data: Omit<Payment, "_id" | "createdAt" | "updatedAt">): Promise<ObjectId> {
    const now = new Date();
    const doc = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId;
  }

  async updateStatus(
    reference: string,
    status: PaymentStatus,
    paidAt?: Date,
    providerResponse?: any
  ): Promise<void> {
    const update: any = { status, updatedAt: new Date() };
    if (paidAt) {
      update.paidAt = paidAt;
    }
    if (providerResponse) {
      update.providerResponse = providerResponse;
    }
    await this.collection.updateOne({ reference }, { $set: update });
  }

  async findByBookingId(bookingId: ObjectId): Promise<Payment[]> {
    return this.collection.find({ bookingId }).toArray();
  }

  async findByLaundryOrderId(laundryOrderId: ObjectId): Promise<Payment[]> {
    return this.collection.find({ laundryOrderId }).toArray();
  }

  async findByOrderId(orderId: ObjectId, orderType: OrderType): Promise<Payment[]> {
    if (orderType === "booking") {
      return this.collection.find({ bookingId: orderId }).toArray();
    } else {
      return this.collection.find({ laundryOrderId: orderId }).toArray();
    }
  }

  async findPendingByOrderId(orderId: ObjectId, orderType: OrderType): Promise<Payment | null> {
    const query: any = { status: "PENDING" };
    if (orderType === "booking") {
      query.bookingId = orderId;
    } else {
      query.laundryOrderId = orderId;
    }
    return this.collection.findOne(query);
  }

  async markFailedPayments(orderId: ObjectId, orderType: OrderType): Promise<void> {
    const query: any = { status: "PENDING" };
    if (orderType === "booking") {
      query.bookingId = orderId;
    } else {
      query.laundryOrderId = orderId;
    }
    await this.collection.updateMany(
      query,
      { $set: { status: "ABANDONED", updatedAt: new Date() } }
    );
  }
}
