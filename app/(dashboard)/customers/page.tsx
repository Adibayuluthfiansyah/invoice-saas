import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Mail, MapPin, Plus, User } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session?.userId) return redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { userId: session.userId as string },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { invoices: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <Button asChild>
          <Link href="/customers/create">
            <Plus className="mr-2 h-4 w-4" /> Tambah Customer
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {customer.name}
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customer._count.invoices} Invoice
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Mail className="mr-2 h-3 w-3" />
                  {customer.email}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="mr-2 h-3 w-3" />
                  <span className="truncate max-w-[200px]">
                    {customer.address || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
