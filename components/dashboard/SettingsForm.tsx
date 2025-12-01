"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateBusinessProfile } from "@/app/actions/settingsActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import Image from "next/image";

interface SettingsFormProps {
  companyName: string;
  address: string | null;
  taxId: string | null;
  defaultTaxRate: number;
  logoUrl: string | null;
  paymentClientKey: string | null;
  paymentServerKey: string | null;
}

const initialState = {
  status: "idle" as const,
  message: "",
};

export function SettingsForm(props: SettingsFormProps) {
  const [state, formAction] = useFormState(updateBusinessProfile, initialState);
  const [preview, setPreview] = useState<string | null>(props.logoUrl);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar!");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File terlalu besar! Maksimal 2MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Company Info */}
      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Informasi Perusahaan</h2>

        <div className="space-y-2">
          <Label htmlFor="companyName">Nama Perusahaan *</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue={props.companyName}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={props.address || ""}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">NPWP</Label>
          <Input id="taxId" name="taxId" defaultValue={props.taxId || ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceTaxRate">Default Tax Rate (%)</Label>
          <Input
            id="invoiceTaxRate"
            name="invoiceTaxRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            defaultValue={props.defaultTaxRate}
          />
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Logo Perusahaan</h2>

        {preview && (
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
            <Image
              src={preview}
              alt="Logo preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="logo">Upload Logo</Label>
          <Input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <p className="text-xs text-muted-foreground">
            Format: JPG, PNG, WebP. Maksimal 2MB
          </p>
        </div>
      </div>

      {/* Payment Keys */}
      <div className="space-y-4 rounded-lg border p-6 bg-primary/5 dark:bg-primary/10">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Integrasi Pembayaran Midtrans
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hubungkan akun Midtrans Anda untuk menerima pembayaran online dari
            customer dan kelola transaksi anda sendiri melalui dashboard
            Midtrans.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Midtrans Payment Keys</h2>
        <div className="space-y-2">
          <Label htmlFor="paymentClientKey">Client Key</Label>
          <Input
            id="paymentClientKey"
            name="paymentClientKey"
            type="text"
            defaultValue={props.paymentClientKey || ""}
            placeholder="SB-Mid-client-..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentServerKey">Server Key</Label>
          <Input
            id="paymentServerKey"
            name="paymentServerKey"
            type="password"
            defaultValue={props.paymentServerKey || ""}
            placeholder="SB-Mid-server-..."
          />
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
    </Button>
  );
}
