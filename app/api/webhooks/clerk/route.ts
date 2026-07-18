import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Clerk webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // User created — upsert into DB
  if (event.type === "user.created" || event.type === "user.updated") {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
    } = event.data;

    const email = email_addresses[0]?.email_address;
    if (!email) return new Response("No email", { status: 400 });

    const name =
      [first_name, last_name].filter(Boolean).join(" ") || null;

    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name, clerkId },
    });

    // Sync the DB role back into Clerk session claims
    // This is what the middleware reads
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: { role: user.role },
    });
  }

  return new Response("ok", { status: 200 });
}