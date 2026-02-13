import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { computeRiskScore, triggerActionForTier } from "@/lib/engines/risk";

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
      weekNumber,
      mood,
      energy,
      sleepQuality,
      stress,
      workloadManageable,
      managerSupportPresent,
      childcareStable,
      performanceAnxiety,
      hardestThisWeek,
    } = body;

    // Validate required numeric fields
    if (
      typeof weekNumber !== "number" ||
      typeof mood !== "number" ||
      typeof energy !== "number" ||
      typeof sleepQuality !== "number" ||
      typeof stress !== "number"
    ) {
      return NextResponse.json(
        { error: "weekNumber, mood, energy, sleepQuality, and stress are required as numbers" },
        { status: 400 }
      );
    }

    if (typeof workloadManageable !== "boolean" ||
        typeof managerSupportPresent !== "boolean" ||
        typeof childcareStable !== "boolean" ||
        typeof performanceAnxiety !== "boolean") {
      return NextResponse.json(
        { error: "workloadManageable, managerSupportPresent, childcareStable, and performanceAnxiety are required as booleans" },
        { status: 400 }
      );
    }

    // Create the check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: session.userId,
        weekNumber,
        mood,
        energy,
        sleepQuality,
        stress,
        workloadManageable,
        managerSupportPresent,
        childcareStable,
        performanceAnxiety,
        hardestThisWeek: hardestThisWeek ?? null,
      },
    });

    // Fetch previous check-in for trend analysis
    const previousCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: session.userId,
        id: { not: checkIn.id },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute risk score
    const currentData = {
      mood,
      energy,
      sleepQuality,
      stress,
      workloadManageable,
      managerSupportPresent,
      childcareStable,
      performanceAnxiety,
    };

    const previousData = previousCheckIn
      ? {
          mood: previousCheckIn.mood,
          energy: previousCheckIn.energy,
          sleepQuality: previousCheckIn.sleepQuality,
          stress: previousCheckIn.stress,
          workloadManageable: previousCheckIn.workloadManageable,
          managerSupportPresent: previousCheckIn.managerSupportPresent,
          childcareStable: previousCheckIn.childcareStable,
          performanceAnxiety: previousCheckIn.performanceAnxiety,
        }
      : null;

    const riskResult = computeRiskScore(currentData, previousData);

    // Save risk score (upsert to allow one per user per week)
    const riskScore = await prisma.riskScore.upsert({
      where: {
        userId_weekNumber: {
          userId: session.userId,
          weekNumber,
        },
      },
      create: {
        userId: session.userId,
        weekNumber,
        score: riskResult.score,
        tier: riskResult.tier,
        factors: JSON.stringify(riskResult.factors),
      },
      update: {
        score: riskResult.score,
        tier: riskResult.tier,
        factors: JSON.stringify(riskResult.factors),
      },
    });

    // Create trigger event if risk tier is medium or above
    let triggerEvent = null;
    if (riskResult.tier !== "low") {
      triggerEvent = await prisma.triggerEvent.create({
        data: {
          userId: session.userId,
          riskTier: riskResult.tier,
          action: triggerActionForTier(riskResult.tier),
        },
      });
    }

    return NextResponse.json(
      {
        checkIn,
        riskScore,
        triggerEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Check-in error:", error);
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

    const checkIns = await prisma.checkIn.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error("Get check-ins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
