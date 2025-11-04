import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admin allowed" }, { status: 403 });
    }

    const { id } = params;
    const { status, note } = await req.json();

    // ✅ Update order and timeline
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        timeline: {
          create: {
            status,
            note: note || `Status moved to ${status}`,
            actorId: user.id,
          },
        },
      },
    });

    // ✅ Correct WebSocket payload (ONLY status)
    const socketPayload = { status };

    try {
      // 👤 Notify customer room
      await fetch(`${process.env.SOCKET_SERVER_URL}/emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: id,
          event: "order:updated",
          payload: socketPayload,
        }),
      });

      // 👨‍🍳 Notify admin dashboard
      await fetch(`${process.env.SOCKET_SERVER_URL}/emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: "admin_room",
          event: "order:updated",
          payload: socketPayload,
        }),
      });
    } catch (err) {
      console.warn("⚠️ Socket emit failed", err);
    }

    return NextResponse.json({ success: true, order });

  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
