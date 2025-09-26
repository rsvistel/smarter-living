import { promises as fs } from 'fs';
import path from 'path';
import { getMCCCategory, CATEGORY_ICONS } from './mcc-mapping';
import MonthlySpendingChart from './components/MonthlySpendingChart';

interface Transaction {
  CardId: string;
  Age_cat: string;
  trx_date: string;
  trx_code: string;
  trx_amount: string;
  trx_currency: string;
  trx_desc: string;
  trx_city: string;
  trx_country: string;
  trx_mcc: string;
  MccDesc: string;
  MccGroup: string;
  IsCardPresent: string;
  IsPurchase: string;
  IsCash: string;
  LimitExhaustion_cat: string;
}

function parseCSV(csvText: string): Transaction[] {
  const lines = csvText.split('\n');
  const headers = lines[0].replace('\ufeff', '').split(',');
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      const transaction: any = {};
      headers.forEach((header, index) => {
        transaction[header] = values[index] || '';
      });
      return transaction as Transaction;
    });
}

const CURRENCY_CODES: Record<string, string> = {
  '756': 'CHF', // Swiss Franc
  '978': 'EUR', // Euro
  '840': 'USD', // US Dollar
  '826': 'GBP', // British Pound Sterling
  '392': 'JPY', // Japanese Yen
  '949': 'TRY', // Turkish Lira
  '208': 'DKK', // Danish Krone
  '410': 'KRW', // South Korean Won
  '752': 'SEK', // Swedish Krona
  '901': 'TWD', // New Taiwan Dollar
  '764': 'THB', // Thai Baht
  '985': 'PLN', // Polish Zloty
  '203': 'CZK', // Czech Koruna
  '834': 'TZS', // Tanzanian Shilling
  '504': 'MAD', // Moroccan Dirham
  '784': 'AED', // UAE Dirham
  '702': 'SGD', // Singapore Dollar
  '144': 'LKR', // Sri Lankan Rupee
  '032': 'ARS', // Argentine Peso
  '512': 'OMR', // Omani Rial
  '170': 'COP', // Colombian Peso
  '124': 'CAD', // Canadian Dollar
  '048': 'BHD', // Bahraini Dinar
};

async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/CHF');
    const data = await response.json();
    
    const rates: Record<string, number> = {};
    Object.entries(CURRENCY_CODES).forEach(([code, symbol]) => {
      if (symbol !== 'CHF' && data.rates[symbol]) {
        rates[code] = 1 / data.rates[symbol];
      }
    });
    
    return rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return {};
  }
}

function formatAmount(amount: string, currency: string, exchangeRates: Record<string, number> = {}): string {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return amount;
  
  const currencySymbol = CURRENCY_CODES[currency] || currency;
  const baseFormat = `${numAmount.toFixed(2)} ${currencySymbol}`;
  
  if (currency === '756' || !exchangeRates[currency]) {
    return baseFormat;
  }
  
  const chfAmount = numAmount * exchangeRates[currency];
  return `${baseFormat} (${chfAmount.toFixed(2)} CHF)`;
}

function formatDate(dateStr: string): string {
  if (dateStr.length === 10) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return dateStr;
}

interface PageProps {
  searchParams: Promise<{ page?: string; cards?: string; sort?: 'newest' | 'oldest' }>;
}

interface CardInfo {
  id: string;
  transactionCount: number;
  totalAmount: number;
  currencies: string[];
}

interface MonthlySpending {
  month: string;
  year: number;
  totalCHF: number;
  transactionCount: number;
  currencies: Record<string, number>;
  categories: Record<string, number>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const selectedCards = params.cards ? params.cards.split(',').filter(Boolean) : [];
  const sortOrder = params.sort || 'newest';
  const itemsPerPage = 50;
  
