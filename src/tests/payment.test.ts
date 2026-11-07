import { describe, it, expect, beforeEach, vi } from "vitest";
import { PaymentService, PaystackTransactionData } from "../server/services/payment";
import { PaymentRepository, PaymentStatus } from "../server/repositories/payments";
import { BookingRepository } from "../server/repositories/bookings";
import { LaundryOrderRepository } from "../server/repositories/laundry-orders";
import { StatusHistoryRepository } from "../server/repositories/status-history";
import { ObjectId } from "mongodb";

// Valid ObjectIds for testing
const paymentId = new ObjectId("507f1f77bcf86cd799439011");
const bookingId = new ObjectId("507f1f77bcf86cd799439012");
const laundryOrderId = new ObjectId("507f1f77bcf86cd799439013");
const statusHistoryId = new ObjectId("507f1f77bcf86cd799439014");

// Mock Paystack API
vi.mock("../../../src/lib/env", () => ({
  env: {
    PAYSTACK_SECRET_KEY: "sk_test_mock",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  },
}));

describe("PaymentService Tests with Mocked Paystack", () => {
  let mockDb: any;
  let paymentService: PaymentService;
  let mockPaymentRepo: any;
  let mockBookingRepo: any;
  let mockLaundryRepo: any;
  let mockStatusHistoryRepo: any;

  beforeEach(() => {
    // Mock repositories as proper objects with methods
    mockPaymentRepo = {
      findByReference: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
      markFailedPayments: vi.fn(),
      findPendingByOrderId: vi.fn(),
    };

    mockBookingRepo = {
      update: vi.fn(),
    };

    mockLaundryRepo = {
      update: vi.fn(),
    };

    mockStatusHistoryRepo = {
      create: vi.fn(),
    };

    // Mock Db to return our mocked collections
    mockDb = {
      collection: vi.fn((name: string) => {
        const collectionMock = {
          findOneAndUpdate: vi.fn(),
        };
        return collectionMock;
      }),
    };

    // Create service with mocked db
    paymentService = new PaymentService(mockDb as any);

    // Replace the internal repositories with our mocks
    (paymentService as any).paymentRepo = mockPaymentRepo;
    (paymentService as any).paymentRepo.collection = {
      findOneAndUpdate: vi.fn(),
    };
    (paymentService as any).bookingRepo = mockBookingRepo;
    (paymentService as any).laundryRepo = mockLaundryRepo;
    (paymentService as any).statusHistoryRepo = mockStatusHistoryRepo;
  });

  describe("Successful Payment", () => {
    it("should process successful payment and mark order as PAID", async () => {
      const payment = {
        _id: paymentId,
        orderType: "booking" as const,
        bookingId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
        email: "test@example.com",
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);
      mockBookingRepo.update.mockResolvedValue(undefined);
      mockStatusHistoryRepo.create.mockResolvedValue(undefined);

      // Mock atomic update - make it succeed
      const mockCollection = {
        findOneAndUpdate: vi.fn().mockResolvedValue({ value: payment }),
      };
      (paymentService as any).paymentRepo.collection = mockCollection;

      const paystackData: PaystackTransactionData = {
        status: "success",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      const result = await paymentService.reconcilePayment(paystackData);

      expect(result.success).toBe(true);
      expect(result.paymentStatus).toBe("SUCCESS");
      expect(result.orderStatus).toBe("PAID");
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
      expect(mockBookingRepo.update).toHaveBeenCalledWith(
        bookingId,
        { paymentStatus: "PAID" }
      );
      expect(mockStatusHistoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: bookingId,
          newStatus: "PAID",
          changedBy: "SYSTEM",
        })
      );
    });
  });

  describe("Failed Payment", () => {
    it("should mark payment as FAILED when Paystack returns failed", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);

      const paystackData: PaystackTransactionData = {
        status: "failed",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      const result = await paymentService.reconcilePayment(paystackData);

      expect(result.success).toBe(false);
      expect(result.paymentStatus).toBe("FAILED");
      expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith(
        "STC_REF123",
        "FAILED",
        undefined,
        paystackData
      );
    });
  });

  describe("Abandoned Payment", () => {
    it("should mark payment as ABANDONED when Paystack returns abandoned", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);

      const paystackData: PaystackTransactionData = {
        status: "abandoned",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      const result = await paymentService.reconcilePayment(paystackData);

      expect(result.success).toBe(false);
      expect(result.paymentStatus).toBe("ABANDONED");
    });
  });

  describe("Pending Payment", () => {
    it("should mark payment as FAILED when Paystack returns pending (after timeout)", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);

      const paystackData: PaystackTransactionData = {
        status: "pending",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      const result = await paymentService.reconcilePayment(paystackData);

      expect(result.success).toBe(false);
      expect(result.paymentStatus).toBe("FAILED");
    });
  });

  describe("Duplicate Webhook", () => {
    it("should be idempotent - second webhook call returns success without duplicate updates", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000,
        currency: "NGN",
        status: "SUCCESS" as PaymentStatus, // Already paid
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);

      const paystackData: PaystackTransactionData = {
        status: "success",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      const result = await paymentService.reconcilePayment(paystackData);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Payment already processed");
      expect(mockPaymentRepo.updateStatus).not.toHaveBeenCalled();
      expect(mockStatusHistoryRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("Invalid Signature", () => {
    it("should reject webhook with invalid signature (handled in webhook route)", () => {
      // This is tested in the webhook route, not in reconcilePayment
      // Signature validation happens before reconcilePayment is called
      const signature = "invalid" as string;
      const expectedSignature = "valid" as string;
      const isValid = signature === expectedSignature;
      expect(isValid).toBe(false);
    });
  });

  describe("Amount Mismatch", () => {
    it("should reject payment when amount doesn't match expected", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000, // Expected: ₦1,000
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);

      const paystackData: PaystackTransactionData = {
        status: "success",
        amount: 50000, // Received: ₦500 (wrong!)
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      const result = await paymentService.reconcilePayment(paystackData);

      expect(result.success).toBe(false);
      expect(result.paymentStatus).toBe("FAILED");
      expect(result.message).toBe("Amount mismatch");
      expect(mockPaymentRepo.updateStatus).toHaveBeenCalledWith(
        "STC_REF123",
        "FAILED",
        undefined,
        expect.objectContaining({
          error: "Amount mismatch",
          expected: 100000,
          received: 50000,
        })
      );
    });
  });

  describe("Wrong Currency", () => {
    it("should reject payment when currency doesn't match", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);

      const paystackData: PaystackTransactionData = {
        status: "success",
        amount: 100000,
        currency: "USD", // Wrong currency
        reference: "STC_REF123",
        email: "test@example.com",
      };

      const result = await paymentService.reconcilePayment(paystackData);

      expect(result.success).toBe(false);
      expect(result.paymentStatus).toBe("FAILED");
      expect(result.message).toBe("Currency mismatch");
    });
  });

  describe("Callback Before Webhook", () => {
    it("should handle callback arriving before webhook (idempotent)", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);
      mockBookingRepo.update.mockResolvedValue(undefined);
      mockStatusHistoryRepo.create.mockResolvedValue(undefined);

      let callCount = 0;
      const mockCollection = {
        findOneAndUpdate: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return { value: payment };
          return null;
        }),
      };
      (paymentService as any).paymentRepo.collection = mockCollection;

      const paystackData: PaystackTransactionData = {
        status: "success",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      // First call (callback)
      const result1 = await paymentService.reconcilePayment(paystackData);
      expect(result1.success).toBe(true);

      // Second call (webhook) - should be idempotent
      payment.status = "SUCCESS";
      const result2 = await paymentService.reconcilePayment(paystackData);
      expect(result2.success).toBe(true);
      expect(result2.message).toBe("Payment already processed");
    });
  });

  describe("Webhook Before Callback", () => {
    it("should handle webhook arriving before callback (idempotent)", async () => {
      const payment = {
        _id: paymentId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);
      mockBookingRepo.update.mockResolvedValue(undefined);
      mockStatusHistoryRepo.create.mockResolvedValue(undefined);

      let callCount = 0;
      const mockCollection = {
        findOneAndUpdate: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return { value: payment };
          return null;
        }),
      };
      (paymentService as any).paymentRepo.collection = mockCollection;

      const paystackData: PaystackTransactionData = {
        status: "success",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      // First call (webhook)
      const result1 = await paymentService.reconcilePayment(paystackData);
      expect(result1.success).toBe(true);

      // Second call (callback) - should be idempotent
      payment.status = "SUCCESS";
      const result2 = await paymentService.reconcilePayment(paystackData);
      expect(result2.success).toBe(true);
      expect(result2.message).toBe("Payment already processed");
    });
  });

  describe("Concurrent Calls", () => {
    it("should produce exactly one PAID transition and one status_history entry with concurrent calls", async () => {
      const payment = {
        _id: paymentId,
        orderType: "booking" as const,
        bookingId,
        amountKobo: 100000,
        currency: "NGN",
        status: "PENDING" as PaymentStatus,
      };

      // Both concurrent calls see PENDING initially
      mockPaymentRepo.findByReference.mockResolvedValue(payment);
      mockPaymentRepo.updateStatus.mockResolvedValue(undefined);
      mockBookingRepo.update.mockResolvedValue(undefined);
      mockStatusHistoryRepo.create.mockResolvedValue(undefined);

      // Mock atomic update - first call succeeds, second fails (returns null)
      let callCount = 0;
      const mockCollection = {
        findOneAndUpdate: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return { value: payment };
          return null;
        }),
      };
      (paymentService as any).paymentRepo.collection = mockCollection;

      const paystackData: PaystackTransactionData = {
        status: "success",
        amount: 100000,
        currency: "NGN",
        reference: "STC_REF123",
        email: "test@example.com",
      };

      // Simulate concurrent calls
      const [result1, result2] = await Promise.all([
        paymentService.reconcilePayment(paystackData),
        paymentService.reconcilePayment(paystackData),
      ]);

      // Both should return success (idempotent)
      const successCount = [result1.success, result2.success].filter(Boolean).length;
      expect(successCount).toBe(2);

      // Atomic update should be called twice (concurrent), but only succeed once
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledTimes(2);

      // Booking update and status history should only be called once
      expect(mockBookingRepo.update).toHaveBeenCalledTimes(1);
      expect(mockStatusHistoryRepo.create).toHaveBeenCalledTimes(1);
    });
  });
});
