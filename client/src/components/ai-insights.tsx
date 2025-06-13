import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, RefreshCw } from "lucide-react";
import { AiInsight } from "@shared/schema";
import { getInsightTypeColor, getInsightTypeBgColor } from "@/lib/financial-utils";

interface AiInsightsProps {
  insights: AiInsight[];
  isGenerating: boolean;
  onRegenerateInsights: () => void;
}

export function AiInsights({ insights, isGenerating, onRegenerateInsights }: AiInsightsProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Generated just now";
    if (diffInHours === 1) return "Generated 1 hour ago";
    return `Generated ${diffInHours} hours ago`;
  };

  const latestInsight = insights.length > 0 ? insights[0] : null;

  return (
    <Card className="lg:col-span-2 border border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bot className="text-primary text-sm" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">AI Financial Insights</CardTitle>
            <p className="text-sm text-slate-600">Generated insights from your financial data</p>
          </div>
        </div>
        {latestInsight && (
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            {getTimeAgo(latestInsight.generatedAt)}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 mb-4">No AI insights available yet.</p>
            <p className="text-sm text-slate-500 mb-6">Upload your financial data and generate insights to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div 
                key={insight.id} 
                className={`p-4 bg-slate-50 rounded-lg border-l-4 ${getInsightTypeColor(insight.type)}`}
              >
                <h4 className="font-semibold text-slate-900 mb-2">{insight.title}</h4>
                <p className="text-slate-700 text-sm">{insight.content}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-slate-200">
          <Button 
            onClick={onRegenerateInsights} 
            disabled={isGenerating}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Insights
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
