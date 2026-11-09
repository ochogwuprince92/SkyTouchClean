import { z } from "zod";

const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().url("Invalid MongoDB URI"),
  MONGODB_DB: z.string().min(1, "MongoDB database name is required"),

  // Session
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),

  // Paystack
  PAYSTACK_SECRET_KEY: z.string().min(1, "Paystack secret key is required"),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1, "Paystack public key is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url("Invalid site URL"),

  // Email - Brevo (optional - if not set, console adapter will be used)
  BREVO_API_KEY: z.string().optional(),
  BREVO_API_URL: z.string().optional(),
  BREVO_SENDER_NAME: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().optional(),

  // Email - Resend (alternative, optional)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // First admin (for seed)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_NAME: z.string().optional(),
});

// For build time, use defaults for optional vars if not set
const buildEnv = {
  ...process.env,
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  BREVO_API_URL: process.env.BREVO_API_URL || "",
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || "",
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "",
};

const _env = envSchema.safeParse(buildEnv);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.flatten().fieldErrors);
  console.error("\nMake sure to set required environment variables.");
  console.error("For development, copy .env.test to .env.local and configure as needed.");
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
