import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const storiesTable = pgTable("gnoseon_stories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userImage: text("user_image"),
  text: text("text"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  bgColor: text("bg_color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type GnoseonStory = typeof storiesTable.$inferSelect;
export type InsertStory = typeof storiesTable.$inferInsert;
