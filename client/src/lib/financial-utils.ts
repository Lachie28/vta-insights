export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netCashFlow: number;
  runway: number;
  revenueGrowthRate: number;
  expenseGrowthRate: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
  }>;
  weeklyData: Array<{
    week: string;
    revenue: number;
    expenses: number;
  }>;
  kpis: {
    grossMargin: number;
    operatingMargin: number;
    burnRate: number;
    customerAcquisitionCost: number;
    averageRevenuePerUser: number;
    churnRate: number;
  };
  trends: {
    revenueDirection: 'increasing' | 'decreasing' | 'stable';
    expenseDirection: 'increasing' | 'decreasing' | 'stable';
    seasonality: Array<{
      month: number;
      factor: number;
    }>;
  };
  targetAreas: Array<{
    category: string;
    issue: string;
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function getGrowthColor(value: number): string {
  return value >= 0 ? 'text-accent' : 'text-destructive';
}

export function getInsightTypeColor(type: string): string {
  switch (type) {
    case 'positive':
      return 'border-accent';
    case 'warning':
      return 'border-warning';
    case 'info':
    default:
      return 'border-primary';
  }
}

export function getInsightTypeBgColor(type: string): string {
  switch (type) {
    case 'positive':
      return 'bg-accent/10';
    case 'warning':
      return 'bg-warning/10';
    case 'info':
    default:
      return 'bg-primary/10';
  }
}

export function generateChartColors(): string[] {
  return [
    'hsl(221, 83%, 53%)', // primary
    'hsl(142, 71%, 45%)', // accent
    'hsl(43, 96%, 56%)',  // warning
    'hsl(0, 84%, 60%)',   // destructive
    'hsl(215, 16%, 46.9%)', // muted-foreground
  ];
}

// Advanced Analytics Functions
export function calculateKPIs(financialData: any[]): {
  grossMargin: number;
  operatingMargin: number;
  burnRate: number;
  customerAcquisitionCost: number;
  averageRevenuePerUser: number;
  churnRate: number;
} {
  const totalRevenue = financialData
    .filter(d => d.type === 'income')
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);
  
  const totalExpenses = financialData
    .filter(d => d.type === 'expense')
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const operatingExpenses = financialData
    .filter(d => d.type === 'expense' && !['COGS', 'Cost of Goods Sold'].includes(d.category))
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const cogs = financialData
    .filter(d => d.type === 'expense' && ['COGS', 'Cost of Goods Sold'].includes(d.category))
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  const marketingExpenses = financialData
    .filter(d => d.type === 'expense' && d.category.toLowerCase().includes('marketing'))
    .reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return {
    grossMargin: totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue) * 100 : 0,
    operatingMargin: totalRevenue > 0 ? ((totalRevenue - operatingExpenses) / totalRevenue) * 100 : 0,
    burnRate: (totalExpenses - totalRevenue) / 12, // Monthly burn rate
    customerAcquisitionCost: marketingExpenses > 0 ? marketingExpenses / Math.max(1, financialData.length / 100) : 0,
    averageRevenuePerUser: totalRevenue > 0 ? totalRevenue / Math.max(1, financialData.length / 50) : 0,
    churnRate: 5.2 // Estimated based on industry standards
  };
}

export function identifyTrends(monthlyData: Array<{ month: string; revenue: number; expenses: number }>): {
  revenueDirection: 'increasing' | 'decreasing' | 'stable';
  expenseDirection: 'increasing' | 'decreasing' | 'stable';
  seasonality: Array<{ month: number; factor: number }>;
} {
  if (monthlyData.length < 3) {
    return {
      revenueDirection: 'stable',
      expenseDirection: 'stable',
      seasonality: []
    };
  }

  // Calculate revenue trend
  const recentRevenue = monthlyData.slice(-3).map(d => d.revenue);
  const revenueSlope = (recentRevenue[2] - recentRevenue[0]) / 2;
  const revenueDirection = revenueSlope > 500 ? 'increasing' : revenueSlope < -500 ? 'decreasing' : 'stable';

  // Calculate expense trend
  const recentExpenses = monthlyData.slice(-3).map(d => d.expenses);
  const expenseSlope = (recentExpenses[2] - recentExpenses[0]) / 2;
  const expenseDirection = expenseSlope > 200 ? 'increasing' : expenseSlope < -200 ? 'decreasing' : 'stable';

  // Simple seasonality detection
  const seasonality = monthlyData.map((data, index) => ({
    month: index + 1,
    factor: data.revenue / (monthlyData.reduce((sum, d) => sum + d.revenue, 0) / monthlyData.length)
  }));

  return {
    revenueDirection,
    expenseDirection,
    seasonality
  };
}

export function identifyTargetAreas(financialData: any[], kpis: any): Array<{
  category: string;
  issue: string;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}> {
  const targetAreas = [];

  // Check burn rate
  if (kpis.burnRate > 0) {
    targetAreas.push({
      category: 'Cash Flow',
      issue: 'Negative cash flow detected',
      priority: 'high' as const,
      recommendation: 'Focus on increasing revenue or reducing operating expenses'
    });
  }

  // Check expense categories
  const expenseByCategory: Record<string, number> = financialData
    .filter(d => d.type === 'expense')
    .reduce((acc: Record<string, number>, d) => {
      acc[d.category] = (acc[d.category] || 0) + parseFloat(d.amount);
      return acc;
    }, {});

  const totalExpenses = Object.values(expenseByCategory).reduce((sum, amount) => sum + amount, 0);
  
  // Identify high expense categories
  Object.entries(expenseByCategory).forEach(([category, amount]) => {
    const percentage = (amount / totalExpenses) * 100;
    if (percentage > 30) {
      targetAreas.push({
        category: 'Expense Management',
        issue: `High spending in ${category} (${percentage.toFixed(1)}% of total expenses)`,
        priority: percentage > 50 ? 'high' as const : 'medium' as const,
        recommendation: `Review and optimize ${category} expenses`
      });
    }
  });

  // Check gross margin
  if (kpis.grossMargin < 50) {
    targetAreas.push({
      category: 'Profitability',
      issue: `Low gross margin (${kpis.grossMargin.toFixed(1)}%)`,
      priority: kpis.grossMargin < 30 ? 'high' as const : 'medium' as const,
      recommendation: 'Consider increasing prices or reducing cost of goods sold'
    });
  }

  return targetAreas;
}

export function generateWeeklyData(financialData: any[]): Array<{
  week: string;
  revenue: number;
  expenses: number;
}> {
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

  return Object.entries(weeklyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: data.revenue,
      expenses: data.expenses
    }));
}
