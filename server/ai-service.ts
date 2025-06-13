import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netCashFlow: number;
  averageMonthlyRevenue: number;
  averageMonthlyExpenses: number;
  revenueGrowthRate: number;
  expenseGrowthRate: number;
  runway: number;
}

export interface AiInsightResponse {
  title: string;
  content: string;
  type: 'positive' | 'warning' | 'info';
}

export async function generateFinancialInsights(
  financialSummary: FinancialSummary,
  recentTransactions: any[]
): Promise<AiInsightResponse[]> {
  try {
    const prompt = `
You are a financial analyst AI. Analyze the following financial data and provide 3 actionable insights.

Financial Summary:
- Total Revenue: $${financialSummary.totalRevenue}
- Total Expenses: $${financialSummary.totalExpenses}
- Net Cash Flow: $${financialSummary.netCashFlow}
- Average Monthly Revenue: $${financialSummary.averageMonthlyRevenue}
- Average Monthly Expenses: $${financialSummary.averageMonthlyExpenses}
- Revenue Growth Rate: ${financialSummary.revenueGrowthRate}%
- Expense Growth Rate: ${financialSummary.expenseGrowthRate}%
- Runway: ${financialSummary.runway} months

Recent Transactions Sample:
${recentTransactions.slice(0, 10).map(t => `${t.date}: ${t.description} - $${t.amount} (${t.type})`).join('\n')}

Provide exactly 3 insights in JSON format with the following structure:
{
  "insights": [
    {
      "title": "Brief title (max 50 characters)",
      "content": "Detailed analysis and recommendation (max 200 characters)",
      "type": "positive|warning|info"
    }
  ]
}

Focus on:
1. Cash flow trends and sustainability
2. Expense optimization opportunities
3. Revenue growth patterns and forecasting
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional financial analyst. Provide actionable, data-driven insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.insights || [];
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw new Error("Failed to generate AI insights: " + error.message);
  }
}

export async function generateFinancialReport(
  financialSummary: FinancialSummary,
  insights: AiInsightResponse[],
  reportType: string = "monthly"
): Promise<string> {
  try {
    const prompt = `
Generate a professional financial report based on the following data:

Report Type: ${reportType}
Financial Summary:
- Total Revenue: $${financialSummary.totalRevenue}
- Total Expenses: $${financialSummary.totalExpenses}
- Net Cash Flow: $${financialSummary.netCashFlow}
- Revenue Growth Rate: ${financialSummary.revenueGrowthRate}%
- Expense Growth Rate: ${financialSummary.expenseGrowthRate}%
- Runway: ${financialSummary.runway} months

Key Insights:
${insights.map(insight => `- ${insight.title}: ${insight.content}`).join('\n')}

Generate a comprehensive financial report in markdown format including:
1. Executive Summary
2. Financial Performance Overview
3. Key Metrics Analysis
4. Insights and Recommendations
5. Forecast and Outlook

Keep the report professional, concise, and actionable.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional financial report writer. Generate comprehensive, well-structured financial reports."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.2
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating financial report:", error);
    throw new Error("Failed to generate financial report: " + error.message);
  }
}
