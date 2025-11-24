"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function generateAndSavePDF(invoiceId: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: session.userId as string },
      include: { customer: true, items: true },
    });

    if (!invoice) return { success: false, message: "Invoice not found" };

    const stream = await renderToStream(<InvoicePDF data={invoice as any} />);

    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }

    const buffer = Buffer.concat(chunks);

    const fileName = `${invoice.invoiceNumber}-${Date.now()}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfUrl: publicUrlData.publicUrl,
        status: "PENDING",
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
