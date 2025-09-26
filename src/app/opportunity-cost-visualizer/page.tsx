import { promises as fs } from 'fs';
import path from 'path';
import { getMCCCategory } from '../mcc-mapping';
import OpportunityCostClient from './OpportunityCostClient';

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

interface MonthlySpending {
  month: string;
  year: number;
  totalCHF: number;
  transactionCount: number;
  currencies: Record<string, number>;
  categories: Record<string, number>;
}

export default async function OpportunityCostPage({ searchParams }: { searchParams: Promise<{ household?: string }> }) {
  const params = await searchParams;
  const householdSize = parseInt(params.household || '1', 10);
  let categorySpending = {
    'Food & Dining': 0,
    'Retail & Shopping': 0,
    'Transportation': 0,
    'Entertainment & Recreation': 0
  };
  let exchangeRates: Record<string, number> = {};
  
  try {
    const filePath = path.join(process.cwd(), 'data', 'data.csv');
    const csvText = await fs.readFile(filePath, 'utf-8');
    const allTransactions = parseCSV(csvText);
    
    exchangeRates = await getExchangeRates();
    
    // Calculate monthly spending for Food & Dining analysis
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
      
      // Convert to CHF
      let chfAmount = amount;
      if (currency !== '756' && exchangeRates[currency]) {
        chfAmount = amount * exchangeRates[currency];
      }
      
      monthData.totalCHF += chfAmount;
      
      // Add category breakdown
      const category = getMCCCategory(transaction.trx_mcc).category;
      monthData.categories[category] = (monthData.categories[category] || 0) + chfAmount;
    });
    
    const monthlySpending = Array.from(monthlyData.values()).sort((a, b) => {
      return b.year - a.year || (new Date(`${b.month} 1`).getMonth() - new Date(`${a.month} 1`).getMonth());
    });
    
    // Calculate category spending over last 12 months
    const last12MonthsData = monthlySpending.slice(0, 12);
    const targetCategories = ['Food & Dining', 'Retail & Shopping', 'Transportation', 'Entertainment & Recreation'];
    
    targetCategories.forEach(category => {
      categorySpending[category as keyof typeof categorySpending] = last12MonthsData.reduce((total, month) => {
        return total + (month.categories[category] || 0);
      }, 0);
    });
    
  } catch (error) {
    console.error('Error reading CSV file:', error);
  }
  
  return (
    <OpportunityCostClient 
      categorySpending={categorySpending} 
      initialHouseholdSize={householdSize}
    />
  );
}