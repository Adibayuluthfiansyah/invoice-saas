import { getSession } from "@/lib/session";
import LandingPageClient from "@/components/dashboard/LandingPageClient";

export default async function Home() {
  const session = await getSession();
  const userId = session?.userId ? String(session.userId) : null;

  return (
    <div className="min-h-screen justify-center items-center">
      <div className="grid gap-4">
        <LandingPageClient user={userId} />
      </div>
    </div>
  );
}
