"use client";

import { Button } from "@/components/ui/button";
import { generateAndSavePDF } from "@/app/actions/generatePdf";
import { FileCheck, Loader2, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export function FinalizeButton({
  invoiceId,
  pdfUrl,
}: {
  invoiceId: string;
  pdfUrl: string | null;
}) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateAndSavePDF(invoiceId);

    if (result.success) {
      toast.success("Invoice berhasil digenerate & disimpan!");
    } else {
      toast.error(result.message || "Gagal generate PDF");
    }
    setLoading(false);
  };

  if (pdfUrl) {
    return (
      <Button variant="outline" asChild>
        <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
          <Download className="w-4 h-4 mr-2" /> Download PDF Invoice
        </Link>
      </Button>
    );
  }

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileCheck className="w-4 h-4 mr-2" />
      )}
      {loading ? "Memproses..." : "Finalisasi & Generate PDF"}
    </Button>
  );
}
