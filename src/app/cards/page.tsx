import { fetchUserTransactions } from '../../lib/api';
import { transformApiData, getExchangeRates, CardInfo } from '../../lib/dataTransformation';
import { getAuthSession } from '../../lib/auth';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default async function CardsPage() {
  const session = await getAuthSession();
  const userId = session?.userId || 3;
  
  let cardStats: CardInfo[] = [];
  
  try {
    // Fetch exchange rates and transaction data
    const exchangeRates = await getExchangeRates();
    const apiResponse = await fetchUserTransactions(userId);
    
    if (apiResponse.error || !apiResponse.data) {
      throw new Error(`API Error: ${apiResponse.error || 'No data received'}`);
    }
    
    // Transform API data to get card stats
    const transformedData = transformApiData(apiResponse.data, exchangeRates);
    cardStats = transformedData.cardStats;
  } catch (error) {
    console.error('Error fetching card data:', error);
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 pr-3 py-2 text-sm font-medium text-gray-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
          <div>
            <h1 className="text-4xl font-light text-white mb-2">Manage Cards</h1>
            <p className="text-gray-400">
              {cardStats.length} card{cardStats.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardStats.map((card) => (
            <div key={card.id} className="group">
              <div className="relative w-full aspect-[1.586/1] bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-700">
                {/* Credit card design elements */}
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-6 bg-gray-600 rounded-sm opacity-60"></div>
                </div>
                
                {/* Card number */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="font-mono text-lg font-medium text-white tracking-wider">
                    {card.id.replace(/(.{4})/g, '$1 ').trim()}
                  </div>
                </div>
                
                {/* Subtle pattern/texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-xl"></div>
              </div>
              
              {/* Card Details */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Transactions:</span>
                  <span className="text-white font-medium">{card.transactionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Currencies:</span>
                  <span className="text-white font-medium">{card.currencies.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {cardStats.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No cards found</h3>
            <p className="text-gray-400">Unable to load your cards at this time.</p>
          </div>
        )}


        <button className="w-full mt-6 cursor-pointer inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors">
          <CreditCard className="w-4 h-4 mr-2" /> Add a New Card
         </button>
        
      </div>
    </div>
  );
}