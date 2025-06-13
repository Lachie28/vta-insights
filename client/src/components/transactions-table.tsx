import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, Download } from "lucide-react";
import { FinancialData } from "@shared/schema";
import { formatCurrency } from "@/lib/financial-utils";

interface TransactionsTableProps {
  transactions: FinancialData[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const sortedTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Show last 10 transactions

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-primary/10 text-primary',
      'Revenue': 'bg-accent/10 text-accent',
      'Facilities': 'bg-warning/10 text-warning',
      'Marketing': 'bg-slate-100 text-slate-600',
      'Salaries': 'bg-blue-100 text-blue-600',
      'Other': 'bg-gray-100 text-gray-600'
    };
    return colors[category] || colors['Other'];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-accent/10 text-accent';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: string, type: string) => {
    const value = parseFloat(amount);
    const formattedAmount = formatCurrency(value);
    return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const getAmountColor = (type: string) => {
    return type === 'income' ? 'text-accent font-medium' : 'text-slate-900 font-medium';
  };

  if (transactions.length === 0) {
    return (
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Transactions</CardTitle>
            <p className="text-sm text-slate-600">Latest financial transactions and entries</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-600 mb-2">No transactions available</p>
            <p className="text-sm text-slate-500">Upload your financial data to see transactions here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Transactions</CardTitle>
          <p className="text-sm text-slate-600">Latest financial transactions and entries</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-900 font-semibold">Date</TableHead>
                <TableHead className="text-slate-900 font-semibold">Description</TableHead>
                <TableHead className="text-slate-900 font-semibold">Category</TableHead>
                <TableHead className="text-right text-slate-900 font-semibold">Amount</TableHead>
                <TableHead className="text-center text-slate-900 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-slate-100 hover:bg-slate-50">
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-900">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getCategoryColor(transaction.category)}>
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-sm text-right ${getAmountColor(transaction.type)}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing {sortedTransactions.length} of {transactions.length} transactions
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
