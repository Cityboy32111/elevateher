import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="flex h-14 items-center justify-center border-b border-[#2D2D2D]/8 bg-white">
        <span className="text-lg font-semibold tracking-tight text-[#2D2D2D]">
          elevate<span className="text-[#7C9A82]">her</span>
        </span>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
