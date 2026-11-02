import "dotenv/config";
import { getDb } from "../src/lib/mongodb/client";
import { ServiceRepository } from "../src/server/repositories/services";
import { ServicePriceRepository } from "../src/server/repositories/service-prices";

export const runtime = "nodejs";

// Expected data from docs/02 (amounts in kobo)
const EXPECTED_SERVICES = [
  { code: "HOME_CLEANING", name: "Home Cleaning", pricingMode: "FIXED" },
  { code: "LAUNDRY", name: "Laundry Services", pricingMode: "FIXED" },
  { code: "FUMIGATION", name: "Fumigation", pricingMode: "QUOTE" },
];

const EXPECTED_PRICES = [
  { serviceCode: "HOME_CLEANING", itemCode: "HC_1BD_MONTHLY", label: "1 Bedroom (Monthly Package)", unit: "MONTH", amountKobo: 2500000, isFromPrice: false },
  { serviceCode: "HOME_CLEANING", itemCode: "HC_1BD_SINGLE", label: "1 Bedroom (Single Visit)", unit: "VISIT", amountKobo: 700000, isFromPrice: false },
  { serviceCode: "HOME_CLEANING", itemCode: "HC_2BD_MONTHLY", label: "2 Bedrooms (Monthly Package)", unit: "MONTH", amountKobo: 3000000, isFromPrice: false },
  { serviceCode: "HOME_CLEANING", itemCode: "HC_2BD_SINGLE", label: "2 Bedrooms (Single Visit)", unit: "VISIT", amountKobo: 800000, isFromPrice: false },
  { serviceCode: "HOME_CLEANING", itemCode: "HC_3BD_MONTHLY", label: "3 Bedrooms (Monthly Package)", unit: "MONTH", amountKobo: 3500000, isFromPrice: false },
  { serviceCode: "HOME_CLEANING", itemCode: "HC_3BD_SINGLE", label: "3 Bedrooms (Single Visit)", unit: "VISIT", amountKobo: 1000000, isFromPrice: false },
  { serviceCode: "HOME_CLEANING", itemCode: "HC_4BD_MONTHLY", label: "4 Bedrooms (Monthly Package)", unit: "MONTH", amountKobo: 4500000, isFromPrice: false },
  { serviceCode: "HOME_CLEANING", itemCode: "HC_4BD_SINGLE", label: "4 Bedrooms (Single Visit)", unit: "VISIT", amountKobo: 1500000, isFromPrice: false },
  { serviceCode: "LAUNDRY", itemCode: "LA_TROUSERS_SHIRT", label: "Trousers and Shirt", unit: "ITEM", amountKobo: 100000, isFromPrice: false },
  { serviceCode: "LAUNDRY", itemCode: "LA_NATIVE_WEAR", label: "Native Wears", unit: "SET", amountKobo: 150000, isFromPrice: false },
  { serviceCode: "LAUNDRY", itemCode: "LA_AGBADA", label: "Agbada (Complete Set)", unit: "SET", amountKobo: 300000, isFromPrice: false },
  { serviceCode: "LAUNDRY", itemCode: "LA_BEDSPREAD", label: "Bedspread", unit: "ITEM", amountKobo: 150000, isFromPrice: false },
  { serviceCode: "LAUNDRY", itemCode: "LA_DUVET", label: "Duvets", unit: "ITEM", amountKobo: 350000, isFromPrice: true },
  { serviceCode: "FUMIGATION", itemCode: "FU_QUOTE", label: "Fumigation Quotation", unit: "QUOTE", amountKobo: 0, isFromPrice: false },
];

