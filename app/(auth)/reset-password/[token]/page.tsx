"use client";

import { useState } from "react";
import { resetPassword } from "@/app/actions/authActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();

  const token = params.token as string;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak sama!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    const result = await resetPassword(token, password);

    if (result.success) {
      toast.success(result.message);
      router.push("/login");
    } else {
      toast.error(result.error || "Gagal mereset password");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Buat Password Baru
          </CardTitle>
          <CardDescription>
            Silakan masukkan password baru untuk akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
