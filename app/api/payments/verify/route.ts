import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      await req.json();

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const data = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Razorpay signature mismatch");
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // ✅ Update Payment
    await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "captured",
        capturedAt: new Date(),
      },
    });

    // ✅ Update Order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });

    // ✅ Add timeline event
    await prisma.fulfillmentEvent.create({
      data: {
        orderId,
        status: "CONFIRMED",
        note: "Payment verified successfully",
      },
    });

    // ✅ Clear cart
    if (updatedOrder.userId) {
      await prisma.cart.deleteMany({ where: { userId: updatedOrder.userId } });
    }

    // ✅ Real-time emit to customer & admin
    try {
      await fetch(`${process.env.SOCKET_SERVER_URL}/emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: orderId,               // customer room
          event: "order:updated",
          payload: { status: "CONFIRMED", orderId },
        }),
      });

      await fetch(`${process.env.SOCKET_SERVER_URL}/emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: "admin_room",         // admin notification
          event: "order:updated",
          payload: { orderId, status: "CONFIRMED" },
        }),
      });
    } catch (err) {
      console.warn("⚠️ Socket emit skipped (server offline?)");
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
