'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchMyTransactions, isAuthenticated } from '../../lib/api';
import { transformApiData, getExchangeRates } from '../../lib/dataTransformation';
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
        const exchangeRates = await getExchangeRates();
        
        // Fetch authenticated user's transactions
        const apiResponse = await fetchMyTransactions();
        
        if (apiResponse.error || !apiResponse.data) {
          throw new Error(`API Error: ${apiResponse.error || 'No data received'}`);
        }
        
        // Transform API data using the same method as home page
        const transformedData = transformApiData(apiResponse.data, exchangeRates);
        const monthlySpending = transformedData.monthlySpending;
        
        // Calculate category spending over last 12 months
        const last12MonthsData = monthlySpending.slice(0, 12);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading your financial data...</div>
      </div>
    );
  }
  
  return (
    <OpportunityCostClient 
      categorySpending={categorySpending} 
      initialHouseholdSize={householdSize}
    />
  );
}