import { db } from "../firebase";

// Export the Firebase database instance
export { db };

// Export type definitions for Firebase collections
export const collections = {
  users: db.collection("users"),
  financialData: db.collection("financial_data")
};

// Export type definitions for Firebase documents
export type User = {
  id: string;
  username: string;
  password: string;
};

export type FinancialData = {
  id: string;
  userId: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: string;
};