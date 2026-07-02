import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";

import { v4 as uuidv4 } from "uuid";

const router = Router();

// POST /api/messages
router.post("/messages", async (req, res) => {
  const { content, senderId, senderName, senderImage, channelId, dmId, type, mediaUrl } = req.body as {
    content?: string;
    senderId?: string;
    senderName?: string;
    senderImage?: string;
    channelId?: string;
    dmId?: string;
    type?: string;
    mediaUrl?: string;
  };

  if (!senderId || !senderName) {
    res.status(400).json({ error: "senderId and senderName are required." });
    return;
  }
  if (!channelId && !dmId) {
    res.status(400).json({ error: "channelId or dmId is required." });
    return;
  }

  try {
    const id = uuidv4();
    await db.insert(messagesTable).values({
      id,
      content: content || "",
      senderId,
      senderName,
      senderImage: senderImage ?? null,
      channelId: channelId ?? null,
      dmId: dmId ?? null,
      type: type ?? "text",
      mediaUrl: mediaUrl ?? null,
    });

    res.status(201).json({ id });
  } catch (err) {
    req.log.error({ err }, "Failed to create message");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/messages?channelId=xxx  or  ?dmId=xxx
router.get("/messages", async (req, res) => {
  const { channelId, dmId } = req.query as { channelId?: string; dmId?: string };

  if (!channelId && !dmId) {
    res.status(400).json({ error: "channelId or dmId required" });
    return;
  }

  try {
    const rows = channelId
      ? await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.channelId, channelId))
          .orderBy(asc(messagesTable.createdAt))
          .limit(100)
      : await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.dmId, dmId!))
          .orderBy(asc(messagesTable.createdAt))
          .limit(100);

    const messages = rows.map((r) => ({
      id: r.id,
      content: r.content,
      senderId: r.senderId,
      senderName: r.senderName,
      senderImage: r.senderImage,
      channelId: r.channelId,
      dmId: r.dmId,
      type: r.type,
      mediaUrl: r.mediaUrl,
      reactions: [],
      edited: r.edited,
      replyToId: r.replyToId,
      replyToSenderName: r.replyToSenderName,
      replyToContent: r.replyToContent,
      createdAt: r.createdAt.toISOString(),
    }));

    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
