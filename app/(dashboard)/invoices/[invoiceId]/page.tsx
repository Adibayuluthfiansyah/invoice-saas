import { DownloadInvoiceBtn } from "@/components/dashboard/DownloadInvoiceBtn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronLeft, Download, Mail, Printer } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface InvoiceDetailPageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const session = await getSession();
  if (!session?.userId) return redirect("/login");

  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
      userId: session.userId as string,
    },
    include: {
      customer: true,
      items: true,
    },
  });

  // Jika invoice tidak ditemukan
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Invoice Tidak Ditemukan</h2>
        <p className="text-muted-foreground">
          Invoice yang Anda cari tidak ada atau Anda tidak memiliki akses.
        </p>
        <Button asChild variant="outline">
          <Link href="/invoices">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER NAVIGASI & AKSI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/invoices">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detail Invoice</h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <DownloadInvoiceBtn data={invoice} />
          <Button>
            <Mail className="w-4 h-4 mr-2" /> Kirim ke Email
          </Button>
        </div>
      </div>

      {/* KARTU UTAMA INVOICE */}
      <Card className="overflow-hidden border-t-4 border-t-primary shadow-md">
        <CardHeader className="bg-muted/30 p-8 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Invoice Untuk
              </p>
              <h2 className="text-xl font-bold mt-1">
                {invoice.customer.name}
              </h2>
              <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                {invoice.customer.address || "Alamat tidak tersedia"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {invoice.customer.email}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary">
                {invoice.invoiceNumber}
              </h2>
              <p className="text-sm font-medium mt-1">
                Diterbitkan:{" "}
                <span className="font-normal">
                  {formatDate(invoice.issueDate)}
                </span>
              </p>
              <p className="text-sm font-medium">
                Jatuh Tempo:{" "}
                <span className="font-normal">
                  {formatDate(invoice.dueDate)}
                </span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* TABEL ITEMS */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-4 py-3 w-[10%]">#</th>
                  <th className="px-4 py-3 w-[50%]">Deskripsi</th>
                  <th className="px-4 py-3 text-right w-[15%]">Qty</th>
                  <th className="px-4 py-3 text-right w-[25%]">Harga Satuan</th>
                  <th className="px-4 py-3 text-right w-[25%]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RINGKASAN TOTAL */}
          <div className="mt-6 flex justify-end">
            <div className="w-full sm:w-1/3 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Pajak ({invoice.taxRate}%)</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-lg">Total Tagihan</span>
                <span className="font-bold text-lg text-primary">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Badge (Sama seperti di list page)
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-gray-500",
    PENDING: "bg-yellow-500",
    PAID: "bg-green-500",
    OVERDUE: "bg-red-500",
    VOID: "bg-slate-800",
  };

  return (
    <Badge
      className={`${styles[status] || "bg-primary"} hover:${styles[status]}`}
    >
      {status}
    </Badge>
  );
}
