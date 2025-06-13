import { parse } from 'csv-parse/sync';
import { InsertFinancialData } from '@shared/schema';

export interface ParsedFinancialData {
  date: string;
  description: string;
  category: string;
  amount: string;
  type: 'income' | 'expense';
}

export function parseCSVData(csvContent: string, userId: number): InsertFinancialData[] {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((record: any) => {
      // Handle different CSV formats
      const amount = parseFloat(record.amount || record.Amount || record.AMOUNT || '0');
      const description = record.description || record.Description || record.DESCRIPTION || 'Unknown';
      const category = record.category || record.Category || record.CATEGORY || 'Other';
      const date = record.date || record.Date || record.DATE || new Date().toISOString().split('T')[0];
      
      // Determine type based on amount or explicit type field
      let type: 'income' | 'expense' = 'expense';
      if (record.type || record.Type || record.TYPE) {
        type = (record.type || record.Type || record.TYPE).toLowerCase() === 'income' ? 'income' : 'expense';
      } else if (amount > 0) {
        type = 'income';
      } else if (amount < 0) {
        type = 'expense';
      }

      return {
        userId,
        date,
        description,
        category,
        amount: Math.abs(amount).toString(),
        type,
        status: 'completed'
      };
    });
  } catch (error) {
    throw new Error('Failed to parse CSV data: ' + error.message);
  }
}

export function validateFinancialData(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  // Check if each record has required fields
  return data.every(record => 
    record.hasOwnProperty('amount') || 
    record.hasOwnProperty('Amount') || 
    record.hasOwnProperty('AMOUNT')
  );
}

export function generateSampleData(userId: number): InsertFinancialData[] {
  // Only return empty array - no mock data generation unless explicitly requested
  return [];
}
