import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TransactionsTable } from "@/components/transactions-table";
import type { FinancialData } from "@shared/schema";

export default function UploadDataPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: financialData = [], isLoading } = useQuery<FinancialData[]>({
    queryKey: ['/api/financial-data'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload-financial-data', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Upload successful",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financial-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial-metrics'] });
      setFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `Date,Description,Category,Amount,Type
2024-01-15,Client Payment - ABC Corp,Revenue,5000,income
2024-01-16,Office Rent,Operating Expenses,2500,expense
2024-01-17,Software Subscription,Technology,299,expense
2024-01-18,Consulting Revenue,Revenue,3500,income
2024-01-19,Marketing Campaign,Marketing,800,expense`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_financial_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Financial Data</h1>
          <p className="text-slate-600">Import your financial data to generate insights and reports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upload Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Upload your financial data in CSV format. Make sure your file includes Date, Description, Category, Amount, and Type columns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
              >
                {file ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={handleUpload}
                        disabled={uploadMutation.isPending}
                      >
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-slate-900">Drop your CSV file here</p>
                      <p className="text-slate-500">or click to browse</p>
                    </div>
                    <Label htmlFor="file-upload">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline">Browse Files</Button>
                    </Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                File Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Required Columns:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <strong>Date:</strong> YYYY-MM-DD format</li>
                  <li>• <strong>Description:</strong> Transaction description</li>
                  <li>• <strong>Category:</strong> Expense/Income category</li>
                  <li>• <strong>Amount:</strong> Numerical value</li>
                  <li>• <strong>Type:</strong> "income" or "expense"</li>
                </ul>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={downloadSampleCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Data */}
        {financialData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Financial Data</CardTitle>
              <CardDescription>
                {financialData.length} transactions currently loaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable transactions={financialData} />
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {financialData.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No data uploaded yet</h3>
              <p className="text-slate-500 mb-4">Upload your first CSV file to get started with financial analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}