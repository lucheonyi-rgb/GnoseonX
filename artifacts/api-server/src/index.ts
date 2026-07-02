import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";
import { db, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
    recipientId?: string;
    type?: string;
    mediaUrl?: string;
    mediaName?: string;
    replyToId?: string;
    replyToSenderName?: string;
    replyToContent?: string;
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
        mediaName: payload.mediaName ?? null,
        replyToId: payload.replyToId ?? null,
        replyToSenderName: payload.replyToSenderName ?? null,
        replyToContent: payload.replyToContent ?? null,
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

      // For DMs: notify both participants' personal rooms so sidebar badges update
      if (payload.dmId) {
        const dmUpdate = {
          dmId: payload.dmId,
          lastMessage: {
            content: payload.content || "",
            senderId: payload.senderId,
            senderName: payload.senderName,
            createdAt: new Date().toISOString(),
          },
        };
        io.to(`user:${payload.senderId}`).emit("dm:updated", dmUpdate);
        if (payload.recipientId) {
          io.to(`user:${payload.recipientId}`).emit("dm:updated", dmUpdate);
        }
      }
    } catch (err) {
      logger.error({ err }, "Failed to save/broadcast message");
    }
  });

  socket.on("edit_message", async (payload: {
    id: string;
    content: string;
    channelId?: string;
    dmId?: string;
  }) => {
    if (!payload.id || !payload.content) return;

    try {
      await db
        .update(messagesTable)
        .set({ content: payload.content, edited: true, updatedAt: new Date() })
        .where(eq(messagesTable.id, payload.id));

      const roomId = payload.channelId
        ? `channel:${payload.channelId}`
        : `dm:${payload.dmId}`;

      io.to(roomId).emit("message_edited", { id: payload.id, content: payload.content });
      logger.info({ messageId: payload.id }, "Message edited");
    } catch (err) {
      logger.error({ err }, "Failed to edit message");
    }
  });

  socket.on("delete_message", async (payload: {
    id: string;
    channelId?: string;
    dmId?: string;
  }) => {
    if (!payload.id) return;

    try {
      await db.delete(messagesTable).where(eq(messagesTable.id, payload.id));

      const roomId = payload.channelId
        ? `channel:${payload.channelId}`
        : `dm:${payload.dmId}`;

      io.to(roomId).emit("message_deleted", { id: payload.id });
      logger.info({ messageId: payload.id }, "Message deleted");
    } catch (err) {
      logger.error({ err }, "Failed to delete message");
    }
  });

  socket.on("add_reaction", (payload: {
    messageId: string;
    emoji: string;
    userId: string;
    channelId?: string;
    dmId?: string;
  }) => {
    if (!payload.messageId || !payload.emoji || !payload.userId) return;

    const roomId = payload.channelId
      ? `channel:${payload.channelId}`
      : `dm:${payload.dmId}`;

    io.to(roomId).emit("reaction_updated", {
      messageId: payload.messageId,
      emoji: payload.emoji,
      userId: payload.userId,
    });
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Socket disconnected");
  });
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});
