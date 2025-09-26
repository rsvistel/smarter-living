'use client';

import { useState } from 'react';
import { getMCCCategory, CATEGORY_ICONS } from '../mcc-mapping';

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

function formatAmount(amount: string, currency: string, exchangeRates: Record<string, number> = {}): React.JSX.Element | string {
  const numAmount = parseFloat(amount) * -1;
  if (isNaN(numAmount)) return amount;
  
  const currencySymbol = CURRENCY_CODES[currency] || currency;
  const baseFormat = `${numAmount.toFixed(2)} ${currencySymbol}`;
  
  if (currency === '756' || !exchangeRates[currency]) {
    return baseFormat;
  }
  
  const chfAmount = numAmount * exchangeRates[currency];
  return <div>{chfAmount.toFixed(2)} CHF<br/><span className="text-gray-400 font-medium">{baseFormat}</span></div>
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

interface TransactionListProps {
  initialTransactions: Transaction[];
  allTransactions: Transaction[];
  exchangeRates: Record<string, number>;
}

export default function TransactionList({ 
  initialTransactions, 
  allTransactions, 
  exchangeRates
}: TransactionListProps) {
  const [displayedTransactions, setDisplayedTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 50;

  const hasMoreTransactions = displayedTransactions.length < allTransactions.length;

  const loadMore = async () => {
    setIsLoading(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const nextBatch = allTransactions.slice(0, displayedTransactions.length + itemsPerPage);
    setDisplayedTransactions(nextBatch);
    setIsLoading(false);
  };

  return (
    <div>
      <ul className="space-y-2">
        {displayedTransactions.map((transaction, index) => (
          <li key={index} className="flex items-center gap-3 bg-neutral-900 p-4 shadow-sm transition-all duration-200">
            <div className="flex-shrink-0">
              {(() => {
                const category = getMCCCategory(transaction.trx_mcc).category;
                const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
                return <IconComponent className="w-5 h-5 text-white" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-md text-white capitalize font-medium truncate">{transaction.trx_desc}</h4>
              <p className="text-sm text-gray-300">{formatDate(transaction.trx_date)}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-right ml-3">
                <p className={`text-sm font-bold whitespace-nowrap ${
                  parseFloat(transaction.trx_amount) < 0 ? 'text-green-400' : 'text-white'
                }`}>
                  {formatAmount(transaction.trx_amount, transaction.trx_currency, exchangeRates)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {hasMoreTransactions && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="w-full justify-center flex items-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                Load More Transactions
              </>
            )}
          </button>
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-400">
        Showing {displayedTransactions.length} of {allTransactions.length} transactions
      </div>
    </div>
  );
}