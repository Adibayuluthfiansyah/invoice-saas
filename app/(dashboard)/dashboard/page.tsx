import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Banknote,
  CreditCard,
  Users,
  Activity,
  ArrowUpRight,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

async function getDashboardData(userId: string) {
  const [
    paidInvoices,
    pendingInvoices,
    totalInvoices,
    totalCustomers,
    recentInvoices,
    user,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: { userId, status: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.count({
      where: { userId, status: "PENDING" },
    }),
    prisma.invoice.count({
      where: { userId },
    }),
    prisma.customer.count({
      where: { userId },
    }),
    prisma.invoice.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
  ]);

  return {
    revenue: paidInvoices._sum.totalAmount || 0,
    pendingCount: pendingInvoices,
    invoiceCount: totalInvoices,
    customerCount: totalCustomers,
    recentActivity: recentInvoices,
    userName: user?.name || "User",
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) return redirect("/login");

  const data = await getDashboardData(session.userId as string);

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">
          Selamat Datang, <span className="text-primary">{data.userName}</span>
        </h1>
      </div>

      {/* Header Dashboard & Tombol */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-semibold ">Dashboard Overview</h2>
        <Button asChild>
          <Link href="/invoices/create">
            <PlusIcon className="mr-2 h-4 w-4" /> Buat Invoice Baru
          </Link>
        </Button>
      </div>

      {/* --- BAGIAN KARTU STATISTIK --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">Dari invoice lunas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Pembayaran
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Invoice status Pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoice</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.invoiceCount}</div>
            <p className="text-xs text-muted-foreground">
              Semua invoice dibuat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Klien</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.customerCount}</div>
            <p className="text-xs text-muted-foreground">
              Klien aktif terdaftar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- BAGIAN RECENT ACTIVITY --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Invoice Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada transaksi terbaru.
                </p>
              ) : (
                data.recentActivity.map((inv) => (
                  <div key={inv.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {inv.customer.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {inv.customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.invoiceNumber} • {formatDate(inv.issueDate)}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <span
                        className={
                          inv.status === "PAID" ? "text-green-600" : ""
                        }
                      >
                        {inv.status === "PAID" ? "+" : ""}
                        {formatCurrency(inv.totalAmount)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      asChild
                    >
                      <Link href={`/invoices/${inv.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/invoices/create">
                <PlusIcon className="mr-2 h-4 w-4" /> Buat Invoice Baru
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/customers">
                <Users className="mr-2 h-4 w-4" /> Tambah Customer
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
