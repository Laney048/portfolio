import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role"),
  avatar: text("avatar"),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  duration: text("duration").notNull(),
  status: text("status").notNull().default("Processing"),
  summary: text("summary").default(""),
  transcription: text("transcription").default(""),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  text: text("text").notNull(),
});

export const actionItems = pgTable("action_items", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  task: text("task").notNull(),
  assignee: text("assignee").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").default("Not Started"),
  completed: boolean("completed").default(false),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  read: boolean("read").default(false),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  title: true,
  date: true,
  duration: true,
  status: true,
  summary: true,
  transcription: true,
  audioUrl: true,
});

export const insertDecisionSchema = createInsertSchema(decisions).pick({
  meetingId: true,
  text: true,
});

export const insertActionItemSchema = createInsertSchema(actionItems).pick({
  meetingId: true,
  task: true,
  assignee: true,
  dueDate: true,
  status: true,
  completed: true,
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  meetingId: true,
  userId: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  description: true,
  date: true,
  read: true,
});

// Export Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type User = typeof users.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type Decision = typeof decisions.$inferSelect;
export type ActionItem = typeof actionItems.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Extended types for the application
export type MeetingWithDetails = Meeting & {
  decisions: Decision[];
  actionItems: ActionItem[];
  participants: string[];
};
