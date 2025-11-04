import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // 🔥 prevents cache issues

export async function POST(req: Request) {
  try {
    const payload = await req.text(); // ⚠️ raw body
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Webhook signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(payload);
    const eventType = event.event;

    // 📌 Extract IDs
    const razorpayOrderId = event?.payload?.payment?.entity?.order_id;
    const paymentId = event?.payload?.payment?.entity?.id;
    const status = event?.payload?.payment?.entity?.status;

    if (!razorpayOrderId) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // ✅ Get our DB order
    const dbPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId },
    });

    if (!dbPayment) {
      console.error("⚠️ No payment record found for webhook order");
      return NextResponse.json({ received: true });
    }

    // ✅ Process payment status
    if (eventType === "payment.captured") {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: {
          razorpayPaymentId: paymentId,
          status: "captured",
          capturedAt: new Date(),
        },
      });

      await prisma.order.update({
        where: { id: dbPayment.orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });

      await prisma.fulfillmentEvent.create({
        data: {
          orderId: dbPayment.orderId,
          status: "CONFIRMED",
          note: "Payment confirmed via Razorpay webhook",
        },
      });
    }

    if (eventType === "payment.failed") {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: {
          status: "failed",
        },
      });

      await prisma.order.update({
        where: { id: dbPayment.orderId },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
      });

      await prisma.fulfillmentEvent.create({
        data: {
          orderId: dbPayment.orderId,
          status: "CANCELLED",
          note: "Payment failed via Razorpay webhook",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
