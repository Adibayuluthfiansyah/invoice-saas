"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Globe,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LandingPageClientProps {
  user: string | null;
}
const scrollToFeatures = () => {
  const element = document.getElementById("features");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

export default function LandingPageClient({ user }: LandingPageClientProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-17 w-17">
              <Image
                src="/invoicelogo-removebg-preview.png"
                alt="7ONG Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <nav className="flex gap-4">
            {user ? (
              <Button asChild className="rounded-full px-6">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4"
                >
                  Masuk
                </Link>
                <Button asChild className="rounded-full px-6">
                  <Link href="/register">Mulai Gratis</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="py-24 md:py-32 flex flex-col items-center justify-center text-center px-6 bg-background">
          <div className="container mx-auto max-w-4xl space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Kelola Tagihan Bisnis Anda
              <br />
              <span className="text-primary">Lebih Cepat & Profesional</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Buat invoice, kirim ke klien, dan terima pembayaran dalam satu
              platform. Tanpa ribet, tanpa kertas, dan data tersimpan aman.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 rounded-full text-base font-semibold"
              >
                <Link href={user ? "/dashboard" : "/register"}>
                  Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full text-base cursor-pointer"
              >
                <button onClick={scrollToFeatures}>Pelajari Fitur</button>
              </Button>
            </div>
          </div>
        </section>

        {/* --- FEATURES (CENTERED & CLEAN) --- */}
        <section id="features" className="py-24 bg-muted/20 border-y">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Kenapa Harus 7ONG?
              </h2>
              <p className="text-muted-foreground">
                Kami mendesain alat ini untuk pengusaha yang benci ribet, tapi
                cinta kerapian.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Card 1 */}
              <div className="bg-card border p-8 rounded-2xl shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Invoice Generator</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Buat invoice PDF profesional lengkap dengan logo & data pajak
                  Anda dalam hitungan detik.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-card border p-8 rounded-2xl shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Public Payment Link</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Kirim link web ke klien. Mereka bisa lihat tagihan & bayar
                  tanpa perlu login atau install aplikasi.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-card border p-8 rounded-2xl shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Laporan Keuangan</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Grafik pendapatan real-time. Pantau cashflow bisnis Anda
                  langsung dari dashboard.
                </p>
              </div>

              {/* Card 4  */}
              <div className="md:col-span-3 bg-primary text-primary-foreground p-10 rounded-3xl shadow-md flex flex-col items-center text-center">
                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Kirim via Email Instan
                </h3>
                <p className="text-primary-foreground/80 max-w-lg mb-8">
                  Integrasi email langsung. Sekali klik, invoice mendarat di
                  inbox klien dengan tampilan profesional.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full px-8"
                  asChild
                >
                  <Link href="/register">Coba Fitur Ini</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="py-24 container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8 border rounded-4xl p-12 shadow-sm bg-card">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Mulai Rapikan Keuangan Anda Hari Ini
            </h2>
            <p className="text-lg text-muted-foreground">
              Bergabung dengan ribuan pengusaha cerdas lainnya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 px-10 rounded-full text-base"
              >
                <Link href="/register">Daftar Gratis - 30 Detik</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-10 rounded-full text-base"
              >
                <Link href="/login">Sudah punya akun?</Link>
              </Button>
            </div>

            <div className="pt-6 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Tanpa Kartu
                Kredit
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Batalkan Kapan
                Saja
              </span>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="py-12 border-t bg-background">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-center mb-10">
              Pertanyaan Umum
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Apakah aplikasi ini gratis?
                </AccordionTrigger>
                <AccordionContent>
                  Ya! Kami menyediakan paket dengan batasan tertentu. Anda bisa
                  upgrade kapan saja jika bisnis Anda berkembang.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Apakah data saya aman?
                </AccordionTrigger>
                <AccordionContent>
                  Sangat aman. Kami menggunakan enkripsi standar industri dan
                  database yang terlindungi untuk menyimpan informasi bisnis
                  Anda.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Bisakah saya pakai logo sendiri?
                </AccordionTrigger>
                <AccordionContent>
                  Tentu! Fitur personalisasi branding (Logo, Nama Perusahaan,
                  Pajak) tersedia di menu Pengaturan secara gratis.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <Image
                src="/invoicelogo-removebg-preview.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-sm">7ONG INVOICE</span>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-right">
            &copy; {new Date().getFullYear()} 7ONG Technology. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
