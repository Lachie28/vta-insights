import { users, financialData, aiInsights, reports, type User, type InsertUser, type FinancialData, type InsertFinancialData, type AiInsight, type InsertAiInsight, type Report, type InsertReport } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Financial data methods
  getFinancialData(userId: number): Promise<FinancialData[]>;
  createFinancialData(data: InsertFinancialData): Promise<FinancialData>;
  bulkCreateFinancialData(data: InsertFinancialData[]): Promise<FinancialData[]>;
  
  // AI insights methods
  getAiInsights(userId: number): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  clearAiInsights(userId: number): Promise<void>;
  
  // Reports methods
  getReports(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private financialData: Map<number, FinancialData>;
  private aiInsights: Map<number, AiInsight>;
  private reports: Map<number, Report>;
  private currentUserId: number;
  private currentFinancialDataId: number;
  private currentAiInsightId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.financialData = new Map();
    this.aiInsights = new Map();
    this.reports = new Map();
    this.currentUserId = 1;
    this.currentFinancialDataId = 1;
    this.currentAiInsightId = 1;
    this.currentReportId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFinancialData(userId: number): Promise<FinancialData[]> {
    return Array.from(this.financialData.values()).filter(
      (data) => data.userId === userId
    );
  }

  async createFinancialData(data: InsertFinancialData): Promise<FinancialData> {
    const id = this.currentFinancialDataId++;
    const financialRecord: FinancialData = { 
      ...data, 
      id,
      status: data.status || "completed"
    };
    this.financialData.set(id, financialRecord);
    return financialRecord;
  }

  async bulkCreateFinancialData(data: InsertFinancialData[]): Promise<FinancialData[]> {
    const results: FinancialData[] = [];
    for (const item of data) {
      const result = await this.createFinancialData(item);
      results.push(result);
    }
    return results;
  }

  async getAiInsights(userId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.userId === userId
    );
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const id = this.currentAiInsightId++;
    const aiInsight: AiInsight = { 
      ...insight, 
      id, 
      generatedAt: new Date() 
    };
    this.aiInsights.set(id, aiInsight);
    return aiInsight;
  }

  async clearAiInsights(userId: number): Promise<void> {
    const userInsights = Array.from(this.aiInsights.entries()).filter(
      ([_, insight]) => insight.userId === userId
    );
    userInsights.forEach(([id]) => this.aiInsights.delete(id));
  }

  async getReports(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.userId === userId
    );
  }

  async createReport(report: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const reportRecord: Report = { 
      ...report, 
      id, 
      generatedAt: new Date() 
    };
    this.reports.set(id, reportRecord);
    return reportRecord;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getFinancialData(userId: number): Promise<FinancialData[]> {
    return await db.select().from(financialData).where(eq(financialData.userId, userId));
  }

  async createFinancialData(data: InsertFinancialData): Promise<FinancialData> {
    const [record] = await db
      .insert(financialData)
      .values({
        ...data,
        status: data.status || "completed"
      })
      .returning();
    return record;
  }

  async bulkCreateFinancialData(data: InsertFinancialData[]): Promise<FinancialData[]> {
    const records = await db
      .insert(financialData)
      .values(data.map(item => ({
        ...item,
        status: item.status || "completed"
      })))
      .returning();
    return records;
  }

  async getAiInsights(userId: number): Promise<AiInsight[]> {
    return await db.select().from(aiInsights).where(eq(aiInsights.userId, userId));
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const [record] = await db
      .insert(aiInsights)
      .values(insight)
      .returning();
    return record;
  }

  async clearAiInsights(userId: number): Promise<void> {
    await db.delete(aiInsights).where(eq(aiInsights.userId, userId));
  }

  async getReports(userId: number): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.userId, userId));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [record] = await db
      .insert(reports)
      .values(report)
      .returning();
    return record;
  }
}

import { FirebaseStorage } from "./firebase-storage";
import { adminDb } from "./firebase-config";

// Use Firebase storage if available, otherwise fall back to memory storage
export const storage: IStorage = adminDb ? new FirebaseStorage() : new MemStorage();
