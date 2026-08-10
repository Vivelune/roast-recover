import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireMobileAdmin } from "@/lib/mobile-auth";

export async function GET(req: Request) {

  console.log("===== MOBILE DASHBOARD REQUEST =====");


  console.log(
    "HEADERS:",
    Object.fromEntries(req.headers.entries())
  );


  const authHeader = req.headers.get("authorization");

  console.log(
    "AUTHORIZATION HEADER:",
    authHeader
  );


  console.log("===== REQUIRE MOBILE ADMIN =====");


  const adminCheck = await requireMobileAdmin();


  console.log(
    "ADMIN CHECK RESULT:",
    adminCheck
  );


  if (adminCheck.error) {

    console.log(
      "AUTH FAILED:",
      adminCheck.error,
      adminCheck.status
    );


    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }


  console.log(
    "AUTH PASSED USER:",
    adminCheck.userId
  );


  const now = new Date();

  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  const todayStart = new Date(now);

  todayStart.setHours(0, 0, 0, 0);


  const [
    revenueOrders,
    pendingDepositCount,
    awaitingBalanceCount,
    todayOrders,
    newLeads,
    recentOrders,
  ] = await Promise.all([

    prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        status: {
          in: [
            "PAID",
            "AWAITING_BALANCE",
            "IN_PRODUCTION",
            "SHIPPED",
            "DELIVERED",
          ],
        },
      },
      include: {
        items: true
      },
    }),


    prisma.order.count({
      where: {
        status: "PENDING_DEPOSIT"
      }
    }),


    prisma.order.count({
      where: {
        status: "AWAITING_BALANCE"
      }
    }),


    prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    }),


    prisma.lead.count({
      where: {
        status: "NEW"
      }
    }),


    prisma.order.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 8,
      include: {
        items: {
          include: {
            product: {
              select: {
                name:true
              }
            }
          }
        },
        user: {
          select:{
            email:true,
            name:true
          }
        },
      },
    }),

  ]);


  console.log("REVENUE ORDERS:", revenueOrders.length);
  console.log("PENDING DEPOSITS:", pendingDepositCount);
  console.log("AWAITING BALANCE:", awaitingBalanceCount);
  console.log("TODAY ORDERS:", todayOrders);
  console.log("NEW LEADS:", newLeads);
  console.log("RECENT ORDERS:", recentOrders.length);



  const totalRevenue = revenueOrders.reduce((sum, o) => {

    return sum + o.items.reduce((s, i) => {

      if (i.depositPercent) {

        return (
          s +
          Math.round(
            (i.unitPriceCents * i.depositPercent) / 100
          ) *
          i.quantity
        );

      }


      return s + i.unitPriceCents * i.quantity;

    },0);


  },0);



  console.log(
    "TOTAL REVENUE:",
    totalRevenue
  );



  return NextResponse.json({

    stats:{
      revenue30d:totalRevenue,
      pendingDeposit:pendingDepositCount,
      awaitingBalance:awaitingBalanceCount,
      ordersToday:todayOrders,
      newLeads,
    },


    recentOrders:recentOrders.map((o)=>({

      id:o.id,

      shortId:o.id
        .slice(-8)
        .toUpperCase(),

      email:o.user.email,

      name:o.user.name,

      status:o.status,

      firstItem:o.items[0]?.product.name ?? "—",

      itemCount:o.items.length,

      createdAt:o.createdAt.toISOString(),

    })),

  });

}