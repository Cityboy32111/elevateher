import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find the user's org membership with an admin or executive role
    const membership = await prisma.orgMembership.findFirst({
      where: {
        userId: session.userId,
        role: { in: ["hr_admin", "executive"] },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden. Requires employer_admin or executive role." },
        { status: 403 }
      );
    }

    const organizationId = membership.organizationId;

    // Fetch analytics facts for the organization
    const analytics = await prisma.employerAnalyticsFact.findMany({
      where: { organizationId },
      orderBy: { period: "desc" },
    });

    // Compute aggregated summary from the most recent period
    const latest = analytics[0] ?? null;

    // Get total membership count for the org
    const totalMembers = await prisma.orgMembership.count({
      where: { organizationId },
    });

    return NextResponse.json({
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        totalSeats: membership.organization.totalSeats,
        usedSeats: membership.organization.usedSeats,
      },
      totalMembers,
      latestPeriod: latest
        ? {
            period: latest.period,
            totalEnrolled: latest.totalEnrolled,
            activeUsers: latest.activeUsers,
            checkInRate: latest.checkInRate,
            coachingUtil: latest.coachingUtil,
            avgRiskScore: latest.avgRiskScore,
            riskDistribution: JSON.parse(latest.riskDistribution),
            topPainPoints: JSON.parse(latest.topPainPoints),
            retentionProxy: latest.retentionProxy,
          }
        : null,
      historicalPeriods: analytics.map((a: typeof analytics[number]) => ({
        period: a.period,
        totalEnrolled: a.totalEnrolled,
        activeUsers: a.activeUsers,
        checkInRate: a.checkInRate,
        coachingUtil: a.coachingUtil,
        avgRiskScore: a.avgRiskScore,
        riskDistribution: JSON.parse(a.riskDistribution),
        topPainPoints: JSON.parse(a.topPainPoints),
        retentionProxy: a.retentionProxy,
      })),
    });
  } catch (error) {
    console.error("Get employer analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
