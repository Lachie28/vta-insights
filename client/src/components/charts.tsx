import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from "recharts";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateChartColors, formatCompactCurrency } from "@/lib/financial-utils";

interface ChartsProps {
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

export function Charts({ monthlyData, expenseBreakdown }: ChartsProps) {
  const colors = generateChartColors();

  // Format monthly data for chart
  const chartData = monthlyData.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    revenue: item.revenue,
    expenses: item.expenses
  }));

  // Format expense data for pie chart
  const pieData = expenseBreakdown.map(item => ({
    name: item.category,
    value: item.amount
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCompactCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>
            {formatCompactCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Revenue Trend</CardTitle>
            <p className="text-sm text-slate-600">Monthly revenue over time</p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: colors[0] }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Expense Breakdown</CardTitle>
            <p className="text-sm text-slate-600">Current expense categories</p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
