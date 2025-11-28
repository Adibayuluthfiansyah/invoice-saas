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
    //  Ambil Data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, userId: session.userId as string },
      include: {
        customer: true,
        user: {
          include: { businessProfile: true },
        },
      },
    });

    if (!invoice) return { success: false, message: "Invoice tidak ditemukan" };

    if (!invoice.pdfUrl) {
      return {
        success: false,
        message: "Harap 'Finalisasi & Generate PDF' terlebih dahulu.",
      };
    }

    const senderProfile = invoice.user.businessProfile;

    // Kirim Email
    const { error } = await resend.emails.send({
      // Ganti dengan domain Anda yang sudah verified
      from: "7ONG Invoice <billing@o7ong.me>",

      // Production kirim ke Klien, kalau Dev kirim ke Anda
      to:
        process.env.NODE_ENV === "production"
          ? [invoice.customer.email]
          : ["adibayuluthfiansyah@gmail.com"],

      subject: `Tagihan Baru #${invoice.invoiceNumber}`,
      react: (
        <InvoiceEmail
          customerName={invoice.customer.name}
          invoiceNumber={invoice.invoiceNumber}
          pdfUrl={invoice.pdfUrl}
          totalAmount={formatCurrency(invoice.totalAmount)}
          dueDate={formatDate(invoice.dueDate)}
          invoiceId={invoice.id}
          sender={{
            name: senderProfile?.companyName || "7ONG User",
            address: senderProfile?.address || "",
            taxId: senderProfile?.taxId || "",
            logoUrl: senderProfile?.logoUrl || null,
          }}
        />
      ),
    });

    if (error) {
      console.error("Resend Error:", error);
      return {
        success: false,
        message: "Gagal mengirim email: " + error.message,
      };
    }

    // Update status masih draft
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
