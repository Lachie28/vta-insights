import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CloudUpload, 
  TrendingUp, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onDataUploaded: () => void;
}

export function FileUpload({ onDataUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-financial-data', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadStatus('success');
      toast({
        title: "Upload successful",
        description: result.message,
      });
      onDataUploaded();
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const recentActivities = [
    { text: "Q4 Report generated", time: "2h ago", status: "success" },
    { text: "Data uploaded", time: "1d ago", status: "success" },
    { text: "Forecast updated", time: "3d ago", status: "warning" },
  ];

  return (
    <Card className="border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            isUploading 
              ? 'border-primary/50 bg-primary/5' 
              : uploadStatus === 'success'
              ? 'border-accent/50 bg-accent/5'
              : uploadStatus === 'error'
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onClick={handleFileSelect}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {isUploading ? (
            <>
              <CloudUpload className="text-primary text-2xl mb-2 mx-auto animate-pulse" />
              <p className="text-sm font-medium text-primary">Uploading...</p>
              <p className="text-xs text-slate-500">Processing your file</p>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="text-accent text-2xl mb-2 mx-auto" />
              <p className="text-sm font-medium text-accent">Upload Successful!</p>
              <p className="text-xs text-slate-500">Click to upload another file</p>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="text-destructive text-2xl mb-2 mx-auto" />
              <p className="text-sm font-medium text-destructive">Upload Failed</p>
              <p className="text-xs text-slate-500">Click to try again</p>
            </>
          ) : (
            <>
              <CloudUpload className="text-slate-400 text-2xl mb-2 mx-auto" />
              <p className="text-sm font-medium text-slate-900">Upload Financial Data</p>
              <p className="text-xs text-slate-500">CSV, Excel, or PDF files</p>
            </>
          )}
        </div>
        
        <Button className="w-full bg-accent hover:bg-accent/90 text-white">
          <TrendingUp className="mr-2 h-4 w-4" />
          Generate Forecast
        </Button>
        
        <Button variant="secondary" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Export PDF Report
        </Button>
        
        <Button variant="outline" className="w-full">
          <Clock className="mr-2 h-4 w-4" />
          Schedule Reports
        </Button>
        
        {/* Recent Activity */}
        <div className="pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-accent' :
                  activity.status === 'warning' ? 'bg-warning' : 'bg-primary'
                }`} />
                <span className="text-slate-600 flex-1">{activity.text}</span>
                <span className="text-slate-400 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
