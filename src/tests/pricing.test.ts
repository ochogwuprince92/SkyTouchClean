import { describe, it, expect, beforeEach, vi } from "vitest";
import { PricingService } from "../server/services/pricing";
import { ServiceRepository } from "../server/repositories/services";
import { ServicePriceRepository } from "../server/repositories/service-prices";
import { Db, ObjectId } from "mongodb";

// Helper to create valid ObjectId - use proper hex strings
const serviceId = new ObjectId("507f1f77bcf86cd799439011");
const priceId1 = new ObjectId("507f1f77bcf86cd799439012");
const priceId2 = new ObjectId("507f1f77bcf86cd799439013");
const priceId3 = new ObjectId("507f1f77bcf86cd799439014");

describe("PricingService", () => {
  let mockServiceRepo: any;
  let mockPriceRepo: any;
  let pricingService: PricingService;

  beforeEach(() => {
    // Mock repositories
    mockServiceRepo = {
      findByCode: vi.fn(),
    };
    mockPriceRepo = {
      findByServiceIdAndItemCode: vi.fn(),
    };

    pricingService = new PricingService(
      mockServiceRepo as any,
      mockPriceRepo as any
    );
  });

  describe("calculateLaundryTotal", () => {
    it("should calculate multi-item laundry totals correctly", async () => {
      // Mock service
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "LAUNDRY",
        name: "Laundry Services",
        pricingMode: "FIXED",
        isActive: true,
      });

      // Mock prices
      const mockPriceResponse = (itemCode: string, amountKobo: number, isFromPrice: boolean, id: ObjectId) => ({
        _id: id,
        serviceId: serviceId,
        itemCode,
        label: itemCode.replace(/_/g, " "),
        unit: "ITEM",
        amountKobo,
        isFromPrice,
        isActive: true,
      });

      mockPriceRepo.findByServiceIdAndItemCode.mockImplementation((sid: ObjectId, itemCode: string) => {
        const prices: Record<string, any> = {
          LA_TROUSERS_SHIRT: mockPriceResponse("LA_TROUSERS_SHIRT", 100000, false, priceId1),
          LA_NATIVE_WEAR: mockPriceResponse("LA_NATIVE_WEAR", 150000, false, priceId2),
          LA_AGBADA: mockPriceResponse("LA_AGBADA", 300000, false, priceId3),
        };
        return Promise.resolve(prices[itemCode]);
      });

      const items = [
        { itemCode: "LA_TROUSERS_SHIRT", quantity: 2 },
        { itemCode: "LA_NATIVE_WEAR", quantity: 1 },
        { itemCode: "LA_AGBADA", quantity: 1 },
      ];

      const result = await pricingService.calculateLaundryTotal(items);

      expect(result.items).toHaveLength(3);
      expect(result.subtotalKobo).toBe(100000 * 2 + 150000 + 300000); // 650000 kobo = ₦6,500
      expect(result.hasFromPrice).toBe(false);

      // Verify snapshots
      expect(result.items[0].unitPriceKobo).toBe(100000);
      expect(result.items[0].lineTotalKobo).toBe(200000);
      expect(result.items[1].unitPriceKobo).toBe(150000);
      expect(result.items[1].lineTotalKobo).toBe(150000);
      expect(result.items[2].unitPriceKobo).toBe(300000);
      expect(result.items[2].lineTotalKobo).toBe(300000);
    });

    it("should flag duvet as estimate (isFromPrice)", async () => {
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "LAUNDRY",
        name: "Laundry Services",
        pricingMode: "FIXED",
        isActive: true,
      });

      mockPriceRepo.findByServiceIdAndItemCode.mockResolvedValue({
        _id: priceId1,
        serviceId: serviceId,
        itemCode: "LA_DUVET",
        label: "Duvets",
        unit: "ITEM",
        amountKobo: 350000,
        isFromPrice: true,
        isActive: true,
      });

      const items = [{ itemCode: "LA_DUVET", quantity: 2 }];

      const result = await pricingService.calculateLaundryTotal(items);

      expect(result.hasFromPrice).toBe(true);
      expect(result.items[0].isFromPrice).toBe(true);
      expect(result.items[0].itemNameSnapshot).toBe("Duvets");
    });

    it("should ignore tampered client prices and use server prices", async () => {
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "LAUNDRY",
        name: "Laundry Services",
        pricingMode: "FIXED",
        isActive: true,
      });

      // Server price is ₦1,000 (100000 kobo)
      mockPriceRepo.findByServiceIdAndItemCode.mockResolvedValue({
        _id: priceId1,
        serviceId: serviceId,
        itemCode: "LA_TROUSERS_SHIRT",
        label: "Trousers and Shirt",
        unit: "ITEM",
        amountKobo: 100000, // Server price: ₦1,000
        isFromPrice: false,
        isActive: true,
      });

      // Client might try to send their own price, but we ignore it
      // We only use itemCode and quantity from client
      const items = [{ itemCode: "LA_TROUSERS_SHIRT", quantity: 3 }];

      const result = await pricingService.calculateLaundryTotal(items);

      // Should use server price (100000 * 3 = 300000), not any client-supplied price
      expect(result.subtotalKobo).toBe(300000);
      expect(result.items[0].unitPriceKobo).toBe(100000);
      expect(result.items[0].lineTotalKobo).toBe(300000);
    });
  });

  describe("calculateCleaningPrice", () => {
    it("should calculate monthly package price correctly", async () => {
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "HOME_CLEANING",
        name: "Home Cleaning",
        pricingMode: "FIXED",
        isActive: true,
      });

      mockPriceRepo.findByServiceIdAndItemCode.mockResolvedValue({
        _id: priceId1,
        serviceId: serviceId,
        itemCode: "HC_2BD_MONTHLY",
        label: "2 Bedrooms (Monthly Package)",
        unit: "MONTH",
        amountKobo: 3000000, // ₦30,000
        isFromPrice: false,
        isActive: true,
      });

      const result = await pricingService.calculateCleaningPrice(2, "MONTHLY");

      expect(result.priceKobo).toBe(3000000);
      expect(result.bedroomCount).toBe(2);
      expect(result.bookingPlan).toBe("MONTHLY");
      expect(result.includedVisits).toBe(4);
    });

    it("should calculate single visit price correctly", async () => {
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "HOME_CLEANING",
        name: "Home Cleaning",
        pricingMode: "FIXED",
        isActive: true,
      });

      mockPriceRepo.findByServiceIdAndItemCode.mockResolvedValue({
        _id: priceId2,
        serviceId: serviceId,
        itemCode: "HC_2BD_SINGLE",
        label: "2 Bedrooms (Single Visit)",
        unit: "VISIT",
        amountKobo: 800000, // ₦8,000
        isFromPrice: false,
        isActive: true,
      });

      const result = await pricingService.calculateCleaningPrice(2, "SINGLE_VISIT");

      expect(result.priceKobo).toBe(800000);
      expect(result.bedroomCount).toBe(2);
      expect(result.bookingPlan).toBe("SINGLE_VISIT");
      expect(result.includedVisits).toBe(1);
    });

    it("should differentiate monthly vs single-visit pricing", async () => {
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "HOME_CLEANING",
        name: "Home Cleaning",
        pricingMode: "FIXED",
        isActive: true,
      });

      mockPriceRepo.findByServiceIdAndItemCode.mockImplementation((sid: ObjectId, itemCode: string) => {
        const prices: Record<string, any> = {
          HC_3BD_MONTHLY: {
            _id: priceId1,
            serviceId: serviceId,
            itemCode: "HC_3BD_MONTHLY",
            label: "3 Bedrooms (Monthly Package)",
            unit: "MONTH",
            amountKobo: 3500000, // ₦35,000
            isFromPrice: false,
            isActive: true,
          },
          HC_3BD_SINGLE: {
            _id: priceId2,
            serviceId: serviceId,
            itemCode: "HC_3BD_SINGLE",
            label: "3 Bedrooms (Single Visit)",
            unit: "VISIT",
            amountKobo: 1000000, // ₦10,000
            isFromPrice: false,
            isActive: true,
          },
        };
        return Promise.resolve(prices[itemCode]);
      });

      const monthlyResult = await pricingService.calculateCleaningPrice(3, "MONTHLY");
      const singleResult = await pricingService.calculateCleaningPrice(3, "SINGLE_VISIT");

      // Monthly: ₦35,000 for 4 visits
      expect(monthlyResult.priceKobo).toBe(3500000);
      expect(monthlyResult.includedVisits).toBe(4);

      // Single: ₦10,000 for 1 visit
      expect(singleResult.priceKobo).toBe(1000000);
      expect(singleResult.includedVisits).toBe(1);

      // Monthly is more expensive total but cheaper per visit
      expect(monthlyResult.priceKobo).toBeGreaterThan(singleResult.priceKobo);
    });
  });

  describe("getFumigationPrice", () => {
    it("should return quote-only for fumigation", async () => {
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "FUMIGATION",
        name: "Fumigation",
        pricingMode: "QUOTE",
        isActive: true,
      });

      const result = await pricingService.getFumigationPrice();

      expect(result.quoteOnly).toBe(true);
    });

    it("should throw error if fumigation is not quote-only", async () => {
      mockServiceRepo.findByCode.mockResolvedValue({
        _id: serviceId,
        code: "FUMIGATION",
        name: "Fumigation",
        pricingMode: "FIXED", // Wrong mode
        isActive: true,
      });

      await expect(pricingService.getFumigationPrice()).rejects.toThrow(
        "Fumigation should be quote-only"
      );
    });

    it("should throw error if fumigation service not found", async () => {
      mockServiceRepo.findByCode.mockResolvedValue(null);

      await expect(pricingService.getFumigationPrice()).rejects.toThrow(
        "Fumigation service not found"
      );
    });
  });
});
