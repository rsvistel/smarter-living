'use client';

import { Leaf, Car, Bike, Bus } from 'lucide-react';

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

interface CO2TipsProps {
  transactions: Transaction[];
  exchangeRates: Record<string, number>;
}

export default function CO2Tips({ transactions, exchangeRates }: CO2TipsProps) {
  // Calculate parking expenses in last 60 days (since data contains various date ranges)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Calculate fuel expenses in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Debug: Check recent parking transactions
  const parkingTransactions = transactions.filter(transaction => transaction.trx_mcc === '7523');
  const recentParkingTransactions = parkingTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.trx_date);
    return transactionDate >= sixtyDaysAgo;
  });

  // Check recent fuel transactions (gas stations)
  const fuelTransactions = transactions.filter(transaction => 
    transaction.trx_mcc === '5541' || transaction.trx_mcc === '5542'
  );
  const recentFuelTransactions = fuelTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.trx_date);
    return transactionDate >= thirtyDaysAgo;
  });

  const recentParkingExpenses = recentParkingTransactions
    .reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);

  const recentFuelExpenses = recentFuelTransactions
    .reduce((total, transaction) => {
      let amount = Math.abs(parseFloat(transaction.trx_amount) || 0);
      
      // Convert to CHF if needed
      if (transaction.trx_currency !== '756' && exchangeRates[transaction.trx_currency]) {
        amount = amount * exchangeRates[transaction.trx_currency];
      }
      
      return total + amount;
    }, 0);

  // Debug logging
  console.log('Total parking transactions:', parkingTransactions.length);
  console.log('Recent parking transactions (last 60 days):', recentParkingTransactions.length);
  console.log('Sixty days ago:', sixtyDaysAgo.toISOString());
  console.log('Recent parking expenses:', recentParkingExpenses);
  console.log('Total fuel transactions:', fuelTransactions.length);
  console.log('Recent fuel transactions (last 30 days):', recentFuelTransactions.length);
  console.log('Recent fuel expenses:', recentFuelExpenses);
  if (recentParkingTransactions.length > 0) {
    console.log('Sample recent parking transaction:', recentParkingTransactions[0]);
  }
  if (recentFuelTransactions.length > 0) {
    console.log('Sample recent fuel transaction:', recentFuelTransactions[0]);
  }

  // Check which tip to show (prioritize fuel tip if both conditions are met)
  const showFuelTip = recentFuelExpenses > 200;
  const showParkingTip = recentParkingExpenses > 15;

  if (!showFuelTip && !showParkingTip) {
    return null;
  }

  if (showFuelTip) {
    return (
      <div className="mb-6 bg-green-900 p-4 border-l-4 border-green-400">
        <div className="flex items-center gap-3 mb-3">
          <Leaf className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-medium text-white">CO₂ Emission Tip</h3>
        </div>
        
        <div className="flex items-start gap-3">
          <Car className="w-5 h-5 text-gray-300 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-200 mb-2">
              You spent <span className="font-semibold text-green-400">{recentFuelExpenses.toFixed(0)} CHF</span> on fuel in the last 30 days.
            </p>
            <p className="text-sm text-gray-300 mb-3">
              You use a lot of gas! Consider cycling or public transport to reduce your environmental impact and save money.
            </p>
            
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Cycling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Public transport</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-green-900 p-4 border-l-4 border-green-400">
      <div className="flex items-center gap-3 mb-3">
        <Leaf className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-medium text-white">CO₂ Emission Tip</h3>
      </div>
      
      <div className="flex items-start gap-3">
        <Car className="w-5 h-5 text-gray-300 mt-1 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-200 mb-2">
            You spent <span className="font-semibold text-green-400">{recentParkingExpenses.toFixed(0)} CHF</span> on parking in the last 60 days.
          </p>
          <p className="text-sm text-gray-300 mb-3">
            Consider using more sustainable transport options to reduce both costs and CO₂ emissions.
          </p>
          
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Cycling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Public transport</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}