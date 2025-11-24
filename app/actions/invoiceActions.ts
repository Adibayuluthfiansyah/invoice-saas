"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteInvoice(invoiceId: string) {
  const session = await getSession();
  if (!session?.userId) return;

  await prisma.invoice.delete({
    where: {
      id: invoiceId,
      userId: session.userId as string, 
    },
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const session = await getSession();
  if (!session?.userId) return;

  await prisma.invoice.update({
    where: {
      id: invoiceId,
      userId: session.userId as string,
    },
    data: {
      status: status,
    },
  });

  revalidatePath(`/invoices/${invoiceId}`);
}