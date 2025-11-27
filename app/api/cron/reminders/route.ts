import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { InvoiceEmail } from "@/components/email/InvoiceEmail"; 
import { createElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + 10);
  
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const invoices = await prisma.invoice.findMany({
        where: {
            status: "PENDING",
            dueDate: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            customer: true,
            user: { include: { businessProfile: true } } 
        }
    });

    if (invoices.length === 0) {
        return NextResponse.json({ message: "No invoices due in 10 days." });
    }

    const results = [];
    for (const inv of invoices) {
        if (!inv.customer?.email) continue;

        const profile = inv.user?.businessProfile;

        // SAFETY CHECK
        if (!profile) {
            console.log(`Skip Invoice #${inv.invoiceNumber}: User tidak punya Business Profile.`);
            continue; 
        }

        // Kirim Email
        const { error } = await resend.emails.send({
            from: "7ONG Reminder <billing@o7ong.me>",
            to: inv.customer.email,
            subject: `Reminder: Tagihan #${inv.invoiceNumber} Jatuh Tempo 10 Hari Lagi`,
            react: createElement(InvoiceEmail, {
                invoiceId: inv.id,
                customerName: inv.customer.name,
                invoiceNumber: inv.invoiceNumber,
                dueDate: inv.dueDate.toLocaleDateString("id-ID"),
                totalAmount: new Intl.NumberFormat("id-ID", { 
                    style: "currency", 
                    currency: "IDR" 
                }).format(Number(inv.totalAmount)), 
                
                pdfUrl: inv.pdfUrl || "",
                sender: { 
                    name: profile.companyName,
                    address: profile.address,
                    taxId: profile.taxId,
                    logoUrl: profile.logoUrl
                }
            })
        });
        
        if (error) {
            console.error(`Gagal kirim email ke ${inv.customer.email}:`, error);
            results.push({ id: inv.id, status: 'failed', error });
        } else {
            results.push({ id: inv.id, status: 'sent' });
        }
    }

    return NextResponse.json({ 
        success: true, 
        processed: results.length,
        details: results
    });

  } catch (error) {
      console.error("CRON ERROR:", error);
      return NextResponse.json({ 
          message: "Error processing reminders", 
          error: String(error) 
      }, { status: 500 });
  }
}