"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { invoiceSchema} from "@/lib/zodSchemas";
import { SubmissionState } from "@/app/actions/CreateInvoice";
import { redirect } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";

export async function updateInvoice(
  prevState: SubmissionState,
  formData: FormData
): Promise<SubmissionState> {
  const session = await getSession();
  if (!session?.userId) {
    return { status: "error", message: "Unauthorized" };
  }

  const invoiceId = formData.get("id") as string; 


  const descriptions = formData.getAll("itemDescription");
  const quantities = formData.getAll("itemQuantity");
  const rates = formData.getAll("itemRate");

  const items = descriptions.map((desc, index) => ({
    description: desc as string,
    quantity: Number(quantities[index]),
    rate: Number(rates[index]),
  }));

  const rawData = {
    invoiceName: formData.get("invoiceName") as string,
    total: Number(formData.get("total")),
    status: formData.get("status") as string,
    date: new Date(formData.get("date") as string),
    dueDate: Number(formData.get("dueDate")),
    fromName: formData.get("fromName") as string,
    fromEmail: formData.get("fromEmail") as string,
    fromAddress: formData.get("fromAddress") as string,
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    clientAddress: formData.get("clientAddress") as string,
    currency: formData.get("currency") as string,
    items: items,
  };


  const validatedData = invoiceSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      status: "error",
      errors: validatedData.error.flatten().fieldErrors,
      message: "Gagal memvalidasi data. Pastikan semua field terisi.",
    };
  }

  const data = validatedData.data;

  try {

    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({
        where: { invoiceId: invoiceId },
      }),
      prisma.invoice.update({
        where: { id: invoiceId, userId: session.userId as string },
        data: {
          invoiceNumber: data.invoiceName,
          issueDate: data.date,
          dueDate: new Date(
            data.date.getTime() + data.dueDate * 24 * 60 * 60 * 1000
          ),
          status: data.status as InvoiceStatus,
          totalAmount: data.total,
          customer: {
            update: {
              name: data.clientName,
              email: data.clientEmail,
              address: data.clientAddress,
            },
          },
          items: {
            create: data.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.rate,
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Gagal mengupdate invoice." };
  }

  return redirect(`/invoices/${invoiceId}`);
}