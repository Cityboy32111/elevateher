import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build dynamic where clause
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const toolkits = await prisma.toolkit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        favorites: {
          where: { userId: session.userId },
          select: { id: true },
        },
      },
    });

    // Reshape to include a simple `isFavorited` boolean
    const result = toolkits.map((toolkit: typeof toolkits[number]) => {
      const { favorites, ...rest } = toolkit;
      return {
        ...rest,
        isFavorited: favorites.length > 0,
      };
    });

    return NextResponse.json({ toolkits: result });
  } catch (error) {
    console.error("Get toolkits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
