'use client';

import { useState } from 'react';
import { CATEGORY_ICONS } from '../mcc-mapping';
import MonthlySpendingChart from './MonthlySpendingChart';
import { WandSparkles, Leaf, Car, Bike, Bus, ShoppingBag } from 'lucide-react';

interface MonthlySpending {
  month: string;
  year: number;
  totalCHF: number;
  transactionCount: number;
  currencies: Record<string, number>;
  categories: Record<string, number>;
}

interface MonthlySpendingSectionProps {
  monthlySpendingData: MonthlySpending[];
  allTransactions?: any[];
  exchangeRates?: Record<string, number>;
}

export default function MonthlySpendingSection({ monthlySpendingData, allTransactions = [], exchangeRates = {} }: MonthlySpendingSectionProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  if (!monthlySpendingData || monthlySpendingData.length === 0) {
    return null;
  }

  const currentMonth = monthlySpendingData[currentMonthIndex];
  const canGoPrev = currentMonthIndex < monthlySpendingData.length - 1;
  const canGoNext = currentMonthIndex > 0;

  // Get transactions for the current month only
  const getCurrentMonthTransactions = () => {
    if (!allTransactions.length) return [];
    
    const currentMonthKey = `${currentMonth.year}-${String(new Date(`${currentMonth.month} 1`).getMonth() + 1).padStart(2, '0')}`;
    
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.trx_date);
      const transactionMonthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonthKey === currentMonthKey;
    });
  };

  const currentMonthTransactions = getCurrentMonthTransactions();

  const goToPrevMonth = () => {
    if (canGoPrev) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const goToNextMonth = () => {
    if (canGoNext) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  // Calculate expenses for current month
  const calculateExpenses = (mccCodes: string[]) => {
    if (!currentMonthTransactions.length) return 0;
    
    const relevantTransactions = currentMonthTransactions.filter(transaction => 
      mccCodes.includes(transaction.trx_mcc)
    );

    return relevantTransactions.reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);
  };

  const monthlyParkingExpenses = calculateExpenses(['7523']); // Parking
  const monthlyFuelExpenses = calculateExpenses(['5541', '5542']); // Gas stations
  
  // Check for bundling opportunities (multiple purchases per day at same store)
  const checkBundlingOpportunities = () => {
    if (!currentMonthTransactions.length) return { hasBundlingOpportunity: false, exampleStore: '', dayCount: 0 };
    
    // Group transactions by date and store name
    const dailyStoreVisits = new Map<string, Set<string>>();
    
    currentMonthTransactions.forEach(transaction => {
      const date = transaction.trx_date;
      const storeName = transaction.trx_desc?.toLowerCase().trim() || '';
      
      // Skip if no store name or very short names (likely not actual stores)
      if (!storeName || storeName.length < 3) return;
      
      const dateKey = date;
      if (!dailyStoreVisits.has(dateKey)) {
        dailyStoreVisits.set(dateKey, new Set());
      }
      dailyStoreVisits.get(dateKey)!.add(storeName);
    });
    
    // Check for same store visits on same day
    let bundlingDays = 0;
    let exampleStore = '';
    
    for (const [date, stores] of dailyStoreVisits.entries()) {
      const storeVisitCounts = new Map<string, number>();
      
      // Count visits to each store on this day
      currentMonthTransactions
        .filter(t => t.trx_date === date)
        .forEach(transaction => {
          const storeName = transaction.trx_desc?.toLowerCase().trim() || '';
          if (storeName && storeName.length >= 3) {
            storeVisitCounts.set(storeName, (storeVisitCounts.get(storeName) || 0) + 1);
          }
        });
      
      // Check if any store was visited multiple times on this day
      for (const [store, count] of storeVisitCounts.entries()) {
        if (count > 1) {
          bundlingDays++;
          if (!exampleStore) {
            exampleStore = store;
          }
          break; // Only count this day once
        }
      }
    }
    
    return {
      hasBundlingOpportunity: bundlingDays > 0,
      exampleStore,
      dayCount: bundlingDays
    };
  };

  const bundlingCheck = checkBundlingOpportunities();
  
  // Determine which CO2 tips to show (show all applicable ones)
  const showBundlingTip = bundlingCheck.hasBundlingOpportunity;
  const showFuelTip = monthlyFuelExpenses > 200;
  const showParkingTip = monthlyParkingExpenses > 15;

  return (
    <div className="mb-6 bg-neutral-900 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-lg transition-colors ${
            canGoPrev
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-light text-white">
          {currentMonth.month} {currentMonth.year}
        </h2>
        
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition-colors ${
            canGoNext
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        <div className="flex justify-center md:flex-shrink-0">
          <MonthlySpendingChart 
            categories={currentMonth.categories} 
            totalAmount={currentMonth.totalCHF} 
          />
        </div>
        <div className="flex-1">
          <div className="space-y-3">
            {Object.entries(currentMonth.categories)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount], index) => {
                const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                // Generate consistent colors for each category
                const colors = [
                  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
                  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
                  '#14B8A6', '#F43F5E', '#8B5A3C', '#6B7280', '#9CA3AF'
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    ></div>
                    <IconComponent className="w-4 h-4 text-white flex-shrink-0" />
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <span className="text-sm text-gray-300 truncate">{category}</span>
                      <span className="text-sm font-medium text-white ml-2 whitespace-nowrap">
                        {amount.toFixed(0)} CHF
                      </span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
      
      {showBundlingTip && (
        <div className="mt-4 bg-green-900 p-4 border-l-4 border-green-400">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="w-5 h-5 text-green-400" />
            <h4 className="text-sm font-medium text-white">CO₂ Emission Tip</h4>
          </div>
          
          <div className="flex items-start gap-3">
            <ShoppingBag className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-200 mb-2">
                You made multiple trips to the same store on {bundlingCheck.dayCount} day{bundlingCheck.dayCount !== 1 ? 's' : ''} this month.
              </p>
              <p className="text-xs text-gray-300 mb-3">
                How about bundling and preplanning your purchase next time to save CO₂ and your leisurely time?
              </p>
              
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-300">Plan ahead</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-green-400" />
                  <span className="text-gray-300">Bundle purchases</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFuelTip && (
        <div className="mt-4 bg-green-900 p-4 border-l-4 border-green-400">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="w-5 h-5 text-green-400" />
            <h4 className="text-sm font-medium text-white">CO₂ Emission Tip</h4>
          </div>
          
          <div className="flex items-start gap-3">
            <Car className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-200 mb-2">
                You spent <span className="font-semibold text-green-400">{monthlyFuelExpenses.toFixed(0)} CHF</span> on fuel this month.
              </p>
              <p className="text-xs text-gray-300 mb-3">
                You use a lot of gas! Consider cycling or public transport to reduce your environmental impact and save money.
              </p>
              
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Bike className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-300">Cycling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bus className="w-3 h-3 text-purple-400" />
                  <span className="text-gray-300">Public transport</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showParkingTip && (
        <div className="mt-4 bg-green-900 p-4 border-l-4 border-green-400">
          <div className="flex items-center gap-3 mb-3">
            <Leaf className="w-5 h-5 text-green-400" />
            <h4 className="text-sm font-medium text-white">CO₂ Emission Tip</h4>
          </div>
          
          <div className="flex items-start gap-3">
            <Car className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-200 mb-2">
                You spent <span className="font-semibold text-green-400">{monthlyParkingExpenses.toFixed(0)} CHF</span> on parking this month.
              </p>
              <p className="text-xs text-gray-300 mb-3">
                Consider sustainable transport to reduce costs and CO₂ emissions.
              </p>
              
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Bike className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-300">Cycling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bus className="w-3 h-3 text-purple-400" />
                  <span className="text-gray-300">Public transport</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <a href="/opportunity-cost-visualizer" className="w-full mt-6 inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors">
        <WandSparkles className="w-4 h-4 mr-2" /> Opportunity Cost Visualizer
      </a>
    </div>
  );
}