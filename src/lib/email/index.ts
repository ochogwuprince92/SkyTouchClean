import { EmailProvider } from "./types";
import { ConsoleEmailAdapter } from "./console-adapter";
import { ResendEmailAdapter } from "./resend-adapter";
import { BrevoEmailAdapter } from "./brevo-adapter";

let emailProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!emailProvider) {
    // Check if Brevo is configured (priority)
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoApiUrl = process.env.BREVO_API_URL;
    const brevoSenderName = process.env.BREVO_SENDER_NAME;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;

    if (brevoApiKey && brevoApiUrl && brevoSenderName && brevoSenderEmail) {
      // Use Brevo in production
      emailProvider = new BrevoEmailAdapter(
        brevoApiKey,
        brevoApiUrl,
        brevoSenderName,
        brevoSenderEmail
      );
      console.log("Using Brevo email adapter");
    } else if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      // Fallback to Resend
      emailProvider = new ResendEmailAdapter(
        process.env.RESEND_API_KEY,
        process.env.RESEND_FROM_EMAIL
      );
      console.log("Using Resend email adapter");
    } else {
      // Fall back to console adapter in development
      emailProvider = new ConsoleEmailAdapter();
      console.log("Using console email adapter (development mode)");
    }
  }
  return emailProvider;
}

export function setEmailProvider(provider: EmailProvider): void {
  emailProvider = provider;
}
