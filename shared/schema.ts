import { pgTable, text, integer, boolean, timestamp, decimal, json, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile"),
  role: text("role").notNull().default("student"), // student, researcher, technician, admin
  city: text("city"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const samples = pgTable("samples", {
  id: serial("id").primaryKey(),
  sampleId: text("sample_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  sampleType: text("sample_type").notNull(), // water, soil, plant, biological_fluid, air
  collectionDate: timestamp("collection_date").notNull(),
  collectionTime: text("collection_time").notNull(),
  location: text("location"),
  geolocation: json("geolocation"), // {lat, lng}
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  ph: decimal("ph", { precision: 3, scale: 1 }),
  salinity: decimal("salinity", { precision: 5, scale: 2 }),
  conductivity: decimal("conductivity", { precision: 8, scale: 2 }),
  fieldConditions: json("field_conditions"), // additional conditions
  status: text("status").notNull().default("pending"), // pending, processing, completed
  qrCode: text("qr_code"),
  barcode: text("barcode"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const protocols = pgTable("protocols", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("active"),
  difficulty: text("difficulty").notNull().default("beginner"),
  estimatedTime: text("estimated_time").notNull(),
  equipment: text("equipment").notNull(),
  materials: text("materials").notNull(),
  safetyNotes: text("safety_notes"),
  steps: text("steps").notNull(),
  tags: text("tags"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  sampleId: integer("sample_id").notNull(),
  title: text("title").notNull(),
  content: json("content").notNull(), // charts, analysis results
  generatedBy: integer("generated_by").notNull(),
  status: text("status").notNull().default("draft"), // draft, completed, shared
  pdfPath: text("pdf_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // sample_entry, status_update, report_generated
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  sampleId: integer("sample_id").notNull(),
  sensorType: text("sensor_type").notNull(), // temperature, ph, conductivity
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const slotReservations = pgTable("slot_reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  slotDate: timestamp("slot_date").notNull(),
  slotTime: text("slot_time").notNull(), // e.g., "09:00-10:00"
  location: text("location").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
});

export const sampleShares = pgTable("sample_shares", {
  id: serial("id").primaryKey(),
  sampleId: integer("sample_id").notNull(),
  sharedBy: integer("shared_by").notNull(),
  sharedWith: text("shared_with"), // email address
  shareToken: text("share_token").notNull().unique(),
  shareType: text("share_type").notNull().default("link"), // link, email
  expiresAt: timestamp("expires_at"),
  accessCount: integer("access_count").notNull().default(0),
  maxAccess: integer("max_access").default(10),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  samples: many(samples),
  protocols: many(protocols),
  reports: many(reports),
  notifications: many(notifications),
  slotReservations: many(slotReservations),
  sampleShares: many(sampleShares),
}));

export const samplesRelations = relations(samples, ({ one, many }) => ({
  user: one(users, {
    fields: [samples.userId],
    references: [users.id],
  }),
  reports: many(reports),
  sensorData: many(sensorData),
  sampleShares: many(sampleShares),
}));

export const protocolsRelations = relations(protocols, ({ one }) => ({
  createdBy: one(users, {
    fields: [protocols.createdBy],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  sample: one(samples, {
    fields: [reports.sampleId],
    references: [samples.id],
  }),
  generatedBy: one(users, {
    fields: [reports.generatedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const sensorDataRelations = relations(sensorData, ({ one }) => ({
  sample: one(samples, {
    fields: [sensorData.sampleId],
    references: [samples.id],
  }),
}));

export const slotReservationsRelations = relations(slotReservations, ({ one }) => ({
  user: one(users, {
    fields: [slotReservations.userId],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [slotReservations.approvedBy],
    references: [users.id],
  }),
}));

export const sampleSharesRelations = relations(sampleShares, ({ one }) => ({
  sample: one(samples, {
    fields: [sampleShares.sampleId],
    references: [samples.id],
  }),
  sharedBy: one(users, {
    fields: [sampleShares.sharedBy],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  role: z.enum(["student", "researcher", "technician", "admin"]),
});

export const insertSampleSchema = createInsertSchema(samples).omit({
  id: true,
  createdAt: true,
}).extend({
  sampleType: z.enum(["water", "soil", "plant", "biological_fluid", "air"]),
  status: z.enum(["pending", "processing", "completed"]).optional(),
  collectionDate: z.date(),
  collectionTime: z.string(),
  location: z.string().nullable().optional(),
  temperature: z.string().nullable().optional(),
  ph: z.string().nullable().optional(),
  salinity: z.string().nullable().optional(),
  conductivity: z.string().nullable().optional(),
});

export const insertProtocolSchema = createInsertSchema(protocols).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

export const insertSlotReservationSchema = createInsertSchema(slotReservations).omit({
  id: true,
  requestedAt: true,
  approvedAt: true,
}).extend({
  slotDate: z.date(),
  status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
});

export const insertSampleShareSchema = createInsertSchema(sampleShares).omit({
  id: true,
  createdAt: true,
  shareToken: true,
}).extend({
  shareType: z.enum(["link", "email"]).optional(),
  expiresAt: z.date().nullable().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Sample = typeof samples.$inferSelect;
export type InsertSample = z.infer<typeof insertSampleSchema>;
export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SensorData = typeof sensorData.$inferSelect;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type SlotReservation = typeof slotReservations.$inferSelect;
export type InsertSlotReservation = z.infer<typeof insertSlotReservationSchema>;
export type SampleShare = typeof sampleShares.$inferSelect;
export type InsertSampleShare = z.infer<typeof insertSampleShareSchema>;
