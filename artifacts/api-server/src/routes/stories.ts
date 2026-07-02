import { Router, type Request, type Response } from "express";
import { eq, gt, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { db, storiesTable } from "@workspace/db";

const router = Router();

const CreateStoryBody = z.object({
  userId: z.string(),
  userName: z.string(),
  userImage: z.string().optional(),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
  bgColor: z.string().optional(),
});

router.get("/stories", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(storiesTable)
      .where(gt(storiesTable.expiresAt, now))
      .orderBy(storiesTable.createdAt);

    res.json(rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      userImage: r.userImage ?? undefined,
      text: r.text ?? undefined,
      mediaUrl: r.mediaUrl ?? undefined,
      mediaType: r.mediaType ?? undefined,
      bgColor: r.bgColor ?? undefined,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      viewers: [],
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to fetch stories");
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/stories", async (req: Request, res: Response) => {
  const parsed = CreateStoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid story data." });
    return;
  }

  const { userId, userName, userImage, text, mediaUrl, mediaType, bgColor } = parsed.data;

  if (!text && !mediaUrl) {
    res.status(400).json({ error: "Story must have text or media." });
    return;
  }

  try {
    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await db.insert(storiesTable).values({
      id,
      userId,
      userName,
      userImage: userImage ?? null,
      text: text ?? null,
      mediaUrl: mediaUrl ?? null,
      mediaType: mediaType ?? null,
      bgColor: bgColor ?? null,
      expiresAt,
    });

    const story = {
      id,
      userId,
      userName,
      userImage,
      text,
      mediaUrl,
      mediaType,
      bgColor,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      viewers: [],
    };

    res.status(201).json(story);
  } catch (err) {
    req.log.error({ err }, "Failed to create story");
    res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/stories/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query as { userId?: string };

  if (!userId) {
    res.status(400).json({ error: "userId required." });
    return;
  }

  try {
    await db
      .delete(storiesTable)
      .where(and(eq(storiesTable.id, id), eq(storiesTable.userId, userId)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete story");
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
