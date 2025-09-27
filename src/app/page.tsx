'use client';

import { useState, useEffect } from 'react';
import TransactionList from './components/TransactionList';
import MonthlySpendingSection from './components/MonthlySpendingSection';
import { fetchMyTransactions, isAuthenticated } from '../lib/api';
import { transformApiData, getExchangeRates, Transaction, CardInfo, MonthlySpending } from '../lib/dataTransformation';
import { CreditCard, Mic, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Transaction interface is now imported from dataTransformation

/*
function formatAmount(amount: string, currency: string, exchangeRates: Record<string, number> = {}): React.JSX.Element | string {
  const numAmount = parseFloat(amount) * -1;
  if (isNaN(numAmount)) return amount;
  
  const currencySymbol = CURRENCY_CODES[currency] || currency;
  const baseFormat = `${numAmount.toFixed(2)} ${currencySymbol}`;
  
  if (currency === '756' || !exchangeRates[currency]) {
    return baseFormat;
  }
  
  const chfAmount = numAmount * exchangeRates[currency];
  return <div>{chfAmount.toFixed(2)} CHF<br/><span className="text-gray-400">{baseFormat}</span></div>
}
*/

// function formatDate(dateStr: string): string {
//   if (dateStr.length === 10) {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   }
//   return dateStr;
// }

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allSortedTransactions, setAllSortedTransactions] = useState<Transaction[]>([]);
  // const [totalTransactions, setTotalTransactions] = useState(0);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [cardStats, setCardStats] = useState<CardInfo[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([]);
  
  // For now, use hardcoded values - you can get these from URL params or state later
  const limit = 50;
  const selectedCards: string[] = [];
  const sortOrder = 'newest';
  // const itemsPerPage = 50;

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated()) {
      router.push('/auth/signin?message=Please sign in to access your account.');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch exchange rates first
        const rates = await getExchangeRates();
        setExchangeRates(rates);
        
        // Fetch authenticated user's transaction data from API
        const apiResponse = await fetchMyTransactions();
        
        if (apiResponse.error || !apiResponse.data) {
          throw new Error(`API Error: ${apiResponse.error || 'No data received'}`);
        }
        
        // Transform API data to legacy format
        const transformedData = transformApiData(apiResponse.data, rates);
        const allTransactions = transformedData.allTransactions;
        setCardStats(transformedData.cardStats);
        
        // Filter transactions by selected cards if specified
        // const filteredTransactions = selectedCards.length > 0
        //   ? allTransactions.filter(t => selectedCards.includes(t.CardId))
        //   : allTransactions;
        const filteredTransactions = allTransactions;
        
        // Sort transactions chronologically
        const sortedTransactions = [...filteredTransactions].sort((a, b) => {
          const dateA = new Date(a.trx_date);
          const dateB = new Date(b.trx_date);
          return sortOrder === 'newest' 
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        });
        
        setAllSortedTransactions(sortedTransactions);
        // setTotalTransactions(sortedTransactions.length);
        setTransactions(sortedTransactions.slice(0, Math.min(limit, 50))); // Initial load
        
        // Use monthly spending from transformed data, but filter if cards are selected
        let monthlySpendingData;
        if (selectedCards.length > 0) {
          // Recalculate monthly spending for filtered cards
          const filteredApiData = {
            ...apiResponse.data,
            cards: apiResponse.data.cards.filter(card => selectedCards.includes(card.cardId))
          };
          const filteredTransformed = transformApiData(filteredApiData, rates);
          monthlySpendingData = filteredTransformed.monthlySpending;
        } else {
          monthlySpendingData = transformedData.monthlySpending;
        }
        setMonthlySpending(monthlySpendingData);
        
        // Calculate Food & Dining spending over last 12 months
        const last12MonthsData = monthlySpendingData.slice(0, 12);
        const foodDining = last12MonthsData.reduce((total, month) => {
          return total + (month.categories['Food & Dining'] || 0);
        }, 0);
        setFoodDiningLast12Months(foodDining);
        
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        // Authentication errors will be handled by the API automatically
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading your financial data...</div>
      </div>
    );
  }

  // Show fullscreen CTA if user has no cards
  if (cardStats.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Large Card Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <CreditCard className="w-24 h-24 text-gray-600" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-xl font-bold">+</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-light text-white mb-4">
            Welcome to Smarter Living
          </h1>
          
          {/* Description */}
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Start tracking your spending by adding your first card. 
            Get insights into your financial habits and discover ways to save.
          </p>

          {/* CTA Button */}
          <a
            href="/cards"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-black bg-white hover:bg-gray-200 transition-colors rounded-lg shadow-lg"
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Add Your First Card
          </a>
        </div>
      </div>
    );
  }
  
  // const hasMoreTransactions = limit < totalTransactions;
  
  /*
  const buildUrl = (newLimit?: number, cards?: string[], sort?: string) => {
    const params = new URLSearchParams();
    const limitToUse = newLimit !== undefined ? newLimit : limit;
    if (limitToUse > 50) params.set('limit', limitToUse.toString());
    const cardsToUse = cards !== undefined ? cards : [];
    if (cardsToUse.length > 0) params.set('cards', cardsToUse.join(','));
    const sortToUse = sort !== undefined ? sort : sortOrder;
    if (sortToUse !== 'newest') params.set('sort', sortToUse);
    return `/?${params.toString()}`;
  };
  */

  /*
  const toggleCard = (cardId: string) => {
    const newCards = selectedCards.includes(cardId)
      ? selectedCards.filter(id => id !== cardId)
      : [...selectedCards, cardId];
    return buildUrl(50, newCards);
  };
  */

  /*
  const removeCard = (cardId: string) => {
    const newCards = selectedCards.filter(id => id !== cardId);
    return buildUrl(limit, newCards);
  };
  */

  /*
  const toggleSort = () => {
    return buildUrl(50, selectedCards, sortOrder === 'newest' ? 'oldest' : 'newest');
  };
  */

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-3xl font-light text-white">My Cards</h3>
            <a href="/cards" className="hidden md:flex px-3 py-1.5 text-md font-medium cursor-pointer transition-colors items-center text-white hover:text-gray-300">
              <CreditCard className="h-4 w-4 mr-2" /> Manage cards
            </a>
            {selectedCards.length > 0 && (
              <div className="text-sm text-gray-400">
                {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          
          {/* Mobile: Show 1 card with slider */}
          <div className="block mb-6 md:hidden md:mb-0">
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {cardStats.slice(0, 1).map((card) => {
                return (
                  <div
                    key={card.id}
                    className="flex-shrink-0 w-full"
                  >
                    <div className="relative w-full aspect-[1.586/1] bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
                      {/* Credit card design elements */}
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-6 bg-gray-600 rounded-sm opacity-60"></div>
                      </div>
                      
                      {/* Card number */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="font-mono text-sm font-medium text-white tracking-wider">
                          {card.id.replace(/(.{4})/g, '$1 ').trim()}
                        </div>
                      </div>
                      
                      {/* Subtle pattern/texture */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Mobile: Show additional cards info and manage button */}
            <div className="mt-2">
              {cardStats.length > 1 && (
                <p className="text-sm text-center text-gray-400 mb-4">
                  + {cardStats.length - 1} other card{cardStats.length - 1 !== 1 ? 's' : ''}
                </p>
              )}
              <a href="/cards" className="w-full justify-center flex items-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Cards
              </a>
            </div>
          </div>

          {/* Desktop: Show 3 cards in grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {cardStats.slice(0, 3).map((card) => {
                return (
                  <div
                    key={card.id}
                    className="block w-full max-w-sm mx-auto"
                  >
                    <div className="relative w-full aspect-[1.586/1] bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
                      {/* Credit card design elements */}
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-6 bg-gray-600 rounded-sm opacity-60"></div>
                      </div>
                      
                      {/* Card number */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="font-mono text-sm font-medium text-white tracking-wider">
                          {card.id.replace(/(.{4})/g, '$1 ').trim()}
                        </div>
                      </div>
                      
                      {/* Subtle pattern/texture */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Desktop: Show additional cards info and manage button */}
            <div className="flex items-center justify-between mt-4">
              {cardStats.length > 3 ? (
                <span className="text-sm text-gray-400">
                  + {cardStats.length - 3} other{cardStats.length - 3 !== 1 ? 's' : ''}
                </span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        </div>
        
        {/* {monthlySpending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Monthly Spending {selectedCards.length > 0 ? '(Filtered Cards)' : '(All Cards)'}
            </h2>
            <div className="bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Total (CHF)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categories</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {monthlySpending.map((month, index) => (
                      <tr key={`${month.year}-${month.month}`} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {month.month} {month.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white text-right">
                          {month.totalCHF.toFixed(2)} CHF
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                          {month.transactionCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              {Object.entries(month.categories)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 5)
                                .map(([category, amount]) => (
                                <div key={category} className="flex justify-between items-center">
                                  <div className="flex items-center gap-1.5 flex-1">
                                    {(() => {
                                      const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                                      return <IconComponent className="w-3 h-3 text-white" />;
                                    })()}
                                    <span className="text-xs text-gray-400 truncate">{category}</span>
                                  </div>
                                  <span className="text-xs font-medium text-white ml-2">
                                    {amount.toFixed(0)} CHF
                                  </span>
                                </div>
                              ))}
                              {Object.keys(month.categories).length > 5 && (
                                <div className="text-xs text-gray-500 italic">
                                  +{Object.keys(month.categories).length - 5} more categories
                                </div>
                              )}
                            </div>
                            <div className="w-full">
                              <MonthlySpendingChart categories={month.categories} totalAmount={month.totalCHF} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    Total across {monthlySpending.length} months:
                  </span>
                  <span className="font-bold text-white">
                    {monthlySpending.reduce((sum, month) => sum + month.totalCHF, 0).toFixed(2)} CHF
                  </span>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* <FoodSavingsInsight totalFoodSpending={foodDiningLast12Months} /> */}
        <MonthlySpendingSection 
          monthlySpendingData={monthlySpending} 
          allTransactions={allSortedTransactions as any}
          exchangeRates={exchangeRates}
        />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-3xl font-light text-white">Transactions</h3>
            {/* <a
              href={toggleSort()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white hover:text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sortOrder === 'newest' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v18" />
                )}
              </svg>
              Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </a> */}
          </div>
          
          <TransactionList 
            initialTransactions={transactions}
            allTransactions={allSortedTransactions}
            exchangeRates={exchangeRates}
          />
        </div>

        {/* AI Voice Agent Card */}
        <div className="mt-12 mb-8">
          <div className="bg-neutral-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start gap-4">

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-light text-white">AI Financial Coach</h3>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Get personalized financial advice through our AI voice agent. 
                  Ask questions about budgeting, saving strategies, or get insights 
                  about your spending patterns - all through natural conversation.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://elevenlabs.io/app/talk-to?agent_id=agent_2601k638558re60tj4jf0w8yrjj9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Talk to AI Coach
                  </a>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></div>
                    Available 24/7
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></div>
                    Voice & Text
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 mr-2 bg-gray-400 rounded-full"></div>
                    Fine-tuned model
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
