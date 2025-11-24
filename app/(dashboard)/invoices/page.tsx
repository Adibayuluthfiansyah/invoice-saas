import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function InvoicePage() {
  const session = await getSession();
  if (!session || !session.userId) {
    return redirect("/login");
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.userId as string },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Kelola tagihan dan riwayat pembayaran klien Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" /> Buat Invoice Baru
          </Link>
        </Button>
      </div>

      {/* Content Table  */}
      {invoices.length === 0 ? (
        // Tampilan Kosong
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border bg-muted/20 p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Belum ada invoice</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            Anda belum membuat tagihan apapun. Mulai buat tagihan pertama Anda
            untuk klien.
          </p>
          <Button asChild variant="outline">
            <Link href="/invoices/create">Buat Invoice Pertama</Link>
          </Button>
        </div>
      ) : (
        // Tabel Data
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tanggal Isu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell>{inv.customer.name}</TableCell>
                  <TableCell>{formatDate(inv.issueDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/invoices/${inv.id}`}>Detail</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Helper Untuk Badge Status
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-gray-500 hover:bg-gray-600",
    PENDING: "bg-yellow-500 hover:bg-yellow-600",
    PAID: "bg-green-500 hover:bg-green-600",
    OVERDUE: "bg-red-500 hover:bg-red-600",
    VOID: "bg-slate-800 hover:bg-slate-900",
  };

  return <Badge className={styles[status] || "bg-primary"}>{status}</Badge>;
}
