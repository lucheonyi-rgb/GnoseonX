import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const friendRequestsTable = pgTable("gnoseon_friend_requests", {
  id: text("id").primaryKey(),
  fromUserId: text("from_user_id").notNull(),
  fromDisplayName: text("from_display_name").notNull(),
  toUserId: text("to_user_id").notNull(),
  toDisplayName: text("to_display_name").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FriendRequest = typeof friendRequestsTable.$inferSelect;
