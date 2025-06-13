import { adminDb } from "../firebase-admin";

export const storage = {
  async getFinancialData(userId: string) {
    const snapshot = await adminDb.collection('financial_data')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async createFinancialData(data: any) {
    const docRef = await adminDb.collection('financial_data').add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async bulkCreateFinancialData(data: any[]) {
    const batch = adminDb.batch();
    data.forEach(item => {
      const docRef = adminDb.collection('financial_data').doc();
      batch.set(docRef, {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    await batch.commit();
    return data.map(item => ({ id: item.id || '', ...item }));
  },

  async getAiInsights(userId: string) {
    const snapshot = await adminDb.collection('ai_insights')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async createAiInsight(data: any) {
    const docRef = await adminDb.collection('ai_insights').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async clearAiInsights(userId: string) {
    const snapshot = await adminDb.collection('ai_insights')
      .where('userId', '==', userId)
      .get();
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  },

  async getReports(userId: string) {
    const snapshot = await adminDb.collection('reports')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async createReport(data: any) {
    const docRef = await adminDb.collection('reports').add({
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }
};
