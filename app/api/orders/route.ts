// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return NextResponse.json([], { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: true } },
      timeline: true,
      payment: true
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
