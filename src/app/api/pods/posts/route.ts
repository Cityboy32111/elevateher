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
    const { podId, content } = body;

    if (!podId || !content) {
      return NextResponse.json(
        { error: "podId and content are required" },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Post content cannot be empty" },
        { status: 400 }
      );
    }

    // Verify the user is a member of the pod
    const membership = await prisma.podMembership.findUnique({
      where: {
        userId_podId: {
          userId: session.userId,
          podId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this pod" },
        { status: 403 }
      );
    }

    const post = await prisma.podPost.create({
      data: {
        podId,
        userId: session.userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create pod post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const podId = searchParams.get("podId");

    if (!podId) {
      return NextResponse.json(
        { error: "podId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify the user is a member of the pod
    const membership = await prisma.podMembership.findUnique({
      where: {
        userId_podId: {
          userId: session.userId,
          podId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this pod" },
        { status: 403 }
      );
    }

    const posts = await prisma.podPost.findMany({
      where: { podId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Get pod posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
