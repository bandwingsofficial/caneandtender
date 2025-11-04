"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useOrderSocket(orderId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Socket connected, joining room:", orderId);
      s.emit("join_order_room", orderId);
    });

    // ✅ Valid cleanup — does NOT return a Socket
    return () => {
      console.log("🔌 Cleaning up socket on unmount");
      s.emit("leave_order_room", orderId);
      s.disconnect();
    };
  }, [orderId]);

  return socket;
}
