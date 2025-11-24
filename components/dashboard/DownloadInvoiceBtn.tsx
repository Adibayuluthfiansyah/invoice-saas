"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF, InvoiceData } from "@/components/pdf/InvoicePDF";

export function DownloadInvoiceBtn({ data }: { data: InvoiceData }) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF data={data} />}
      fileName={`Invoice-${data.invoiceNumber}.pdf`}
    >
      {/* Definisi tipe eksplisit untuk parameter render prop */}
      {({ loading }: { loading: boolean }) => (
        <Button variant="outline" disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {loading ? "Menyiapkan PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
