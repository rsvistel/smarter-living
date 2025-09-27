'use client';

import { PieChart } from '@mui/x-charts/PieChart';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { CATEGORY_ICONS } from '../mcc-mapping';

interface MonthlySpendingChartProps {
  categories: Record<string, number>;
  totalAmount: number;
}

const ChartContainer = styled(Box)({
  position: 'relative',
  width: '300px',
  height: '200px',
});

const CenterLabel = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  pointerEvents: 'none',
});

export default function MonthlySpendingChart({ categories, totalAmount }: MonthlySpendingChartProps) {
  // Generate consistent colors for each category
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A3C', '#6B7280', '#9CA3AF'
  ];

  const chartData = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .map(([category, amount], index) => {
      const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
      return {
        id: index,
        value: amount,
        label: category.split(' ')[0], // Shortened label
        category: category,
        icon: IconComponent,
        color: colors[index % colors.length]
      };
    });

  return (
    <ChartContainer>
      <PieChart
        series={[
          {
            data: chartData,
            innerRadius: 80,
            outerRadius: 90,
            paddingAngle: 1,
            cornerRadius: 1,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 90, additionalRadius: -15, color: 'gray' },
          },
        ]}
        width={300}
        height={200}
        slots={{
          legend: () => null,
        }}
        sx={{
          '& .MuiChartsAxis-root': {
            '& .MuiChartsAxis-line': { stroke: '#374151' },
            '& .MuiChartsAxis-tick': { stroke: '#374151' },
            '& .MuiChartsAxis-tickLabel': { fill: '#9CA3AF' },
          },
          '& .MuiChartsTooltip-root': {
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            color: '#F3F4F6',
          },
        }}
      />
      <CenterLabel>
        <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold' }}>
          {totalAmount.toFixed(0)} CHF
        </div>
        <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
          spent
        </div>
      </CenterLabel>
    </ChartContainer>
  );
}