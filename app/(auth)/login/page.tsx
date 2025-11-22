import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/app/actions/auth/login";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await login(email, password);
    toast.success("Login berhasil!", {
      description: "Selamat datang kembali.",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Email atau password salah";
    toast.error(message, {
      description: "Silakan coba lagi.",
    });
    setError(message);
  } finally {
    setLoading(false);
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto rounded-2xl flex items-center justify-center shadow-lg">
            <Image src="/" alt="Logo" width={200} height={200} />
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription className="text-foreground/70">
            Login to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <CardDescription className="text-red-600 bg-red-100 p-2 rounded">
                <CardDescription>{error}</CardDescription>
              </CardDescription>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                className="border-black/40"
                id="email"
                type="text"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                className="border-black/40"
                id="password"
                type="password"
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Daftar di sini
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
