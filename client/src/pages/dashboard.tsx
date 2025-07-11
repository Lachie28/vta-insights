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
      <header className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-[#0066ff] to-[#3366ff] bg-clip-text text-transparent">
              Financial Intelligence Platform
            </h2>
            <p className="text-slate-600 mt-1">Advanced analytics with AI-powered insights and automated reporting</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending}
              className="bg-gradient-to-r from-[#00f3ff] to-[#0066ff] hover:from-[#00d4e6] hover:to-[#0052cc] text-white font-semibold shadow-lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {generateReportMutation.isPending ? 'Generating...' : 'Generate AI Report'}
            </Button>
            <div className="flex items-center space-x-2 text-slate-500 bg-white px-3 py-2 rounded-lg border">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{currentDate}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content with Tabs */}
      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="automation">Revenue & KPI Analysis</TabsTrigger>
            <TabsTrigger value="forecasting">Trends & Forecasting</TabsTrigger>
            <TabsTrigger value="reporting">Weekly/Monthly Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* File Upload */}
            <FileUpload onDataUploaded={handleDataUploaded} />
            
            {/* KPI Cards */}
            <KPICards metrics={currentMetrics} />

            {/* Charts */}
            <Charts 
              monthlyData={currentMetrics.monthlyData} 
              expenseBreakdown={currentMetrics.expenseBreakdown} 
            />

            {/* Transactions Table */}
            <TransactionsTable transactions={transactions} />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <AutomationDashboard metrics={currentMetrics} />
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Charts 
                  monthlyData={currentMetrics.monthlyData} 
                  expenseBreakdown={currentMetrics.expenseBreakdown} 
                />
              </div>
              <div className="space-y-6">
                <AutomationDashboard metrics={currentMetrics} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AiInsights 
                  insights={insights}
                  isGenerating={generateInsightsMutation.isPending}
                  onRegenerateInsights={handleRegenerateInsights}
                />
              </div>
              <div className="space-y-6">
                <AutomationDashboard metrics={currentMetrics} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
