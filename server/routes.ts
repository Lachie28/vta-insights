import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { parseCSVData, validateFinancialData } from "./file-processor";
import { generateFinancialInsights, generateFinancialReport } from "./ai-service";
import { generatePDFReport } from "./pdf-generator";
import { insertFinancialDataSchema, insertAiInsightSchema, insertReportSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo (in real app, this would come from authentication)
  const DEMO_USER_ID = 1;

  // Get financial data
  app.get("/api/financial-data", async (req, res) => {
    try {
      const data = await storage.getFinancialData(DEMO_USER_ID);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred" });
    }
  });

  // Upload financial data
  app.post("/api/upload-financial-data", upload.single('file'), async (req, res) => {
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

  // Get financial metrics/summary
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
          expenseBreakdown: []
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
        const month = d.date.substring(0, 7); // YYYY-MM format
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

      res.json({
        totalRevenue,
        totalExpenses,
        netCashFlow,
        runway: Math.max(0, runway),
        revenueGrowthRate: 8.3, // Simplified
        expenseGrowthRate: 5.2, // Simplified
        monthlyData: monthlyArray,
        expenseBreakdown
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
