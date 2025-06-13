import { z } from 'zod';

export const userSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const financialDataSchema = z.object({
  userId: z.string(),
  date: z.string(),
  description: z.string(),
  category: z.string(),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  status: z.enum(['completed', 'pending']).default('completed'),
});

export const aiInsightSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(['positive', 'warning', 'info']),
  generatedAt: z.date(),
});

export const reportSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(['monthly', 'quarterly', 'forecast']),
  generatedAt: z.date(),
});
