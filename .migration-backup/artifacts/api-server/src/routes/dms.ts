import { Router } from "express";
import { eq, or, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable, dmsTable, messagesTable } from "@workspace/db";

const router = Router();

// POST /api/dms/open — create or get existing DM between two users
router.post("/dms/open", async (req, res) => {
  const { fromUserId, toUserId } = req.body as {
    fromUserId?: string;
    toUserId?: string;
  };

  if (!fromUserId || !toUserId) {
    res.status(400).json({ error: "fromUserId and toUserId required." });
    return;
  }
  if (fromUserId === toUserId) {
    res.status(400).json({ error: "Cannot DM yourself." });
    return;
  }

  try {
    // Check if DM already exists
    const existing = await db
      .select()
      .from(dmsTable)
      .where(
        or(
          and(eq(dmsTable.user1Id, fromUserId), eq(dmsTable.user2Id, toUserId)),
          and(eq(dmsTable.user1Id, toUserId), eq(dmsTable.user2Id, fromUserId))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      res.json({ id: existing[0].id, created: false });
      return;
    }

    // Fetch both users
    const [fromUser, toUser] = await Promise.all([
      db.select().from(usersTable).where(eq(usersTable.id, fromUserId)).limit(1),
      db.select().from(usersTable).where(eq(usersTable.id, toUserId)).limit(1),
    ]);

    if (fromUser.length === 0 || toUser.length === 0) {
      res.status(404).json({ error: "One or both users not found." });
      return;
    }

    const id = uuidv4();
    await db.insert(dmsTable).values({
      id,
      user1Id: fromUser[0].id,
      user1DisplayName: fromUser[0].displayName,
      user2Id: toUser[0].id,
      user2DisplayName: toUser[0].displayName,
    });

    res.status(201).json({ id, created: true });
  } catch (err) {
    req.log.error({ err }, "Failed to open DM");
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/dms?userId=xxx — get all DMs for a user with last message info
router.get("/dms", async (req, res) => {
  const { userId } = req.query as { userId?: string };
  if (!userId) { res.status(400).json({ error: "userId required." }); return; }

  try {
    const rows = await db
      .select()
      .from(dmsTable)
      .where(or(eq(dmsTable.user1Id, userId), eq(dmsTable.user2Id, userId)));

    // For each DM, get the last message
    const dmsWithLastMsg = await Promise.all(
      rows.map(async (dm) => {
        const lastMsgs = await db
          .select()
          .from(messagesTable)
          .where(eq(messagesTable.dmId, dm.id))
          .orderBy(desc(messagesTable.createdAt))
          .limit(1);

        const otherId = dm.user1Id === userId ? dm.user2Id : dm.user1Id;
        const otherDisplayName =
          dm.user1Id === userId ? dm.user2DisplayName : dm.user1DisplayName;

        return {
          id: dm.id,
          otherId,
          otherDisplayName,
          createdAt: dm.createdAt,
          lastMessage: lastMsgs.length > 0 ? {
            id: lastMsgs[0].id,
            content: lastMsgs[0].content,
            senderId: lastMsgs[0].senderId,
            senderName: lastMsgs[0].senderName,
            type: lastMsgs[0].type,
            createdAt: lastMsgs[0].createdAt,
          } : null,
        };
      })
    );

    // Sort by last message time descending
    dmsWithLastMsg.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    res.json(dmsWithLastMsg);
  } catch (err) {
    req.log.error({ err }, "Failed to get DMs");
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
