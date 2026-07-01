import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { db, messagesTable } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  path: "/api/socket.io/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Socket connected");

  // Join a room (channel or dm)
  socket.on("join_room", (roomId: string) => {
    socket.rooms.forEach((r) => { if (r !== socket.id) socket.leave(r); });
    socket.join(roomId);
    logger.info({ socketId: socket.id, roomId }, "Joined room");
  });

  // Send a message — save to DB, broadcast to room
  socket.on("send_message", async (payload: {
    id?: string;
    content: string;
    senderId: string;
    senderName: string;
    senderImage?: string;
    channelId?: string;
    dmId?: string;
    type?: string;
    mediaUrl?: string;
  }) => {
    try {
      const id = payload.id || uuidv4();
      const roomId = payload.channelId
        ? `channel:${payload.channelId}`
        : `dm:${payload.dmId}`;

      await db.insert(messagesTable).values({
        id,
        content: payload.content,
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderImage: payload.senderImage ?? null,
        channelId: payload.channelId ?? null,
        dmId: payload.dmId ?? null,
        type: payload.type ?? "text",
        mediaUrl: payload.mediaUrl ?? null,
      });

      const saved = {
        id,
        content: payload.content,
        senderId: payload.senderId,
        senderName: payload.senderName,
        senderImage: payload.senderImage,
        channelId: payload.channelId,
        dmId: payload.dmId,
        type: payload.type ?? "text",
        mediaUrl: payload.mediaUrl,
        reactions: [],
        edited: false,
        createdAt: new Date().toISOString(),
      };

      io.to(roomId).emit("new_message", saved);
    } catch (err) {
      logger.error({ err }, "Failed to save message");
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Socket disconnected");
  });
});

httpServer.listen(port, (err?: Error) => {
  if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
  logger.info({ port }, "Server listening");
});
