import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Missing webhook secret", {
      status: 500,
    });
  }

  const payload = await req.json();

  const headerPayload = await headers();

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  };


  const wh = new Webhook(WEBHOOK_SECRET);

  let event;

  try {
    event = wh.verify(
      JSON.stringify(payload),
      svixHeaders
    ) as {
      type: string;
      data: any;
    };
  } catch {
    return new Response("Invalid webhook", {
      status: 400,
    });
  }


  if (event.type === "user.created") {
    const user = event.data;


    try {
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.email_addresses[0].email_address,
          name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        },
      });
    } catch (err) {
      console.error(err);
      return new Response("Database error", { status: 500 });
    }
  }


  if (event.type === "user.updated") {
    const user = event.data;

    await prisma.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        email: user.email_addresses[0].email_address,
        name:
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      },
    });
  }


  return Response.json({
    success: true,
  });
}