"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePDF, InvoiceData } from "@/components/pdf/InvoicePDF";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function generateAndSavePDF(invoiceId: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: session.userId as string },
      include: {
        customer: true,
        items: true,
        user: {
          include: {
            businessProfile: true,
          },
        },
      },
    });

    if (!invoice) return { success: false, message: "Invoice not found" };

    // Mapping Data
    const pdfData: InvoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      totalAmount: invoice.totalAmount,
      subTotal: invoice.subTotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        address: invoice.customer.address || "",
      },
      sender: {
        name:
          invoice.user.businessProfile?.companyName ||
          invoice.user.name ||
          "Bisnis Tanpa Nama",
        address: invoice.user.businessProfile?.address || "",
        email: invoice.user.email,
        taxId: invoice.user.businessProfile?.taxId || null,
        logoUrl: invoice.user.businessProfile?.logoUrl || null,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    const stream = await renderToStream(<InvoicePDF data={pdfData} />);
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }

    const buffer = Buffer.concat(chunks);
    const fileName = `${invoice.invoiceNumber}-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);
    const newStatus = invoice.status === "DRAFT" ? "PENDING" : undefined;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfUrl: publicUrlData.publicUrl,
        // Update status hanya jika diperlukan
        ...(newStatus && { status: newStatus }),
      },
    });

    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, url: publicUrlData.publicUrl };
  } catch (error) {
    console.error("PDF Generation Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}
