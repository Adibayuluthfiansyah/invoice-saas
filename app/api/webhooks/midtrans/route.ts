import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { InvoiceStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    //  Terima data notifikasi dari Midtrans
    const json = await request.json();
    
    const status_code = json.status_code;
    const gross_amount = json.gross_amount;
    const order_id = json.order_id;
    const signature_key = json.signature_key;
    const transaction_status = json.transaction_status;
    const fraud_status = json.fraud_status;
    
    // Ambil Invoice ID dari Order ID
    // Kita perlu mengambil bagian paling belakang (ID Database)
    const parts = order_id.split("-");
    const invoiceId = parts[parts.length - 1]; 

    // Cari Invoice di Database beserta Server Key Pemiliknya
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            user: {
                include: { businessProfile: true }
            }
        }
    });

    if (!invoice) {
        return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Ambil Server Key dari Database User (BUKAN dari .env global)
    const serverKey = invoice.user.businessProfile?.paymentServerKey;

    if (!serverKey) {
        return NextResponse.json({ message: "Server Key not found for this user" }, { status: 500 });
    }

    // 4. Validasi Signature Key 
    // Caranya dengan membuat ulang signature key menggunakan Server Key user dan mencocokkannya.
    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hash !== signature_key) {
        return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
    }

    // Tentukan Status Invoice Baru berdasarkan status transaksi Midtrans
    let newStatus: InvoiceStatus | null = null;

    if (transaction_status == 'capture') {
        if (fraud_status == 'challenge') {
            // Transaksi berhasil tapi dicurigai fraud -> Pending dulu
            newStatus = 'PENDING';
        } else if (fraud_status == 'accept') {
            // Transaksi berhasil dan aman -> LUNAS
            newStatus = 'PAID';
        }
    } else if (transaction_status == 'settlement') {
        // Uang sudah masuk/selesai -> LUNAS
        newStatus = 'PAID';
    } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
        // Transaksi gagal/dibatalkan -> VOID
        newStatus = 'VOID'; 
    } else if (transaction_status == 'pending') {
        newStatus = 'PENDING';
    }

    //  Update Database jika status berubah
    if (newStatus) {
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
        });
    }

    // Berikan respons OK ke Midtrans agar mereka tidak mengirim ulang notifikasi
    return NextResponse.json({ ok: true });

  } catch (error) {
      console.error("Webhook Error:", error);
      return NextResponse.json({ message: "Error processing notification" }, { status: 500 });
  }
}