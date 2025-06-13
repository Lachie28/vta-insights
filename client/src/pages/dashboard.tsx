import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Calendar } from "lucide-react";
import { KPICards } from "@/components/kpi-cards";
import { Charts } from "@/components/charts";
import { AiInsights } from "@/components/ai-insights";
import { FileUpload } from "@/components/file-upload";
import { TransactionsTable } from "@/components/transactions-table";
import { AutomationDashboard } from "@/components/automation-dashboard";
import { FinancialMetrics } from "@/lib/financial-utils";
import { FinancialData, AiInsight } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch financial metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<FinancialMetrics>({
    queryKey: ['/api/financial-metrics'],
  });

  // Fetch financial data
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<FinancialData[]>({
    queryKey: ['/api/financial-data'],
  });

  // Fetch AI insights
  const { data: insights = [], isLoading: insightsLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/ai-insights'],
  });

  // Generate insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/generate-insights'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
      toast({
        title: "Insights generated",
        description: "New AI insights have been generated based on your financial data.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate insights",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/generate-report', {
      title: 'Monthly Financial Report',
      type: 'monthly'
    }),
    onSuccess: async (response) => {
      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'financial-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report generated",
        description: "Your financial report has been generated and downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDataUploaded = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/financial-data'] });
    queryClient.invalidateQueries({ queryKey: ['/api/financial-metrics'] });
  };

  const handleRegenerateInsights = () => {
    generateInsightsMutation.mutate();
  };

  const handleGenerateReport = () => {
    generateReportMutation.mutate();
  };

  const defaultMetrics: FinancialMetrics = {
    totalRevenue: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    runway: 0,
    revenueGrowthRate: 0,
    expenseGrowthRate: 0,
    monthlyData: [],
    expenseBreakdown: []
  };

  const currentMetrics = metrics || defaultMetrics;
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (metricsLoading || transactionsLoading || insightsLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 rounded"></div>
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Financial Dashboard</h2>
            <p className="text-slate-600">Overview of your financial performance and AI insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {generateReportMutation.isPending ? 'Generating...' : 'Generate AI Report'}
            </Button>
            <div className="flex items-center space-x-2 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{currentDate}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <KPICards metrics={currentMetrics} />

        {/* Charts Section */}
        <Charts 
          monthlyData={currentMetrics.monthlyData} 
          expenseBreakdown={currentMetrics.expenseBreakdown} 
        />

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AiInsights 
            insights={insights}
            isGenerating={generateInsightsMutation.isPending}
            onRegenerateInsights={handleRegenerateInsights}
          />
          <FileUpload onDataUploaded={handleDataUploaded} />
        </div>

        {/* Transactions Table */}
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
}
