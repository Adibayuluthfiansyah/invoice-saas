"use server";

import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

export async function createPaymentToken(invoiceId: string) {
  //  get invoice data
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      user: {
        include: {
          businessProfile: true, 
        },
      },
    },
  });

  if (!invoice) {
    return { success: false, message: "Invoice tidak ditemukan" };
  }

  //  Ambil Key dari Database User
  const serverKey = invoice.user.businessProfile?.paymentServerKey;
  const clientKey = invoice.user.businessProfile?.paymentClientKey;

  // Cek apakah user sudah setting pembayaran
  if (!serverKey || !clientKey) {
    return { 
      success: false, 
      message: "Pemilik bisnis belum mengkonfigurasi pembayaran online." 
    };
  }

  const isSandbox = serverKey.startsWith("SB-Mid-");

  const snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === "production" && !isSandbox,
    serverKey: serverKey,
    clientKey: clientKey,
  });

  const parameter = {
    transaction_details: {
      order_id: `${invoice.invoiceNumber}_${invoice.id}`, 
      gross_amount: invoice.totalAmount,
    },
    customer_details: {
      first_name: invoice.customer.name,
      email: invoice.customer.email,
    },
  };

  try {
    const token = await snap.createTransactionToken(parameter);
    return { 
      success: true, 
      token: token, 
      clientKey: clientKey,
      isSandbox: isSandbox 
    }; 
  } catch (error) {
    console.error("Midtrans Error:", error);
    return { 
      success: false, 
      message: "Gagal membuat token pembayaran (Cek Server Key)." 
    };
  }
}