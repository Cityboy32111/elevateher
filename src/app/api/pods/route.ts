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

    // Find all pods the user is a member of, with recent posts
    const memberships = await prisma.podMembership.findMany({
      where: { userId: session.userId },
      include: {
        pod: {
          include: {
            posts: {
              orderBy: { createdAt: "desc" },
              take: 5,
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
                _count: {
                  select: { comments: true },
                },
              },
            },
            _count: {
              select: { memberships: true },
            },
          },
        },
      },
    });

    const pods = memberships.map((m: typeof memberships[number]) => ({
      ...m.pod,
      joinedAt: m.joinedAt,
    }));

    return NextResponse.json({ pods });
  } catch (error) {
    console.error("Get pods error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
