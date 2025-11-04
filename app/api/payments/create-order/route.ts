import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customer, items, totalAmount } = body;

    if (!customer || !items?.length) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // ✅ Create Order in DB (NO PENDING TIMELINE)
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        user: { connect: { email: session.user.email } },
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: session.user.email,
        address: `${customer.address1}, ${customer.address2}, ${customer.city}, ${customer.pincode}`,
        totalAmount,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.discountPrice ?? item.price,
          })),
        },
      },
    });

    // ✅ Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // ✅ Create Razorpay Order
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order.id,
    });

    // ✅ Save initial Payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: rzpOrder.id,
        amount: Math.round(totalAmount * 100),
        status: "created",
      },
    });

    // ✅ Emit Socket event to admin
    try {
      await fetch(`${process.env.SOCKET_SERVER_URL}/emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: "admin_room",
          event: "order:new",
          payload: { orderId: order.id, status: "PENDING" },
        }),
      });
    } catch (err) {
      console.warn("⚠️ Admin socket notification failed", err);
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
