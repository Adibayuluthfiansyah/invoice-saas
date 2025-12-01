"use client";

import { Button } from "@/components/ui/button";
import { createPaymentToken } from "@/app/actions/paymentActions";
import { CreditCard, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PayButtonProps {
  invoiceId: string;
  status: string;
}

export function PayButton({ invoiceId, status }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  if (status === "PAID") {
    return (
      <Button
        variant="outline"
        disabled
        className="bg-green-50 text-green-700 border-green-200 cursor-not-allowed opacity-100"
      >
        <CreditCard className="mr-2 h-4 w-4" /> Lunas
      </Button>
    );
  }

  const handlePay = async () => {
    setLoading(true);

    // get token
    const result = await createPaymentToken(invoiceId);

    if (!result.success || !result.token || !result.clientKey) {
      toast.error(result.message || "Gagal memproses pembayaran");
      setLoading(false);
      return;
    }

    const scriptId = "midtrans-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = result.isSandbox
        ? "https://app.sandbox.midtrans.com/snap/snap.js"
        : "https://app.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", result.clientKey);
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
        setTimeout(resolve, 1000);
      });
    } else {
      script.setAttribute("data-client-key", result.clientKey);
    }

    // @ts-expect-error: Snap global
    if (window.snap) {
      // @ts-expect-error: Snap global
      window.snap.pay(result.token, {
        onSuccess: () => {
          toast.success("Pembayaran Berhasil!");
          window.location.reload();
        },
        onPending: () => {
          toast.info("Menunggu pembayaran...");
        },
        onError: () => {
          toast.error("Pembayaran gagal!");
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } else {
      toast.error("Gagal memuat sistem pembayaran. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? "Memproses..." : "Bayar Sekarang"}
    </Button>
  );
}
