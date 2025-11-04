"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useOrderSocket } from "@/hooks/useOrderSocket";

interface TimelineEvent {
  id?: string;
  status: string;
  note: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  address: string;
  timeline: TimelineEvent[];
}

export default function OrderStatusPage() {
  const { id } = useParams();
  const orderId = id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const socket = useOrderSocket(orderId);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}?t=${Date.now()}`);
      const data = await res.json();

      setOrder({
        ...data.order,
        timeline: data.timeline,
      });
    } catch {
      toast.error("Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // ✅ Socket listener
  useEffect(() => {
    if (!socket) {
      console.log("⏳ Waiting for socket...");
      return;
    }

    const handler = ({ status }: { status: string }) => {
      console.log("📩 Live update:", status);
      toast.success(`Order status updated: ${status}`);
      fetchOrder();
    };

    socket.on("order:updated", handler);

    // ✅ Correct cleanup function (no returning socket)
    return () => {
      socket.off("order:updated", handler);
    };
  }, [socket]);

  if (loading) return <div className="text-center p-10">Loading order...</div>;
  if (!order) return <div className="text-center p-10">Order not found</div>;

  const steps = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Order #{order.orderNumber}</h1>

      <p className="text-lg font-semibold text-green-700 mb-6">
        Current Status: {order.status}
      </p>

      <div className="space-y-4 border-l-2 border-green-600 pl-4 mb-8">
        {order.timeline.map((ev, i) => (
          <div key={i} className="relative mb-4">
            <div className="w-3 h-3 bg-green-600 rounded-full absolute -left-[10px] top-1"></div>
            <p className="font-semibold text-gray-800">{ev.status}</p>
            <p className="text-sm text-gray-500">{ev.note}</p>
            <p className="text-xs text-gray-400">{new Date(ev.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center py-6">
        {steps.map((s) => {
          const active = s === order.status;
          const done = steps.indexOf(order.status) >= steps.indexOf(s);

          return (
            <div key={s} className="flex flex-col items-center text-xs">
              <div className={`h-4 w-4 rounded-full mb-1 ${done ? "bg-green-600" : "bg-gray-300"}`} />
              <span className={`${active ? "text-green-700 font-bold" : "text-gray-600"}`}>
                {s.replace(/_/g, " ")}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t pt-6 text-sm">
        <p><strong>Name:</strong> {order.customerName}</p>
        <p><strong>Phone:</strong> {order.customerPhone}</p>
        <p><strong>Address:</strong> {order.address}</p>
        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
      </div>
    </div>
  );
}
