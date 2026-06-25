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

  // CLEAN DATABASE (optional for testing)
  await prisma.equipmentRegistryItem.deleteMany();
  await prisma.productionBatch.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.company.deleteMany();
  await prisma.product.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.user.deleteMany();


  // USERS
  const admin = await prisma.user.create({
    data: {
      clerkId: "user_admin_test",
      email: "admin@roast.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      clerkId: "user_customer_test",
      email: "customer@roast.com",
      name: "John Customer",
      role: "CUSTOMER",
    },
  });


  // COMPANY

  const company = await prisma.company.create({
    data: {
      name: "Roast Cafe LLC",
      users: {
        connect: {
          id: customer.id,
        },
      },
    },
  });


  // ADDRESS

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      companyId: company.id,
      line1: "123 Coffee Street",
      line2: "Suite 200",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "US",
    },
  });



  // CERTIFICATION

  const cert = await prisma.certification.create({
    data: {
      type: "NSF",
      listingNumber: "NSF-12345",
      documentUrl: "https://example.com/nsf.pdf",
      verifiedAt: new Date(),
    },
  });



  // PRODUCTS

  const machine = await prisma.product.create({
    data: {
      name: "RoastMaster X1 Espresso Machine",
      slug: "roastmaster-x1",
      description:
        "Commercial espresso machine sourced directly from certified factory.",
      category: "EQUIPMENT",
      priceCents: 850000,
      depositPercent: 30,
      leadTimeDays: 21,
      certificationId: cert.id,
      images: [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
      ],
    },
  });


  const grinder = await prisma.product.create({
    data: {
      name: "Industrial Coffee Grinder",
      slug: "industrial-grinder",
      description:
        "Heavy duty grinder for commercial coffee shops.",
      category: "EQUIPMENT",
      priceCents: 250000,
      depositPercent: 20,
      leadTimeDays: 14,
      certificationId: cert.id,
      images: [],
    },
  });


  const packaging = await prisma.product.create({
    data: {
      name: "Premium Coffee Bags",
      slug: "premium-coffee-bags",
      description:
        "Monthly packaging supply subscription.",
      category: "PACKAGING",
      priceCents: 4500,
      isSubscribable: true,
      images: [],
    },
  });



  // ORDER

  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      addressId: address.id,
      status: "PENDING_DEPOSIT",

      estimatedShipDate: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 21
      ),

      items: {
        create: [
          {
            productId: machine.id,
            quantity: 1,
            unitPriceCents: machine.priceCents,
          },
          {
            productId: grinder.id,
            quantity: 1,
            unitPriceCents: grinder.priceCents,
          },
        ],
      },
    },
  });



  // SUBSCRIPTION

  await prisma.subscription.create({
    data: {
      userId: customer.id,
      productId: packaging.id,
      stripeSubscriptionId: "sub_test_roast_001",
      status: "active",
      intervalDays: 30,
    },
  });



  // EQUIPMENT REGISTRY

  await prisma.equipmentRegistryItem.create({
    data: {
      userId: customer.id,
      productId: machine.id,
      orderId: order.id,
      installedAt: new Date(),
      warrantyEndsAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 365
      ),
    },
  });



  // PRODUCTION

  await prisma.productionBatch.create({
    data: {
      productId: machine.id,
      quantity: 25,
      status: "in_production",
      eta: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 20
      ),
    },
  });


  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });