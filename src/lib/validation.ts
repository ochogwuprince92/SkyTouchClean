import { z } from "zod";

// Nigerian phone format: +234 or 0 followed by 10 digits
const nigerianPhoneRegex = /^(\+234|0)[789]\d{9}$/;

export const laundryOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(nigerianPhoneRegex, "Invalid Nigerian phone number"),
  email: z.string().email("Invalid email address"),
  pickupAddress: z.string().min(5, "Address must be at least 5 characters"),
  deliveryAddress: z.string().min(5, "Address must be at least 5 characters"),
  preferredPickupDate: z.string().min(1, "Pickup date is required"),
  preferredPickupTime: z.string().min(1, "Pickup time is required"),
  items: z.array(
    z.object({
      itemCode: z.string().min(1, "Item code is required"),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "At least one item is required"),
  customerNotes: z.string().optional(),
  honeypot: z.string().optional(), // For bot detection
});

export const cleaningBookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(nigerianPhoneRegex, "Invalid Nigerian phone number"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  bedroomCount: z.number().int().min(1).max(4, "Bedroom count must be 1-4"),
  bookingPlan: z.enum(["MONTHLY", "SINGLE_VISIT"]),
  materialsOption: z.enum(["CUSTOMER_PROVIDES", "SKYTOUCH_PROVIDES"]),
  requiresDeepCleaning: z.boolean().optional(),
  heavilySoiled: z.boolean().optional(),
  customerNotes: z.string().optional(),
  honeypot: z.string().optional(),
});

export const fumigationBookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(nigerianPhoneRegex, "Invalid Nigerian phone number"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  propertyType: z.enum(["apartment", "house", "office", "warehouse", "other"]),
  propertySize: z.enum(["small", "medium", "large", "xlarge"]),
  pestProblem: z.enum([
    "cockroaches",
    "rodents",
    "termites",
    "bedbugs",
    "ants",
    "mosquitoes",
    "other",
  ]),
  customerNotes: z.string().optional(),
  honeypot: z.string().optional(),
});
