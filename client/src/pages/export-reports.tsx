import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Report, FinancialData } from "@shared/schema";

export default function ExportReportsPage() {
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
  });

  const { data: financialData = [] } = useQuery<FinancialData[]>({
    queryKey: ['/api/financial-data'],
  });

  const generateReportMutation = useMutation({
    mutationFn: async ({ title, type }: { title: string; type: string }) => {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, type }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }
      
      // Return the blob for download
      return response.blob();
    },
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${variables.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report generated",
        description: `${variables.title} has been downloaded`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      setReportTitle("");
      setReportType("");
    },
    onError: (error: any) => {
      toast({
        title: "Report generation failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    if (!reportTitle.trim() || !reportType) {
      toast({
        title: "Missing information",
        description: "Please enter a report title and select a type",
        variant: "destructive",
      });
      return;
    }

    generateReportMutation.mutate({
      title: reportTitle.trim(),
      type: reportType
    });
  };

  const reportTypes = [
    { value: "monthly", label: "Monthly Report", icon: Calendar },
    { value: "quarterly", label: "Quarterly Report", icon: BarChart3 },
    { value: "yearly", label: "Annual Report", icon: TrendingUp },
    { value: "custom", label: "Custom Analysis", icon: FileText },
  ];

  const getReportTypeLabel = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.label : type;
  };

  const getReportTypeBadgeColor = (type: string) => {
    switch (type) {
      case "monthly": return "bg-blue-100 text-blue-800";
      case "quarterly": return "bg-green-100 text-green-800";
      case "yearly": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Export Reports</h1>
          <p className="text-slate-600">Generate and download comprehensive financial reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generate New Report */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Generate New Report
              </CardTitle>
              <CardDescription>
                Create a comprehensive financial report based on your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-title">Report Title</Label>
                <Input
                  id="report-title"
                  placeholder="e.g., Q4 2024 Financial Summary"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending || financialData.length === 0}
                className="w-full"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>

              {financialData.length === 0 && (
                <p className="text-sm text-slate-500 text-center">
                  Upload financial data to generate reports
                </p>
              )}
            </CardContent>
          </Card>

          {/* Report History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Report History
              </CardTitle>
              <CardDescription>
                Previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No reports generated yet</h3>
                  <p className="text-slate-500">Generate your first report to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-slate-900">{report.title}</h3>
                            <Badge 
                              className={`text-xs ${getReportTypeBadgeColor(report.type)}`}
                              variant="secondary"
                            >
                              {getReportTypeLabel(report.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            Generated on {formatDate(report.generatedAt)}
                          </p>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {report.content.substring(0, 150)}...
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4">
                          <Download className="w-4 h-4 mr-2" />
                          Re-download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Templates */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Available Report Templates</CardTitle>
            <CardDescription>
              Choose from these pre-configured report formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div 
                    key={type.value}
                    className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setReportType(type.value)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-blue-500" />
                      <h3 className="font-medium text-slate-900">{type.label}</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      {type.value === 'monthly' && 'Detailed monthly financial analysis with trends and insights'}
                      {type.value === 'quarterly' && 'Comprehensive quarterly review with performance metrics'}
                      {type.value === 'yearly' && 'Annual financial summary with year-over-year comparisons'}
                      {type.value === 'custom' && 'Flexible report format for specific analysis needs'}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}