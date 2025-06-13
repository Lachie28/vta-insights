import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, AlertTriangle } from "lucide-react";
import { Charts } from "@/components/charts";
import type { FinancialData } from "@shared/schema";
import type { FinancialMetrics } from "@/lib/financial-utils";

export default function ForecastsPage() {
  const { data: financialData = [] } = useQuery<FinancialData[]>({
    queryKey: ['/api/financial-data'],
  });

  const { data: metrics } = useQuery<FinancialMetrics>({
    queryKey: ['/api/financial-metrics'],
  });

  // Generate forecast data based on current trends
  const generateForecasts = () => {
    if (!metrics || financialData.length === 0) {
      return {
        nextMonthRevenue: 0,
        nextMonthExpenses: 0,
        quarterlyForecast: { revenue: 0, expenses: 0, netCashFlow: 0 },
        yearlyForecast: { revenue: 0, expenses: 0, netCashFlow: 0 },
        burnRate: 0,
        runwayMonths: 0
      };
    }

    const monthlyRevenue = metrics.totalRevenue / 12;
    const monthlyExpenses = metrics.totalExpenses / 12;
    
    // Simple growth projections
    const revenueGrowthFactor = 1 + (metrics.revenueGrowthRate / 100);
    const expenseGrowthFactor = 1 + (metrics.expenseGrowthRate / 100);

    const nextMonthRevenue = monthlyRevenue * revenueGrowthFactor;
    const nextMonthExpenses = monthlyExpenses * expenseGrowthFactor;

    const quarterlyRevenue = nextMonthRevenue * 3;
    const quarterlyExpenses = nextMonthExpenses * 3;
    
    const yearlyRevenue = nextMonthRevenue * 12;
    const yearlyExpenses = nextMonthExpenses * 12;

    return {
      nextMonthRevenue,
      nextMonthExpenses,
      quarterlyForecast: {
        revenue: quarterlyRevenue,
        expenses: quarterlyExpenses,
        netCashFlow: quarterlyRevenue - quarterlyExpenses
      },
      yearlyForecast: {
        revenue: yearlyRevenue,
        expenses: yearlyExpenses,
        netCashFlow: yearlyRevenue - yearlyExpenses
      },
      burnRate: monthlyExpenses - monthlyRevenue,
      runwayMonths: metrics.runway
    };
  };

  const forecasts = generateForecasts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeIndicator = (current: number, projected: number) => {
    const change = ((projected - current) / current) * 100;
    if (change > 0) {
      return { icon: TrendingUp, color: "text-green-600", value: `+${change.toFixed(1)}%` };
    } else {
      return { icon: TrendingDown, color: "text-red-600", value: `${change.toFixed(1)}%` };
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Forecasts</h1>
          <p className="text-slate-600">Predictive analysis and future financial projections</p>
        </div>

        {financialData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No data available</h3>
              <p className="text-slate-500">Upload financial data to generate forecasts</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Key Forecast Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Next Month Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(forecasts.nextMonthRevenue)}
                      </p>
                      {metrics && (
                        <div className="flex items-center mt-1">
                          {(() => {
                            const indicator = getChangeIndicator(metrics.totalRevenue / 12, forecasts.nextMonthRevenue);
                            const Icon = indicator.icon;
                            return (
                              <div className={`flex items-center ${indicator.color}`}>
                                <Icon className="w-3 h-3 mr-1" />
                                <span className="text-xs">{indicator.value}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Next Month Expenses</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(forecasts.nextMonthExpenses)}
                      </p>
                      {metrics && (
                        <div className="flex items-center mt-1">
                          {(() => {
                            const indicator = getChangeIndicator(metrics.totalExpenses / 12, forecasts.nextMonthExpenses);
                            const Icon = indicator.icon;
                            return (
                              <div className={`flex items-center ${indicator.color}`}>
                                <Icon className="w-3 h-3 mr-1" />
                                <span className="text-xs">{indicator.value}</span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <Target className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Runway</p>
                      <p className="text-2xl font-bold text-slate-900">{forecasts.runwayMonths.toFixed(1)}m</p>
                      <Badge variant={forecasts.runwayMonths > 6 ? "default" : "destructive"} className="text-xs mt-1">
                        {forecasts.runwayMonths > 6 ? "Healthy" : "Warning"}
                      </Badge>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Burn Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(Math.abs(forecasts.burnRate))}
                      </p>
                      <Badge variant={forecasts.burnRate < 0 ? "destructive" : "default"} className="text-xs mt-1">
                        {forecasts.burnRate < 0 ? "Burning" : "Positive"}
                      </Badge>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forecast Periods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quarterly Forecast</CardTitle>
                  <CardDescription>Next 3 months projection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Projected Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(forecasts.quarterlyForecast.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Projected Expenses</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(forecasts.quarterlyForecast.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium text-slate-900">Net Cash Flow</span>
                    <span className={`font-bold ${forecasts.quarterlyForecast.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(forecasts.quarterlyForecast.netCashFlow)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Annual Forecast</CardTitle>
                  <CardDescription>Next 12 months projection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Projected Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(forecasts.yearlyForecast.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Projected Expenses</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(forecasts.yearlyForecast.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium text-slate-900">Net Cash Flow</span>
                    <span className={`font-bold ${forecasts.yearlyForecast.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(forecasts.yearlyForecast.netCashFlow)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription>Historical data and projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <Charts 
                    monthlyData={metrics.monthlyData}
                    expenseBreakdown={metrics.expenseBreakdown}
                  />
                </CardContent>
              </Card>
            )}

            {/* Forecast Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle>Forecast Assumptions</CardTitle>
                <CardDescription>Key assumptions used in these projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Revenue Growth Rate</p>
                    <p className="text-xs text-slate-500">
                      {metrics ? `${metrics.revenueGrowthRate.toFixed(1)}%` : 'N/A'} monthly growth based on historical trends
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Expense Growth Rate</p>
                    <p className="text-xs text-slate-500">
                      {metrics ? `${metrics.expenseGrowthRate.toFixed(1)}%` : 'N/A'} monthly growth based on historical trends
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Seasonal Variations</p>
                    <p className="text-xs text-slate-500">Does not account for seasonal business fluctuations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">External Factors</p>
                    <p className="text-xs text-slate-500">Market conditions and economic factors not considered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}