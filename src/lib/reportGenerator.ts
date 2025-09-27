import { MonthlySpending, Transaction } from './dataTransformation';

// CO2 calculation functions (extracted from CO2Tips component logic)
export function calculateCO2Data(transactions: Transaction[], exchangeRates: Record<string, number>) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Fuel transactions (MCC 5541, 5542)
  const fuelTransactions = transactions.filter(transaction => 
    transaction.trx_mcc === '5541' || transaction.trx_mcc === '5542'
  );
  
  const recentFuelTransactions = fuelTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.trx_date);
    return transactionDate >= thirtyDaysAgo;
  });

  // Parking transactions (MCC 7523)
  const parkingTransactions = transactions.filter(transaction => 
    transaction.trx_mcc === '7523'
  );
  
  const recentParkingTransactions = parkingTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.trx_date);
    return transactionDate >= sixtyDaysAgo;
  });

  // Calculate expenses with currency conversion
  const recentFuelExpenses = recentFuelTransactions.reduce((total, transaction) => {
    const amount = parseFloat(transaction.trx_amount) || 0;
    const currency = transaction.trx_currency;
    
    let chfAmount = amount;
    if (currency !== '756' && exchangeRates[currency]) {
      chfAmount = amount * exchangeRates[currency];
    }
    
    return total + chfAmount;
  }, 0);

  const recentParkingExpenses = recentParkingTransactions.reduce((total, transaction) => {
    const amount = parseFloat(transaction.trx_amount) || 0;
    const currency = transaction.trx_currency;
    
    let chfAmount = amount;
    if (currency !== '756' && exchangeRates[currency]) {
      chfAmount = amount * exchangeRates[currency];
    }
    
    return total + chfAmount;
  }, 0);

  return {
    fuelExpenses: {
      last30Days: recentFuelExpenses,
      transactionCount: recentFuelTransactions.length,
      showTip: recentFuelExpenses > 200
    },
    parkingExpenses: {
      last60Days: recentParkingExpenses,
      transactionCount: recentParkingTransactions.length,
      showTip: recentParkingExpenses > 15
    },
    environmentalRecommendations: []
  };
}

// Opportunity cost calculations (from OpportunityCostVisualizer logic)
export function calculateOpportunityCostData(categorySpending: Record<string, number>, householdSize: number = 1) {
  const baseThresholds = {
    'Food & Dining': 400,
    'Retail & Shopping': 300,
    'Transportation': 200,
    'Entertainment & Recreation': 150
  };
  
  const thresholds = {
    'Food & Dining': baseThresholds['Food & Dining'] * householdSize,
    'Retail & Shopping': baseThresholds['Retail & Shopping'] * householdSize,
    'Transportation': baseThresholds['Transportation'] * householdSize,
    'Entertainment & Recreation': baseThresholds['Entertainment & Recreation'] * householdSize
  };

  const categoryAnalysis = Object.entries(categorySpending).map(([category, annualSpending]) => {
    const monthlySpending = annualSpending / 12;
    const threshold = thresholds[category as keyof typeof thresholds];
    const monthlyOverage = Math.max(0, monthlySpending - threshold);
    const annualSavings = monthlyOverage * 12;
    const isDoingWell = monthlySpending <= threshold;
    
    return {
      category,
      annualSpending,
      monthlySpending,
      threshold,
      annualSavings,
      isDoingWell
    };
  });

  const totalAnnualSavings = categoryAnalysis.reduce((sum, cat) => sum + cat.annualSavings, 0);
  
  // Investment projections with 7% annual growth
  const calculateInvestmentValue = (annualContribution: number, years: number, growthRate: number = 0.07) => {
    return annualContribution * (((1 + growthRate) ** years - 1) / growthRate);
  };
  
  const projections = {
    '10Years': calculateInvestmentValue(totalAnnualSavings, 10),
    '20Years': calculateInvestmentValue(totalAnnualSavings, 20),
    '30Years': calculateInvestmentValue(totalAnnualSavings, 30)
  };

  return {
    categoryAnalysis,
    totalAnnualSavings,
    investmentProjections: projections,
    thresholds,
    householdSize
  };
}

