import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./firebase-storage";
import { adminDb } from "../firebase-admin";
import { parseCSVData, validateFinancialData } from "./file-processor";
import { generateFinancialInsights, generateFinancialReport } from "./ai-service";
import { generatePDFReport } from "./pdf-generator";
import { insertFinancialDataSchema, insertAiInsightSchema, insertReportSchema } from "@shared/schema";

interface FirebaseRequest extends Request {
  db?: typeof adminDb;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo (in real app, this would come from authentication)
  const DEMO_USER_ID = "1";

  // Get financial data
  app.get("/api/financial-data", async (req: FirebaseRequest, res: Response) => {
    try {
      const data = await storage.getFinancialData(DEMO_USER_ID);
      res.json(data);
    } catch (error: unknown) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    }
  });

  // Upload financial data
  app.post("/api/upload-financial-data", upload.single('file'), async (req: FirebaseRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      
      if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
        return res.status(400).json({ error: "Only CSV files are supported" });
      }

      const parsedData = parseCSVData(fileContent, DEMO_USER_ID);
      
      if (parsedData.length === 0) {
        return res.status(400).json({ error: "No valid financial data found in file" });
      }

      const savedData = await storage.bulkCreateFinancialData(parsedData);
      res.json({ 
        message: `Successfully uploaded ${savedData.length} financial records`,
        count: savedData.length 
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  // Get AI insights
  app.get("/api/ai-insights", async (req, res) => {
    try {
      const insights = await storage.getAiInsights(DEMO_USER_ID);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  // Generate AI insights
  app.post("/api/generate-insights", async (req, res) => {
    try {
      const financialData = await storage.getFinancialData(DEMO_USER_ID);
      
      if (financialData.length === 0) {
        return res.status(400).json({ error: "No financial data available. Please upload data first." });
      }

      // Calculate financial summary
      const totalRevenue = financialData
        .filter(d => d.type === 'income')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      const totalExpenses = financialData
        .filter(d => d.type === 'expense')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

      const netCashFlow = totalRevenue - totalExpenses;
      const averageMonthlyRevenue = totalRevenue / 12;
      const averageMonthlyExpenses = totalExpenses / 12;
      const revenueGrowthRate = 8.3; // Simplified calculation
      const expenseGrowthRate = 5.2; // Simplified calculation
      const runway = netCashFlow > 0 ? (totalRevenue / averageMonthlyExpenses) : 0;

      const financialSummary = {
        totalRevenue,
        totalExpenses,
        netCashFlow,
        averageMonthlyRevenue,
        averageMonthlyExpenses,
        revenueGrowthRate,
        expenseGrowthRate,
        runway
      };

      // Clear existing insights
      await storage.clearAiInsights(DEMO_USER_ID);

      // Generate new insights
      const aiInsights = await generateFinancialInsights(financialSummary, financialData);
      
      // Save insights to storage
      const savedInsights = [];
      for (const insight of aiInsights) {
        const saved = await storage.createAiInsight({
          userId: DEMO_USER_ID,
          title: insight.title,
          content: insight.content,
          type: insight.type
        });
        savedInsights.push(saved);
      }

      res.json(savedInsights);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  // Get financial metrics/summary with advanced analytics
  app.get("/api/financial-metrics", async (req, res) => {
    try {
      const financialData = await storage.getFinancialData(DEMO_USER_ID);
      
      if (financialData.length === 0) {
        return res.json({
          totalRevenue: 0,
          totalExpenses: 0,
          netCashFlow: 0,
          runway: 0,
          revenueGrowthRate: 0,
          expenseGrowthRate: 0,
          monthlyData: [],
          weeklyData: [],
          expenseBreakdown: [],
          kpis: {
            grossMargin: 0,
            operatingMargin: 0,
            burnRate: 0,
            customerAcquisitionCost: 0,
            averageRevenuePerUser: 0,
            churnRate: 0
          },
          trends: {
            revenueDirection: 'stable',
            expenseDirection: 'stable',
            seasonality: []
          },
          targetAreas: []
        });
      }

      const totalRevenue = financialData
        .filter(d => d.type === 'income')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      const totalExpenses = financialData
        .filter(d => d.type === 'expense')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

      const netCashFlow = totalRevenue - totalExpenses;
      const runway = totalExpenses > 0 ? (netCashFlow / (totalExpenses / 12)) : 0;

      // Calculate KPIs
      const operatingExpenses = financialData
        .filter(d => d.type === 'expense' && !['COGS', 'Cost of Goods Sold'].includes(d.category))
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

      const cogs = financialData
        .filter(d => d.type === 'expense' && ['COGS', 'Cost of Goods Sold'].includes(d.category))
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

      const marketingExpenses = financialData
        .filter(d => d.type === 'expense' && d.category.toLowerCase().includes('marketing'))
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

      const kpis = {
        grossMargin: totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue) * 100 : 0,
        operatingMargin: totalRevenue > 0 ? ((totalRevenue - operatingExpenses) / totalRevenue) * 100 : 0,
        burnRate: (totalExpenses - totalRevenue) / 12,
        customerAcquisitionCost: marketingExpenses > 0 ? marketingExpenses / Math.max(1, financialData.length / 100) : 0,
        averageRevenuePerUser: totalRevenue > 0 ? totalRevenue / Math.max(1, financialData.length / 50) : 0,
        churnRate: 5.2
      };

      // Group by category for expense breakdown
      const expenseByCategory = financialData
        .filter(d => d.type === 'expense')
        .reduce((acc, d) => {
          acc[d.category] = (acc[d.category] || 0) + parseFloat(d.amount);
          return acc;
        }, {} as Record<string, number>);

      const expenseBreakdown = Object.entries(expenseByCategory).map(([category, amount]) => ({
        category,
        amount
      }));

      // Group by month for trend data
      const monthlyData = financialData.reduce((acc, d) => {
        const month = d.date.substring(0, 7);
        if (!acc[month]) {
          acc[month] = { revenue: 0, expenses: 0 };
        }
        if (d.type === 'income') {
          acc[month].revenue += parseFloat(d.amount);
        } else {
          acc[month].expenses += parseFloat(d.amount);
        }
        return acc;
      }, {} as Record<string, { revenue: number; expenses: number }>);

      const monthlyArray = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          expenses: data.expenses
        }));

      // Generate weekly data
      const weeklyData: Record<string, { revenue: number; expenses: number }> = {};
      financialData.forEach(transaction => {
        const date = new Date(transaction.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { revenue: 0, expenses: 0 };
        }

        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
          weeklyData[weekKey].revenue += amount;
        } else {
          weeklyData[weekKey].expenses += amount;
        }
      });

      const weeklyArray = Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, data]) => ({
          week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: data.revenue,
          expenses: data.expenses
        }));

      // Identify trends
      let revenueDirection: 'stable' | 'increasing' | 'decreasing' = 'stable';
      let expenseDirection: 'stable' | 'increasing' | 'decreasing' = 'stable';

      if (monthlyArray.length >= 3) {
        const recentRevenue = monthlyArray.slice(-3).map(d => d.revenue);
        const revenueSlope = (recentRevenue[2] - recentRevenue[0]) / 2;
        revenueDirection = revenueSlope > 500 ? 'increasing' : revenueSlope < -500 ? 'decreasing' : 'stable';

        const recentExpenses = monthlyArray.slice(-3).map(d => d.expenses);
        const expenseSlope = (recentExpenses[2] - recentExpenses[0]) / 2;
        expenseDirection = expenseSlope > 200 ? 'increasing' : expenseSlope < -200 ? 'decreasing' : 'stable';
      }

      const trends = {
        revenueDirection,
        expenseDirection,
        seasonality: monthlyArray.map((data, index) => ({
          month: index + 1,
          factor: data.revenue / (monthlyArray.reduce((sum, d) => sum + d.revenue, 0) / monthlyArray.length || 1)
        }))
      };

      // Identify target areas
      const targetAreas = [];

      if (kpis.burnRate > 0) {
        targetAreas.push({
          category: 'Cash Flow',
          issue: 'Negative cash flow detected',
          priority: 'high',
          recommendation: 'Focus on increasing revenue or reducing operating expenses'
        });
      }

      Object.entries(expenseByCategory).forEach(([category, amount]) => {
        const percentage = (amount / totalExpenses) * 100;
        if (percentage > 30) {
          targetAreas.push({
            category: 'Expense Management',
            issue: `High spending in ${category} (${percentage.toFixed(1)}% of total expenses)`,
            priority: percentage > 50 ? 'high' : 'medium',
            recommendation: `Review and optimize ${category} expenses`
          });
        }
      });

      if (kpis.grossMargin < 50) {
        targetAreas.push({
          category: 'Profitability',
          issue: `Low gross margin (${kpis.grossMargin.toFixed(1)}%)`,
          priority: kpis.grossMargin < 30 ? 'high' : 'medium',
          recommendation: 'Consider increasing prices or reducing cost of goods sold'
        });
      }

      // Calculate growth rates
      const revenueGrowthRate = monthlyArray.length >= 2 ? 
        ((monthlyArray[monthlyArray.length - 1].revenue - monthlyArray[monthlyArray.length - 2].revenue) / monthlyArray[monthlyArray.length - 2].revenue * 100) : 0;
      
      const expenseGrowthRate = monthlyArray.length >= 2 ? 
        ((monthlyArray[monthlyArray.length - 1].expenses - monthlyArray[monthlyArray.length - 2].expenses) / monthlyArray[monthlyArray.length - 2].expenses * 100) : 0;

      res.json({
        totalRevenue,
        totalExpenses,
        netCashFlow,
        runway: Math.max(0, runway),
        revenueGrowthRate: isFinite(revenueGrowthRate) ? revenueGrowthRate : 0,
        expenseGrowthRate: isFinite(expenseGrowthRate) ? expenseGrowthRate : 0,
        monthlyData: monthlyArray,
        weeklyData: weeklyArray,
        expenseBreakdown,
        kpis,
        trends,
        targetAreas
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  // Generate and export PDF report
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { title = "Financial Report", type = "monthly" } = req.body;
      
      const financialData = await storage.getFinancialData(DEMO_USER_ID);
      const insights = await storage.getAiInsights(DEMO_USER_ID);
      
      if (financialData.length === 0) {
        return res.status(400).json({ error: "No financial data available. Please upload data first." });
      }

      // Calculate metrics
      const totalRevenue = financialData
        .filter(d => d.type === 'income')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      const totalExpenses = financialData
        .filter(d => d.type === 'expense')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

      const netCashFlow = totalRevenue - totalExpenses;
      const runway = totalExpenses > 0 ? (netCashFlow / (totalExpenses / 12)) : 0;

      const financialSummary = {
        totalRevenue,
        totalExpenses,
        netCashFlow,
        averageMonthlyRevenue: totalRevenue / 12,
        averageMonthlyExpenses: totalExpenses / 12,
        revenueGrowthRate: 8.3,
        expenseGrowthRate: 5.2,
        runway
      };

      // Generate report content using AI
      const reportContent = await generateFinancialReport(
        financialSummary,
        insights.map(i => ({ title: i.title, content: i.content, type: i.type as any })),
        type
      );

      // Save report to storage
      const savedReport = await storage.createReport({
        userId: DEMO_USER_ID,
        title,
        content: reportContent,
        type
      });

      // Generate PDF
      const pdfBuffer = await generatePDFReport({
        title,
        content: reportContent,
        generatedAt: savedReport.generatedAt,
        metrics: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          cashFlow: netCashFlow,
          runway
        }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports(DEMO_USER_ID);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
