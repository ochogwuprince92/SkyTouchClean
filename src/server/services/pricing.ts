import { ServiceRepository } from "../repositories/services";
import { ServicePriceRepository } from "../repositories/service-prices";
import { LaundryItem } from "../repositories/laundry-orders";

export interface LaundryItemPrice {
  itemCode: string;
  itemNameSnapshot: string;
  quantity: number;
  unitPriceKobo: number;
  lineTotalKobo: number;
  isFromPrice: boolean;
}

export interface CleaningPrice {
  bedroomCount: number;
  bookingPlan: "MONTHLY" | "SINGLE_VISIT";
  priceKobo: number;
  includedVisits: number;
}

export class PricingService {
  private serviceRepo: ServiceRepository;
  private priceRepo: ServicePriceRepository;

  constructor(serviceRepo: ServiceRepository, priceRepo: ServicePriceRepository) {
    this.serviceRepo = serviceRepo;
    this.priceRepo = priceRepo;
  }

  async calculateLaundryTotal(
    items: { itemCode: string; quantity: number }[]
  ): Promise<{ items: LaundryItemPrice[]; subtotalKobo: number; hasFromPrice: boolean }> {
    const laundryService = await this.serviceRepo.findByCode("LAUNDRY");
    if (!laundryService) {
      throw new Error("Laundry service not found");
    }

    const processedItems: LaundryItemPrice[] = [];
    let subtotalKobo = 0;
    let hasFromPrice = false;

    for (const item of items) {
      if (item.quantity <= 0) continue;

      const price = await this.priceRepo.findByServiceIdAndItemCode(
        laundryService._id!,
        item.itemCode
      );

      if (!price) {
        throw new Error(`Price not found for item: ${item.itemCode}`);
      }

      const lineTotalKobo = price.amountKobo * item.quantity;
      subtotalKobo += lineTotalKobo;

      processedItems.push({
        itemCode: item.itemCode,
        itemNameSnapshot: price.label,
        quantity: item.quantity,
        unitPriceKobo: price.amountKobo,
        lineTotalKobo,
        isFromPrice: price.isFromPrice,
      });

      if (price.isFromPrice) {
        hasFromPrice = true;
      }
    }

    return { items: processedItems, subtotalKobo, hasFromPrice };
  }

  async calculateCleaningPrice(
    bedroomCount: number,
    bookingPlan: "MONTHLY" | "SINGLE_VISIT"
  ): Promise<CleaningPrice> {
    const cleaningService = await this.serviceRepo.findByCode("HOME_CLEANING");
    if (!cleaningService) {
      throw new Error("Home cleaning service not found");
    }

    const itemCode = bookingPlan === "MONTHLY"
      ? `HC_${bedroomCount}BD_MONTHLY`
      : `HC_${bedroomCount}BD_SINGLE`;

    const price = await this.priceRepo.findByServiceIdAndItemCode(
      cleaningService._id!,
      itemCode
    );

    if (!price) {
      throw new Error(`Price not found for ${bedroomCount} bedroom ${bookingPlan.toLowerCase()}`);
    }

    return {
      bedroomCount,
      bookingPlan,
      priceKobo: price.amountKobo,
      includedVisits: bookingPlan === "MONTHLY" ? 4 : 1,
    };
  }

  async getFumigationPrice(): Promise<{ quoteOnly: true }> {
    const fumigationService = await this.serviceRepo.findByCode("FUMIGATION");
    if (!fumigationService) {
      throw new Error("Fumigation service not found");
    }

    if (fumigationService.pricingMode !== "QUOTE") {
      throw new Error("Fumigation should be quote-only");
    }

    return { quoteOnly: true };
  }
}
