"use server";

import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";


interface MidtransError extends Error {
  httpStatusCode?: number;
  ApiResponse?: {
    error_messages?: string[];
    [key: string]: unknown;
  };
}

export async function createPaymentToken(invoiceId: string) {
  // Ambil Data Invoice
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

  const rawServerKey = invoice.user.businessProfile?.paymentServerKey;
  const rawClientKey = invoice.user.businessProfile?.paymentClientKey;

  if (!rawServerKey || !rawClientKey) {
    return { 
      success: false, 
      message: "Key Pembayaran belum diatur di menu Settings." 
    };
  }

  const serverKey = rawServerKey.trim();
  const clientKey = rawClientKey.trim();

  const isSandbox = true;


// === INI UNTUK PRODUCTION ===
  // const isSandbox = serverKey.startsWith("SB-");

  // LOG midtrans issue
  console.log("--- DEBUG MIDTRANS ---");
  console.log(`Key dipakai: ${serverKey.substring(0, 6)}...`);
  console.log(`Mode terdeteksi: ${isSandbox ? "SANDBOX (Testing)" : "PRODUCTION (Live)"}`);
  
  if (!isSandbox) {
    console.warn("PERINGATAN: Anda menggunakan Key Production (Mid-...) di environment yang mungkin masih Development.");
  }


  const snap = new midtransClient.Snap({
// === INI UNTUK PRODUCTION ===
//isProduction: !isSandbox,

    isProduction: false, 
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
    credit_card: {
      secure: true
    }
  };

  try {
    const token = await snap.createTransactionToken(parameter) as string;
    
    return { 
      success: true, 
      token: token, 
      clientKey: clientKey,
      isSandbox: isSandbox 
    }; 
  } catch (error: unknown) {
    const err = error as MidtransError;
    console.error("Midtrans Error:", JSON.stringify(err, null, 2));

    let msg = "Gagal membuat token pembayaran.";

    if (err.httpStatusCode === 401) {
      if (isSandbox) {
        msg += " (Error 401 di Sandbox: Cek apakah Server Key Sandbox Anda benar/typo).";
      } else {
        msg += " (Error 401: Anda memakai Key Production 'Mid-' tapi akun belum Live/Approved. Ganti ke Key 'SB-' untuk testing).";
      }
    }

    return { 
      success: false, 
      message: msg 
    };
  }
}