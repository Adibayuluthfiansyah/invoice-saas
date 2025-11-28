import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.userId) return redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { businessProfile: true },
  });

  if (!user) return redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>

      <SettingsForm
        companyName={user.businessProfile?.companyName || ""}
        address={user.businessProfile?.address || ""}
        taxId={user.businessProfile?.taxId || ""}
        defaultTaxRate={user.businessProfile?.invoiceTaxRate || 0}
        logoUrl={user.businessProfile?.logoUrl || null}
        paymentClientKey={user.businessProfile?.paymentClientKey || ""}
        paymentServerKey={user.businessProfile?.paymentServerKey || ""}
      />
    </div>
  );
}
