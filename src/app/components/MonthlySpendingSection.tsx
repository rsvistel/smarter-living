'use client';

import { useState } from 'react';
import { CATEGORY_ICONS } from '../mcc-mapping';
import MonthlySpendingChart from './MonthlySpendingChart';
import { WandSparkles, Leaf, Bike, Bus, ShoppingBag, UtensilsCrossed, Home, Recycle, Smartphone, BookOpen, Shield, ChevronDown, ChevronUp } from 'lucide-react';

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
  allTransactions?: Array<{trx_date: string; trx_mcc: string; trx_amount: string; trx_currency: string; trx_desc?: string; trx_city?: string; [key: string]: unknown}>;
  exchangeRates?: Record<string, number>;
}

export default function MonthlySpendingSection({ monthlySpendingData, allTransactions = [], exchangeRates = {} }: MonthlySpendingSectionProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [showAllTips, setShowAllTips] = useState(false);

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
  
  // Check for meal delivery expenses
  const calculateMealDeliveryExpenses = () => {
    if (!currentMonthTransactions.length) return 0;
    
    const deliveryTransactions = currentMonthTransactions.filter(transaction => {
      const description = transaction.trx_desc?.toLowerCase() || '';
      const mcc = transaction.trx_mcc;
      const isCardNotPresent = transaction.IsCardPresent === 'FALSE' || transaction.IsCardPresent === 'False';
      
      // Detect Uber Eats and other delivery services
      const isUberEats = description.includes('uber') && description.includes('eats');
      const isDeliveryService = description.includes('deliveroo') || 
                              description.includes('doordash') || 
                              description.includes('grubhub') || 
                              description.includes('just eat') ||
                              description.includes('foodpanda') ||
                              description.includes('delivery');
      
      // Uber Eats specific pattern: MCC 4121 or 5812, card not present
      const isUberEatsPattern = isUberEats && (mcc === '4121' || mcc === '5812') && isCardNotPresent;
      
      // General delivery pattern: delivery keywords with restaurant MCC and card not present
      const isGeneralDelivery = isDeliveryService && mcc === '5812' && isCardNotPresent;
      
      return isUberEatsPattern || isGeneralDelivery;
    });

    return deliveryTransactions.reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);
  };

  const monthlyMealDeliveryExpenses = calculateMealDeliveryExpenses();
  
  // Check for IKEA purchases
  const calculateIKEAExpenses = () => {
    if (!currentMonthTransactions.length) return 0;
    
    const ikeaTransactions = currentMonthTransactions.filter(transaction => {
      const description = transaction.trx_desc?.toLowerCase() || '';
      const city = transaction.trx_city?.toLowerCase() || '';
      
      // Detect IKEA purchases by description or merchant name
      return description.includes('ikea') || city.includes('ikea');
    });

    return ikeaTransactions.reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);
  };

  const monthlyIKEAExpenses = calculateIKEAExpenses();
  
  // Check for digital goods/subscription expenses
  const calculateDigitalSubscriptionExpenses = () => {
    if (!currentMonthTransactions.length) return 0;
    
    const digitalTransactions = currentMonthTransactions.filter(transaction => {
      const mcc = transaction.trx_mcc;
      const description = transaction.trx_desc?.toLowerCase() || '';
      
      // Digital goods MCC codes
      const digitalGoodsMCCs = ['5815', '5816', '5817', '5818', '5968'];
      
      // Common subscription service patterns
      const subscriptionKeywords = [
        'netflix', 'spotify', 'apple music', 'amazon prime', 'disney',
        'youtube premium', 'adobe', 'microsoft', 'google', 'dropbox',
        'icloud', 'subscription', 'monthly', 'annual'
      ];
      
      const isMCCDigital = digitalGoodsMCCs.includes(mcc);
      const hasSubscriptionKeyword = subscriptionKeywords.some(keyword => 
        description.includes(keyword)
      );
      
      return isMCCDigital || hasSubscriptionKeyword;
    });

    return digitalTransactions.reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);
  };

  const monthlyDigitalSubscriptionExpenses = calculateDigitalSubscriptionExpenses();
  
  // Check for book purchases (only for past months, not current month)
  const calculateBookExpenses = () => {
    if (!currentMonthTransactions.length) return 0;
    
    // Check if this is the current month
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const viewingMonthKey = `${currentMonth.year}-${String(new Date(`${currentMonth.month} 1`).getMonth() + 1).padStart(2, '0')}`;
    
    // Only show for past months, not current month
    if (currentMonthKey === viewingMonthKey) return 0;
    
    const bookTransactions = currentMonthTransactions.filter(transaction => {
      const mcc = transaction.trx_mcc;
      const description = transaction.trx_desc?.toLowerCase() || '';
      
      // Book store MCC codes
      const bookMCCs = ['5192', '5942']; // Books/Periodicals/Newspapers, Book Stores
      
      // Common bookstore keywords
      const bookstoreKeywords = [
        'bookstore', 'book store', 'barnes', 'waterstones', 'amazon books',
        'thalia', 'fnac', 'library', 'buchhandlung', 'librairie'
      ];
      
      const isMCCBook = bookMCCs.includes(mcc);
      const hasBookKeyword = bookstoreKeywords.some(keyword => 
        description.includes(keyword)
      );
      
      return isMCCBook || hasBookKeyword;
    });

    return bookTransactions.reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);
  };

  const monthlyBookExpenses = calculateBookExpenses();
  
  // Check for electronics purchases
  const calculateElectronicsExpenses = () => {
    if (!currentMonthTransactions.length) return 0;
    
    const electronicsTransactions = currentMonthTransactions.filter(transaction => {
      const mcc = transaction.trx_mcc;
      const description = transaction.trx_desc?.toLowerCase() || '';
      
      // Electronics MCC codes
      const electronicsMCCs = ['5045', '5732', '5734']; // Computers, Electronics Stores, Software
      
      // Common electronics keywords
      const electronicsKeywords = [
        'apple store', 'best buy', 'media markt', 'saturn', 'fnac',
        'digitec', 'galaxus', 'amazon', 'dell', 'hp', 'lenovo',
        'samsung', 'sony', 'nintendo', 'playstation', 'xbox',
        'iphone', 'ipad', 'macbook', 'laptop', 'smartphone',
        'electronics', 'computer', 'tablet'
      ];
      
      const isMCCElectronics = electronicsMCCs.includes(mcc);
      const hasElectronicsKeyword = electronicsKeywords.some(keyword => 
        description.includes(keyword)
      );
      
      return isMCCElectronics || hasElectronicsKeyword;
    });

    return electronicsTransactions.reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);
  };

  const monthlyElectronicsExpenses = calculateElectronicsExpenses();
  
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
    
    for (const [date] of dailyStoreVisits.entries()) {
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
  
  // Determine which CO2 tips to show
  const allTips = [
    {
      id: 'bundling',
      show: bundlingCheck.hasBundlingOpportunity,
      component: 'bundling'
    },
    {
      id: 'mealDelivery', 
      show: monthlyMealDeliveryExpenses > 0,
      component: 'mealDelivery'
    },
    {
      id: 'ikea',
      show: monthlyIKEAExpenses > 0,
      component: 'ikea'
    },
    {
      id: 'subscription',
      show: monthlyDigitalSubscriptionExpenses > 0,
      component: 'subscription'
    },
    {
      id: 'book',
      show: monthlyBookExpenses > 0,
      component: 'book'
    },
    {
      id: 'electronics',
      show: monthlyElectronicsExpenses > 0,
      component: 'electronics'
    },
    {
      id: 'fuel',
      show: monthlyFuelExpenses > 200,
      component: 'fuel'
    },
    {
      id: 'parking',
      show: monthlyParkingExpenses > 15,
      component: 'parking'
    }
  ];

  const activeTips = allTips.filter(tip => tip.show);
  const visibleTips = showAllTips ? activeTips : activeTips.slice(0, 2);
  const hiddenTipsCount = activeTips.length - visibleTips.length;

  // Function to render individual CO2 tip components
  const renderTipComponent = (tipType: string) => {
    const baseClasses = "mt-2 bg-black p-4";
    
    switch (tipType) {
      case 'bundling':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                  You made multiple trips to the same store on {bundlingCheck.dayCount} day{bundlingCheck.dayCount !== 1 ? 's' : ''} this month. 
                  How about bundling and preplanning your purchase next time to save CO₂ and your leisurely time?
                </p>
                
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3 text-blue-400" strokeWidth={2} />
                    <span className="text-sm text-gray-400">Plan ahead</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Leaf className="w-3 h-3 text-green-400" strokeWidth={2} />
                    <span className="text-sm text-gray-400">Bundle purchases</span>
                  </div>
                </div>
            </div>
          </div>
        );

      case 'mealDelivery':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                You spent <span className="font-semibold text-green-400">{monthlyMealDeliveryExpenses.toFixed(0)} CHF</span> on meal deliveries this month. 
                Less meal deliveries - more grocery shopping! Better for your budget and better for the environment.
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3 text-blue-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Grocery shopping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3 h-3 text-green-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Home cooking</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ikea':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                You spent <span className="font-semibold text-green-400">{monthlyIKEAExpenses.toFixed(0)} CHF</span> at IKEA this month. 
                Have you considered second hand furniture?
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <Recycle className="w-3 h-3 text-blue-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Second-hand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Home className="w-3 h-3 text-green-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Vintage finds</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                You spent <span className="font-semibold text-green-400">{monthlyDigitalSubscriptionExpenses.toFixed(0)} CHF</span> on digital subscriptions this month. 
                Have you made use of this subscription?
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <Recycle className="w-3 h-3 text-blue-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Cancel unused</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-green-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Review usage</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'book':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                You spent <span className="font-semibold text-green-400">{monthlyBookExpenses.toFixed(0)} CHF</span> on books this month. 
                Have you read it?
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-blue-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Start reading</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Recycle className="w-3 h-3 text-green-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Share when done</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'electronics':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                You spent <span className="font-semibbold text-green-400">{monthlyElectronicsExpenses.toFixed(0)} CHF</span> on electronics this month. 
                Check your warranty expiration.
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-blue-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Check warranty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Recycle className="w-3 h-3 text-green-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Extended protection</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fuel':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                You spent <span className="font-semibold text-green-400">{monthlyFuelExpenses.toFixed(0)} CHF</span> on fuel this month. 
                You use a lot of gas! Consider cycling or public transport to reduce your environmental impact and save money.
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <Bike className="w-3 h-3 text-blue-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Cycling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bus className="w-3 h-3 text-purple-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Public transport</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'parking':
        return (
          <div className={baseClasses}>
            <div className="flex gap-3 mb-2">
              <Leaf
                className="mt-0.5 shrink-0 opacity-60 text-green-400"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">CO₂ Emission Tip</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400">
                You spent <span className="font-semibold text-green-400">{monthlyParkingExpenses.toFixed(0)} CHF</span> on parking this month. 
                Consider sustainable transport to reduce costs and CO₂ emissions.
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <Bike className="w-3 h-3 text-blue-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Cycling</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bus className="w-3 h-3 text-purple-400" strokeWidth={2} />
                  <span className="text-sm text-gray-400">Public transport</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
      
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 md:mb-4 mb-6">
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
      
      {/* Render visible CO2 tips */}
      {visibleTips.map((tip) => (
        <div key={tip.id}>
          {renderTipComponent(tip.component)}
        </div>
      ))}

      {/* Show more button if there are hidden tips */}
      {hiddenTipsCount > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAllTips(!showAllTips)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors border border-gray-700 hover:border-gray-600"
          >
            {showAllTips ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show fewer tips
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {hiddenTipsCount} more tip{hiddenTipsCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
      
      <a href="/opportunity-cost-visualizer" className="w-full mt-6 inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors">
        <WandSparkles className="w-4 h-4 mr-2" /> Opportunity Cost Visualizer
      </a>
    </div>
  );
}