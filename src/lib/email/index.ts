import { EmailProvider } from "./types";
import { ConsoleEmailAdapter } from "./console-adapter";

let emailProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!emailProvider) {
    // In development, use console adapter
    // In production, this would be configured based on EMAIL_PROVIDER env var
    emailProvider = new ConsoleEmailAdapter();
  }
  return emailProvider;
}

export function setEmailProvider(provider: EmailProvider): void {
  emailProvider = provider;
}
