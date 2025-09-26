import { promises as fs } from 'fs';
import path from 'path';

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
  searchParams: Promise<{ page?: string; card?: string }>;
}

interface CardInfo {
  id: string;
  transactionCount: number;
  totalAmount: number;
  currencies: string[];
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const selectedCard = params.card;
  const itemsPerPage = 50;
  
  let transactions: Transaction[] = [];
  let totalTransactions = 0;
  let exchangeRates: Record<string, number> = {};
  let cardStats: CardInfo[] = [];
  
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
    
    // Filter transactions by selected card if specified
    const filteredTransactions = selectedCard 
      ? allTransactions.filter(t => t.CardId === selectedCard)
      : allTransactions;
    
    totalTransactions = filteredTransactions.length;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    transactions = filteredTransactions.slice(startIndex, endIndex);
    
    exchangeRates = await getExchangeRates();
  } catch (error) {
    console.error('Error reading CSV file:', error);
  }
  
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  const buildUrl = (page?: number) => {
    const params = new URLSearchParams();
    if (page && page > 1) params.set('page', page.toString());
    if (selectedCard) params.set('card', selectedCard);
    return `/?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            {selectedCard && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">Filtered by card:</span>
                <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {selectedCard}
                </span>
                <a 
                  href="/" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filter
                </a>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        
        {!selectedCard && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Card</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cardStats.map((card) => (
                <a
                  key={card.id}
                  href={`/?card=${card.id}`}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <div className="font-mono text-sm font-medium text-gray-900 mb-2">
                    {card.id}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
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
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Present</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.trx_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {transaction.trx_desc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(transaction.trx_amount, transaction.trx_currency, exchangeRates)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.trx_city}, {transaction.trx_country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {transaction.MccGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.IsCardPresent === 'TRUE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.IsCardPresent === 'TRUE' ? 'Present' : 'Not Present'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={hasPrevPage ? buildUrl(currentPage - 1) : '#'}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    hasPrevPage
                      ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                      : 'text-gray-400 cursor-not-allowed'
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
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
                      ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                      : 'text-gray-400 cursor-not-allowed'
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
