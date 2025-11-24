"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { registerUser } from "@/app/actions/authActions";
import { toast } from "sonner";
import Link from "next/link";
import { UserPlus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const result = await registerUser(rawData);

    if (result.success) {
      toast.success("AKUN BERHASIL DIBUAT!", {
        description: "SILAHKAN MASUK KE AKUN ANDA.",
      });
      router.push("/login");
    } else {
      setError(result.error || "Gagal mendaftar");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-bold">Buat Akun</CardTitle>
          <CardDescription className="text-foreground/70">
            Buat akun Anda untuk mulai mengelola invoice Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="border-foreground/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                className="border-foreground/40"
                id="email"
                name="email"
                placeholder="email@domain.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                className="border-foreground/40"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Confirmation Password
              </Label>
              <Input
                className="border-foreground/40"
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
              {loading && <Spinner className="ml-2" />}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium flex items-center justify-center gap-1 mt-2"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
