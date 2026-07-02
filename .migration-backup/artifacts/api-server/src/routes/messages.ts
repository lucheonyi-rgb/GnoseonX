import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";

const router = Router();

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
      edited: false,
      createdAt: r.createdAt.toISOString(),
    }));

    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
