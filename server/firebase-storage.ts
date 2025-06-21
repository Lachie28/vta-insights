import { adminDb } from "./firebase-config";
import { IStorage } from "./storage";
import {
  type InsertUser,
  type User,
  type FinancialData,
  type InsertFinancialData,
  type AiInsight,
  type InsertAiInsight,
  type Report,
  type InsertReport,
} from "@shared/schema";

export class FirebaseStorage implements IStorage {
  private db = adminDb;

  async getUser(id: number): Promise<User | undefined> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const doc = await this.db.collection('users').doc(id.toString()).get();
    if (!doc.exists) return undefined;
    
    return { id, ...doc.data() } as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const snapshot = await this.db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    return { id: parseInt(doc.id), ...doc.data() } as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const docRef = this.db.collection('users').doc();
    const id = parseInt(docRef.id.slice(-10), 16); // Generate numeric ID from doc ID
    
    const userData = { ...user, id, createdAt: new Date() };
    await docRef.set(userData);
    
    return userData as User;
  }

  async getFinancialData(userId: number): Promise<FinancialData[]> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const snapshot = await this.db.collection('financial_data')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: parseInt(doc.id.slice(-10), 16),
      ...doc.data()
    })) as FinancialData[];
  }

  async createFinancialData(data: InsertFinancialData): Promise<FinancialData> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const docRef = this.db.collection('financial_data').doc();
    const id = parseInt(docRef.id.slice(-10), 16);
    
    const financialRecord = {
      ...data,
      id,
      createdAt: new Date(),
      status: data.status || "completed"
    };
    
    await docRef.set(financialRecord);
    return financialRecord as FinancialData;
  }

  async bulkCreateFinancialData(data: InsertFinancialData[]): Promise<FinancialData[]> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const batch = this.db.batch();
    const results: FinancialData[] = [];
    
    for (const item of data) {
      const docRef = this.db.collection('financial_data').doc();
      const id = parseInt(docRef.id.slice(-10), 16);
      
      const financialRecord = {
        ...item,
        id,
        createdAt: new Date(),
        status: item.status || "completed"
      };
      
      batch.set(docRef, financialRecord);
      results.push(financialRecord as FinancialData);
    }
    
    await batch.commit();
    return results;
  }

  async getAiInsights(userId: number): Promise<AiInsight[]> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const snapshot = await this.db.collection('ai_insights')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: parseInt(doc.id.slice(-10), 16),
      generatedAt: doc.data().createdAt || new Date(),
      ...doc.data()
    })) as AiInsight[];
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const docRef = this.db.collection('ai_insights').doc();
    const id = parseInt(docRef.id.slice(-10), 16);
    
    const aiInsight = {
      ...insight,
      id,
      generatedAt: new Date()
    };
    
    await docRef.set(aiInsight);
    return aiInsight as AiInsight;
  }

  async clearAiInsights(userId: number): Promise<void> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const snapshot = await this.db.collection('ai_insights')
      .where('userId', '==', userId)
      .get();
    
    const batch = this.db.batch();
    snapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  async getReports(userId: number): Promise<Report[]> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const snapshot = await this.db.collection('reports')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: parseInt(doc.id.slice(-10), 16),
      ...doc.data()
    })) as Report[];
  }

  async createReport(report: InsertReport): Promise<Report> {
    if (!this.db) throw new Error("Firebase not initialized");
    
    const docRef = this.db.collection('reports').doc();
    const id = parseInt(docRef.id.slice(-10), 16);
    
    const reportRecord = {
      ...report,
      id,
      generatedAt: new Date()
    };
    
    await docRef.set(reportRecord);
    return reportRecord as Report;
  }
}