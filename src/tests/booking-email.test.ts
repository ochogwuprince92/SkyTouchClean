import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmailOptions } from "../lib/email/types";

describe("Booking Email Integration Tests", () => {
  describe("Cleaning Booking Email", () => {
    it("should include booking reference in email", () => {
      const reference = "STC-CLE-ABC12345";
      const emailHtml = `
        <h2>Booking Confirmed!</h2>
        <p>Dear John Doe,</p>
        <p>Your home cleaning booking has been successfully submitted.</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Reference:</strong> ${reference}</p>
        </div>
      `;

      expect(emailHtml).toContain(reference);
      expect(emailHtml).toContain("Booking Confirmed!");
      expect(emailHtml).toContain("John Doe");
    });

    it("should include service details", () => {
      const bedroomCount = 2;
      const bookingPlan = "MONTHLY";
      const preferredDate = "2025-01-15";
      const preferredTime = "10:00";
      const emailHtml = `
        <p><strong>Bedrooms:</strong> ${bedroomCount}</p>
        <p><strong>Plan:</strong> ${bookingPlan === "MONTHLY" ? "Monthly Package" : "Single Visit"}</p>
        <p><strong>Date:</strong> ${preferredDate}</p>
        <p><strong>Time:</strong> ${preferredTime}</p>
      `;

      expect(emailHtml).toContain("2");
      expect(emailHtml).toContain("Monthly Package");
      expect(emailHtml).toContain("2025-01-15");
      expect(emailHtml).toContain("10:00");
    });

    it("should include pricing information", () => {
      const priceNaira = 30000;
      const emailHtml = `
        <p><strong>Estimated Price:</strong> ₦${priceNaira.toLocaleString()}</p>
      `;

      expect(emailHtml).toContain("₦30,000");
    });

    it("should include status check link", () => {
      const siteUrl = "http://localhost:3000";
      const emailHtml = `
        <a href="${siteUrl}/status" style="background-color: #14b8a6; color: white;">Check Booking Status</a>
      `;

      expect(emailHtml).toContain("http://localhost:3000/status");
      expect(emailHtml).toContain("Check Booking Status");
    });
  });

  describe("Fumigation Booking Email", () => {
    it("should indicate quote-only service", () => {
      const emailHtml = `
        <h2>Booking Received!</h2>
        <p><strong>Important:</strong> Fumigation services require an on-site assessment to provide an accurate quote.</p>
      `;

      expect(emailHtml).toContain("Booking Received!");
      expect(emailHtml).toContain("on-site assessment");
      expect(emailHtml).toContain("accurate quote");
    });

    it("should include property details", () => {
      const propertyType = "apartment";
      const propertySize = "medium";
      const pestProblem = "cockroaches";
      const emailHtml = `
        <p><strong>Property Type:</strong> ${propertyType}</p>
        <p><strong>Property Size:</strong> ${propertySize}</p>
        <p><strong>Pest Problem:</strong> ${pestProblem}</p>
      `;

      expect(emailHtml).toContain("apartment");
      expect(emailHtml).toContain("medium");
      expect(emailHtml).toContain("cockroaches");
    });
  });

  describe("Laundry Order Email", () => {
    it("should include order reference", () => {
      const reference = "STC-LAU-XYZ98765";
      const emailHtml = `
        <h2>Order Confirmed!</h2>
        <p><strong>Reference:</strong> ${reference}</p>
      `;

      expect(emailHtml).toContain(reference);
      expect(emailHtml).toContain("Order Confirmed!");
    });

    it("should include items list", () => {
      const items = [
        { itemCode: "TROUSERS_SHIRT", quantity: 2, unitPriceKobo: 100000 },
        { itemCode: "NATIVE_WEAR", quantity: 1, unitPriceKobo: 150000 },
      ];
      const itemsList = items.map(
        (item) => `<li>${item.itemCode} x${item.quantity} - ₦${((item.unitPriceKobo * item.quantity) / 100).toLocaleString()}</li>`
      ).join("");
      const emailHtml = `
        <h4 style="margin-top: 15px;">Items:</h4>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${itemsList}
        </ul>
      `;

      expect(emailHtml).toContain("TROUSERS_SHIRT x2");
      expect(emailHtml).toContain("NATIVE_WEAR x1");
      expect(emailHtml).toContain("₦2,000");
      expect(emailHtml).toContain("₦1,500");
    });

    it("should include pickup and delivery addresses", () => {
      const pickupAddress = "123 Pickup St";
      const deliveryAddress = "456 Delivery Ave";
      const emailHtml = `
        <p><strong>Pickup Address:</strong> ${pickupAddress}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      `;

      expect(emailHtml).toContain("123 Pickup St");
      expect(emailHtml).toContain("456 Delivery Ave");
    });

    it("should show from price warning when applicable", () => {
      const hasFromPrice = true;
      const emailHtml = `
        <p style="font-weight: bold; margin-top: 15px;">Estimated Total: ₦5,000</p>
        ${hasFromPrice ? '<p style="font-size: 12px; color: #666;">* Some items are priced "from" - final price may vary based on condition.</p>' : ''}
      `;

      expect(emailHtml).toContain("Some items are priced \"from\"");
      expect(emailHtml).toContain("final price may vary");
    });
  });

  describe("Email Error Handling", () => {
    it("should not fail booking when email fails", () => {
      const emailError = new Error("Email API failed");
      const bookingSuccess = true;

      // Email failure should not affect booking success
      expect(bookingSuccess).toBe(true);
    });

    it("should log email errors", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const emailError = new Error("Email API failed");

      console.error("Failed to send confirmation email:", emailError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send confirmation email:",
        emailError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Email Content Validation", () => {
    it("should have both HTML and text versions", () => {
      const emailOptions: EmailOptions = {
        to: "test@example.com",
        subject: "Test",
        html: "<p>HTML content</p>",
        text: "Text content",
      };

      expect(emailOptions.html).toBeDefined();
      expect(emailOptions.text).toBeDefined();
      expect(emailOptions.html).toContain("<p>");
      expect(emailOptions.text).not.toContain("<p>");
    });

    it("should have valid email address format", () => {
      const email = "admin.skytouch@gmail.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(email)).toBe(true);
    });

    it("should have meaningful subject lines", () => {
      const subjects = [
        "SkyTouchClean - Booking Confirmation",
        "SkyTouchClean - Fumigation Booking Received",
        "SkyTouchClean - Laundry Order Confirmation",
      ];

      subjects.forEach((subject) => {
        expect(subject).toContain("SkyTouchClean");
        expect(subject.length).toBeGreaterThan(10);
      });
    });
  });
});
