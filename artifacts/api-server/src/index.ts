import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";
import { db, messagesTable } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  path: "/api/socket.io/",
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Socket connected");

  socket.on("join_room", (roomId: string) => {
    // Leave all previous chat rooms (channel:* and dm:*) before joining the new one
    for (const room of socket.rooms) {
      if (room !== socket.id && (room.startsWith("channel:") || room.startsWith("dm:"))) {
        socket.leave(room);
        logger.info({ socketId: socket.id, room }, "Left room");
      }
    }
    socket.join(roomId);
    logger.info({ socketId: socket.id, roomId }, "Joined room");
  });

  socket.on("join_user_room", (userId: string) => {
    socket.join(`user:${userId}`);
    logger.info({ socketId: socket.id, userId }, "Joined user room");
  });

  socket.on("send_message", async (payload: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    channelId?: string;
    dmId?: string;
    type?: string;
    mediaUrl?: string;
  }) => {
    if (!payload.id || !payload.senderId || !payload.senderName) return;
    if (!payload.channelId && !payload.dmId) return;

    try {
      await db.insert(messagesTable).values({
        id: payload.id,
        content: payload.content || "",
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderImage: payload.senderImage ?? null,
        channelId: payload.channelId ?? null,
        dmId: payload.dmId ?? null,
        type: payload.type ?? "text",
        mediaUrl: payload.mediaUrl ?? null,
      });

      const outgoing = {
        ...payload,
        reactions: [],
        edited: false,
        createdAt: new Date().toISOString(),
      };

      const roomId = payload.channelId
        ? `channel:${payload.channelId}`
        : `dm:${payload.dmId}`;

      io.to(roomId).emit("new_message", outgoing);
      logger.info({ roomId, messageId: payload.id }, "Message broadcast");
    } catch (err) {
      logger.error({ err }, "Failed to save/broadcast message");
    }
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Socket disconnected");
  });
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});