  let transactions: Transaction[] = [];
  let totalTransactions = 0;
  let exchangeRates: Record<string, number> = {};
  let cardStats: CardInfo[] = [];
  let monthlySpending: MonthlySpending[] = [];
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'data.csv');
    const csvText = await fs.readFile(filePath, 'utf-8');
    const allTransactions = parseCSV(csvText);
    
    // Calculate card statistics
    const cardMap = new Map<string, CardInfo>();
    allTransactions.forEach(transaction => {
      const cardId = transaction.CardId;
      if (!cardMap.has(cardId)) {
        cardMap.set(cardId, {
          id: cardId,
          transactionCount: 0,
          totalAmount: 0,
          currencies: []
        });
      }
      
      const card = cardMap.get(cardId)!;
      card.transactionCount++;
      card.totalAmount += parseFloat(transaction.trx_amount) || 0;
      
      const currencySymbol = CURRENCY_CODES[transaction.trx_currency] || transaction.trx_currency;
      if (!card.currencies.includes(currencySymbol)) {
        card.currencies.push(currencySymbol);
      }
    });
    
    cardStats = Array.from(cardMap.values()).sort((a, b) => b.transactionCount - a.transactionCount);
    
    // Filter transactions by selected cards if specified
    const filteredTransactions = selectedCards.length > 0
      ? allTransactions.filter(t => selectedCards.includes(t.CardId))
      : allTransactions;
    
    // Sort transactions chronologically
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.trx_date);
      const dateB = new Date(b.trx_date);
      return sortOrder === 'newest' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    
    totalTransactions = sortedTransactions.length;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    transactions = sortedTransactions.slice(startIndex, endIndex);
    
    exchangeRates = await getExchangeRates();
    
    // Calculate monthly spending (filtered by selected cards if any)
    const transactionsForAnalysis = selectedCards.length > 0
      ? allTransactions.filter(t => selectedCards.includes(t.CardId))
      : allTransactions;
    
    const monthlyData = new Map<string, MonthlySpending>();
    
    transactionsForAnalysis.forEach(transaction => {
      const date = new Date(transaction.trx_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const year = date.getFullYear();
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthName,
          year,
          totalCHF: 0,
          transactionCount: 0,
          currencies: {},
          categories: {}
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      monthData.transactionCount++;
      
      const amount = parseFloat(transaction.trx_amount) || 0;
      const currency = transaction.trx_currency;
      const currencySymbol = CURRENCY_CODES[currency] || currency;
      
      // Convert to CHF
      let chfAmount = amount;
      if (currency !== '756' && exchangeRates[currency]) {
        chfAmount = amount * exchangeRates[currency];
      }
      
      monthData.totalCHF += chfAmount;
      monthData.currencies[currencySymbol] = (monthData.currencies[currencySymbol] || 0) + amount;
      
      // Add category breakdown
      const category = getMCCCategory(transaction.trx_mcc).category;
      monthData.categories[category] = (monthData.categories[category] || 0) + chfAmount;
    });
    
    monthlySpending = Array.from(monthlyData.values()).sort((a, b) => {
      return b.year - a.year || (new Date(`${b.month} 1`).getMonth() - new Date(`${a.month} 1`).getMonth());
    });
    
  } catch (error) {
    console.error('Error reading CSV file:', error);
  }
  
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  const buildUrl = (page?: number, cards?: string[], sort?: string) => {
    const params = new URLSearchParams();
    if (page && page > 1) params.set('page', page.toString());
    const cardsToUse = cards !== undefined ? cards : selectedCards;
    if (cardsToUse.length > 0) params.set('cards', cardsToUse.join(','));
    const sortToUse = sort !== undefined ? sort : sortOrder;
    if (sortToUse !== 'newest') params.set('sort', sortToUse);
    return `/?${params.toString()}`;
  };

  const toggleCard = (cardId: string) => {
    const newCards = selectedCards.includes(cardId)
      ? selectedCards.filter(id => id !== cardId)
      : [...selectedCards, cardId];
    return buildUrl(1, newCards);
  };

  const removeCard = (cardId: string) => {
    const newCards = selectedCards.filter(id => id !== cardId);
    return buildUrl(currentPage, newCards);
  };

  const toggleSort = () => {
    return buildUrl(1, selectedCards, sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Transaction History</h1>
            {selectedCards.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">
                    Filtered by {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''}:
                  </span>
                  <a 
                    href="/" 
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    Clear all filters
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCards.map((cardId) => (
                    <div key={cardId} className="flex items-center bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm">
                      <span className="font-mono mr-2">{cardId}</span>
                      <a 
                        href={removeCard(cardId)}
                        className="text-blue-300 hover:text-blue-100 font-bold text-xs"
                        title={`Remove ${cardId}`}
                      >
                        ×
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Select Cards</h2>
            {selectedCards.length > 0 && (
              <div className="text-sm text-gray-400">
                {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardStats.map((card) => {
              const isSelected = selectedCards.includes(card.id);
              return (
                <a
                  key={card.id}
                  href={toggleCard(card.id)}
                  className={`bg-gray-800 p-4 rounded-lg shadow-sm border transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-900/20 shadow-md'
                      : 'border-gray-700 hover:shadow-md hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-mono text-sm font-medium text-white">
                      {card.id}
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-400 bg-blue-500'
                        : 'border-gray-600'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Transactions:</span>
                      <span className="font-medium">{card.transactionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Currencies:</span>
                      <span className="font-medium">{card.currencies.join(', ')}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
        
        {monthlySpending.length > 0 && (
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
                                      return <IconComponent className="w-3 h-3 text-gray-400" />;
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
        )}
        
        <div className="bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Transactions</h3>
              <a
                href={toggleSort()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sortOrder === 'newest' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v18" />
                  )}
                </svg>
                Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Card Present</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatDate(transaction.trx_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white capitalize">
                      {transaction.trx_desc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {formatAmount(transaction.trx_amount, transaction.trx_currency, exchangeRates)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.trx_city}, {transaction.trx_country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                        {(() => {
                          const category = getMCCCategory(transaction.trx_mcc).category;
                          const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                          return (
                            <>
                              <IconComponent className="w-3 h-3" />
                              {category}
                            </>
                          );
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.IsCardPresent === 'TRUE' 
                          ? 'bg-green-900 text-green-200' 
                          : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {transaction.IsCardPresent === 'TRUE' ? 'Present' : 'Not Present'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={hasPrevPage ? buildUrl(currentPage - 1) : '#'}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    hasPrevPage
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                  aria-disabled={!hasPrevPage}
                >
                  ← Previous
                </a>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    
                    const isActive = pageNum === currentPage;
                    
                    return (
                      <a
                        key={pageNum}
                        href={buildUrl(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-blue-400 hover:bg-blue-900/20'
                        }`}
                      >
                        {pageNum}
                      </a>
                    );
                  })}
                </div>
                
                <a
                  href={hasNextPage ? buildUrl(currentPage + 1) : '#'}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    hasNextPage
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                  aria-disabled={!hasNextPage}
                >
                  Next →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
