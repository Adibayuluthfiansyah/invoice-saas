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
    // get data invoice
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

    const customerEmail = invoice.customer.email.trim();
    if (!customerEmail || !customerEmail.includes("@")) {
      return { success: false, message: "Email customer tidak valid" };
    }

    const senderProfile = invoice.user.businessProfile;
    const isDevelopment = process.env.NODE_ENV !== "production";

    const recipientEmail = isDevelopment
      ? ["adibayuluthfiansyah@gmail.com"]
      : [customerEmail];

    const emailSubject = isDevelopment
      ? `[TEST - For: ${customerEmail}] Tagihan Baru #${invoice.invoiceNumber}`
      : `Tagihan Baru #${invoice.invoiceNumber}`;

    console.log(`📧 Sending invoice email to: ${recipientEmail[0]}`);

    // Kirim Email
    const { data, error } = await resend.emails.send({
      from: "7ONG Invoice <onboarding@resend.dev>",
      to: recipientEmail,
      subject: emailSubject,
      react: (
        <InvoiceEmail
          customerName={invoice.customer.name}
          invoiceNumber={invoice.invoiceNumber}
          pdfUrl={invoice.pdfUrl}
          totalAmount={formatCurrency(invoice.totalAmount)}
          dueDate={formatDate(invoice.dueDate)}
          invoiceId={invoice.id}
          sender={{
            name: senderProfile?.companyName || "7ONG Invoice",
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
        message: `Gagal mengirim email: ${error.message}`,
      };
    }

    console.log(`✅ Email sent successfully. ID: ${data?.id}`);

    // Update status jika masih DRAFT
    if (invoice.status === "DRAFT") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PENDING" },
      });
    }

    const successMessage = isDevelopment
      ? `Email test dikirim ke ${recipientEmail[0]}! (Production: ${customerEmail})`
      : `Email berhasil dikirim ke ${customerEmail}!`;

    return {
      success: true,
      message: successMessage,
      emailId: data?.id,
    };
  } catch (error) {
    console.error("Send Email Error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
