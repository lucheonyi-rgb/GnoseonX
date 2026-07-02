import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const messagesTable = pgTable("gnoseon_messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderImage: text("sender_image"),
  channelId: text("channel_id"),
  dmId: text("dm_id"),
  type: text("type").notNull().default("text"),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GnoseonMessage = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
