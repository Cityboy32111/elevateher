import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const { toolkitId } = body;

    if (!toolkitId) {
      return NextResponse.json(
        { error: "toolkitId is required" },
        { status: 400 }
      );
    }

    // Verify the toolkit exists
    const toolkit = await prisma.toolkit.findUnique({
      where: { id: toolkitId },
      select: { id: true },
    });

    if (!toolkit) {
      return NextResponse.json(
        { error: "Toolkit not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existing = await prisma.toolkitFavorite.findUnique({
      where: {
        userId_toolkitId: {
          userId: session.userId,
          toolkitId,
        },
      },
    });

    if (existing) {
      // Remove favorite (toggle off)
      await prisma.toolkitFavorite.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ favorited: false, toolkitId });
    }

    // Add favorite (toggle on)
    await prisma.toolkitFavorite.create({
      data: {
        userId: session.userId,
        toolkitId,
      },
    });

    return NextResponse.json({ favorited: true, toolkitId }, { status: 201 });
  } catch (error) {
    console.error("Toggle toolkit favorite error:", error);
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

    const favorites = await prisma.toolkitFavorite.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        toolkit: true,
      },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Get toolkit favorites error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
