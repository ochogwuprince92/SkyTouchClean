import { Db, ObjectId } from "mongodb";

export interface ServicePrice {
  _id?: ObjectId;
  serviceId: ObjectId;
  itemCode: string;
  label: string;
  unit: "VISIT" | "MONTH" | "ITEM" | "SET" | "QUOTE";
  amountKobo: number;
  isFromPrice: boolean;
  isActive: boolean;
  effectiveFrom: Date;
  createdAt: Date;
}

export class ServicePriceRepository {
  private collection;

  constructor(db: Db) {
    this.collection = db.collection<ServicePrice>("service_prices");
  }

  async findActiveByServiceId(serviceId: ObjectId): Promise<ServicePrice[]> {
    return this.collection
      .find({ serviceId, isActive: true })
      .sort({ effectiveFrom: -1 })
      .toArray();
  }

  async findByServiceIdAndItemCode(
    serviceId: ObjectId,
    itemCode: string
  ): Promise<ServicePrice | null> {
    return this.collection.findOne({
      serviceId,
      itemCode,
      isActive: true,
    });
  }

  async create(data: Omit<ServicePrice, "_id" | "createdAt">): Promise<ObjectId> {
    const doc = {
      ...data,
      createdAt: new Date(),
    };
    const result = await this.collection.insertOne(doc);
    return result.insertedId;
  }

  async findActive(): Promise<ServicePrice[]> {
    return this.collection.find({ isActive: true }).toArray();
  }

  async update(id: ObjectId, data: Partial<ServicePrice>): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { ...data, updatedAt: new Date() } }
    );
  }

  async deactivatePreviousPrices(serviceId: ObjectId, itemCode: string): Promise<void> {
    await this.collection.updateMany(
      { serviceId, itemCode, isActive: true, _id: { $ne: new ObjectId() } },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
  }

  async findById(id: ObjectId): Promise<ServicePrice | null> {
    return this.collection.findOne({ _id: id });
  }
}
