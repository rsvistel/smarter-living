import { UtensilsCrossed, TrendingDown, PiggyBank, TrendingUp, ShoppingBag, Car, Gamepad2, WandSparkles } from 'lucide-react';

interface CategorySpending {
  'Food & Dining': number;
  'Retail & Shopping': number;
  'Transportation': number;
  'Entertainment & Recreation': number;
}

interface OpportunityCostVisualizerProps {
  categorySpending: CategorySpending;
  householdSize?: number;
}

export default function OpportunityCostVisualizer({ categorySpending, householdSize = 1 }: OpportunityCostVisualizerProps) {
  // Define reasonable monthly thresholds per category (CHF per month per person)
  const baseThresholds = {
    'Food & Dining': 400,
    'Retail & Shopping': 300,
    'Transportation': 200,
    'Entertainment & Recreation': 150
  };
  
  // Adjust thresholds based on household size
  const thresholds = {
    'Food & Dining': baseThresholds['Food & Dining'] * householdSize,
    'Retail & Shopping': baseThresholds['Retail & Shopping'] * householdSize,
    'Transportation': baseThresholds['Transportation'] * householdSize,
    'Entertainment & Recreation': baseThresholds['Entertainment & Recreation'] * householdSize
  };

  // Calculate monthly averages and potential savings per category
  const categoryAnalysis = Object.entries(categorySpending).map(([category, annualSpending]) => {
    const monthlySpending = annualSpending / 12;
    const threshold = thresholds[category as keyof typeof thresholds];
    const monthlyOverage = Math.max(0, monthlySpending - threshold);
    const annualSavings = monthlyOverage * 12;
    const isDoingWell = monthlySpending <= threshold;
    
    return {
      category,
      annualSpending,
      monthlySpending,
      threshold,
      annualSavings,
      isDoingWell
    };
  });

  // Calculate total potential savings
  const totalAnnualSavings = categoryAnalysis.reduce((sum, cat) => sum + cat.annualSavings, 0);
  
  // Format numbers with Swiss CHF conventions (space as thousand separator)
  const formatCHF = (amount: number): string => {
    return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Calculate chocolate equivalent (Läderach at 100 CHF/kg)
  const getChocolateEquivalent = (amount: number): string => {
    const kg = amount / 100;
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} tons`;
    } else if (kg >= 1) {
      return `${kg.toFixed(1)} kg`;
    } else {
      return `${(kg * 1000).toFixed(0)} g`;
    }
  };
  
  // Calculate investment projections with 7% annual growth (combined savings)
  const calculateInvestmentValue = (annualContribution: number, years: number, growthRate: number = 0.07) => {
    // Future value of annuity formula: PMT * [((1 + r)^n - 1) / r]
    return annualContribution * (((1 + growthRate) ** years - 1) / growthRate);
  };
  
  const projection10Years = calculateInvestmentValue(totalAnnualSavings, 10);
  const projection20Years = calculateInvestmentValue(totalAnnualSavings, 20);
  const projection30Years = calculateInvestmentValue(totalAnnualSavings, 30);

  // Get category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food & Dining': return UtensilsCrossed;
      case 'Retail & Shopping': return ShoppingBag;
      case 'Transportation': return Car;
      case 'Entertainment & Recreation': return Gamepad2;
      default: return WandSparkles;
    }
  };

  if (totalAnnualSavings === 0) {
    return (
      <>
        <div className="flex items-center gap-3 mb-4">
          <WandSparkles className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-light text-white">Opportunity Cost Visualizer</h2>
        </div>
        <p className="text-gray-300">Great job! You&apos;re spending within reasonable limits across all categories. 🎉</p>
      </>
    );
  }

  return (
    <>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-6">
        {categoryAnalysis.map((analysis) => {
          const IconComponent = getCategoryIcon(analysis.category);
          return (
            <div key={analysis.category} className="bg-neutral-900 p-4">
              <div className="flex items-center gap-2 mb-3">
                <IconComponent className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">{analysis.category}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Monthly spending</span>
                <span className="text-sm text-white">{formatCHF(analysis.monthlySpending)} CHF</span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">Recommended limit</span>
                <span className="text-xs text-gray-300">{formatCHF(analysis.threshold)} CHF</span>
              </div>
              
              {analysis.isDoingWell ? (
                <div className="text-sm text-green-400">✓ Within recommended limit</div>
              ) : (
                <div>
                  <div className="text-sm text-orange-400 mb-1">
                    Potential annual savings: {formatCHF(analysis.annualSavings)} CHF
                  </div>
                  <div className="text-xs text-orange-300">
                    🍫 {getChocolateEquivalent(analysis.annualSavings)} of Läderach
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {totalAnnualSavings > 0 && (
        <div className="mb-6 bg-neutral-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Total Potential Savings</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {formatCHF(totalAnnualSavings)} CHF annually
          </div>
          <div className="text-xs text-orange-400 mt-1">
            🍫 {getChocolateEquivalent(totalAnnualSavings)} of Läderach
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <div className="gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h2 className="text-2xl font-light text-white">Investment Projection</h2>
          </div>
          <span className="text-xs text-gray-400">(7% annual growth)</span>
        </div>
        
        {totalAnnualSavings > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <div className="bg-neutral-900 p-4">
              <div className="text-sm text-gray-300 mb-1">10 Years</div>
              <div className="text-xl font-bold text-blue-400">
                {formatCHF(projection10Years)} CHF
              </div>
              <div className="text-xs text-gray-400">
                vs {formatCHF(totalAnnualSavings * 10)} CHF saved
              </div>
              <div className="text-xs text-orange-400 mt-1">
                🍫 {getChocolateEquivalent(projection10Years)} of Läderach
              </div>
            </div>
            
            <div className="bg-neutral-900 p-4">
              <div className="text-sm text-gray-300 mb-1">20 Years</div>
              <div className="text-xl font-bold text-blue-400">
                {formatCHF(projection20Years)} CHF
              </div>
              <div className="text-xs text-gray-400">
                vs {formatCHF(totalAnnualSavings * 20)} CHF saved
              </div>
              <div className="text-xs text-orange-400 mt-1">
                🍫 {getChocolateEquivalent(projection20Years)} of Läderach
              </div>
            </div>
            
            <div className="bg-neutral-900 p-4">
              <div className="text-sm text-gray-300 mb-1">30 Years</div>
              <div className="text-xl font-bold text-blue-400">
                {formatCHF(projection30Years)} CHF
              </div>
              <div className="text-xs text-gray-400">
                vs {formatCHF(totalAnnualSavings * 30)} CHF saved
              </div>
              <div className="text-xs text-orange-400 mt-1">
                🍫 {getChocolateEquivalent(projection30Years)} of Läderach
              </div>
            </div>
          </div>
        )}
      </div>

      {totalAnnualSavings > 0 && (
        <div className="mt-4 p-4 bg-neutral-900">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Savings Tip</span>
          </div>
          <p className="text-sm text-gray-300">
            By optimizing your spending to recommended limits, you could save{' '}
            <span className="font-semibold text-green-400">{formatCHF(totalAnnualSavings)} CHF</span> annually
            (<span className="text-orange-400">🍫 {getChocolateEquivalent(totalAnnualSavings)} of Läderach</span>).
            If invested in the S&P 500, this could grow to{' '}
            <span className="font-semibold text-blue-400">{formatCHF(projection30Years)} CHF</span> over 30 years
            (<span className="text-orange-400">🍫 {getChocolateEquivalent(projection30Years)} of Läderach</span>)!
          </p>
        </div>
      )}
    </>
  );
}