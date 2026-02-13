import { NextRequest, NextResponse } from "next/server";
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

    const sessions = await prisma.coachingSession.findMany({
      where: { userId: session.userId },
      orderBy: { scheduledAt: "desc" },
      include: {
        coach: {
          select: {
            id: true,
            bio: true,
            specialties: true,
            timezone: true,
          },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Get coaching sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { coachId, scheduledAt, duration } = body;

    if (!coachId || !scheduledAt) {
      return NextResponse.json(
        { error: "coachId and scheduledAt are required" },
        { status: 400 }
      );
    }

    // Validate the coach exists
    const coach = await prisma.coachProfile.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    // Validate the scheduled time is in the future
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "scheduledAt must be a valid future date" },
        { status: 400 }
      );
    }

    // Validate duration if provided
    const sessionDuration = duration ?? 30;
    if (typeof sessionDuration !== "number" || sessionDuration < 15 || sessionDuration > 120) {
      return NextResponse.json(
        { error: "Duration must be between 15 and 120 minutes" },
        { status: 400 }
      );
    }

    const coachingSession = await prisma.coachingSession.create({
      data: {
        userId: session.userId,
        coachId,
        scheduledAt: scheduledDate,
        duration: sessionDuration,
      },
      include: {
        coach: {
          select: {
            id: true,
            bio: true,
            specialties: true,
            timezone: true,
          },
        },
      },
    });

    return NextResponse.json({ session: coachingSession }, { status: 201 });
  } catch (error) {
    console.error("Book coaching session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
