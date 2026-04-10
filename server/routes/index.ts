import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "../auth";
import { storage } from "../models/user";
import { pool } from "../db";
import {
  sendSampleShareEmail,
  sendSlotReservationNotification,
} from "../services/email";
import {
  insertSampleSchema,
  insertProtocolSchema,
  insertReportSchema,
  insertSensorDataSchema,
  insertSlotReservationSchema,
  insertSampleShareSchema,
} from "@shared/schema";

// Helper function to validate numeric IDs
function validateId(id: string): number {
  const numId = Number.parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid ID parameter");
  }
  return numId;
}

// Helper function for consistent error responses
function handleError(
  res: any,
  error: any,
  defaultMessage: string,
  statusCode = 500
) {
  console.error(error);
  if (error instanceof Error) {
    res.status(statusCode).json({
      message: defaultMessage,
      error: error.message,
    });
  } else {
    res.status(statusCode).json({
      message: defaultMessage,
      error: String(error),
    });
  }
}

async function ensureProtocolColumns() {
  await pool.query(`
    ALTER TABLE protocols 
    ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'beginner',
    ADD COLUMN IF NOT EXISTS estimated_time TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS equipment TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS materials TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS safety_notes TEXT,
    ADD COLUMN IF NOT EXISTS steps TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS tags TEXT
  `);
}

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureProtocolColumns();
  // Setup authentication routes
  setupAuth(app);

  // Sample routes
  app.get("/api/samples", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const samples =
        req.user!.role === "admin"
          ? await storage.getAllSamples()
          : await storage.getSamplesByUser(req.user!.id);
      res.json(samples);
    } catch (error) {
      handleError(res, error, "Failed to fetch samples");
    }
  });

  app.post("/api/samples", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      console.log(
        "[SAMPLE_CREATE] Request body:",
        JSON.stringify(req.body, null, 2)
      );

      const validatedData = insertSampleSchema.parse({
        ...req.body,
        userId: req.user!.id,
        collectionDate: new Date(req.body.collectionDate),
      });

      console.log(
        "[SAMPLE_CREATE] Validated data:",
        JSON.stringify(validatedData, null, 2)
      );

      const sample = await storage.createSample(validatedData);

      // Create notification
      await storage.createNotification({
        userId: req.user!.id,
        title: "Sample Submitted",
        message: `Sample ${sample.sampleId} has been submitted successfully`,
        type: "sample_entry",
      });

      res.status(201).json(sample);
    } catch (error) {
      console.error("[SAMPLE_CREATE_ERROR]", error);
      handleError(res, error, "Invalid sample data", 400);
    }
  });

  app.get("/api/samples/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = validateId(req.params.id);
      const sample = await storage.getSample(id);

      if (!sample) {
        return res.status(404).json({ message: "Sample not found" });
      }

      // Check if user can access this sample
      if (req.user!.role !== "admin" && sample.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(sample);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid sample ID" });
      }
      handleError(res, error, "Failed to fetch sample");
    }
  });

  app.put("/api/samples/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = validateId(req.params.id);
      const sample = await storage.getSample(id);

      if (!sample) {
        return res.status(404).json({ message: "Sample not found" });
      }

      // Check permissions
      if (req.user!.role !== "admin" && sample.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertSampleSchema.partial().parse(req.body);
      const updatedSample = await storage.updateSample(id, validatedData);

      res.json(updatedSample);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid sample ID" });
      }
      handleError(res, error, "Invalid sample data", 400);
    }
  });

  // Protocol routes
  app.get("/api/protocols", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { search } = req.query;
      const protocols = search
        ? await storage.searchProtocols(search as string)
        : await storage.getAllProtocols();
      res.json(protocols);
    } catch (error) {
      handleError(res, error, "Failed to fetch protocols");
    }
  });

  app.post("/api/protocols", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const protocolData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        content: req.body.content ?? req.body.steps ?? "",
        status: req.body.status ?? "active",
        difficulty: req.body.difficulty ?? "beginner",
        estimatedTime: req.body.estimatedTime ?? req.body.estimated_time ?? "",
        equipment: req.body.equipment ?? "",
        materials: req.body.materials ?? "",
        safetyNotes: req.body.safetyNotes ?? req.body.safety_notes ?? null,
        steps: req.body.steps ?? "",
        tags: req.body.tags ?? null,
        createdBy: req.user!.id,
      };

      console.log("Creating protocol with data:", protocolData);

      const validatedData = insertProtocolSchema.parse(protocolData);
      const protocol = await storage.createProtocol(validatedData);

      res.status(201).json(protocol);
    } catch (error) {
      console.error("Error creating protocol:", error);
      handleError(
        res,
        error,
        "Failed to create protocol. Please check the data and try again.",
        400
      );
    }
  });

  app.get("/api/protocols/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = validateId(req.params.id);
      const protocol = await storage.getProtocol(id);

      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }

      res.json(protocol);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid protocol ID" });
      }
      handleError(res, error, "Failed to fetch protocol");
    }
  });

  app.put("/api/protocols/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const id = validateId(req.params.id);
      const protocol = await storage.getProtocol(id);

      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }

      const updateData = {
        title: req.body.title ?? protocol.title,
        description: req.body.description ?? protocol.description,
        category: req.body.category ?? protocol.category,
        content: req.body.content ?? req.body.steps ?? protocol.content,
        status: req.body.status ?? protocol.status,
        difficulty: req.body.difficulty ?? protocol.difficulty,
        estimatedTime:
          req.body.estimatedTime ??
          req.body.estimated_time ??
          protocol.estimatedTime,
        equipment: req.body.equipment ?? protocol.equipment,
        materials: req.body.materials ?? protocol.materials,
        safetyNotes:
          req.body.safetyNotes ?? req.body.safety_notes ?? protocol.safetyNotes,
        steps: req.body.steps ?? protocol.steps,
        tags: req.body.tags ?? protocol.tags,
      };

      console.log("Updating protocol with data:", { id, updateData });

      const validatedData = insertProtocolSchema.partial().parse(updateData);
      const updatedProtocol = await storage.updateProtocol(id, validatedData);

      if (!updatedProtocol) {
        return res.status(404).json({ message: "Failed to update protocol" });
      }

      res.json(updatedProtocol);
    } catch (error) {
      console.error("Error updating protocol:", error);
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid protocol ID" });
      }
      handleError(
        res,
        error,
        "Failed to update protocol. Please check the data and try again.",
        400
      );
    }
  });

  app.delete("/api/protocols/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const id = validateId(req.params.id);
      await storage.deleteProtocol(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting protocol:", error);
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid protocol ID" });
      }
      handleError(res, error, "Failed to delete protocol", 400);
    }
  });

  // Report routes
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const reports =
        req.user!.role === "admin"
          ? await storage.getAllReports()
          : await storage.getReportsByUser(req.user!.id);
      res.json(reports);
    } catch (error) {
      handleError(res, error, "Failed to fetch reports");
    }
  });

  app.post("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertReportSchema.parse({
        ...req.body,
        generatedBy: req.user!.id,
      });
      const report = await storage.createReport(validatedData);

      // Create notification
      await storage.createNotification({
        userId: req.user!.id,
        title: "Report Generated",
        message: `Report "${report.title}" has been generated`,
        type: "report_generated",
      });

      res.status(201).json(report);
    } catch (error) {
      handleError(res, error, "Invalid report data", 400);
    }
  });

  // Admin dashboard routes
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      handleError(res, error, "Failed to fetch admin stats");
    }
  });

  app.get("/api/admin/recent-users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const users = await storage.getRecentUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error, "Failed to fetch recent users");
    }
  });

  app.get("/api/admin/recent-samples", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const samples = await storage.getRecentSamples();
      res.json(samples);
    } catch (error) {
      handleError(res, error, "Failed to fetch recent samples");
    }
  });

  app.get("/api/admin/activity-logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      handleError(res, error, "Failed to fetch activity logs");
    }
  });

  app.get("/api/admin/sample-trends", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const trends = await storage.getSampleTrends();
      res.json(trends);
    } catch (error) {
      handleError(res, error, "Failed to fetch sample trends");
    }
  });

  // User management routes (admin only)
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error, "Failed to fetch users");
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const id = validateId(req.params.id);

      // Add basic validation for user update data
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "No update data provided" });
      }

      const updatedUser = await storage.updateUser(id, req.body);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      handleError(res, error, "Invalid user data", 400);
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const id = validateId(req.params.id);

      // Prevent admin from deleting themselves
      if (id === req.user!.id) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(id);
      res.sendStatus(204);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      handleError(res, error, "Failed to delete user");
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      handleError(res, error, "Failed to fetch notifications");
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = validateId(req.params.id);
      await storage.markNotificationAsRead(id);
      res.sendStatus(200);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      handleError(res, error, "Failed to mark notification as read");
    }
  });

  // Dashboard stats
  // app.get("/api/dashboard/stats", async (req, res) => {
  //   if (!req.isAuthenticated()) return res.sendStatus(401);

  //   try {
  //     const stats = await storage.getDashboardStats();
  //     res.json(stats);
  //   } catch (error) {
  //     handleError(res, error, "Failed to fetch dashboard stats");
  //   }
  // });

  // Sensor data routes
  app.post("/api/sensor-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertSensorDataSchema.parse(req.body);
      const sensorData = await storage.createSensorData(validatedData);
      res.status(201).json(sensorData);
    } catch (error) {
      handleError(res, error, "Invalid sensor data", 400);
    }
  });

  // Slot reservation routes
  app.get("/api/slot-reservations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const reservations =
        req.user!.role === "admin"
          ? await storage.getAllSlotReservations()
          : await storage.getSlotReservationsByUser(req.user!.id);
      res.json(reservations);
    } catch (error) {
      handleError(res, error, "Failed to fetch reservations");
    }
  });

  app.post("/api/slot-reservations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validated = insertSlotReservationSchema.parse({
        ...req.body,
        userId: req.user!.id,
        slotDate: new Date(req.body.slotDate),
      });
      const created = await storage.createSlotReservation(validated);
      try {
        const user = await storage.getUser(req.user!.id);
        if (user?.email) {
          await sendSlotReservationNotification({
            recipientEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`,
            status: created.status || "pending",
            slotDate: new Date(created.slotDate).toLocaleDateString(),
            slotTime: created.slotTime,
            location: created.location,
            notes: created.notes || undefined,
          });
        }
      } catch (e) {
        console.error("Failed to send reservation email:", e);
      }
      res.status(201).json(created);
    } catch (error) {
      handleError(res, error, "Invalid reservation data", 400);
    }
  });

  app.put("/api/slot-reservations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = validateId(req.params.id);
      const existing = await storage.getSlotReservation(id);
      const updated = await storage.updateSlotReservation(id, req.body);
      if (!updated)
        return res.status(404).json({ message: "Reservation not found" });
      try {
        if (existing && updated.status && updated.status !== existing.status) {
          const user = await storage.getUser(existing.userId);
          if (user?.email) {
            await sendSlotReservationNotification({
              recipientEmail: user.email,
              userName: `${user.firstName} ${user.lastName}`,
              status: updated.status,
              slotDate: new Date(updated.slotDate).toLocaleDateString(),
              slotTime: updated.slotTime,
              location: updated.location,
              notes: updated.notes || undefined,
            });
          }
        }
      } catch (e) {
        console.error("Failed to send reservation status email:", e);
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid reservation ID" });
      }
      handleError(res, error, "Failed to update reservation");
    }
  });

  app.delete("/api/slot-reservations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = validateId(req.params.id);
      await storage.deleteSlotReservation(id);
      res.sendStatus(204);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid reservation ID" });
      }
      handleError(res, error, "Failed to delete reservation");
    }
  });

  // Sample sharing routes
  app.get("/api/sample-shares", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { sampleId } = req.query;
      if (sampleId) {
        const list = await storage.getSampleSharesBySample(Number(sampleId));
        return res.json(list);
      }
      const list = await storage.getSampleSharesByUser(req.user!.id);
      res.json(list);
    } catch (error) {
      handleError(res, error, "Failed to fetch sample shares");
    }
  });

  app.post("/api/sample-shares", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      console.log("[SAMPLE_SHARE_CREATE] Request body:", JSON.stringify(req.body, null, 2));
      
      // Set default values for required fields
      const shareData = {
        sampleId: req.body.sampleId,
        sharedBy: req.user!.id,
        sharedWith: req.body.sharedWith || null,
        shareType: req.body.shareType || "link",
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
        maxAccess: req.body.maxAccess || 10,
        isActive: true,
        accessCount: 0,
      };

      console.log("[SAMPLE_SHARE_CREATE] Processed data:", JSON.stringify(shareData, null, 2));

      const validated = insertSampleShareSchema.parse(shareData);
      console.log("[SAMPLE_SHARE_CREATE] Validated data:", JSON.stringify(validated, null, 2));
      
      const created = await storage.createSampleShare(validated);
      console.log("[SAMPLE_SHARE_CREATE] Created share:", JSON.stringify(created, null, 2));

      // If sharing via email, send an email with the share link
      if (created.shareType === "email" && created.sharedWith) {
        try {
          const sample = await storage.getSample(created.sampleId);
          const user = await storage.getUser(req.user!.id);
          const shareUrl = `${req.protocol}://${req.get("host")}/shared-sample/${created.shareToken}`;
          
          console.log("[SAMPLE_SHARE_EMAIL] Sending email with data:", {
            recipientEmail: created.sharedWith,
            senderName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            sampleId: sample?.sampleId,
            shareUrl,
          });
          
          if (sample && user && user.email) {
            await sendSampleShareEmail({
              recipientEmail: created.sharedWith,
              senderName: `${user.firstName} ${user.lastName}`,
              sampleId: sample.sampleId,
              sampleType: sample.sampleType,
              shareUrl,
              collectionDate: new Date(sample.collectionDate).toLocaleDateString(),
              location: sample.location || undefined,
            });
            console.log("[SAMPLE_SHARE_EMAIL] Email sent successfully");
          } else {
            throw new Error("Missing sample or user email for share.");
          }
        } catch (e) {
          console.error("[SAMPLE_SHARE_EMAIL] Failed to send sample share email:", e);
          await storage.deleteSampleShare(created.id);
          const message = e instanceof Error ? e.message : "Failed to send sample share email.";
          return res.status(500).json({ message });
        }
      }
      res.status(201).json(created);
    } catch (error) {
      console.error("[SAMPLE_SHARE_CREATE_ERROR]", error);
      handleError(res, error, "Invalid sample share data", 400);
    }
  });

  app.get("/api/sample-shares/token/:token", async (req, res) => {
    try {
      const share = await storage.getSampleShareByToken(req.params.token);
      if (!share || !share.isActive)
        return res.status(404).json({ message: "Share not found" });
      res.json(share);
    } catch (error) {
      handleError(res, error, "Failed to fetch shared sample");
    }
  });

  app.delete("/api/sample-shares/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = validateId(req.params.id);
      await storage.deleteSampleShare(id);
      res.sendStatus(204);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid sample share ID" });
      }
      handleError(res, error, "Failed to delete sample share");
    }
  });

  app.get("/api/sensor-data/sample/:sampleId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const sampleId = validateId(req.params.sampleId);
      const sensorData = await storage.getSensorDataBySample(sampleId);
      res.json(sensorData);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid ID parameter") {
        return res.status(400).json({ message: "Invalid sample ID" });
      }
      handleError(res, error, "Failed to fetch sensor data");
    }
  });

  // Password reset route (simplified per requirements: allow unauthenticated reset by username)
  app.post("/api/reset-password", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    try {
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashed = await hashPassword(password);
      await storage.updateUser(user.id, { password: hashed });

      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      handleError(res, error, "Failed to reset password");
    }
  });

  // Self profile update
  app.put("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { firstName, lastName, email, mobile, city, profilePicture } =
        req.body ?? {};

      const updatePayload: any = {};
      if (typeof firstName === "string") updatePayload.firstName = firstName;
      if (typeof lastName === "string") updatePayload.lastName = lastName;
      if (typeof email === "string") updatePayload.email = email;
      if (typeof mobile === "string" || mobile === null)
        updatePayload.mobile = mobile;
      if (typeof city === "string" || city === null) updatePayload.city = city;
      if (typeof profilePicture === "string" || profilePicture === null)
        updatePayload.profilePicture = profilePicture;

      if (Object.keys(updatePayload).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updated = await storage.updateUser(req.user!.id, updatePayload);
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (error) {
      handleError(res, error, "Failed to update profile");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
