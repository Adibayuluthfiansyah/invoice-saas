import { CreateInvoiceForm } from "@/components/dashboard/CreateInvoiceForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";

export default async function CreateInvoicePage() {
  const session = await getSession();
  if (!session?.userId) return redirect("/login");

  const generateInvoiceId = customAlphabet("1234567890", 6);
  const invoiceNumber = `INV-${generateInvoiceId()}`;

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { businessProfile: true },
  });

  if (!user) return redirect("/login");

  const defaultTax = user.businessProfile?.invoiceTaxRate || 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Buat Invoice Baru</h1>
        <p className="text-muted-foreground">
          Isi formulir di bawah untuk membuat invoice baru.
        </p>
      </div>
      <CreateInvoiceForm
        user={user}
        invoiceNumber={invoiceNumber}
        defaultTax={defaultTax}
      />
    </div>
  );
}
