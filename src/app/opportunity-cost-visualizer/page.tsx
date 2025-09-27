'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchMyTransactions, isAuthenticated } from '../../lib/api';
import { transformApiData, getExchangeRates, MonthlySpending, Transaction } from '../../lib/dataTransformation';
import { generateComprehensiveReport, logReportAsJSON, logReportAsText, generateReportWithAIAnalysis } from '../../lib/reportGenerator';
import OpportunityCostClient from './OpportunityCostClient';

export default function OpportunityCostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const householdSize = parseInt(searchParams.get('household') || '1', 10);
  
  const [categorySpending, setCategorySpending] = useState({
    'Food & Dining': 0,
    'Retail & Shopping': 0,
    'Transportation': 0,
    'Entertainment & Recreation': 0
  });
  const [loading, setLoading] = useState(true);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      router.push('/auth/signin?message=Please sign in to access your account.');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch exchange rates
        const rates = await getExchangeRates();
        setExchangeRates(rates);
        
        // Fetch authenticated user's transactions
        const apiResponse = await fetchMyTransactions();
        
        if (apiResponse.error || !apiResponse.data) {
          throw new Error(`API Error: ${apiResponse.error || 'No data received'}`);
        }
        
        // Transform API data using the same method as home page
        const transformedData = transformApiData(apiResponse.data, rates);
        const monthlySpendingData = transformedData.monthlySpending;
        const allTransactionsData = transformedData.allTransactions;
        
        setMonthlySpending(monthlySpendingData);
        setAllTransactions(allTransactionsData);
        
        // Calculate category spending over last 12 months
        const last12MonthsData = monthlySpendingData.slice(0, 12);
        const targetCategories = ['Food & Dining', 'Retail & Shopping', 'Transportation', 'Entertainment & Recreation'];
        
        const newCategorySpending = {
          'Food & Dining': 0,
          'Retail & Shopping': 0,
          'Transportation': 0,
          'Entertainment & Recreation': 0
        };
        
        targetCategories.forEach(category => {
          newCategorySpending[category as keyof typeof newCategorySpending] = last12MonthsData.reduce((total, month) => {
            return total + (month.categories[category] || 0);
          }, 0);
        });
        
        setCategorySpending(newCategorySpending);
        
      } catch (error) {
        console.error('Error fetching user transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const generateReport = () => {
    if (monthlySpending.length === 0 || allTransactions.length === 0) {
      console.log('⚠️ No data available for report generation');
      return;
    }

    console.log('🔄 Generating comprehensive financial report...');
    
    const report = generateComprehensiveReport(
      monthlySpending,
      categorySpending,
      allTransactions,
      exchangeRates,
      householdSize
    );

    // Log both JSON and text versions
    logReportAsText(report);
    console.log('\n\n');
    logReportAsJSON(report);
    
    console.log('✅ Report generation complete! Check the console output above.');
  };

  const generateReportWithAI = async () => {
    if (monthlySpending.length === 0 || allTransactions.length === 0) {
      console.log('⚠️ No data available for report generation');
      return;
    }

    setGeneratingAI(true);
    
    try {
      console.log('🔄 Generating comprehensive financial report with AI analysis...');
      
      const { report, aiAnalysis } = await generateReportWithAIAnalysis(
        monthlySpending,
        categorySpending,
        allTransactions,
        exchangeRates,
        householdSize
      );

      // Log the structured report to console
      logReportAsText(report);
      console.log('\n\n');
      logReportAsJSON(report);
      
      // Display AI analysis in UI
      setAiAnalysis(aiAnalysis);
      
      // Also log AI analysis to console
      console.log('🤖 AI FINANCIAL ANALYSIS');
      console.log('=========================');
      console.log(aiAnalysis);
      console.log('=========================');
      
      console.log('✅ AI-enhanced report generation complete! Check above for AI insights.');
      
    } catch (error) {
      console.error('❌ Error generating AI analysis:', error);
      console.log('📊 Falling back to standard report...');
      setAiAnalysis('Unable to generate AI analysis. Please check your internet connection and try again.');
      generateReport();
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading your financial data...</div>
      </div>
    );
  }
  
  return (
    <div>
      <OpportunityCostClient 
        categorySpending={categorySpending} 
        initialHouseholdSize={householdSize}
      />
      
      {/* Generate Report Buttons */}
      {/* <div className="max-w-4xl mx-auto px-4 mt-8 mb-8">
        <div className="bg-neutral-900 border border-gray-800 rounded-xl p-6">
          <div>
            <div>
              <h3 className="text-xl font-light text-white mb-2">Generate Comprehensive Report</h3>
              <p className="text-gray-400 text-sm">
                Export your complete financial analysis including monthly spending, opportunity costs, and CO2 impact data to the console.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateReportWithAI}
                disabled={loading || monthlySpending.length === 0 || generatingAI}
                className="w-full mt-6 px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-colors rounded-lg"
              >
                {generatingAI ? 'Generating AI Analysis...' : 'AI-Enhanced Report'}
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* AI Analysis Display */}
      {aiAnalysis && (
        <div className="max-w-4xl mx-auto px-4 mt-8 mb-8">
          <div className="bg-neutral-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <h3 className="text-xl font-light text-white">Financial Behavior Analysis</h3>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Generated by AI • Based on your last 12 months of transaction data
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}