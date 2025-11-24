"use client";

import { Button } from "@/components/ui/button";
import { sendInvoiceEmail } from "@/app/actions/sendEmail";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SendEmailBtn({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    const result = await sendInvoiceEmail(invoiceId);

    if (result.success) {
      toast.success("Email berhasil dikirim ke klien!");
    } else {
      toast.error(result.message || "Gagal mengirim email");
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleSend} disabled={loading}>
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Send className="w-4 h-4 mr-2" />
      )}
      {loading ? "Mengirim..." : "Kirim ke Email"}
    </Button>
  );
}
