"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/dist/client/components/navigation";
import { loginUser } from "@/app/actions/authActions";
import { toast } from "sonner";
import { Description } from "@radix-ui/react-dialog";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const result = await loginUser(rawData);

    if (result.success) {
      toast.success("LOGIN BERHASIL!", {
        description: "SELAMAT DATANG.",
      });
      router.refresh();
      router.push("/dashboard");
    } else {
      setError(result.error || "Gagal login");
      toast.error(result.error || "Gagal login");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription className="text-foreground/70">
            Selamat Datang Kembali, Silakan masuk ke akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <CardDescription className="text-red-600 bg-red-100 p-2 rounded">
                <CardDescription>{error}</CardDescription>
              </CardDescription>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                className="border-foreground/40"
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                className="border-foreground/40"
                id="password"
                name="password"
                type="password"
                placeholder="•••••••••"
                required
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Tidak punya akun?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Daftar di sini
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline font-medium"
              >
                Lupa Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}{" "}
              {loading && <Spinner className="ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
