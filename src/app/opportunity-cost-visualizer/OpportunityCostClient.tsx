'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import OpportunityCostVisualizer from '../components/OpportunityCostVisualizer';
import HouseholdSizeSelector from '../components/HouseholdSizeSelector';

interface CategorySpending {
  'Food & Dining': number;
  'Retail & Shopping': number;
  'Transportation': number;
  'Entertainment & Recreation': number;
}

interface OpportunityCostClientProps {
  categorySpending: CategorySpending;
  initialHouseholdSize: number;
}

export default function OpportunityCostClient({ categorySpending, initialHouseholdSize }: OpportunityCostClientProps) {
  const [householdSize, setHouseholdSize] = useState(initialHouseholdSize);

  const handleHouseholdSizeChange = (size: number) => {
    setHouseholdSize(size);
    const url = new URL(window.location.href);
    if (size === 1) {
      url.searchParams.delete('household');
    } else {
      url.searchParams.set('household', size.toString());
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 pr-3 py-2 text-sm font-medium text-gray-300 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-4xl font-light text-white mb-2">
            Opportunity Cost Visualizer
          </h1>
          <p className="text-gray-400">See what your spending could become if invested instead</p>
        </div>
        
        <HouseholdSizeSelector 
          householdSize={householdSize} 
          onHouseholdSizeChange={handleHouseholdSizeChange}
        />
        
        <OpportunityCostVisualizer categorySpending={categorySpending} householdSize={householdSize} />
      </div>
    </div>
  );
}