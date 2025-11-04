// server/socket.js
import http from "http";
import express from "express";
import { Server } from "socket.io";

// Create express app
const app = express();
app.use(express.json());

// Create HTTP + WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For dev; restrict in production
    methods: ["GET", "POST"],
  },
});

// --- SOCKET.IO CONNECTION HANDLERS ---

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Customer joins order-specific room
  socket.on("join_order_room", (orderId) => {
    socket.join(orderId);
    console.log(`📦 ${socket.id} joined order room: ${orderId}`);
  });

  // Admin joins a global room for new orders
  socket.on("join_admin_room", () => {
    socket.join("admin_room");
    console.log(`🧑‍💼 ${socket.id} joined admin room`);
  });

  // Log disconnections
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// --- EXPRESS ENDPOINTS (used by your Next.js API) ---

// Health check (optional)
app.get("/", (req, res) => {
  res.send("✅ Socket server is running");
});

// This endpoint lets your Next.js backend emit events
// Example POST body:
// { "room": "orderId or admin_room", "event": "order_status_update", "payload": {...} }
app.post("/emit", (req, res) => {
  const { room, event, payload } = req.body;

  if (!room || !event) {
    return res.status(400).json({ error: "Missing room or event" });
  }

  io.to(room).emit(event, payload);
  console.log(`📢 Emitted event "${event}" to room "${room}"`);
  return res.json({ ok: true });
});

// Start server
const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Socket server listening on port ${PORT}`);
});
