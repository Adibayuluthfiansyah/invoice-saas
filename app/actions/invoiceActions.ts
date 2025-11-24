"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";


export async function deleteInvoice(invoiceId: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.invoice.delete({
      where: {
        id: invoiceId,
        userId: session.userId as string,
      },
    });

    revalidatePath("/invoices");
    
    return { success: true, message: "Invoice berhasil dihapus" };

  } catch (error) {
    return { success: false, message: "Gagal menghapus data" };
  }
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