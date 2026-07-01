import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const dmsTable = pgTable("gnoseon_dms", {
  id: text("id").primaryKey(),
  user1Id: text("user1_id").notNull(),
  user1DisplayName: text("user1_display_name").notNull(),
  user2Id: text("user2_id").notNull(),
  user2DisplayName: text("user2_display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GnoseonDM = typeof dmsTable.$inferSelect;
