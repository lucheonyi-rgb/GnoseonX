import { Router } from "express";
import { eq } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db, usersTable } from "@workspace/db";

const router = Router();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = createHash("sha256").update(password + salt).digest("hex");
  return check === hash;
}

function generateDisplayName(name: string): string {
  const prefix = name.slice(0, 2).replace(/[^a-zA-Z0-9]/g, "X").padEnd(2, "X");
  const digits = Math.floor(1000 + Math.random() * 9000).toString();
  return `Gnoseon#${prefix}${digits}`;
}

router.post("/users/join", async (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required." });
    return;
  }
  if (name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }

  try {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered." });
      return;
    }

    const id = uuidv4();
    const displayName = generateDisplayName(name.trim());
    const passwordHash = hashPassword(password);

    await db.insert(usersTable).values({
      id,
      name: name.trim(),
      displayName,
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    res.status(201).json({ id, name: name.trim(), displayName, email: email.toLowerCase().trim() });
  } catch (err) {
    req.log.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, statusText } = req.body as { status?: string; statusText?: string };
  if (!status) { res.status(400).json({ error: "status required." }); return; }
  const allowed = ["online", "idle", "dnd", "offline"];
  if (!allowed.includes(status)) { res.status(400).json({ error: "Invalid status." }); return; }
  try {
    await db.update(usersTable).set({ status, statusText: statusText ?? null }).where(eq(usersTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update status");
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/users/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (rows.length === 0) {
      res.status(401).json({ error: "Wrong email or password." });
      return;
    }

    const user = rows[0];
    if (!verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "Wrong email or password." });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to login user");
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
