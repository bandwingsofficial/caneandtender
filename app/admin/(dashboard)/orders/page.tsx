"use client";

import useSWR from "swr";
import axios from "axios";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Razorpay prepaid → no pending/paid step
const ORDER_STAGES = [
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const { data, mutate } = useSWR("/api/admin/orders", fetcher);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
    });

    socket.emit("join_admin_room");

    // ✅ New Order instantly appear in UI
    socket.on("order:new", ({ order }) => {
      console.log("🆕 New Order", order);

      mutate(
        (current: any) => {
          if (!current?.orders) return current;
          return {
            orders: [
              { ...order, timeline: order.timeline ?? [] },
              ...current.orders,
            ],
          };
        },
        false // ❗don't refetch immediately
      );

      // small delay → stable UI refresh
      setTimeout(() => mutate(), 200);
    });

    // ✅ Order status update
    socket.on("order:updated", ({ orderId, status }) => {
      console.log("♻️ Order Updated", orderId, status);

      mutate(
        (current: any) => {
          if (!current?.orders) return current;
          return {
            orders: current.orders.map((o: any) =>
              o.id === orderId ? { ...o, status } : o
            ),
          };
        },
        false
      );

      setTimeout(() => mutate(), 200);
    });

    return () => {
      socket.off("order:new");
      socket.off("order:updated");
      socket.disconnect();
    };
  }, [mutate]);

  const updateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/update-status`, {
        status: nextStatus,
        note: `Moved to ${nextStatus}`,
      });

      mutate();
    } catch (err: any) {
      console.error("Update failed:", err.response?.data || err);
      alert(err.response?.data?.error || "Update failed");
    }
  };

  if (!data) return <div className="p-6">Loading orders...</div>;

  const orders = data.orders ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Orders Dashboard</h1>

      {orders.length === 0 && (
        <p className="text-gray-600">No orders yet...</p>
      )}

      <div className="space-y-4">
        {orders.map((order: any) => {
          const currentIndex = ORDER_STAGES.indexOf(order.status);
          const nextStage =
            currentIndex < ORDER_STAGES.length - 1
              ? ORDER_STAGES[currentIndex + 1]
              : null;

          return (
            <div key={order.id} className="border p-4 rounded-lg bg-white shadow-sm space-y-2">
              <p className="font-bold">Order #{order.orderNumber}</p>
              <p className="text-sm text-gray-500">
                Customer: {order.customerName} / {order.customerPhone}
              </p>
              <p>Status: <span className="font-semibold text-green-700">{order.status}</span></p>
              <p>Total: ₹{order.totalAmount.toFixed(2)}</p>

              {nextStage ? (
                <button
                  onClick={() => updateStatus(order.id, nextStage)}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Advance to: {nextStage.replace(/_/g, " ")}
                </button>
              ) : (
                <p className="text-green-600 font-medium">✔ Completed</p>
              )}

              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">Timeline</summary>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  {order.timeline?.map((t: any) => (
                    <li key={t.id}>
                      <strong>{t.status}</strong> — {t.note} (
                      {new Date(t.createdAt).toLocaleString()})
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
