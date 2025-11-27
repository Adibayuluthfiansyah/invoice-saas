import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";
import { InvoiceStatus } from "@prisma/client";
import { SuccessPaymentEmail } from "@/components/email/SuccessPaymentEmail"; 

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const json = await request.json();
    
    console.log("Webhook Received:", json.transaction_status, json.order_id);

    const status_code = json.status_code;
    const gross_amount = json.gross_amount;
    const order_id = json.order_id;
    const signature_key = json.signature_key;
    const transaction_status = json.transaction_status;
    const fraud_status = json.fraud_status;
    
    const parts = order_id.split("-");
    const invoiceId = parts[parts.length - 1]; 

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { user: { include: { businessProfile: true } } }
    });

    if (!invoice) return NextResponse.json({ message: "Invoice not found" }, { status: 404 });

    const serverKey = invoice.user.businessProfile?.paymentServerKey;
    if (!serverKey) return NextResponse.json({ message: "Server Key missing" }, { status: 500 });

    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });

    // --- TENTUKAN STATUS  ---
    let newStatus: InvoiceStatus | null = null;

    if (transaction_status == 'capture') {
        if (fraud_status == 'challenge') newStatus = 'PENDING';
        else if (fraud_status == 'accept') newStatus = 'PAID';
    } else if (transaction_status == 'settlement') {
        newStatus = 'PAID';
    } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
        newStatus = 'VOID'; 
    } else if (transaction_status == 'pending') {
        newStatus = 'PENDING';
    }

    // --- UPDATE DATABASE & KIRIM EMAIL ---
    if (newStatus && newStatus !== invoice.status) {
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
        });
        // Kirim Email HANYA jika status berubah jadi PAID
        if (newStatus === 'PAID') {
             // Ambil data termasuk customer
             const invoiceData = await prisma.invoice.findUnique({
                 where: { id: invoiceId },
                 include: { customer: true }
             });

             if (invoiceData?.customer.email) {
                 await resend.emails.send({
                     from: "7ONG Invoice <billing@o7ong.me>", 
                     to: invoiceData.customer.email,
                     subject: `Pembayaran Diterima: ${invoiceData.invoiceNumber}`,
                     react: SuccessPaymentEmail({
                         customerName: invoiceData.customer.name,
                         invoiceNumber: invoiceData.invoiceNumber,
                         amount: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoiceData.totalAmount),
                         paymentDate: new Date().toLocaleDateString("id-ID"),
                     })
                 });
                 console.log("📧 Email sukses bayar dikirim ke:", invoiceData.customer.email);
             }
        }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
      console.error(" Webhook Error:", error);
      return NextResponse.json({ message: "Error processing" }, { status: 500 });
  }
}