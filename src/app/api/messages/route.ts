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
    const threadId = searchParams.get("threadId");
    const partnerId = searchParams.get("partnerId");

    // Build query filter
    const where: Record<string, unknown> = {
      OR: [
        { senderId: session.userId },
        { receiverId: session.userId },
      ],
    };

    if (threadId) {
      where.threadId = threadId;
    }

    if (partnerId) {
      where.OR = [
        { senderId: session.userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: session.userId },
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
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
    const { receiverId, content, threadId } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content are required" },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    if (receiverId === session.userId) {
      return NextResponse.json(
        { error: "Cannot send a message to yourself" },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.userId,
        receiverId,
        content: content.trim(),
        threadId: threadId ?? null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
