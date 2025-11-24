import { EditInvoiceForm } from "@/components/dashboard/EditInvoiceForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface EditPageProps {
  params: Promise<{ invoiceId: string }>;
}

export default async function EditInvoicePage({ params }: EditPageProps) {
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

  if (!invoice) {
    return redirect("/invoices");
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <p className="text-muted-foreground">Perbarui detail invoice Anda.</p>
      </div>
      <EditInvoiceForm invoice={invoice} />
    </div>
  );
}
