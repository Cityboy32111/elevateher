import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });

  if (!user) redirect("/login");
  if (!user.profile?.onboardingComplete) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Nav user={{ name: user.name, email: user.email }} />
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
