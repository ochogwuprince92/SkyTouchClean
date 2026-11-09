import { EmailProvider, EmailOptions } from "./types";

/**
 * Brevo (formerly Sendinblue) email adapter for production.
 * Sends real emails using the Brevo API.
 */
export class BrevoEmailAdapter implements EmailProvider {
  private apiKey: string;
  private apiUrl: string;
  private senderName: string;
  private senderEmail: string;

  constructor(apiKey: string, apiUrl: string, senderName: string, senderEmail: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.senderName = senderName;
    this.senderEmail = senderEmail;
  }

  async send(options: EmailOptions): Promise<void> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: this.senderName,
          email: this.senderEmail,
        },
        to: [
          {
            email: options.to,
          },
        ],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Brevo API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json();
    console.log("Email sent successfully via Brevo:", result.messageId || result);
  }
}
