import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, RefreshCw, TrendingUp, AlertTriangle, Info, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AiInsights } from "@/components/ai-insights";
import type { AiInsight, FinancialData } from "@shared/schema";
import type { FinancialMetrics } from "@/lib/financial-utils";

export default function AiReportsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading: insightsLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/ai-insights'],
  });

  const { data: financialData = [] } = useQuery<FinancialData[]>({
    queryKey: ['/api/financial-data'],
  });

  const { data: metrics } = useQuery<FinancialMetrics>({
    queryKey: ['/api/financial-metrics'],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/generate-insights', { method: 'POST' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate insights');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "AI insights generated",
        description: "New financial insights have been created based on your data",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate insights",
        description: error.message || "Unable to generate insights",
        variant: "destructive",
      });
    },
  });

  const handleRegenerateInsights = () => {
    generateInsightsMutation.mutate();
  };

  const getInsightStats = () => {
    const total = insights.length;
    const positive = insights.filter(i => i.type === 'positive').length;
    const warnings = insights.filter(i => i.type === 'warning').length;
    const info = insights.filter(i => i.type === 'info').length;
    
    return { total, positive, warnings, info };
  };

  const stats = getInsightStats();

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Financial Reports</h1>
          <p className="text-slate-600">Get intelligent insights and analysis powered by AI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Insights</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Positive Trends</p>
                  <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Warnings</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.warnings}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Information</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
                </div>
                <Info className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      AI Financial Insights
                    </CardTitle>
                    <CardDescription>
                      AI-powered analysis of your financial data and trends
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleRegenerateInsights}
                    disabled={generateInsightsMutation.isPending || financialData.length === 0}
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
                    {generateInsightsMutation.isPending ? 'Generating...' : 'Regenerate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {financialData.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No data available</h3>
                    <p className="text-slate-500">Upload financial data to generate AI insights</p>
                  </div>
                ) : (
                  <AiInsights 
                    insights={insights}
                    isGenerating={generateInsightsMutation.isPending}
                    onRegenerateInsights={handleRegenerateInsights}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={handleRegenerateInsights}
                  disabled={generateInsightsMutation.isPending || financialData.length === 0}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Generate New Insights
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled={financialData.length === 0}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trend Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Data Points</span>
                  <Badge variant="secondary">{financialData.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Revenue Streams</span>
                  <Badge variant="secondary">
                    {financialData.filter(d => d.type === 'income').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Expense Categories</span>
                  <Badge variant="secondary">
                    {new Set(financialData.filter(d => d.type === 'expense').map(d => d.category)).size}
                  </Badge>
                </div>
                {metrics && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Cash Flow</span>
                      <Badge variant={metrics.netCashFlow >= 0 ? "default" : "destructive"}>
                        ${Math.abs(metrics.netCashFlow).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Trend Detection</p>
                    <p className="text-xs text-slate-500">Identifies patterns in your financial data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Risk Assessment</p>
                    <p className="text-xs text-slate-500">Evaluates financial risks and opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Smart Recommendations</p>
                    <p className="text-xs text-slate-500">Provides actionable financial advice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}