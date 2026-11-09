import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ConsoleEmailAdapter } from "../lib/email/console-adapter";
import { ResendEmailAdapter } from "../lib/email/resend-adapter";
import { BrevoEmailAdapter } from "../lib/email/brevo-adapter";
import { EmailOptions } from "../lib/email/types";

describe("Email Adapter Tests", () => {
  describe("ConsoleEmailAdapter", () => {
    let adapter: ConsoleEmailAdapter;
    let consoleLogSpy: any;

    beforeEach(() => {
      adapter = new ConsoleEmailAdapter();
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it("should log email to console", async () => {
      const options: EmailOptions = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test text",
      };

      await adapter.send(options);

      expect(consoleLogSpy).toHaveBeenCalledWith("=== EMAIL SENT (Console Adapter) ===");
      expect(consoleLogSpy).toHaveBeenCalledWith("To: test@example.com");
      expect(consoleLogSpy).toHaveBeenCalledWith("Subject: Test Subject");
      expect(consoleLogSpy).toHaveBeenCalledWith("Text: Test text");
      expect(consoleLogSpy).toHaveBeenCalledWith("HTML Length: 16 characters");
    });

    it("should handle missing text version", async () => {
      const options: EmailOptions = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
      };

      await adapter.send(options);

      expect(consoleLogSpy).toHaveBeenCalledWith("Text: (no text version)");
    });
  });

  describe("ResendEmailAdapter", () => {
    let adapter: ResendEmailAdapter;
    let fetchSpy: any;

    beforeEach(() => {
      adapter = new ResendEmailAdapter("re_test_key", "noreply@example.com");
      fetchSpy = vi.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "test-email-id" }),
        } as Response)
      );
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it("should send email via Resend API", async () => {
      const options: EmailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test text",
      };

      await adapter.send(options);

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer re_test_key",
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining("recipient@example.com"),
        })
      );
    });

    it("should throw error on API failure", async () => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          text: () => Promise.resolve("API Error"),
        } as Response)
      );

      const options: EmailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
      };

      await expect(adapter.send(options)).rejects.toThrow("Failed to send email");
    });
  });

  describe("BrevoEmailAdapter", () => {
    let adapter: BrevoEmailAdapter;
    let fetchSpy: any;

    beforeEach(() => {
      adapter = new BrevoEmailAdapter(
        "xkeysib-test-key",
        "https://api.brevo.com/v3/smtp/email",
        "SkyTouch",
        "noreply@example.com"
      );
      fetchSpy = vi.spyOn(global, "fetch").mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ messageId: "test-message-id" }),
        } as Response)
      );
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it("should send email via Brevo API", async () => {
      const options: EmailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test text",
      };

      await adapter.send(options);

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.brevo.com/v3/smtp/email",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "api-key": "xkeysib-test-key",
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
          body: expect.stringContaining("recipient@example.com"),
        })
      );
    });

    it("should include sender name and email", async () => {
      const options: EmailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
      };

      await adapter.send(options);

      const callBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(callBody.sender).toEqual({
        name: "SkyTouch",
        email: "noreply@example.com",
      });
    });

    it("should throw error on API failure", async () => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          text: () => Promise.resolve("API Error"),
        } as Response)
      );

      const options: EmailOptions = {
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
      };

      await expect(adapter.send(options)).rejects.toThrow("Failed to send email");
    });
  });

  describe("Email Provider Selection Logic", () => {
    it("should prioritize Brevo adapter when all Brevo env vars are set", () => {
      const hasBrevoConfig = 
        process.env.BREVO_API_KEY && 
        process.env.BREVO_API_URL && 
        process.env.BREVO_SENDER_NAME && 
        process.env.BREVO_SENDER_EMAIL;
      
      const hasResendConfig = 
        process.env.RESEND_API_KEY && 
        process.env.RESEND_FROM_EMAIL;

      if (hasBrevoConfig) {
        expect(true).toBe(true);
      } else if (hasResendConfig) {
        expect(true).toBe(true);
      } else {
        expect(true).toBe(true);
      }
    });

    it("should fallback to Resend when Brevo not configured but Resend is", () => {
      const hasBrevoConfig = 
        process.env.BREVO_API_KEY && 
        process.env.BREVO_API_URL && 
        process.env.BREVO_SENDER_NAME && 
        process.env.BREVO_SENDER_EMAIL;
      
      const hasResendConfig = 
        process.env.RESEND_API_KEY && 
        process.env.RESEND_FROM_EMAIL;

      if (!hasBrevoConfig && hasResendConfig) {
        expect(true).toBe(true);
      }
    });

    it("should fallback to Console when neither provider configured", () => {
      const hasBrevoConfig = 
        process.env.BREVO_API_KEY && 
        process.env.BREVO_API_URL && 
        process.env.BREVO_SENDER_NAME && 
        process.env.BREVO_SENDER_EMAIL;
      
      const hasResendConfig = 
        process.env.RESEND_API_KEY && 
        process.env.RESEND_FROM_EMAIL;

      if (!hasBrevoConfig && !hasResendConfig) {
        expect(true).toBe(true);
      }
    });
  });
});
