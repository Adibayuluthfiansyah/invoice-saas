import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";
import { InvoiceStatus } from "@prisma/client";
import { SuccessPaymentEmail } from "@/components/email/SuccessPaymentEmail"; 

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const json = await request.json();
    
    console.log("Midtrans Webhook Received:", json.order_id, json.transaction_status);

    const status_code = json.status_code;
    const gross_amount = json.gross_amount;
    const order_id = json.order_id;
    const signature_key = json.signature_key;
    const transaction_status = json.transaction_status;
    const fraud_status = json.fraud_status;

    const parts = order_id.split("_");
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

    const paidAmount = Math.floor(Number(gross_amount)); 
    if (paidAmount !== invoice.totalAmount) {
        return NextResponse.json({ message: "Invalid amount paid" }, { status: 400 });
    }

    // --- TENTUKAN STATUS BARU ---
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
        
        if (invoice.status === 'PAID') {
            return NextResponse.json({ ok: true, message: "Already PAID" });
        }
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
        });

        // HANYA KIRIM EMAIL JIKA STATUS MENJADI 'PAID'
        if (newStatus === 'PAID') {
             const invoiceData = await prisma.invoice.findUnique({
                 where: { id: invoiceId },
                 include: { customer: true, user: { include: { businessProfile: true } } }
             });

             if (invoiceData?.customer.email) {
                 // --- LOGIC TEST SEND EMAIL ---
                // Kalau sudah production hapus email developer
                 // Production Pakai domain asli 
                //const senderEmail = "7ONG Invoice <billing@o7ong.me>";

                 const senderEmail = "7ONG Invoice <onboarding@resend.dev>"; 
                 const isDevelopment = process.env.NODE_ENV !== "production";
                 const developerEmail = "adibayuluthfiansyah@gmail.com"; 
                 const recipientEmail = (isDevelopment) 
                    ? developerEmail 
                    : invoiceData.customer.email;
                
                    // === INI UNTUK PRODUCTION ===
                // const recipientEmail = isDevelopment 
                //     ? "adibayuluthfiansyah@gmail.com" 
                //     : invoiceData.customer.email;

                const emailSubject = `Pembayaran Diterima: ${invoiceData.invoiceNumber}`;

                console.log(` Mencoba kirim email webhook ke: ${recipientEmail} dari ${senderEmail}`);

                 try {
                     const { data, error } = await resend.emails.send({
                         from: senderEmail, 
                         to: recipientEmail,
                         subject: emailSubject,
                         react: SuccessPaymentEmail({
                             customerName: invoiceData.customer.name,
                             invoiceNumber: invoiceData.invoiceNumber,
                             amount: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoiceData.totalAmount),
                             paymentDate: new Date().toLocaleDateString("id-ID"),
                         })
                     });

                     if (error) {
                         console.error(" Resend Error (Webhook):", error);
                     } else {
                         console.log(` Email sukses bayar TERKIRIM ke: ${recipientEmail} (ID: ${data?.id})`);
                     }
                 } catch (emailErr) {
                     console.error("Exception kirim email webhook:", emailErr);
                 }
             }
        }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
      console.error("Webhook Error:", error);
      return NextResponse.json({ message: "Error processing" }, { status: 500 });
  }
}