async function testSeed() {
  console.log("Testing seeded data against docs/02...\n");

  const db = await getDb();
  const serviceRepo = new ServiceRepository(db);
  const priceRepo = new ServicePriceRepository(db);

  let hasErrors = false;

  // Test services
  console.log("Testing services...");
  const services = await serviceRepo.findActive();

  if (services.length !== EXPECTED_SERVICES.length) {
    console.error(`  ✗ Expected ${EXPECTED_SERVICES.length} services, found ${services.length}`);
    hasErrors = true;
  }

  for (const expected of EXPECTED_SERVICES) {
    const service = services.find((s) => s.code === expected.code);
    if (!service) {
      console.error(`  ✗ Missing service: ${expected.code}`);
      hasErrors = true;
      continue;
    }

    if (service.name !== expected.name) {
      console.error(`  ✗ Service ${expected.code} name mismatch: expected "${expected.name}", got "${service.name}"`);
      hasErrors = true;
    }

    if (service.pricingMode !== expected.pricingMode) {
      console.error(`  ✗ Service ${expected.code} pricingMode mismatch: expected "${expected.pricingMode}", got "${service.pricingMode}"`);
      hasErrors = true;
    }

    if (!service.isActive) {
      console.error(`  ✗ Service ${expected.code} is not active`);
      hasErrors = true;
    }

    console.log(`  ✓ Service ${expected.code} matches`);
  }

  // Test prices
  console.log("\nTesting service prices...");
  const prices = await priceRepo.findActive();

  if (prices.length !== EXPECTED_PRICES.length) {
    console.error(`  ✗ Expected ${EXPECTED_PRICES.length} prices, found ${prices.length}`);
    hasErrors = true;
  }

  for (const expected of EXPECTED_PRICES) {
    const service = await serviceRepo.findByCode(expected.serviceCode);
    if (!service) {
      console.error(`  ✗ Service not found for price: ${expected.itemCode}`);
      hasErrors = true;
      continue;
    }

    const price = await priceRepo.findByServiceIdAndItemCode(service._id!, expected.itemCode);
    if (!price) {
      console.error(`  ✗ Missing price: ${expected.itemCode}`);
      hasErrors = true;
      continue;
    }

    if (price.label !== expected.label) {
      console.error(`  ✗ Price ${expected.itemCode} label mismatch: expected "${expected.label}", got "${price.label}"`);
      hasErrors = true;
    }

    if (price.unit !== expected.unit) {
      console.error(`  ✗ Price ${expected.itemCode} unit mismatch: expected "${expected.unit}", got "${price.unit}"`);
      hasErrors = true;
    }

    if (price.amountKobo !== expected.amountKobo) {
      console.error(`  ✗ Price ${expected.itemCode} amountKobo mismatch: expected ${expected.amountKobo}, got ${price.amountKobo}`);
      hasErrors = true;
    }

    if (price.isFromPrice !== expected.isFromPrice) {
      console.error(`  ✗ Price ${expected.itemCode} isFromPrice mismatch: expected ${expected.isFromPrice}, got ${price.isFromPrice}`);
      hasErrors = true;
    }

    if (!price.isActive) {
      console.error(`  ✗ Price ${expected.itemCode} is not active`);
      hasErrors = true;
    }

    console.log(`  ✓ Price ${expected.itemCode} matches`);
  }

  // Test monthly packages include 4 visits (business logic note)
  console.log("\nBusiness logic checks...");
  const homeCleaning = await serviceRepo.findByCode("HOME_CLEANING");
  if (homeCleaning) {
    const monthlyPrices = await priceRepo.findActiveByServiceId(homeCleaning._id!);
    const monthlyItems = monthlyPrices.filter((p) => p.unit === "MONTH");
    console.log(`  ✓ Found ${monthlyItems.length} monthly packages (should be 4)`);
    if (monthlyItems.length !== 4) {
      console.error(`  ✗ Expected 4 monthly packages, found ${monthlyItems.length}`);
      hasErrors = true;
    }
  }

  // Test duvet is "from" price
  const laundry = await serviceRepo.findByCode("LAUNDRY");
  if (laundry) {
    const duvetPrice = await priceRepo.findByServiceIdAndItemCode(laundry._id!, "LA_DUVET");
    if (duvetPrice) {
      if (duvetPrice.isFromPrice) {
        console.log(`  ✓ Duvet is marked as "from" price`);
      } else {
        console.error(`  ✗ Duvet should be marked as "from" price`);
        hasErrors = true;
      }
    }
  }

  // Test fumigation is quote-only
  const fumigation = await serviceRepo.findByCode("FUMIGATION");
  if (fumigation) {
    if (fumigation.pricingMode === "QUOTE") {
      console.log(`  ✓ Fumigation is quote-only`);
    } else {
      console.error(`  ✗ Fumigation should be quote-only`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.log("\n❌ Seed data validation failed");
    process.exit(1);
  } else {
    console.log("\n✅ All seed data matches docs/02 exactly");
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  testSeed().catch((error) => {
    console.error("Error testing seed:", error);
    process.exit(1);
  });
}