// Comprehensive report generator
export interface FinancialReport {
  metadata: {
    generatedAt: string;
    reportPeriod: string;
    userId?: string;
    currency: string;
  };
  monthlySpending: {
    last12Months: MonthlySpending[];
    totalSpent: number;
    averageMonthly: number;
    categoryBreakdown: Record<string, number>;
  };
  opportunityCost: {
    categoryAnalysis: Array<{
      category: string;
      annualSpending: number;
      monthlySpending: number;
      threshold: number;
      annualSavings: number;
      isDoingWell: boolean;
    }>;
    totalAnnualSavings: number;
    investmentProjections: {
      '10Years': number;
      '20Years': number;
      '30Years': number;
    };
    thresholds: Record<string, number>;
    householdSize: number;
  };
  co2Impact: {
    fuelExpenses: {
      last30Days: number;
      transactionCount: number;
      showTip: boolean;
    };
    parkingExpenses: {
      last60Days: number;
      transactionCount: number;
      showTip: boolean;
    };
    environmentalRecommendations: string[];
  };
  insights: {
    topSpendingCategory: string;
    biggestSavingsOpportunity: string;
    environmentalImpact: string;
    investmentPotential: string;
  };
}

export function generateComprehensiveReport(
  monthlySpending: MonthlySpending[],
  categorySpending: Record<string, number>,
  transactions: Transaction[],
  exchangeRates: Record<string, number>,
  householdSize: number = 1
): FinancialReport {
  
  // Calculate all data
  const co2Data = calculateCO2Data(transactions, exchangeRates);
  const opportunityCostData = calculateOpportunityCostData(categorySpending, householdSize);
  
  // Monthly spending analysis
  const last12MonthsData = monthlySpending.slice(0, 12);
  const totalSpent = last12MonthsData.reduce((sum, month) => sum + month.totalCHF, 0);
  const averageMonthly = totalSpent / 12;
  
  // Category breakdown across all 12 months
  const categoryBreakdown: Record<string, number> = {};
  last12MonthsData.forEach(month => {
    Object.entries(month.categories).forEach(([category, amount]) => {
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
    });
  });

  // Generate insights
  const topSpendingCategory = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  
  const biggestSavingsOpportunity = opportunityCostData.categoryAnalysis
    .sort((a, b) => b.annualSavings - a.annualSavings)[0]?.category || 'None';

  const environmentalImpact = co2Data.fuelExpenses.showTip 
    ? `High fuel spending (${co2Data.fuelExpenses.last30Days.toFixed(0)} CHF in 30 days)`
    : co2Data.parkingExpenses.showTip 
    ? `Frequent parking expenses (${co2Data.parkingExpenses.last60Days.toFixed(0)} CHF in 60 days)`
    : 'Good environmental practices';

  const investmentPotential = opportunityCostData.totalAnnualSavings > 0
    ? `Could save ${opportunityCostData.totalAnnualSavings.toFixed(0)} CHF annually, growing to ${opportunityCostData.investmentProjections['30Years'].toFixed(0)} CHF in 30 years`
    : 'Already optimized spending';

  // Add environmental recommendations
  const environmentalRecommendations: string[] = [];
  if (co2Data.fuelExpenses.showTip) {
    environmentalRecommendations.push('Consider cycling or public transport to reduce fuel expenses and CO2 emissions');
  }
  if (co2Data.parkingExpenses.showTip) {
    environmentalRecommendations.push('High parking costs suggest frequent car usage - consider alternative transportation');
  }
  
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      reportPeriod: 'Last 12 months',
      currency: 'CHF'
    },
    monthlySpending: {
      last12Months: last12MonthsData,
      totalSpent,
      averageMonthly,
      categoryBreakdown
    },
    opportunityCost: {
      ...opportunityCostData,
      environmentalRecommendations
    },
    co2Impact: {
      ...co2Data,
      environmentalRecommendations
    },
    insights: {
      topSpendingCategory,
      biggestSavingsOpportunity,
      environmentalImpact,
      investmentPotential
    }
  };
}

// Console logging functions
export function logReportAsJSON(report: FinancialReport) {
  console.log('=== FINANCIAL REPORT (JSON) ===');
  console.log(JSON.stringify(report, null, 2));
}

