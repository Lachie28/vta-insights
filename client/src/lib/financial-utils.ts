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
