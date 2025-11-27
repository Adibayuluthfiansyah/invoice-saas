import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayButton } from "@/components/invoice/PayButton";
import Image from "next/image";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      items: true,
      user: {
        include: { businessProfile: true },
      },
    },
  });

  // id tidak ketemu
  if (!invoice) {
    return notFound();
  }

  const sender = invoice.user.businessProfile;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Header  */}
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2 font-bold text-xl text-muted-foreground opacity-70">
            <Image
              src="/invoicelogo-removebg-preview.png"
              alt="7ONG Logo"
              width={100}
              height={100}
            />
          </div>

          {/* Tombol Download PDF */}
          {invoice.pdfUrl && (
            <Button asChild variant="default">
              <a href={invoice.pdfUrl} target="_blank" download>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </a>
            </Button>
          )}
        </div>

        <PayButton invoiceId={invoice.id} status={invoice.status} />

        {/* Kartu Invoice  */}
        <Card className="shadow-xl border-t-4 border-t-primary overflow-hidden">
          <CardHeader className="p-8 border-b bg-white">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              {/* Info Pengirim & Logo */}
              <div className="flex flex-col gap-4">
                {sender?.logoUrl ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                    <Image
                      src={sender.logoUrl}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-primary">
                    {sender?.companyName}
                  </div>
                )}

                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground text-lg">
                    {sender?.companyName}
                  </p>
                  <p className="whitespace-pre-line">{sender?.address}</p>
                  {sender?.taxId && <p>NPWP: {sender.taxId}</p>}
                </div>
              </div>

              {/* Info Invoice Detail */}
              <div className="text-right space-y-2">
                <h1 className="text-4xl font-bold text-slate-200 tracking-widest">
                  INVOICE
                </h1>
                <p className="text-xl font-medium">#{invoice.invoiceNumber}</p>

                <div className="pt-4 space-y-2 text-sm">
                  <div className="flex justify-end gap-4 items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <div className="flex justify-end gap-4">
                    <span className="text-muted-foreground">Tanggal Isu:</span>
                    <span className="font-medium">
                      {formatDate(invoice.issueDate)}
                    </span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <span className="text-muted-foreground">Jatuh Tempo:</span>
                    <span className="font-medium">
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-10 bg-white min-h-[400px]">
            {/* Ditagihkan Ke */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Ditagihkan Kepada
                </p>
                <h3 className="text-xl font-bold text-foreground">
                  {invoice.customer.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {invoice.customer.email}
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">
                  {invoice.customer.address}
                </p>
              </div>
            </div>

            {/* Tabel Item */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">
                      Deskripsi Item
                    </th>
                    <th className="px-6 py-4 text-right font-medium w-[100px]">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-right font-medium w-[150px]">
                      Harga Satuan
                    </th>
                    <th className="px-6 py-4 text-right font-medium w-[150px]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kalkulasi Total */}
            <div className="flex justify-end">
              <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.subTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Pajak ({invoice.taxRate}%)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(invoice.taxAmount)}
                  </span>
                </div>
                <div className="border-t pt-4 mt-4 flex justify-between font-bold text-xl items-center">
                  <span>Total Tagihan</span>
                  <span className="text-primary">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-8">
          <p>
            Invoice ini dibuat otomatis menggunakan layanan{" "}
            <span className="font-bold text-primary">7ONG INVOICE</span>.
          </p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} 7ONG Technology.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    PAID: "bg-green-100 text-green-700 border-green-200",
    OVERDUE: "bg-red-100 text-red-700 border-red-200",
    VOID: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}
