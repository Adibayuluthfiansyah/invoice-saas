"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Resend } from "resend";
import { InvoiceEmail } from "@/components/email/InvoiceEmail";
import { formatCurrency, formatDate } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(invoiceId: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: session.userId as string },
      include: { customer: true },
    });

    if (!invoice) return { success: false, message: "Invoice tidak ditemukan" };

    if (!invoice.pdfUrl) {
      return {
        success: false,
        message:
          "Harap 'Finalisasi & Generate PDF' terlebih dahulu sebelum mengirim email.",
      };
    }

    const { error } = await resend.emails.send({
      from: "Invoice App <onboarding@resend.dev>",

      // For Development Testing
      to: ["adibayuluthfiansyah@gmail.com"],

      // For Production
      // to: [invoice.customer.email],

      subject: `Tagihan Baru #${invoice.invoiceNumber}`,
      react: (
        <InvoiceEmail
          customerName={invoice.customer.name}
          invoiceNumber={invoice.invoiceNumber}
          pdfUrl={invoice.pdfUrl}
          totalAmount={formatCurrency(invoice.totalAmount)}
          dueDate={formatDate(invoice.dueDate)}
        />
      ),
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, message: "Gagal mengirim email" };
    }

    if (invoice.status === "DRAFT") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PENDING" },
      });
    }

    return { success: true, message: "Email berhasil dikirim!" };
  } catch (error) {
    console.error("Server Error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}
