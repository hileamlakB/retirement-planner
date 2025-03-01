import React, { useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { InvestmentData } from '../types';
import { INVESTMENT_ACCOUNTS, AGE_MILESTONES } from '../utils/constants';
import { calculateAfterTaxValue } from '../utils/calculations';
import { Download } from 'lucide-react';

interface InvestmentChartProps {
  data: InvestmentData[];
  retirementTaxRate: number;
  onDownloadChart: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const InvestmentChart: React.FC<InvestmentChartProps> = ({ 
  data, 
  retirementTaxRate,
  onDownloadChart
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return <div className="text-center p-8">No data available for chart</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-lg mb-2">Age: {label}</p>
          
          <div className="space-y-1">
            {INVESTMENT_ACCOUNTS.map(account => {
              const accountValue = dataPoint[account.id];
              const afterTaxValue = calculateAfterTaxValue(
                accountValue, 
                account.id, 
                dataPoint.age, 
                retirementTaxRate
              );
              
              return (
                <div key={account.id} className="flex justify-between">
                  <span style={{ color: account.color }} className="font-medium">
                    {account.name}:
                  </span>
                  <span className="ml-4">
                    {formatCurrency(accountValue)} 
                    <span className="text-sm text-gray-500 ml-1">
                      (After tax: {formatCurrency(afterTaxValue)})
                    </span>
                  </span>
                </div>
              );
            })}
            
            <div className="border-t border-gray-200 mt-2 pt-2 font-bold flex justify-between">
              <span>Total Net Worth:</span>
              <span>{formatCurrency(dataPoint.totalNetWorth)}</span>
            </div>
            
            <div className="font-bold flex justify-between text-blue-600">
              <span>Liquidation Value:</span>
              <span>{formatCurrency(dataPoint.liquidationValue || 0)}</span>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Investment Projection</h2>
        <button 
          onClick={onDownloadChart}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download size={16} className="mr-1" />
          Download Chart
        </button>
      </div>
      
      <div className="h-[500px]" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="age" 
              label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} 
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              label={{ value: 'Account Value ($)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference lines for important milestones */}
            <ReferenceLine 
              x={AGE_MILESTONES.earlyWithdrawalPenaltyEnds} 
              stroke="#FF8C00" 
              strokeDasharray="3 3"
              label={{ value: 'Age 59½ (Penalty-free withdrawals)', position: 'top', fill: '#FF8C00' }}
            />
            <ReferenceLine 
              x={AGE_MILESTONES.medicareEligibility} 
              stroke="#8884d8" 
              strokeDasharray="3 3"
              label={{ value: 'Age 65 (Medicare)', position: 'top', fill: '#8884d8' }}
            />
            <ReferenceLine 
              x={AGE_MILESTONES.rmdStartAge} 
              stroke="#82ca9d" 
              strokeDasharray="3 3"
              label={{ value: 'Age 72 (RMDs begin)', position: 'top', fill: '#82ca9d' }}
            />
            
            {/* Investment account areas */}
            {INVESTMENT_ACCOUNTS.map(account => (
              <Area
                key={account.id}
                type="monotone"
                dataKey={account.id}
                stackId="1"
                stroke={account.color}
                fill={account.color}
                name={account.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentChart;