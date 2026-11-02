import { EmailProvider, EmailOptions } from "./types";

/**
 * Console/log adapter for development.
 * Logs email content instead of sending real emails.
 */
export class ConsoleEmailAdapter implements EmailProvider {
  async send(options: EmailOptions): Promise<void> {
    console.log("=== EMAIL SENT (Console Adapter) ===");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text: ${options.text || "(no text version)"}`);
    console.log(`HTML Length: ${options.html.length} characters`);
    console.log("========================================");
  }
}
