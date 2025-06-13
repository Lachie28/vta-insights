import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, Clock, DollarSign, Users, Zap } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/financial-utils";
import type { FinancialMetrics } from "@/lib/financial-utils";

interface AutomationDashboardProps {
  metrics: FinancialMetrics;
}

export function AutomationDashboard({ metrics }: AutomationDashboardProps) {
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Revenue Analysis
            </CardTitle>
            <CardDescription>Automated revenue data analysis and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(metrics.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Growth Rate</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(metrics.trends.revenueDirection)}
                <span className={`font-medium ${metrics.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(metrics.revenueGrowthRate)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trend Direction</span>
              <Badge variant="secondary" className="capitalize">
                {metrics.trends.revenueDirection}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Revenue Seasonality</span>
              <div className="grid grid-cols-3 gap-2">
                {metrics.trends.seasonality.slice(0, 6).map((season, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500">M{season.month}</div>
                    <div className="text-sm font-medium">
                      {(season.factor * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              KPI Monitoring
            </CardTitle>
            <CardDescription>Key performance indicators tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Gross Margin</span>
                <span className="font-bold">{metrics.kpis.grossMargin.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(metrics.kpis.grossMargin, 100)} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Operating Margin</span>
                <span className="font-bold">{metrics.kpis.operatingMargin.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(Math.max(metrics.kpis.operatingMargin, 0), 100)} className="h-2" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Burn Rate</span>
              <span className={`font-bold ${metrics.kpis.burnRate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(metrics.kpis.burnRate))}/month
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Customer Acquisition Cost</span>
              <span className="font-bold">{formatCurrency(metrics.kpis.customerAcquisitionCost)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Revenue Per User</span>
              <span className="font-bold">{formatCurrency(metrics.kpis.averageRevenuePerUser)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Areas Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Target Areas Analysis
          </CardTitle>
          <CardDescription>
            Automated identification of areas requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.targetAreas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-green-700 mb-1">All systems operational</h3>
              <p className="text-sm text-gray-600">No critical issues detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.targetAreas.map((area, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(area.priority)} variant="outline">
                          {area.priority.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium text-gray-600">{area.category}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{area.issue}</h4>
                      <p className="text-sm text-gray-600">{area.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecasting Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Forecasting Support
            </CardTitle>
            <CardDescription>Predictive analysis and projections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Next Month Projection</span>
              <span className="font-bold">
                {formatCurrency(metrics.totalRevenue * (1 + metrics.revenueGrowthRate / 100))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quarterly Forecast</span>
              <span className="font-bold">
                {formatCurrency(metrics.totalRevenue * 3 * (1 + metrics.revenueGrowthRate / 100))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cash Runway</span>
              <span className={`font-bold flex items-center gap-1 ${metrics.runway > 6 ? 'text-green-600' : 'text-red-600'}`}>
                <Clock className="w-4 h-4" />
                {metrics.runway.toFixed(1)} months
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Confidence Level</span>
              <div className="flex items-center gap-2">
                <Progress value={85} className="flex-1 h-2" />
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly/Monthly Reporting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Automated Reporting
            </CardTitle>
            <CardDescription>Weekly and monthly analysis summaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Weekly Data Points</span>
              <span className="font-bold">{metrics.weeklyData.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Trends</span>
              <span className="font-bold">{metrics.monthlyData.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last Week Revenue</span>
              <span className="font-bold text-green-600">
                {metrics.weeklyData.length > 0 
                  ? formatCurrency(metrics.weeklyData[metrics.weeklyData.length - 1]?.revenue || 0)
                  : formatCurrency(0)
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Report Generation</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Automated
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Analysis Completion</span>
              <div className="flex items-center gap-2">
                <Progress value={100} className="flex-1 h-2" />
                <span className="text-sm font-medium">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}