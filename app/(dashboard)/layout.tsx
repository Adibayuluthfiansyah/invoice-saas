import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { MainNav } from "@/components/dashboard/MainNav";
import { UserNav } from "@/components/dashboard/UserNav";
import { MobileNav } from "@/components/dashboard/MobileNav";
import Link from "next/link";

async function getUser() {
  const session = await getSession();
  if (!session || !session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: {
      id: true,
      name: true,
      email: true,
      businessProfile: { select: { companyName: true } },
    },
  });

  return user;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    return redirect("/login");
  }

  const companyName = user.businessProfile?.companyName || "INVOICE SAAS";

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      {/* --- NAVBAR START --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Menu */}
          <div className="flex items-center gap-4 md:gap-8">
            <MobileNav companyName={companyName} />

            <Link
              href="/dashboard"
              className="font-bold text-xl tracking-tight flex items-center gap-2"
            >
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                {companyName.charAt(0).toUpperCase()}
              </div>
            </Link>

            <div className="hidden md:flex">
              <MainNav />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2">
            <UserNav
              user={{
                name: user.name,
                email: user.email,
              }}
            />
          </div>
        </div>
      </header>
      {/* --- NAVBAR END --- */}

      <main className="flex-1 container py-6 px-4 md:px-8">{children}</main>
    </div>
  );
}
