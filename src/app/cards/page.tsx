'use client';

import { useState, useEffect } from 'react';
import { fetchMyTransactions, fetchAllCards, addCardToUser, ApiCardsResponse } from '../../lib/api';
import { transformApiData, getExchangeRates, CardInfo } from '../../lib/dataTransformation';
import { ArrowLeft, CreditCard, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function CardsPage() {
  const [cardStats, setCardStats] = useState<CardInfo[]>([]);
  const [allCards, setAllCards] = useState<Array<{cardId: string; transactionCount: number}>>([]);
  const [userCardIds, setUserCardIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCards, setShowAllCards] = useState(false);
  const [loadingAllCards, setLoadingAllCards] = useState(false);
  const [addingCardId, setAddingCardId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCardData() {
      try {
        // Fetch exchange rates and transaction data
        const exchangeRates = await getExchangeRates();
        const apiResponse = await fetchMyTransactions(); // Fetch authenticated user's data
        
        if (apiResponse.error || !apiResponse.data) {
          throw new Error(`API Error: ${apiResponse.error || 'No data received'}`);
        }
        
        // Transform API data to get card stats
        const transformedData = transformApiData(apiResponse.data, exchangeRates);
        setCardStats(transformedData.cardStats);
        
        // Extract user's card IDs for comparison
        const userCards = apiResponse.data.cards.map(card => card.cardId);
        setUserCardIds(userCards);
      } catch (error) {
        console.error('Error fetching card data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCardData();
  }, []);

  const handleAddNewCard = async () => {
    setLoadingAllCards(true);
    try {
      console.log('Fetching all cards...');
      const response = await fetchAllCards();
      console.log('Response:', response);
      
      if (response.data) {
        console.log('Cards:', response.data.cards);
        setAllCards(response.data.cards);
        setShowAllCards(true);
      } else {
        console.error('Failed to fetch all cards:', response.error);
        alert(`Error: ${response.error}`);
      }
    } catch (error) {
      console.error('Error fetching all cards:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoadingAllCards(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
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


        <button 
          onClick={handleAddNewCard}
          disabled={loadingAllCards}
          className="w-full mt-6 cursor-pointer inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingAllCards ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full"></div>
              Loading...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Add a New Card
            </>
          )}
        </button>

        {/* All Cards Modal */}
        {showAllCards && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-black max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-neutral-900">
                <h2 className="text-2xl font-light text-white">Available Cards</h2>
                <button 
                  onClick={() => setShowAllCards(false)}
                  className="cursor-pointer text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
                   style={{
                     scrollbarWidth: 'none',
                     msOverflowStyle: 'none'
                   }}>
                {allCards.map((card) => {
                  const isAlreadyAdded = userCardIds.includes(card.cardId);
                  const isCurrentlyAdding = addingCardId === card.cardId;
                  
                  return (
                    <div 
                      key={card.cardId}
                      className="flex items-center justify-between p-4 bg-neutral-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white block">
                              {card.cardId.replace(/(.{4})/g, '$1 ').trim()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {card.transactionCount} transactions
                          </span>
                        </div>
                      </div>
                      <button 
                        className="px-3 py-1 text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isAlreadyAdded || isCurrentlyAdding}
                        onClick={async () => {
                          if (isAlreadyAdded) return;
                          
                          setAddingCardId(card.cardId);
                          try {
                            const response = await addCardToUser(card.cardId);
                            if (response.data) {
                              // Reload the page to reflect changes
                              window.location.reload();
                            } else {
                              alert(`Error: ${response.error}`);
                            }
                          } catch (error) {
                            alert('Failed to add card');
                          } finally {
                            setAddingCardId(null);
                          }
                        }}
                      >
                        {isCurrentlyAdding ? 'Adding...' : isAlreadyAdded ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
                
                {allCards.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No additional cards available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
      </div>
    </div>
  );
}