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

  // Email (optional for now)
  EMAIL_PROVIDER: z.enum(["resend", "sendgrid"]).optional(),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),

  // First admin (for seed)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_NAME: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.flatten().fieldErrors);
  console.error("\nMake sure to set required environment variables.");
  console.error("For development, copy .env.test to .env.local and configure as needed.");
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
