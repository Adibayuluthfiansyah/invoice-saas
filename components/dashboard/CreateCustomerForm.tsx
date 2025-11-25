"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { createCustomer } from "@/app/actions/createCustomer";
import { SubmissionState } from "@/app/actions/CreateInvoice";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";

export function CreateCustomerForm() {
  const initialState: SubmissionState = { status: "success", message: "" };
  const [state, formAction, isPending] = useActionState(
    createCustomer,
    initialState
  );

  return (
    <form action={formAction}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Tambah Customer Baru</CardTitle>
          <CardDescription>
            Masukkan detail informasi klien bisnis Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {state.status === "error" && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
              {state.message}
            </div>
          )}

          <div className="space-y-2">
            <Label>Nama Lengkap / Perusahaan</Label>
            <Input name="name" placeholder="PT Maju Mundur" />
            {state.errors?.name && (
              <p className="text-red-500 text-xs">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input name="email" type="email" placeholder="finance@klien.com" />
            {state.errors?.email && (
              <p className="text-red-500 text-xs">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Alamat Lengkap</Label>
            <Textarea name="address" placeholder="Alamat lengkap..." />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/customers">Batal</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Simpan Customer
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
