import { Db, ObjectId } from "mongodb";
import { PaymentRepository, PaymentStatus, OrderType } from "../repositories/payments";
import { BookingRepository } from "../repositories/bookings";
import { LaundryOrderRepository } from "../repositories/laundry-orders";
import { StatusHistoryRepository } from "../repositories/status-history";

export interface PaystackTransactionData {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  email: string;
  metadata?: {
    orderType?: OrderType;
    orderId?: string;
  };
}

export interface ReconcileResult {
  success: boolean;
  paymentStatus: PaymentStatus;
  orderStatus?: string;
  message: string;
}

/**
 * Idempotent payment reconciliation service.
 * Used by both the verify callback and the webhook.
 * Ensures exactly one PAID transition and one status_history entry.
 */
export class PaymentService {
  private paymentRepo: PaymentRepository;
  private bookingRepo: BookingRepository;
  private laundryRepo: LaundryOrderRepository;
  private statusHistoryRepo: StatusHistoryRepository;

  constructor(db: Db) {
    this.paymentRepo = new PaymentRepository(db);
    this.bookingRepo = new BookingRepository(db);
    this.laundryRepo = new LaundryOrderRepository(db);
    this.statusHistoryRepo = new StatusHistoryRepository(db);
  }

  /**
   * Reconcile a Paystack transaction with our records.
   * Idempotent: can be called multiple times safely.
   */
  async reconcilePayment(
    paystackData: PaystackTransactionData
  ): Promise<ReconcileResult> {
    const { status, amount, currency, reference, email, metadata } = paystackData;

    // 1. Find the payment record
    const payment = await this.paymentRepo.findByReference(reference);
    if (!payment) {
      return {
        success: false,
        paymentStatus: "FAILED",
        message: "Payment not found in database",
      };
    }

    // 2. If already PAID, return success (idempotent)
    if (payment.status === "SUCCESS") {
      return {
        success: true,
        paymentStatus: "SUCCESS",
        message: "Payment already processed",
      };
    }

    // 3. Validate amount and currency
    if (amount !== payment.amountKobo) {
      await this.paymentRepo.updateStatus(reference, "FAILED", undefined, {
        error: "Amount mismatch",
        expected: payment.amountKobo,
        received: amount,
      });
      return {
        success: false,
        paymentStatus: "FAILED",
        message: "Amount mismatch",
      };
    }

    if (currency !== payment.currency) {
      await this.paymentRepo.updateStatus(reference, "FAILED", undefined, {
        error: "Currency mismatch",
        expected: payment.currency,
        received: currency,
      });
      return {
        success: false,
        paymentStatus: "FAILED",
        message: "Currency mismatch",
      };
    }

    // 4. Handle non-success Paystack status
    if (status !== "success") {
      const newStatus: PaymentStatus =
        status === "failed" ? "FAILED" : status === "abandoned" ? "ABANDONED" : "FAILED";
      await this.paymentRepo.updateStatus(reference, newStatus, undefined, paystackData);
      return {
        success: false,
        paymentStatus: newStatus,
        message: `Paystack status: ${status}`,
      };
    }

    // 5. Atomic update to PAID status (only if currently PENDING)
    const updated = await this.atomicUpdatePaymentToPaid(reference, paystackData);
    if (!updated) {
      // Already paid by another concurrent call
      return {
        success: true,
        paymentStatus: "SUCCESS",
        message: "Payment already processed by concurrent call",
      };
    }

    // 6. Update order status and paymentStatus
    const orderType = payment.orderType;
    const orderId = orderType === "booking" ? payment.bookingId : payment.laundryOrderId;

    if (orderType === "booking") {
      await this.bookingRepo.update(orderId!, {
        paymentStatus: "PAID",
      });
    } else {
      await this.laundryRepo.update(orderId!, {
        paymentStatus: "PAID",
      });
    }

    // 7. Record status history (idempotent)
    const statusHistoryData: any = {
      newStatus: "PAID",
      changedBy: "SYSTEM",
      note: `Payment verified via Paystack: ${reference}`,
    };
    if (orderType === "booking") {
      statusHistoryData.bookingId = orderId;
    } else {
      statusHistoryData.laundryOrderId = orderId;
    }
    await this.statusHistoryRepo.create(statusHistoryData);

    return {
      success: true,
      paymentStatus: "SUCCESS",
      orderStatus: "PAID",
      message: "Payment processed successfully",
    };
  }

  /**
   * Atomic update to ensure only one PAID transition.
   * Uses findOneAndUpdate with condition.
   */
  private async atomicUpdatePaymentToPaid(
    reference: string,
    providerResponse: any
  ): Promise<boolean> {
    const collection = (this.paymentRepo as any).collection;

    const result = await collection.findOneAndUpdate(
      { reference, status: "PENDING" },
      {
        $set: {
          status: "SUCCESS",
          paidAt: new Date(),
          providerResponse,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result !== null;
  }

  /**
   * Initialize a new payment attempt.
   * Marks any existing pending payments as abandoned.
   */
  async initializePayment(
    orderType: OrderType,
    orderId: ObjectId,
    amountKobo: number,
    email: string
  ): Promise<{ reference: string; authorizationUrl: string }> {
    // Mark any existing pending payments as abandoned
    await this.paymentRepo.markFailedPayments(orderId, orderType);

    // Generate unique Paystack reference
    const reference = this.generatePaystackReference();

    // Create payment record
    await this.paymentRepo.create({
      orderType,
      bookingId: orderType === "booking" ? orderId : undefined,
      laundryOrderId: orderType === "laundry_order" ? orderId : undefined,
      provider: "paystack",
      reference,
      amountKobo,
      currency: "NGN",
      status: "PENDING",
      email,
    });

    // Call Paystack initialize API
    const authUrl = await this.callPaystackInitialize({
      amount: amountKobo,
      email,
      reference,
      metadata: { orderType, orderId: orderId.toString() },
    });

    return { reference, authorizationUrl: authUrl };
  }

  private async callPaystackInitialize(data: {
    amount: number;
    email: string;
    reference: string;
    metadata?: any;
  }): Promise<string> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.amount,
        email: data.email,
        reference: data.reference,
        currency: "NGN",
        callback_url: `${siteUrl}/api/payments/verify?reference=${data.reference}`,
        metadata: data.metadata,
      }),
    });

    const result = await response.json();

    if (!result.status) {
      throw new Error(`Paystack initialize failed: ${result.message}`);
    }

    return result.data.authorization_url;
  }

  private generatePaystackReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `STC_${timestamp}_${random}`.toUpperCase();
  }
}
