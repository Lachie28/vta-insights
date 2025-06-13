import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, Clock } from "lucide-react";
import { formatCompactCurrency, formatPercentage, getGrowthColor } from "@/lib/financial-utils";

interface KPICardsProps {
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netCashFlow: number;
    runway: number;
    revenueGrowthRate: number;
    expenseGrowthRate: number;
  };
}

export function KPICards({ metrics }: KPICardsProps) {
  const kpiData = [
    {
      title: "Monthly Revenue",
      value: formatCompactCurrency(metrics.totalRevenue / 12),
      icon: DollarSign,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      growth: metrics.revenueGrowthRate,
      growthLabel: "vs last month"
    },
    {
      title: "Operating Expenses", 
      value: formatCompactCurrency(metrics.totalExpenses / 12),
      icon: CreditCard,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      growth: metrics.expenseGrowthRate,
      growthLabel: "vs last month"
    },
    {
      title: "Cash Flow",
      value: formatCompactCurrency(metrics.netCashFlow),
      icon: TrendingUp,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      growth: 8.7,
      growthLabel: "vs last month"
    },
    {
      title: "Runway (Months)",
      value: metrics.runway.toFixed(1),
      icon: Clock,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      growth: 2.1,
      growthLabel: "months added"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                </div>
                <div className={`w-12 h-12 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${kpi.iconColor} text-lg`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className={`font-medium ${getGrowthColor(kpi.growth)}`}>
                  {formatPercentage(kpi.growth)}
                </span>
                <span className="text-slate-500 ml-2">{kpi.growthLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
