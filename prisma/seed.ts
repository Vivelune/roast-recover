import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});


async function main() {
  console.log("🌱 Seeding database...");

  // -----------------------
  // USERS
  // -----------------------
  const admin = await prisma.user.create({
    data: {
      email: "admin@roast.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@roast.com",
      name: "John Customer",
      role: "CUSTOMER",
    },
  });

  // -----------------------
  // COMPANY + ADDRESS
  // -----------------------
  const company = await prisma.company.create({
    data: {
      name: "Roast Cafe LLC",
      users: {
        connect: [{ id: customer.id }],
      },
    },
  });

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      companyId: company.id,
      line1: "123 Coffee St",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "US",
    },
  });

  // -----------------------
  // CERTIFICATION
  // -----------------------
  const cert = await prisma.certification.create({
    data: {
      type: "NSF",
      listingNumber: "NSF-12345",
      documentUrl: "https://example.com/cert.pdf",
      verifiedAt: new Date(),
    },
  });

  // -----------------------
  // PRODUCTS
  // -----------------------
  const espressoMachine = await prisma.product.create({
    data: {
      name: "Espresso Machine X1",
      slug: "espresso-machine-x1",
      description: "High-end commercial espresso machine",
      category: "EQUIPMENT",
      priceCents: 500000,
      depositPercent: 30,
      leadTimeDays: 21,
      certificationId: cert.id,
      images: [],
    },
  });

  const beansSubscription = await prisma.product.create({
    data: {
      name: "Roast Beans Monthly",
      slug: "beans-monthly",
      description: "Monthly coffee bean subscription",
      category: "PACKAGING",
      priceCents: 2500,
      isSubscribable: true,
      images: [],
    },
  });

  // -----------------------
  // ORDER
  // -----------------------
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      addressId: address.id,
      status: "PENDING_DEPOSIT",
      items: {
        create: [
          {
            productId: espressoMachine.id,
            quantity: 1,
            unitPriceCents: espressoMachine.priceCents,
          },
        ],
      },
      depositPaidAt: null,
      balancePaidAt: null,
      estimatedShipDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
    },
  });

  // -----------------------
  // SUBSCRIPTION
  // -----------------------
  await prisma.subscription.create({
    data: {
      userId: customer.id,
      productId: beansSubscription.id,
      stripeSubscriptionId: "sub_test_123",
      status: "active",
      intervalDays: 30,
    },
  });

  // -----------------------
  // EQUIPMENT REGISTRY
  // -----------------------
  await prisma.equipmentRegistryItem.create({
    data: {
      userId: customer.id,
      productId: espressoMachine.id,
      orderId: order.id,
      installedAt: null,
      warrantyEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
  });

  // -----------------------
  // PRODUCTION BATCH
  // -----------------------
  await prisma.productionBatch.create({
    data: {
      productId: espressoMachine.id,
      quantity: 10,
      status: "planned",
      eta: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });