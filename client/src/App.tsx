import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import UploadDataPage from "@/pages/upload-data";
import AiReportsPage from "@/pages/ai-reports";
import ForecastsPage from "@/pages/forecasts";
import ExportReportsPage from "@/pages/export-reports";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <UploadDataPage />;
      case 'insights':
        return <AiReportsPage />;
      case 'forecasts':
        return <ForecastsPage />;
      case 'reports':
        return <ExportReportsPage />;
      case 'settings':
        return (
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Settings</h2>
              <p className="text-slate-600">Settings page coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-slate-50">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          {renderContent()}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
