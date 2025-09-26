'use client';

import { useState } from 'react';
import { CATEGORY_ICONS } from '../mcc-mapping';
import MonthlySpendingChart from './MonthlySpendingChart';
import { WandSparkles } from 'lucide-react';

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
}

export default function MonthlySpendingSection({ monthlySpendingData }: MonthlySpendingSectionProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  if (!monthlySpendingData || monthlySpendingData.length === 0) {
    return null;
  }

  const currentMonth = monthlySpendingData[currentMonthIndex];
  const canGoPrev = currentMonthIndex < monthlySpendingData.length - 1;
  const canGoNext = currentMonthIndex > 0;

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
      <a href="/opportunity-cost-visualizer" className="w-full mt-6 inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors">
        <WandSparkles className="w-4 h-4 mr-2" /> Opportunity Cost Visualizer
      </a>
    </div>
  );
}