import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeetingSchema, insertActionItemSchema, insertDecisionSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();

  // Get all meetings
  apiRouter.get("/meetings", async (req, res) => {
    const meetings = await storage.getAllMeetingsWithDetails();
    res.json(meetings);
  });

  // Get a specific meeting with details
  apiRouter.get("/meetings/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    const meeting = await storage.getMeetingWithDetails(id);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json(meeting);
  });

  // Create a new meeting
  apiRouter.post("/meetings", async (req, res) => {
    try {
      const meeting = insertMeetingSchema.parse(req.body);
      const newMeeting = await storage.createMeeting(meeting);
      res.status(201).json(newMeeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  // Update a meeting
  apiRouter.patch("/meetings/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    try {
      const meetingUpdate = insertMeetingSchema.partial().parse(req.body);
      const updatedMeeting = await storage.updateMeeting(id, meetingUpdate);
      
      if (!updatedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.json(updatedMeeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  // Get all action items
  apiRouter.get("/action-items", async (req, res) => {
    const actionItems = await storage.getAllActionItems();
    res.json(actionItems);
  });

  // Create a new action item
  apiRouter.post("/action-items", async (req, res) => {
    try {
      const actionItem = insertActionItemSchema.parse(req.body);
      const newActionItem = await storage.createActionItem(actionItem);
      res.status(201).json(newActionItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create action item" });
    }
  });

  // Update an action item
  apiRouter.patch("/action-items/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid action item ID" });
    }

    try {
      const actionItemUpdate = insertActionItemSchema.partial().parse(req.body);
      const updatedActionItem = await storage.updateActionItem(id, actionItemUpdate);
      
      if (!updatedActionItem) {
        return res.status(404).json({ message: "Action item not found" });
      }
      
      res.json(updatedActionItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid action item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update action item" });
    }
  });

  // Create a new decision
  apiRouter.post("/decisions", async (req, res) => {
    try {
      const decision = insertDecisionSchema.parse(req.body);
      const newDecision = await storage.createDecision(decision);
      res.status(201).json(newDecision);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid decision data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create decision" });
    }
  });

  // Get all users
  apiRouter.get("/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Get all notifications
  apiRouter.get("/notifications", async (req, res) => {
    // For demo purposes, get all notifications (in a real app, you'd filter by user)
    const userId = 1; // Default to first user in demo
    const notifications = await storage.getNotificationsByUserId(userId);
    res.json(notifications);
  });

  // Create a new notification
  apiRouter.post("/notifications", async (req, res) => {
    try {
      const notification = insertNotificationSchema.parse(req.body);
      const newNotification = await storage.createNotification(notification);
      res.status(201).json(newNotification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Mark a notification as read
  apiRouter.patch("/notifications/:id/read", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const updatedNotification = await storage.markNotificationAsRead(id);
    
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json(updatedNotification);
  });

  // Register API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
