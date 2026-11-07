import "dotenv/config";
import { MongoClient, Db } from "mongodb";
import { ServiceRepository } from "../src/server/repositories/services";
import { ServicePriceRepository } from "../src/server/repositories/service-prices";
import { StaffRepository } from "../src/server/repositories/staff";
import argon2 from "argon2";

export const runtime = "nodejs";

// Direct MongoDB connection for seed script (bypasses Next.js server context check)
let client: MongoClient | null = null;
let db: Db | null = null;

async function getDb(): Promise<Db> {
  if (!db) {
    const uri = process.env.MONGODB_URI || "";
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.MONGODB_DB || "skytouchclean");
  }
  return db;
}

async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Seed data from docs/02 exactly (amounts in kobo)
const SERVICES = [
  {
    code: "HOME_CLEANING",
    name: "Home Cleaning",
    description: "Professional cleaning for homes and offices",
    pricingMode: "FIXED" as const,
  },
  {
    code: "LAUNDRY",
    name: "Laundry Services",
    description: "Expert laundry for all garments",
    pricingMode: "FIXED" as const,
  },
  {
    code: "FUMIGATION",
    name: "Fumigation",
    description: "Professional pest control services",
    pricingMode: "QUOTE" as const,
  },
];

const SERVICE_PRICES = [
  // Home Cleaning - Monthly
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_1BD_MONTHLY",
    label: "1 Bedroom (Monthly Package)",
    unit: "MONTH" as const,
    amountKobo: 2500000,
    isFromPrice: false,
  },
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_1BD_SINGLE",
    label: "1 Bedroom (Single Visit)",
    unit: "VISIT" as const,
    amountKobo: 700000,
    isFromPrice: false,
  },
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_2BD_MONTHLY",
    label: "2 Bedrooms (Monthly Package)",
    unit: "MONTH" as const,
    amountKobo: 3000000,
    isFromPrice: false,
  },
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_2BD_SINGLE",
    label: "2 Bedrooms (Single Visit)",
    unit: "VISIT" as const,
    amountKobo: 800000,
    isFromPrice: false,
  },
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_3BD_MONTHLY",
    label: "3 Bedrooms (Monthly Package)",
    unit: "MONTH" as const,
    amountKobo: 3500000,
    isFromPrice: false,
  },
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_3BD_SINGLE",
    label: "3 Bedrooms (Single Visit)",
    unit: "VISIT" as const,
    amountKobo: 1000000,
    isFromPrice: false,
  },
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_4BD_MONTHLY",
    label: "4 Bedrooms (Monthly Package)",
    unit: "MONTH" as const,
    amountKobo: 4500000,
    isFromPrice: false,
  },
  {
    serviceCode: "HOME_CLEANING",
    itemCode: "HC_4BD_SINGLE",
    label: "4 Bedrooms (Single Visit)",
    unit: "VISIT" as const,
    amountKobo: 1500000,
    isFromPrice: false,
  },
  // Laundry
  {
    serviceCode: "LAUNDRY",
    itemCode: "LA_TROUSERS_SHIRT",
    label: "Trousers and Shirt",
    unit: "ITEM" as const,
    amountKobo: 100000,
    isFromPrice: false,
  },
  {
    serviceCode: "LAUNDRY",
    itemCode: "LA_NATIVE_WEAR",
    label: "Native Wears",
    unit: "SET" as const,
    amountKobo: 150000,
    isFromPrice: false,
  },
  {
    serviceCode: "LAUNDRY",
    itemCode: "LA_AGBADA",
    label: "Agbada (Complete Set)",
    unit: "SET" as const,
    amountKobo: 300000,
    isFromPrice: false,
  },
  {
    serviceCode: "LAUNDRY",
    itemCode: "LA_BEDSPREAD",
    label: "Bedspread",
    unit: "ITEM" as const,
    amountKobo: 150000,
    isFromPrice: false,
  },
  {
    serviceCode: "LAUNDRY",
    itemCode: "LA_DUVET",
    label: "Duvets",
    unit: "ITEM" as const,
    amountKobo: 350000,
    isFromPrice: true,
  },
  // Fumigation
  {
    serviceCode: "FUMIGATION",
    itemCode: "FU_QUOTE",
    label: "Fumigation Quotation",
    unit: "QUOTE" as const,
    amountKobo: 0,
    isFromPrice: false,
  },
];

async function seed() {
  console.log("Seeding database...");

  const db = await getDb();
  const serviceRepo = new ServiceRepository(db);
  const priceRepo = new ServicePriceRepository(db);
  const staffRepo = new StaffRepository(db);

  // Seed services (idempotent)
  console.log("\nSeeding services...");
  for (const serviceData of SERVICES) {
    const existing = await serviceRepo.findByCode(serviceData.code);
    if (!existing) {
      await serviceRepo.create({
        ...serviceData,
        isActive: true,
      });
      console.log(`  ✓ Created service: ${serviceData.code}`);
    } else {
      console.log(`  - Service already exists: ${serviceData.code}`);
    }
  }

  // Seed service prices (idempotent)
  console.log("\nSeeding service prices...");
  for (const priceData of SERVICE_PRICES) {
    const service = await serviceRepo.findByCode(priceData.serviceCode);
    if (!service) {
      console.error(`  ✗ Service not found: ${priceData.serviceCode}`);
      continue;
    }

    const existing = await priceRepo.findByServiceIdAndItemCode(
      service._id!,
      priceData.itemCode
    );
    if (!existing) {
      await priceRepo.create({
        ...priceData,
        serviceId: service._id!,
        isActive: true,
        effectiveFrom: new Date(),
      });
      console.log(`  ✓ Created price: ${priceData.itemCode}`);
    } else {
      console.log(`  - Price already exists: ${priceData.itemCode}`);
    }
  }

  // Seed first admin from env (idempotent)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (adminEmail && adminPassword) {
    console.log("\nSeeding first admin...");
    const existingAdmin = await staffRepo.findByEmail(adminEmail);
    if (!existingAdmin) {
      const passwordHash = await argon2.hash(adminPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      await staffRepo.create({
        fullName: adminName,
        phone: "00000000000",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      });
      console.log(`  ✓ Created admin: ${adminEmail}`);
    } else {
      console.log(`  - Admin already exists: ${adminEmail}`);
    }
  } else {
    console.log("\nSkipping admin seed (ADMIN_EMAIL and ADMIN_PASSWORD not set)");
  }

  await closeDb();
  console.log("\n✅ Database seeded successfully");
}

// Run if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("\nDone");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}
