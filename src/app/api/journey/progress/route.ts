import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ALLOWED_FIELDS = ["actionDone", "scriptSaved", "reflectionText", "checkInDone"] as const;
type ProgressField = typeof ALLOWED_FIELDS[number];

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
    const { field, value } = body;

    if (!field || !ALLOWED_FIELDS.includes(field as ProgressField)) {
      return NextResponse.json(
        { error: `Invalid field. Allowed fields: ${ALLOWED_FIELDS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate field value types
    if (
      (field === "actionDone" || field === "scriptSaved" || field === "checkInDone") &&
      typeof value !== "boolean"
    ) {
      return NextResponse.json(
        { error: `Field '${field}' requires a boolean value` },
        { status: 400 }
      );
    }

    if (field === "reflectionText" && typeof value !== "string") {
      return NextResponse.json(
        { error: "Field 'reflectionText' requires a string value" },
        { status: 400 }
      );
    }

    // Get the user's profile for current phase/week
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    // Build the update data
    const updateData: Record<string, unknown> = {
      [field]: value,
    };

    // Upsert the week progress record
    const weekProgress = await prisma.weekProgress.upsert({
      where: {
        userId_phaseNumber_weekNumber: {
          userId: session.userId,
          phaseNumber: profile.currentPhase,
          weekNumber: profile.currentWeek,
        },
      },
      create: {
        userId: session.userId,
        phaseNumber: profile.currentPhase,
        weekNumber: profile.currentWeek,
        [field]: value,
      },
      update: updateData,
    });

    // Check if all progress items are complete and set completedAt
    if (
      weekProgress.actionDone &&
      weekProgress.scriptSaved &&
      weekProgress.reflectionText &&
      weekProgress.checkInDone &&
      !weekProgress.completedAt
    ) {
      await prisma.weekProgress.update({
        where: { id: weekProgress.id },
        data: { completedAt: new Date() },
      });
      weekProgress.completedAt = new Date();
    }

    return NextResponse.json({ weekProgress });
  } catch (error) {
    console.error("Update week progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
