import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Banknote, CreditCard, Users, Activity, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OverviewChart } from "@/components/dashboard/OverviewChart";

async function getDashboardData(userId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const [paidInvoices, pendingInvoices, totalInvoices, totalCustomers] =
      await Promise.all([
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
      ]);

    const [recentInvoices, user, monthlyRevenueRaw] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          businessProfile: { select: { companyName: true } },
        },
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          status: "PAID",
          issueDate: { gte: sixMonthsAgo },
        },
        select: {
          issueDate: true,
          totalAmount: true,
        },
        orderBy: { issueDate: "asc" },
      }),
    ]);

    const chartMap = new Map<string, number>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString("default", { month: "short" });
      chartMap.set(monthName, 0);
    }

    monthlyRevenueRaw.forEach((inv) => {
      const monthName = inv.issueDate.toLocaleString("default", {
        month: "short",
      });
      if (chartMap.has(monthName)) {
        chartMap.set(
          monthName,
          (chartMap.get(monthName) || 0) + inv.totalAmount
        );
      }
    });

    const chartData = Array.from(chartMap, ([name, total]) => ({
      name,
      total,
    }));

    const displayName =
      user?.businessProfile?.companyName || user?.name || "User";

    return {
      revenue: paidInvoices._sum.totalAmount || 0,
      pendingCount: pendingInvoices,
      invoiceCount: totalInvoices,
      customerCount: totalCustomers,
      recentActivity: recentInvoices,
      displayName: displayName,
      chartData: chartData,
    };
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return {
      revenue: 0,
      pendingCount: 0,
      invoiceCount: 0,
      customerCount: 0,
      recentActivity: [],
      displayName: "User",
      chartData: [],
    };
  }
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
          Selamat Datang,{" "}
          <span className="text-primary">{data.displayName}</span>
        </h1>
      </div>

      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-semibold ">Dashboard Overview</h2>
        <Button asChild>
          <Link href="/invoices/create">
            <PlusIcon className="mr-2 h-4 w-4" /> Buat Invoice Baru
          </Link>
        </Button>
      </div>

      {/* --- STATISTIK --- */}
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

      {/* --- GRAFIK & RECENT ACTIVITY --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OverviewChart data={data.chartData} />

        {/* Recent Invoices */}
        <Card className="col-span-4 lg:col-span-3">
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
                    <Avatar className="h-9 w-9 hidden sm:flex">
                      <AvatarFallback>
                        {inv.customer.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-[120px]">
                        {inv.customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.invoiceNumber}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="hidden sm:block">
                        <StatusBadge status={inv.status} />
                      </div>
                      <div className="font-medium text-sm">
                        {formatCurrency(inv.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions  */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-7">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto justify-start"
            >
              <Link href="/invoices/create">
                <PlusIcon className="mr-2 h-4 w-4" /> Buat Invoice Baru
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto justify-start"
            >
              <Link href="/customers/create">
                <Users className="mr-2 h-4 w-4" /> Tambah Customer
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Badge Status
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
