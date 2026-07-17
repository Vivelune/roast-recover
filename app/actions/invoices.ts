"use server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/generate-invoice";
import { UTApi } from "uploadthing/server";
import { revalidatePath } from "next/cache";

const utapi = new UTApi();

async function getNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNum: { startsWith: `RR-${year}-` } },
  });
  return `RR-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function generateAndStoreInvoice(orderId: string) {
  // Check if invoice already exists
  const existing = await prisma.invoice.findUnique({
    where: { orderId },
  });
  if (existing?.pdfUrl) return existing;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      user: { include: { company: true } },
      shippingAddress: true,
    },
  });
  if (!order) throw new Error("Order not found");

  const totalCents = order.items.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity,
    0
  );

  const invoiceNum = await getNextInvoiceNumber();

  // Generate PDF
  const pdfBuffer = await generateInvoicePdf({
    invoiceNum,
    issuedAt: new Date(),
    order: {
      id: order.id,
      items: order.items.map((i) => ({
        product: { name: i.product.name },
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
      })),
      shippingAddress: order.shippingAddress,
    },
    user: {
      name: order.user.name,
      email: order.user.email,
      company: order.user.company,
    },
    totalCents,
  });

  // Upload to Uploadthing
// Upload to Uploadthing
const file = new File(
  [new Uint8Array(pdfBuffer)],
  `invoice-${invoiceNum}.pdf`,
  {
    type: "application/pdf",
  }
);

  const uploaded = await utapi.uploadFiles(file);
  const pdfUrl = uploaded.data?.ufsUrl;

  // Upsert invoice record
  const invoice = await prisma.invoice.upsert({
    where: { orderId },
    update: { pdfUrl, invoiceNum, totalCents },
    create: {
      orderId,
      userId: order.userId,
      invoiceNum,
      pdfUrl: pdfUrl ?? null,
      totalCents,
      status: "issued",
    },
  });

  revalidatePath(`/account/orders/${orderId}`);
  return invoice;
}