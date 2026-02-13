import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { computePhaseAndWeek } from "@/lib/engines/personalization";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      dueDate,
      childBirthDate,
      leaveStartDate,
      returnToWorkDate,
      roleLevel,
      roleFunction,
      workMode,
      managerSupportLevel,
      childcareSituation,
      topStressors,
      topStressorsFreeText,
      goals,
      companyType,
      supportSystem,
    } = body;

    // Compute phase and week based on dates
    const { phase, week } = computePhaseAndWeek({
      dueDate,
      childBirthDate,
      leaveStartDate,
      returnToWorkDate,
    });

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        childBirthDate: childBirthDate ? new Date(childBirthDate) : null,
        leaveStartDate: leaveStartDate ? new Date(leaveStartDate) : null,
        returnToWorkDate: returnToWorkDate ? new Date(returnToWorkDate) : null,
        roleLevel: roleLevel ?? null,
        roleFunction: roleFunction ?? null,
        workMode: workMode ?? null,
        managerSupportLevel: managerSupportLevel ?? null,
        childcareSituation: childcareSituation ?? null,
        topStressors: topStressors
          ? JSON.stringify(topStressors)
          : null,
        topStressorsFreeText: topStressorsFreeText ?? null,
        goals: goals ? JSON.stringify(goals) : null,
        companyType: companyType ?? null,
        supportSystem: supportSystem ?? null,
        currentPhase: phase,
        currentWeek: week,
        onboardingComplete: true,
      },
      update: {
        dueDate: dueDate ? new Date(dueDate) : null,
        childBirthDate: childBirthDate ? new Date(childBirthDate) : null,
        leaveStartDate: leaveStartDate ? new Date(leaveStartDate) : null,
        returnToWorkDate: returnToWorkDate ? new Date(returnToWorkDate) : null,
        roleLevel: roleLevel ?? null,
        roleFunction: roleFunction ?? null,
        workMode: workMode ?? null,
        managerSupportLevel: managerSupportLevel ?? null,
        childcareSituation: childcareSituation ?? null,
        topStressors: topStressors
          ? JSON.stringify(topStressors)
          : null,
        topStressorsFreeText: topStressorsFreeText ?? null,
        goals: goals ? JSON.stringify(goals) : null,
        companyType: companyType ?? null,
        supportSystem: supportSystem ?? null,
        currentPhase: phase,
        currentWeek: week,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get onboarding profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
