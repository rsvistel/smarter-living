'use client';

// import { useState } from 'react';
import { Users, Plus, Minus } from 'lucide-react';

interface HouseholdSizeSelectorProps {
  householdSize: number;
  onHouseholdSizeChange: (size: number) => void;
}

export default function HouseholdSizeSelector({ householdSize, onHouseholdSizeChange }: HouseholdSizeSelectorProps) {
  return (
    <div className="bg-neutral-900 p-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-5 h-5 text-white" />
        <h3 className="text-lg font-medium text-white">Household Size</h3>
      </div>
      
      <div className="gap-4">
        <p className="text-sm text-gray-300">Number of people in your household:</p>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => onHouseholdSizeChange(Math.max(1, householdSize - 1))}
            disabled={householdSize <= 1}
            className={`w-10 h-10 flex items-center justify-center transition-colors ${
              householdSize <= 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <h3 className="text-5xl w-12 text-center">
            {householdSize}
          </h3>
          
          <button
            onClick={() => onHouseholdSizeChange(householdSize + 1)}
            className="w-10 h-10 flex items-center justify-center bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Recommended spending limits will be adjusted based on household size.
      </div>
    </div>
  );
}