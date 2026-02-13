import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Verify the user has an employer_admin or executive org membership role
  const membership = await prisma.orgMembership.findFirst({
    where: {
      userId: session.userId,
      role: { in: ["hr_admin", "executive"] },
    },
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Admin top bar */}
      <header className="border-b border-[#2D2D2D]/8 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-tight text-[#2D2D2D]">
              elevate<span className="text-[#7C9A82]">her</span>
            </span>
            <span className="rounded-full bg-[#C4A49A]/15 px-2.5 py-0.5 text-xs font-medium text-[#9A7B71]">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#2D2D2D]/60">
              {membership.organization.name}
            </span>
            <a
              href="/dashboard"
              className="text-sm font-medium text-[#8BA4B8] hover:text-[#6B8A9E] transition-colors"
            >
              Back to App
            </a>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
