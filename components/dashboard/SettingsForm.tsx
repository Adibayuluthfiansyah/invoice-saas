"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBusinessProfile } from "@/app/actions/settingsActions";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { useEffect } from "react";
import { SubmissionState } from "@/app/actions/CreateInvoice";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

interface SettingsFormProps {
  companyName: string;
  address: string;
  taxId: string;
  defaultTaxRate: number;
  paymentClientKey: string;
  paymentServerKey: string;
  logoUrl?: string | null;
}

export function SettingsForm({
  companyName,
  address,
  taxId,
  defaultTaxRate,
  paymentClientKey,
  paymentServerKey,
  logoUrl,
}: SettingsFormProps) {
  const initialState: SubmissionState = { status: "success", message: "" };

  const [state, formAction] = useActionState(
    updateBusinessProfile,
    initialState
  );

  const [previewUrl, setPreviewUrl] = useState<string | null>(logoUrl || null);

  useEffect(() => {
    if (state?.status === "success" && state.message) {
      toast.success(state.message);
    } else if (state?.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Profil Bisnis</CardTitle>
          <CardDescription>
            Informasi ini akan muncul di header Invoice PDF Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bagian Logo */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border overflow-hidden shrink-0 rounded-lg bg-muted">
              <AvatarImage
                src={previewUrl || ""}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="flex h-full w-full items-center justify-center text-xs text-muted-foreground font-medium">
                LOGO
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 w-full max-w-sm">
              <Label>Logo Perusahaan</Label>
              <Input
                name="logo"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Format: JPG, PNG. Maks: 2MB.
              </p>
            </div>
          </div>

          <div className="border-t my-4"></div>

          <div className="space-y-2">
            <Label>Nama Perusahaan</Label>
            <Input
              name="companyName"
              defaultValue={companyName}
              placeholder="Contoh: PT Maju Mundur"
            />
            {state?.errors?.companyName && (
              <p className="text-red-500 text-xs">
                {state.errors.companyName[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>NPWP / Tax ID</Label>
              <Input
                name="taxId"
                defaultValue={taxId}
                placeholder="Contoh: 12.345.678.9-000.000"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Pajak Invoice (%)</Label>
              <Input
                name="invoiceTaxRate"
                type="number"
                step="0.01"
                defaultValue={defaultTaxRate}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alamat Lengkap</Label>
            <Textarea
              name="address"
              defaultValue={address}
              placeholder="Jalan Raya No. 1, Jakarta..."
            />
          </div>

          <div className="border-t my-6 pt-6">
            <h3 className="font-semibold mb-4 text-lg">
              Konfigurasi Pembayaran (Midtrans)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Daftar di{" "}
              <a
                href="https://midtrans.com"
                target="_blank"
                className="text-primary underline"
              >
                Midtrans
              </a>{" "}
              untuk mendapatkan kunci ini agar pembayaran masuk langsung ke
              rekening Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Key (Public)</Label>
                <Input
                  name="paymentClientKey"
                  defaultValue={paymentClientKey}
                  placeholder="SB-Mid-client-..."
                />
              </div>
              <div className="space-y-2">
                <Label>Server Key (Secret)</Label>
                <Input
                  name="paymentServerKey"
                  defaultValue={paymentServerKey}
                  placeholder="SB-Mid-server-..."
                  type="password"
                />
              </div>
            </div>
          </div>

          <Button type="submit">Simpan Perubahan</Button>
        </CardContent>
      </Card>
    </form>
  );
}
