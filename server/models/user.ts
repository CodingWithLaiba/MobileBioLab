import {
  users,
  samples,
  protocols,
  reports,
  notifications,
  sensorData,
  slotReservations,
  sampleShares,
  type User,
  type InsertUser,
  type Sample,
  type InsertSample,
  type Protocol,
  type InsertProtocol,
  type Report,
  type InsertReport,
  type Notification,
  type InsertNotification,
  type SensorData,
  type InsertSensorData,
  type SlotReservation,
  type InsertSlotReservation,
  type SampleShare,
  type InsertSampleShare,
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "../db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  // Sample methods
  getSample(id: number): Promise<Sample | undefined>;
  getSampleBySampleId(sampleId: string): Promise<Sample | undefined>;
  createSample(sample: InsertSample): Promise<Sample>;
  updateSample(
    id: number,
    sample: Partial<InsertSample>
  ): Promise<Sample | undefined>;
  getSamplesByUser(userId: number): Promise<Sample[]>;
  getAllSamples(): Promise<Sample[]>;
  deleteSample(id: number): Promise<void>;

  // Protocol methods
  getProtocol(id: number): Promise<Protocol | undefined>;
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  updateProtocol(
    id: number,
    protocol: Partial<InsertProtocol>
  ): Promise<Protocol | undefined>;
  getAllProtocols(): Promise<Protocol[]>;
  searchProtocols(query: string): Promise<Protocol[]>;
  deleteProtocol(id: number): Promise<void>;

  // Report methods
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(
    id: number,
    report: Partial<InsertReport>
  ): Promise<Report | undefined>;
  getReportsBySample(sampleId: number): Promise<Report[]>;
  getReportsByUser(userId: number): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  deleteReport(id: number): Promise<void>;

  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;

  // Sensor data methods
  getSensorData(id: number): Promise<SensorData | undefined>;
  createSensorData(data: InsertSensorData): Promise<SensorData>;
  getSensorDataBySample(sampleId: number): Promise<SensorData[]>;
  deleteSensorData(id: number): Promise<void>;

  // Slot reservation methods
  getSlotReservation(id: number): Promise<SlotReservation | undefined>;
  createSlotReservation(
    reservation: InsertSlotReservation
  ): Promise<SlotReservation>;
  updateSlotReservation(
    id: number,
    reservation: Partial<InsertSlotReservation>
  ): Promise<SlotReservation | undefined>;
  getSlotReservationsByUser(userId: number): Promise<SlotReservation[]>;
  getAllSlotReservations(): Promise<SlotReservation[]>;
  deleteSlotReservation(id: number): Promise<void>;

  // Sample sharing methods
  getSampleShare(id: number): Promise<SampleShare | undefined>;
  getSampleShareByToken(token: string): Promise<SampleShare | undefined>;
  createSampleShare(share: InsertSampleShare): Promise<SampleShare>;
  updateSampleShare(
    id: number,
    share: Partial<InsertSampleShare>
  ): Promise<SampleShare | undefined>;
  getSampleSharesBySample(sampleId: number): Promise<SampleShare[]>;
  getSampleSharesByUser(userId: number): Promise<SampleShare[]>;
  deleteSampleShare(id: number): Promise<void>;

  // Dashboard stats
  // getDashboardStats(): Promise<{
  //   totalSamples: number;
  //   activeUsers: number;
  //   pendingReports: number;
  //   completedSamples: number;
  // }>;

  // Admin methods
  getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalSamples: number;
    pendingSamples: number;
    completedSamples: number;
    totalReports: number;
    pendingReports: number;
    systemAlerts: number;
  }>;
  getRecentUsers(): Promise<User[]>;
  getRecentSamples(): Promise<Sample[]>;
  getActivityLogs(): Promise<any[]>;
  getSampleTrends(): Promise<any[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.toLowerCase()));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: number,
    updateData: Partial<InsertUser>
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Sample methods
  async getSample(id: number): Promise<Sample | undefined> {
    const [sample] = await db.select().from(samples).where(eq(samples.id, id));
    return sample || undefined;
  }

  async getSampleBySampleId(sampleId: string): Promise<Sample | undefined> {
    const [sample] = await db
      .select()
      .from(samples)
      .where(eq(samples.sampleId, sampleId));
    return sample || undefined;
  }

  async createSample(insertSample: InsertSample): Promise<Sample> {
    const [sample] = await db.insert(samples).values(insertSample).returning();
    return sample;
  }

  async updateSample(
    id: number,
    updateData: Partial<InsertSample>
  ): Promise<Sample | undefined> {
    const [sample] = await db
      .update(samples)
      .set(updateData)
      .where(eq(samples.id, id))
      .returning();
    return sample || undefined;
  }

  async getSamplesByUser(userId: number): Promise<Sample[]> {
    return await db
      .select()
      .from(samples)
      .where(eq(samples.userId, userId))
      .orderBy(desc(samples.createdAt));
  }

  async getAllSamples(): Promise<Sample[]> {
    return await db.select().from(samples).orderBy(desc(samples.createdAt));
  }

  async deleteSample(id: number): Promise<void> {
    await db.delete(samples).where(eq(samples.id, id));
  }

  // Protocol methods
  async getProtocol(id: number): Promise<Protocol | undefined> {
    const [protocol] = await db
      .select()
      .from(protocols)
      .where(eq(protocols.id, id));
    return protocol || undefined;
  }

  async createProtocol(insertProtocol: InsertProtocol): Promise<Protocol> {
    const [protocol] = await db
      .insert(protocols)
      .values(insertProtocol)
      .returning();
    return protocol;
  }

  async updateProtocol(
    id: number,
    updateData: Partial<InsertProtocol>
  ): Promise<Protocol | undefined> {
    const [protocol] = await db
      .update(protocols)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(protocols.id, id))
      .returning();
    return protocol || undefined;
  }

  async getAllProtocols(): Promise<Protocol[]> {
    const { rows } = await pool.query(`
    SELECT *
    FROM protocols
    ORDER BY created_at DESC
  `);

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      content: r.content ?? "",
      status: r.status,
      difficulty: r.difficulty ?? "beginner",
      estimatedTime: r.estimated_time ?? "",
      equipment: r.equipment ?? "",
      materials: r.materials ?? "",
      safetyNotes: r.safety_notes ?? "",
      steps: r.steps ?? "",
      tags: r.tags ?? "",
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async searchProtocols(query: string): Promise<Protocol[]> {
    const q = `%${query}%`;
    const { rows } = await pool.query(
      `SELECT *
       FROM protocols
      WHERE title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1
       ORDER BY created_at DESC`,
      [q]
    );

    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      content: r.content ?? "",
      status: r.status,
      difficulty: r.difficulty ?? "beginner",
      estimatedTime: r.estimated_time ?? "",
      equipment: r.equipment ?? "",
      materials: r.materials ?? "",
      safetyNotes: r.safety_notes ?? "",
      steps: r.steps ?? "",
      tags: r.tags ?? "",
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async deleteProtocol(id: number): Promise<void> {
    await db.delete(protocols).where(eq(protocols.id, id));
  }

  // Report methods
  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async updateReport(
    id: number,
    updateData: Partial<InsertReport>
  ): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return report || undefined;
  }

  async getReportsBySample(sampleId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.sampleId, sampleId))
      .orderBy(desc(reports.createdAt));
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.generatedBy, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification || undefined;
  }

  async createNotification(
    insertNotification: InsertNotification
  ): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Sensor data methods
  async getSensorData(id: number): Promise<SensorData | undefined> {
    const [data] = await db
      .select()
      .from(sensorData)
      .where(eq(sensorData.id, id));
    return data || undefined;
  }

  async createSensorData(insertData: InsertSensorData): Promise<SensorData> {
    const [data] = await db.insert(sensorData).values(insertData).returning();
    return data;
  }

  async getSensorDataBySample(sampleId: number): Promise<SensorData[]> {
    return await db
      .select()
      .from(sensorData)
      .where(eq(sensorData.sampleId, sampleId))
      .orderBy(desc(sensorData.timestamp));
  }

  async deleteSensorData(id: number): Promise<void> {
    await db.delete(sensorData).where(eq(sensorData.id, id));
  }

  // Slot reservation methods
  async getSlotReservation(id: number): Promise<SlotReservation | undefined> {
    const [reservation] = await db
      .select()
      .from(slotReservations)
      .where(eq(slotReservations.id, id));
    return reservation || undefined;
  }

  async createSlotReservation(
    insertReservation: InsertSlotReservation
  ): Promise<SlotReservation> {
    const [reservation] = await db
      .insert(slotReservations)
      .values(insertReservation)
      .returning();
    return reservation;
  }

  async updateSlotReservation(
    id: number,
    updateData: Partial<InsertSlotReservation>
  ): Promise<SlotReservation | undefined> {
    const [reservation] = await db
      .update(slotReservations)
      .set(updateData)
      .where(eq(slotReservations.id, id))
      .returning();
    return reservation || undefined;
  }

  async getSlotReservationsByUser(userId: number): Promise<SlotReservation[]> {
    return await db
      .select()
      .from(slotReservations)
      .where(eq(slotReservations.userId, userId))
      .orderBy(desc(slotReservations.requestedAt));
  }

  async getAllSlotReservations(): Promise<SlotReservation[]> {
    return await db
      .select()
      .from(slotReservations)
      .orderBy(desc(slotReservations.requestedAt));
  }

  async deleteSlotReservation(id: number): Promise<void> {
    await db.delete(slotReservations).where(eq(slotReservations.id, id));
  }

  // Sample sharing methods
  async getSampleShare(id: number): Promise<SampleShare | undefined> {
    const [share] = await db
      .select()
      .from(sampleShares)
      .where(eq(sampleShares.id, id));
    return share || undefined;
  }

  async getSampleShareByToken(token: string): Promise<SampleShare | undefined> {
    const [share] = await db
      .select()
      .from(sampleShares)
      .where(eq(sampleShares.shareToken, token));
    return share || undefined;
  }

  async createSampleShare(
    insertShare: InsertSampleShare
  ): Promise<SampleShare> {
    const shareToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const [share] = await db
      .insert(sampleShares)
      .values({
        ...insertShare,
        shareToken,
      })
      .returning();
    return share;
  }

  async updateSampleShare(
    id: number,
    updateData: Partial<InsertSampleShare>
  ): Promise<SampleShare | undefined> {
    const [share] = await db
      .update(sampleShares)
      .set(updateData)
      .where(eq(sampleShares.id, id))
      .returning();
    return share || undefined;
  }

  async getSampleSharesBySample(sampleId: number): Promise<SampleShare[]> {
    return await db
      .select()
      .from(sampleShares)
      .where(eq(sampleShares.sampleId, sampleId))
      .orderBy(desc(sampleShares.createdAt));
  }

  async getSampleSharesByUser(userId: number): Promise<SampleShare[]> {
    return await db
      .select()
      .from(sampleShares)
      .where(eq(sampleShares.sharedBy, userId))
      .orderBy(desc(sampleShares.createdAt));
  }

  async deleteSampleShare(id: number): Promise<void> {
    await db.delete(sampleShares).where(eq(sampleShares.id, id));
  }

  // Dashboard stats
  // async getDashboardStats(): Promise<{
  //   totalSamples: number;
  //   activeUsers: number;
  //   pendingReports: number;
  //   completedSamples: number;
  // }> {
  //   const [totalSamplesResult] = await db
  //     .select({ count: count() })
  //     .from(samples);
  //   const [activeUsersResult] = await db.select({ count: count() }).from(users);
  //   const [pendingReportsResult] = await db
  //     .select({ count: count() })
  //     .from(reports)
  //     .where(eq(reports.status, "draft"));
  //   const [completedSamplesResult] = await db
  //     .select({ count: count() })
  //     .from(samples)
  //     .where(eq(samples.status, "completed"));

  //   return {
  //     totalSamples: totalSamplesResult.count,
  //     activeUsers: activeUsersResult.count,
  //     pendingReports: pendingReportsResult.count,
  //     completedSamples: completedSamplesResult.count,
  //   };
  // }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalSamples: number;
    pendingSamples: number;
    completedSamples: number;
    totalReports: number;
    pendingReports: number;
    systemAlerts: number;
  }> {
    const [samples, users, reports] = await Promise.all([
      this.getAllSamples(),
      this.getAllUsers(),
      this.getAllReports(),
    ]);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => new Date(u.createdAt) > oneWeekAgo)
        .length,
      totalSamples: samples.length,
      pendingSamples: samples.filter((s) => s.status === "pending").length,
      completedSamples: samples.filter((s) => s.status === "completed").length,
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === "pending").length,
      systemAlerts: 0,
    };
  }

  async getRecentUsers(): Promise<User[]> {
    const users = await this.getAllUsers();
    return users
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);
  }

  async getRecentSamples(): Promise<Sample[]> {
    const samples = await this.getAllSamples();
    return samples
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);
  }

  async getActivityLogs(): Promise<any[]> {
    const users = await this.getAllUsers();
    const samples = await this.getAllSamples();

    const logs = [];

    for (const sample of samples.slice(0, 10)) {
      const user = users.find((u) => u.id === sample.userId);
      logs.push({
        id: sample.id,
        userId: sample.userId,
        action: "CREATE_SAMPLE",
        entityType: "sample",
        entityId: sample.id,
        timestamp: sample.createdAt,
        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
        details: `Created sample ${sample.sampleId} (${sample.sampleType})`,
      });
    }

    return logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getSampleTrends(): Promise<any[]> {
    const samples = await this.getAllSamples();
    const trends = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const samplesOnDay = samples.filter((s) => {
        const sampleDate = new Date(s.createdAt).toISOString().split("T")[0];
        return sampleDate === dateStr;
      }).length;

      trends.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        samples: samplesOnDay,
      });
    }

    return trends;
  }
}

export const storage = new DatabaseStorage();
