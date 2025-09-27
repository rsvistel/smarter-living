import { ApiTransaction, ApiTransactionResponse } from './api';
import { getMCCCategory } from '../app/mcc-mapping';

// Legacy interface for backward compatibility
export interface Transaction {
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

export interface CardInfo {
  id: string;
  transactionCount: number;
  totalAmount: number;
  currencies: string[];
}

export interface MonthlySpending {
  month: string;
  year: number;
  totalCHF: number;
  transactionCount: number;
  currencies: Record<string, number>;
  categories: Record<string, number>;
}

export const CURRENCY_CODES: Record<string, string> = {
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

/**
 * Convert API transaction to legacy format for backward compatibility
 */
export function convertApiTransaction(apiTransaction: ApiTransaction): Transaction {
  return {
    CardId: apiTransaction.cardId,
    Age_cat: apiTransaction.ageCat,
    trx_date: apiTransaction.trxDate,
    trx_code: apiTransaction.trxCode,
    trx_amount: apiTransaction.trxAmount.toString(),
    trx_currency: apiTransaction.trxCurrency,
    trx_desc: apiTransaction.trxDesc,
    trx_city: apiTransaction.trxCity,
    trx_country: apiTransaction.trxCountry,
    trx_mcc: apiTransaction.trxMcc,
    MccDesc: apiTransaction.mccDesc,
    MccGroup: apiTransaction.mccGroup,
    IsCardPresent: apiTransaction.isCardPresent ? 'TRUE' : 'FALSE',
    IsPurchase: apiTransaction.isPurchase ? 'TRUE' : 'FALSE',
    IsCash: apiTransaction.isCash ? 'TRUE' : 'FALSE',
    LimitExhaustion_cat: apiTransaction.limitExhaustionCat,
  };
}

/**
 * Transform API response to legacy format and calculate derived data
 */
export function transformApiData(
  apiResponse: ApiTransactionResponse,
  exchangeRates: Record<string, number> = {}
): {
  allTransactions: Transaction[];
  cardStats: CardInfo[];
  monthlySpending: MonthlySpending[];
} {
  // Convert all transactions to legacy format
  const allTransactions: Transaction[] = [];
  
  apiResponse.cards.forEach(card => {
    card.transactions.forEach(transaction => {
      allTransactions.push(convertApiTransaction(transaction));
    });
  });

  // Calculate card statistics
  const cardMap = new Map<string, CardInfo>();
  
  apiResponse.cards.forEach(card => {
    const totalAmount = card.transactions.reduce((sum, tx) => sum + tx.trxAmount, 0);
    const currencies = [...new Set(card.transactions.map(tx => 
      CURRENCY_CODES[tx.trxCurrency] || tx.trxCurrency
    ))];

    cardMap.set(card.cardId, {
      id: card.cardId,
      transactionCount: card.transactionCount,
      totalAmount,
      currencies
    });
  });

  const cardStats = Array.from(cardMap.values()).sort((a, b) => b.transactionCount - a.transactionCount);

  // Calculate monthly spending
  const monthlyData = new Map<string, MonthlySpending>();
  
  allTransactions.forEach(transaction => {
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
  
  const monthlySpending = Array.from(monthlyData.values()).sort((a, b) => {
    return b.year - a.year || (new Date(`${b.month} 1`).getMonth() - new Date(`${a.month} 1`).getMonth());
  });

  return {
    allTransactions,
    cardStats,
    monthlySpending
  };
}

/**
 * Get exchange rates from external API
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
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