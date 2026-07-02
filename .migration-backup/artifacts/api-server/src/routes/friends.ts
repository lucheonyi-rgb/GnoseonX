import { Router } from "express";
import { eq, or, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable, friendRequestsTable } from "@workspace/db";

const router = Router();

// POST /api/friends/request — send a friend request by display name
router.post("/friends/request", async (req, res) => {
  const { fromUserId, displayName } = req.body as {
    fromUserId?: string;
    displayName?: string;
  };

  if (!fromUserId || !displayName) {
    res.status(400).json({ error: "fromUserId and displayName required." });
    return;
  }

  try {
    // Find target user by display name
    const targets = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.displayName, displayName.trim()))
      .limit(1);

    if (targets.length === 0) {
      res.status(404).json({ error: "User not found. Check the display name and try again." });
      return;
    }

    const target = targets[0];

    if (target.id === fromUserId) {
      res.status(400).json({ error: "You can't add yourself as a friend." });
      return;
    }

    // Check sender exists
    const senders = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, fromUserId))
      .limit(1);

    if (senders.length === 0) {
      res.status(404).json({ error: "Sender not found." });
      return;
    }

    const sender = senders[0];

    // Check if a request already exists between these two users
    const existing = await db
      .select()
      .from(friendRequestsTable)
      .where(
        or(
          and(
            eq(friendRequestsTable.fromUserId, fromUserId),
            eq(friendRequestsTable.toUserId, target.id)
          ),
          and(
            eq(friendRequestsTable.fromUserId, target.id),
            eq(friendRequestsTable.toUserId, fromUserId)
          )
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const ex = existing[0];
      if (ex.status === "accepted") {
        res.status(409).json({ error: "You are already friends." });
      } else if (ex.status === "pending") {
        res.status(409).json({ error: "A friend request already exists." });
      } else {
        // Rejected — allow re-sending
        await db
          .delete(friendRequestsTable)
          .where(eq(friendRequestsTable.id, ex.id));
        // Fall through to create new
        await db.insert(friendRequestsTable).values({
          id: uuidv4(),
          fromUserId: sender.id,
          fromDisplayName: sender.displayName,
          toUserId: target.id,
          toDisplayName: target.displayName,
          status: "pending",
        });
        res.status(201).json({ message: "Friend request sent!", to: target.displayName });
        return;
      }
      return;
    }

    await db.insert(friendRequestsTable).values({
      id: uuidv4(),
      fromUserId: sender.id,
      fromDisplayName: sender.displayName,
      toUserId: target.id,
      toDisplayName: target.displayName,
      status: "pending",
    });

    res.status(201).json({ message: "Friend request sent!", to: target.displayName });
  } catch (err) {
    req.log.error({ err }, "Failed to send friend request");
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/friends/requests?userId=xxx — get pending incoming requests
router.get("/friends/requests", async (req, res) => {
  const { userId } = req.query as { userId?: string };
  if (!userId) { res.status(400).json({ error: "userId required." }); return; }

  try {
    const rows = await db
      .select()
      .from(friendRequestsTable)
      .where(
        and(
          eq(friendRequestsTable.toUserId, userId),
          eq(friendRequestsTable.status, "pending")
        )
      );

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get friend requests");
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/friends?userId=xxx — get accepted friends list
router.get("/friends", async (req, res) => {
  const { userId } = req.query as { userId?: string };
  if (!userId) { res.status(400).json({ error: "userId required." }); return; }

  try {
    const rows = await db
      .select()
      .from(friendRequestsTable)
      .where(
        and(
          or(
            eq(friendRequestsTable.fromUserId, userId),
            eq(friendRequestsTable.toUserId, userId)
          ),
          eq(friendRequestsTable.status, "accepted")
        )
      );

    // Return the other person's display name and id for each friendship
    const friends = rows.map((r) =>
      r.fromUserId === userId
        ? { id: r.toUserId, displayName: r.toDisplayName, friendshipId: r.id }
        : { id: r.fromUserId, displayName: r.fromDisplayName, friendshipId: r.id }
    );

    res.json(friends);
  } catch (err) {
    req.log.error({ err }, "Failed to get friends list");
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/friends/respond — accept or reject a friend request
router.post("/friends/respond", async (req, res) => {
  const { requestId, action } = req.body as {
    requestId?: string;
    action?: "accept" | "reject";
  };

  if (!requestId || !action || !["accept", "reject"].includes(action)) {
    res.status(400).json({ error: "requestId and action (accept|reject) required." });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(friendRequestsTable)
      .where(eq(friendRequestsTable.id, requestId))
      .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Friend request not found." });
      return;
    }

    if (action === "reject") {
      await db.delete(friendRequestsTable).where(eq(friendRequestsTable.id, requestId));
    } else {
      await db
        .update(friendRequestsTable)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(friendRequestsTable.id, requestId));
    }

    res.json({ message: action === "accept" ? "Friend added!" : "Request rejected." });
  } catch (err) {
    req.log.error({ err }, "Failed to respond to friend request");
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
