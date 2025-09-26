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
  width: '100%',
  minHeight: '200px',
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
  const chartData = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .map(([category, amount], index) => {
      const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
      return {
        id: index,
        value: amount,
        label: category.split(' ')[0], // Shortened label
        category: category,
        icon: IconComponent
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
        slotProps={{
          legend: { hidden: true },
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
          {totalAmount.toFixed(0)}
        </div>
        <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
          CHF
        </div>
      </CenterLabel>
    </ChartContainer>
  );
}