export function logReportAsText(report: FinancialReport) {
  console.log('=== COMPREHENSIVE FINANCIAL REPORT ===');
  console.log(`Generated: ${report.metadata.generatedAt}`);
  console.log(`Period: ${report.metadata.reportPeriod}`);
  console.log('');
  
  console.log('📊 MONTHLY SPENDING SUMMARY');
  console.log(`Total spent (12 months): ${report.monthlySpending.totalSpent.toFixed(2)} ${report.metadata.currency}`);
  console.log(`Average monthly: ${report.monthlySpending.averageMonthly.toFixed(2)} ${report.metadata.currency}`);
  console.log('');
  
  console.log('📈 CATEGORY BREAKDOWN (12 months)');
  Object.entries(report.monthlySpending.categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, amount]) => {
      console.log(`  ${category}: ${amount.toFixed(2)} ${report.metadata.currency}`);
    });
  console.log('');
  
  console.log('💰 OPPORTUNITY COST ANALYSIS');
  console.log(`Household size: ${report.opportunityCost.householdSize}`);
  console.log(`Total potential annual savings: ${report.opportunityCost.totalAnnualSavings.toFixed(2)} ${report.metadata.currency}`);
  console.log('');
  console.log('Category Analysis:');
  report.opportunityCost.categoryAnalysis.forEach(analysis => {
    if (!analysis.isDoingWell) {
      console.log(`  ❌ ${analysis.category}: Overspending by ${analysis.annualSavings.toFixed(2)} ${report.metadata.currency}/year`);
      console.log(`     Current: ${analysis.monthlySpending.toFixed(2)} ${report.metadata.currency}/month, Target: ${analysis.threshold.toFixed(2)} ${report.metadata.currency}/month`);
    } else {
      console.log(`  ✅ ${analysis.category}: Within budget (${analysis.monthlySpending.toFixed(2)} ${report.metadata.currency}/month)`);
    }
  });
  console.log('');
  
  console.log('📈 INVESTMENT PROJECTIONS (if savings are invested at 7% annually)');
  console.log(`  10 years: ${report.opportunityCost.investmentProjections['10Years'].toFixed(2)} ${report.metadata.currency}`);
  console.log(`  20 years: ${report.opportunityCost.investmentProjections['20Years'].toFixed(2)} ${report.metadata.currency}`);
  console.log(`  30 years: ${report.opportunityCost.investmentProjections['30Years'].toFixed(2)} ${report.metadata.currency}`);
  console.log('');
  
  console.log('🌱 CO2 & ENVIRONMENTAL IMPACT');
  console.log(`Fuel expenses (30 days): ${report.co2Impact.fuelExpenses.last30Days.toFixed(2)} ${report.metadata.currency} (${report.co2Impact.fuelExpenses.transactionCount} transactions)`);
  console.log(`Parking expenses (60 days): ${report.co2Impact.parkingExpenses.last60Days.toFixed(2)} ${report.metadata.currency} (${report.co2Impact.parkingExpenses.transactionCount} transactions)`);
  
  if (report.co2Impact.environmentalRecommendations.length > 0) {
    console.log('Environmental Recommendations:');
    report.co2Impact.environmentalRecommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
  }
  console.log('');
  
  console.log('💡 KEY INSIGHTS');
  console.log(`Top spending category: ${report.insights.topSpendingCategory}`);
  console.log(`Biggest savings opportunity: ${report.insights.biggestSavingsOpportunity}`);
  console.log(`Environmental impact: ${report.insights.environmentalImpact}`);
  console.log(`Investment potential: ${report.insights.investmentPotential}`);
  console.log('');
  console.log('=== END REPORT ===');
}

// ChatGPT API integration
export async function sendReportToChatGPT(report: FinancialReport): Promise<string> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!API_KEY) {
    throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.');
  }
  
  const prompt = `Give me a short financial human readable summary of this person's customer behaviour

Here is their financial report data:
${JSON.stringify(report, null, 2)}

Please provide a concise, actionable summary focusing on:
1. Spending patterns and habits
2. Areas for improvement
3. Environmental impact insights
4. Investment opportunities
5. Key financial recommendations

Keep it under 300 words and make it easy to understand.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from ChatGPT API');
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    throw error;
  }
}

// Enhanced report function that includes ChatGPT analysis
export async function generateReportWithAIAnalysis(
  monthlySpending: MonthlySpending[],
  categorySpending: Record<string, number>,
  transactions: Transaction[],
  exchangeRates: Record<string, number>,
  householdSize: number = 1
): Promise<{ report: FinancialReport; aiAnalysis: string }> {
  
  // Generate the base report
  const report = generateComprehensiveReport(
    monthlySpending,
    categorySpending,
    transactions,
    exchangeRates,
    householdSize
  );

  // Get AI analysis
  const aiAnalysis = await sendReportToChatGPT(report);

  return { report, aiAnalysis };
}