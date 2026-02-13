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

    // Get the user's profile to determine current phase and week
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    // Find the phase record
    const phase = await prisma.phase.findUnique({
      where: { number: profile.currentPhase },
    });

    if (!phase) {
      return NextResponse.json(
        { error: "Phase not found. Content may not be configured yet." },
        { status: 404 }
      );
    }

    // Find the week template for the user's current phase and week
    const weekTemplate = await prisma.weekTemplate.findUnique({
      where: {
        phaseId_weekNumber: {
          phaseId: phase.id,
          weekNumber: profile.currentWeek,
        },
      },
      include: {
        blocks: {
          include: {
            contentBlock: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    // Get the user's progress for this week
    const weekProgress = await prisma.weekProgress.findUnique({
      where: {
        userId_phaseNumber_weekNumber: {
          userId: session.userId,
          phaseNumber: profile.currentPhase,
          weekNumber: profile.currentWeek,
        },
      },
    });

    return NextResponse.json({
      phase: {
        number: profile.currentPhase,
        name: phase.name,
        description: phase.description,
      },
      currentWeek: profile.currentWeek,
      weekTemplate: weekTemplate ?? null,
      weekProgress: weekProgress ?? null,
    });
  } catch (error) {
    console.error("Get journey error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
